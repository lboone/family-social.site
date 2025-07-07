const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const generateOtp = require("../utils/generateOtp");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const hbs = require("hbs");
const sendEmail = require("../utils/email");
const path = require("path");

const loadTemplate = (templateName, replacements) => {
  const templatePath = path.join(__dirname, "../emailTemplates", templateName);
  console.log("Loading template from:", templatePath);
  const source = fs.readFileSync(templatePath, "utf-8");
  const template = hbs.compile(source);
  return template(replacements);
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set secure flag in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "Lax",
  };

  res.cookie("token", token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.otp = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm, username } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }
  const otp = generateOtp();
  const otpExpires = Date.now() + 24 * 60 * 60 * 100;
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
    otp,
    otpExpires,
  });

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "OTP Verification",
    username: newUser.username,
    otp: newUser.otp,
    message: "Your one time password (OTP) for verification is:",
  });

  try {
    await sendEmail({
      email: newUser.email,
      subject: "OTP for Email Verification",
      html: htmlTemplate,
    });

    createSendToken(
      newUser,
      200,
      res,
      "Registration Successful!  Check your email for OTP verification."
    );
  } catch (error) {
    await User.findByIdAndDelete(newUser._id);
    return next(
      new AppError(
        "There was an error creating that account. Please try again later.",
        500
      )
    );
  }
});

exports.verifyAccount = catchAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return next(new AppError("OTP is required for verification.", 400));
  }

  const user = req.user;
  console.log({ user });
  if (user.otp !== otp) {
    return next(new AppError("Invalid OTP. Please try again.", 400));
  }

  if (Date.now() > user.otpExpires) {
    return next(
      new AppError("OTP has expired. Please request a new one.", 400)
    );
  }

  user.isVerified = true;
  user.otp = undefined; // Clear OTP after verification
  user.otpExpires = undefined; // Clear OTP expiration

  await user.save({ validateBeforeSave: false });

  createSendToken(
    user,
    200,
    res,
    "Account verified successfully! You can now log in."
  );
});

exports.resendOtp = catchAsync(async (req, res, next) => {
  const { email } = req.user;

  if (!email) {
    return next(new AppError("Email is required", 404));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User Not Found!", 404));
  }
  if (user.isVerified) {
    return next(new AppError("Account already verified", 400));
  }

  user.otp = generateOtp();
  user.otpExpires = Date.now() + 24 * 60 * 60 * 1000; // OTP valid for 24 hours
  await user.save({ validateBeforeSave: false });

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "Otp Verification",
    username: user.username,
    otp: user.otp,
    message: "Your one-time password (OTP) for account verification is:",
  });

  try {
    await sendEmail({
      email: user.email,
      subject: "Resend OTP for Email Verification",
      html: htmlTemplate,
    });

    res.status(200).json({
      status: "success",
      message: "New OTP sent to your email.",
    });
  } catch (error) {
    user.otp = undefined; // Clear OTP if email sending fails
    user.otpExpires = undefined; // Clear OTP expiration
    await user.save({ validateBeforeSave: false });
    console.error("Error sending OTP email:", error);
    return next(
      new AppError("Failed to resend OTP. Please try again later.", 500)
    );
  }
});
