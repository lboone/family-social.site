const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("User ID is required", 400));
  }

  const user = await User.findById(id).select(
    "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires"
  );
  // .populate({
  //   path: "posts",
  //   options: { sort: { createdAt: -1 } },
  // })
  // .populate({
  //   path: "savedPosts",
  //   options: { sort: { createdAt: -1 } },
  // });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
