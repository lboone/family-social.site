const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const getDataUri = require("../utils/dataUri");
const { uploadToCloudinary } = require("../utils/cloudinary");
const mongoose = require("mongoose");

exports.getProfile = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("User ID is required", 400));
  }

  const user = await User.findById(id)
    .select(
      "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires"
    )
    .populate({
      path: "posts",
      options: { sort: { createdAt: -1 } },
    })
    .populate({
      path: "savedPosts",
      options: { sort: { createdAt: -1 } },
    })
    .populate({ path: "following", options: { sort: { username: 1 } } })
    .populate({ path: "followers", options: { sort: { username: 1 } } });

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

exports.editProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { bio, usernameColor, pushNotificationSettings } = req.body;
  const profilePicture = req.file;

  let cloudResponse;
  if (profilePicture) {
    const fileUri = getDataUri(profilePicture);
    cloudResponse = await uploadToCloudinary(fileUri);
  }
  const user = await User.findById(userId).select("-password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (bio) {
    user.bio = bio;
  }
  if (pushNotificationSettings) {
    user.pushNotificationSettings = JSON.parse(pushNotificationSettings);
  }
  if (usernameColor) {
    // Validate hex color format
    if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(usernameColor)) {
      return next(
        new AppError(
          "Invalid color format. Please provide a valid hex color.",
          400
        )
      );
    }
    user.usernameColor = usernameColor;
  }
  if (profilePicture) {
    user.profilePicture = cloudResponse.secure_url;
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    message: "Profile updated successfully",
    status: "success",
    data: {
      user,
    },
  });
});

exports.suggestedUser = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;
  const users = await User.find({
    _id: { $ne: loginUserId },
    isVerified: true,
    isActive: true,
  })
    .select(
      "-password -otp -otpExpires -resetPasswordOTP -resetPasswordOTPExpires"
    )
    .limit(10)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.followUnfollow = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;
  const targetUserId = req.params.id;
  if (loginUserId.toString() === targetUserId.toString()) {
    return next(new AppError("You cannot follow/unfollow yourself", 400));
  }
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    return next(new AppError("Target user not found", 404));
  }
  const isFollowing = targetUser.followers.includes(loginUserId);
  if (isFollowing) {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $pull: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $pull: { followers: loginUserId } }
      ),
    ]);
  } else {
    await Promise.all([
      User.updateOne(
        { _id: loginUserId },
        { $addToSet: { following: targetUserId } }
      ),
      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { followers: loginUserId } }
      ),
    ]);
  }

  const updatedLoggedInUser = await User.findById(loginUserId).select(
    "-password"
  );

  res.status(200).json({
    message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
    status: "success",
    data: {
      user: updatedLoggedInUser,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new AppError("You are not logged in", 404));
  }
  res.status(200).json({
    status: "success",
    message: "Authenticated User",
    data: {
      user,
    },
  });
});

exports.getUnauthorizedUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({
    $or: [{ isVerified: false }, { isActive: false }],
  })
    .select("-password ")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

exports.allUsers = catchAsync(async (req, res, next) => {
  const loginUserId = req.user.id;
  const users = await User.find({
    _id: { $ne: loginUserId },
  })
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.getAllUsersGeneral = catchAsync(async (req, res, next) => {
  const loginUserId = mongoose.Types.ObjectId.createFromHexString(req.user.id);
  const users = await User.aggregate([
    // Match users excluding the logged-in user
    {
      $match: {
        _id: { $ne: loginUserId },
        isVerified: true,
        isActive: true,
      },
    },
    // Add post count field
    {
      $addFields: {
        postCount: { $size: "$posts" },
      },
    },
    // Sort by post count (descending) then by username (ascending)
    {
      $sort: {
        postCount: -1,
        username: 1,
      },
    },
    // Remove sensitive fields
    {
      $project: {
        password: 0,
        otp: 0,
        otpExpires: 0,
        resetPasswordOTP: 0,
        resetPasswordOTPExpires: 0,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      users,
    },
  });
});

exports.updateProfileBackground = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const profileBackground = req.file;
  const { x, y, scale, width, height } = req.body;

  if (!profileBackground) {
    return next(new AppError("Please provide a background image", 400));
  }

  let cloudResponse;
  const fileUri = getDataUri(profileBackground);
  cloudResponse = await uploadToCloudinary(fileUri);

  const user = await User.findById(userId).select("-password");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.profileBackground = cloudResponse.secure_url;

  // Store positioning data if provided
  if (x !== undefined && y !== undefined && scale !== undefined) {
    user.profileBackgroundPosition = {
      x: parseFloat(x) || 0,
      y: parseFloat(y) || 0,
      scale: parseFloat(scale) || 1,
      width: parseFloat(width) || 0,
      height: parseFloat(height) || 0,
    };
  }

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    message: "Profile background updated successfully",
    status: "success",
    data: {
      user,
    },
  });
});
