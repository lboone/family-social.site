const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/userModel");

const isAdmin = catchAsync(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log("Decoded token:", decoded);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token does not exist.", 401)
    );
  }

  if (!currentUser.isVerified) {
    return next(
      new AppError(
        "Your account is not verified. Please verify your account.",
        403
      )
    );
  }

  if (!currentUser.isActive) {
    return next(
      new AppError("Your account is not active. Please contact support.", 403)
    );
  }

  if (!currentUser.isAdmin()) {
    return next(
      new AppError("You do not have permission to perform this action.", 403)
    );
  }
  req.user = currentUser;
  next();
});

module.exports = isAdmin;
