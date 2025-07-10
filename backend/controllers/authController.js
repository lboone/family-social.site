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

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return next(new AppError("Username already taken", 400));
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
    "Account verified successfully! You will be contacted when your account is active."
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

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect credentials", 401));
  }

  if (!user.isVerified) {
    return next(new AppError("Account not verified", 401));
  }

  if (!user.isActive) {
    return next(
      new AppError(
        "Account is not active, please contact an admin to activate your account.",
        403
      )
    );
  }

  // TODO: Add next layer of checks isActive.
  createSendToken(user, 200, res, "Login successful!");
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000), // Set cookie to expire in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set secure flag in production
  });
  res.status(200).json({
    status: "success",
    message: "You have been logged out.",
  });
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const otp = generateOtp();
  const resetExpires = Date.now() + 300000; // OTP valid for 5 minutes

  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = resetExpires;
  await user.save({ validateBeforeSave: false });

  const htmlTemplate = loadTemplate("otpTemplate.hbs", {
    title: "Reset Password OTP",
    username: user.username,
    otp: user.resetPasswordOTP,
    message: "Your password reset OTP is:",
  });

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP (Valid for 5 minutes)",
      html: htmlTemplate,
    });

    res.status(200).json({
      status: "success",
      message: "Password reset email sent to your email.",
    });
  } catch (error) {
    user.resetPasswordOTP = undefined; // Clear OTP if email sending fails
    user.resetPasswordOTPExpires = undefined; // Clear OTP expiration
    await user.save({ validateBeforeSave: false });
    console.error("Error sending password reset email:", error);
    return next(
      new AppError(
        "Failed to send password reset email. Please try again later.",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, password, passwordConfirm } = req.body;
  if (!email || !otp || !password || !passwordConfirm) {
    return next(new AppError("All fields are required", 400));
  }

  const user = await User.findOne({
    email,
    resetPasswordOTP: otp,
    resetPasswordOTPExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError("User not found", 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  user.password = password;
  user.passwordConfirm = undefined; // Remove passwordConfirm after hashing
  user.resetPasswordOTP = undefined; // Clear OTP after hashing
  user.resetPasswordOTPExpires = undefined; // Clear OTP expiration
  await user.save({ validateBeforeSave: false });

  createSendToken(
    user,
    200,
    res,
    "Password reset successful! You can now log in with your new password."
  );
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError("All fields are required", 400));
  }

  const { email } = req.user;
  if (!email) {
    return next(new AppError("Email is required", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  if (newPassword !== newPasswordConfirm) {
    return next(new AppError("New passwords do not match", 400));
  }

  user.password = newPassword;
  user.passwordConfirm = undefined; // Remove passwordConfirm after hashing
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, "Password changed successfully!");
});

exports.setActive = catchAsync(async (req, res, next) => {
  const { email, isActive } = req.body;
  if (!email || !isActive) {
    return next(new AppError("Email and isActive are required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const tmpIsActive = isActive === "true" || isActive === true; // Ensure boolean value
  user.isActive = tmpIsActive;
  await user.save({ validateBeforeSave: false });

  if (user.isActive) {
    const htmlTemplate = loadTemplate("activeAccountTemplate.hbs", {
      title: "Account Activation",
      username: user.username,
      message: "Your account has been activated. You can log in now!",
    });

    try {
      await sendEmail({
        email: user.email,
        subject: "Account Activation Successful",
        html: htmlTemplate,
      });

      res.status(200).json({
        status: "success",
        message: `User account has been activated. An email has been sent to ${user.email}.`,
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      return next(
        new AppError(
          "There was an error activating the account. Please try again later.",
          500
        )
      );
    }
  }
});

exports.setAdmin = catchAsync(async (req, res, next) => {
  const { email, isAdmin } = req.body;
  if (!email || !isAdmin) {
    return next(new AppError("Email and isAdmin are required", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const tmpIsAdmin = isAdmin === "true" || isAdmin === true; // Ensure boolean value
  user.role = tmpIsAdmin ? "admin" : "user"; // Set role based on isAdmin
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: `User role updated to ${user.role}`,
  });
});
