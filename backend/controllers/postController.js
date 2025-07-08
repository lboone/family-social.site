const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");
const { uploadToCloudinary, cloudinary } = require("../utils/cloudinary");
const Post = require("../models/postModel");
const User = require("../models/userModel");

exports.createPost = catchAsync(async (req, res, next) => {
  const { caption } = req.body;
  const image = req.file;
  const userId = req.user._id;
  if (!image) {
    return next(new Error("Please upload an image", 400));
  }

  // optimize our image
  const optimizedImageBuffer = await sharp(image.buffer)
    .resize({ width: 800, height: 800, fit: "inside" })
    .toFormat("jpeg", { quality: 80 })
    .toBuffer();

  const fileUrl = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
    "base64"
  )}`;

  const cloudResponse = await uploadToCloudinary(fileUrl);

  let post = await Post.create({
    capition,
    image: {
      url: cloudResponse.secure_url,
      publicId: cloudResponse.public_id,
    },
    user: userId,
  });

  // add post to user's posts
  const user = await User.findById(userId);
  if (user) {
    user.posts.push(post._id);
    await user.save({ validateBeforeSave: false });
  }

  post = await post.populate({
    path: "user",
    select: "username email bio profilePicture",
  });

  return res.status(201).json({
    status: "success",
    message: "Post created successfully",
    data: { post },
  });
});

exports.getAllPost = catchAsync(async (req, res, next) => {
  const posts = await Post.find()
    .populate({
      path: "user",
      select: "username bio profilePicture",
    })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: "success",
    message: "Posts retrieved successfully",
    data: { posts },
  });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const posts = await Post.find({ user: userId })
    .populate({ path: "user", select: "username bio profilePicture" })
    .populate({
      path: "comments",
      select: "text user",
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: { posts },
  });
});

exports.saveOrUnsavePost = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const postId = req.params.postId;

  const user = await User.findById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isPostSaved = user.savedPosts.includes(postId);
  if (isPostSaved) {
    user.savedPosts.pull(postId);
  } else {
    user.savedPosts.push(postId);
  }
  await user.save({ validateBeforeSave: false });
  return res.status(200).json({
    status: "success",
    message: isPostSaved
      ? "Post unsaved successfully"
      : "Post saved successfully",
    data: {
      user,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const post = await Post.findById(postId).populate("user");
  const user = await User.findById(userId);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (!user.isAdmin() || post.user.id.toString() !== userId.toString()) {
    return next(new AppError("You cannot delete this post", 403));
  }

  await User.updateOne({ _id: userId }, { $pull: { posts: postId } });

  await User.updateMany(
    {
      savedPosts: postId,
    },
    {
      $pull: { savedPosts: postId },
    }
  );

  // Remove the comments of this post
  await Comment.deleteMany({ post: postId });

  // Remove cloudinary image
  if (post.image.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId);
  }

  await Post.findByIdAndDelete({ _id: postId });

  return res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
  });
});

exports.likeOrUnlikePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }
  const isLiked = post.likes.includes(userId);
  if (isLiked) {
    await Post.findByIdAndUpdate(
      { _id: postId },
      { $pull: { likes: userId } },
      { new: true }
    );
  } else {
    await Post.findByIdAndUpdate(
      { _id: postId },
      { $addToSet: { likes: userId } }
    );
  }

  return res.status(200).json({
    status: "success",
    message: isLiked ? "Post unliked successfully" : "Post liked successfully",
    data: {
      post,
    },
  });
});

exports.addComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user._id;
  const { text } = req.body;
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (!text || text.trim() === "") {
    return next(new AppError("Comment text cannot be empty", 400));
  }

  const comment = await Comment.create({
    text,
    user: userId,
  });
  post.comments.push(comment);
  await post.save({ validateBeforeSave: false });
  await comment.populate({
    path: "user",
    select: "username profilePicture bio",
  });
  return res.status(201).json({
    status: "success",
    message: "Comment added successfully",
    data: {
      comment,
    },
  });
});
