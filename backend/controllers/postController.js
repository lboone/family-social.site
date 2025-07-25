const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");
const { uploadToCloudinary, cloudinary } = require("../utils/cloudinary");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const Comment = require("../models/commentModel");
const getDataUri = require("../utils/dataUri");
const NotificationService = require("../services/notificationService");

// Use the singleton notification service instance
const notificationService = NotificationService;

exports.createPost = catchAsync(async (req, res, next) => {
  const { caption } = req.body;
  const userId = req.user._id;

  // Extract files from multer fields
  const postImage = req.files?.postImage?.[0];
  const postVideo = req.files?.postVideo?.[0];

  let post;
  let cloudResponse;

  if (postImage) {
    // Handle image upload
    const fileUri = getDataUri(postImage);
    cloudResponse = await uploadToCloudinary(fileUri);
    post = await Post.create({
      caption,
      image: {
        url: cloudResponse.secure_url,
        publicId: cloudResponse.public_id,
      },
      user: userId,
    });
  } else if (postVideo) {
    // Handle video upload
    const fileUri = getDataUri(postVideo);
    // Upload video to Cloudinary with video-specific options
    cloudResponse = await uploadToCloudinary(fileUri, {
      resource_type: "video",
      format: "mp4",
      quality: "auto",
    });

    post = await Post.create({
      caption,
      video: {
        url: cloudResponse.secure_url,
        publicId: cloudResponse.public_id,
        thumbnail: cloudResponse.secure_url.replace(/\.[^/.]+$/, ".jpg"), // Generate thumbnail URL
      },
      user: userId,
    });
  } else {
    // No media, create text-only post
    post = await Post.create({
      caption,
      user: userId,
    });
  }

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

// exports.getAllPost = catchAsync(async (req, res, next) => {
//   const posts = await Post.find()
//     .populate({
//       path: "user",
//       select: "username bio profilePicture",
//     })
//     .populate({
//       path: "comments",
//       select: "text user",
//       populate: {
//         path: "user",
//         select: "username profilePicture",
//       },
//     })
//     .sort({ createdAt: -1 });

//   return res.status(200).json({
//     status: "success",
//     message: "Posts retrieved successfully",
//     data: { posts },
//   });
// });

// In postController.js - update getAllPost function
exports.getAllPost = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .populate({
      path: "user",
      select: "username bio profilePicture",
    })
    .populate({
      path: "comments",
      select: "text user createdAt",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const totalPosts = await Post.countDocuments();
  const hasMore = skip + posts.length < totalPosts;

  return res.status(200).json({
    status: "success",
    message: "Posts retrieved successfully",
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPosts,
        hasMore,
        totalPages: Math.ceil(totalPosts / limit),
      },
    },
  });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12; // 12 for grid layout
  const skip = (page - 1) * limit;

  const posts = await Post.find({ user: userId })
    .populate({ path: "user", select: "username bio profilePicture" })
    .populate({
      path: "comments",
      select: "text user createdAt",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination info
  const totalPosts = await Post.countDocuments({ user: userId });
  const totalPages = Math.ceil(totalPosts / limit);
  const hasMore = page < totalPages;

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasMore,
        limit,
      },
    },
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

  if (user.role !== "admin") {
    if (post.user.id.toString() !== userId.toString()) {
      return next(new AppError("You cannot delete this post", 403));
    }
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
  if (post.image && post.image.publicId) {
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
  const username = req.user.username;

  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    // Unlike the post
    await Post.findByIdAndUpdate(
      { _id: postId },
      { $pull: { likes: userId } },
      { new: true }
    );
  } else {
    // Like the post
    await Post.findByIdAndUpdate(
      { _id: postId },
      { $addToSet: { likes: userId } }
    );

    // 🔔 NEW: Send like notification (only when liking, not unliking)
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔔 Attempting to send like notification for post ${postId} by ${username}`
        );
      }
      const notificationResult = await notificationService.sendLikeNotification(
        postId,
        userId,
        username
      );
      if (process.env.NODE_ENV === "development") {
        console.log(`📧 Like notification result:`, notificationResult);
      }
    } catch (error) {
      // Don't fail the request if notification fails
      console.error("❌ Failed to send like notification:", error);
    }
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
    post: postId,
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

exports.getPostsByHashtag = catchAsync(async (req, res, next) => {
  const { hashtag } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find({
    hashtags: hashtag.toLowerCase(),
  })
    .populate("user", "username profilePicture")
    .populate({
      path: "comments",
      select: "text user createdAt",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination info
  const totalPosts = await Post.countDocuments({
    hashtags: hashtag.toLowerCase(),
  });
  const totalPages = Math.ceil(totalPosts / limit);
  const hasMore = page < totalPages;

  res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasMore,
        limit,
      },
    },
  });
});

exports.getAllHashtags = catchAsync(async (req, res, next) => {
  // Aggregate hashtags from all posts
  const hashtagStats = await Post.aggregate([
    // Only include posts that have hashtags
    { $match: { hashtags: { $exists: true, $ne: [] } } },

    // Unwind the hashtags array to create separate documents for each hashtag
    { $unwind: "$hashtags" },

    // Group by hashtag and count occurrences
    {
      $group: {
        _id: "$hashtags",
        count: { $sum: 1 },
      },
    },

    // Sort by count in descending order (most popular first)
    { $sort: { count: -1 } },

    // Rename _id to hashtag for clearer response
    {
      $project: {
        _id: 0,
        hashtag: "$_id",
        count: 1,
      },
    },
  ]);

  // Get total unique hashtags count
  const totalHashtags = hashtagStats.length;

  return res.status(200).json({
    status: "success",
    message: "Hashtags retrieved successfully",
    results: totalHashtags,
    data: {
      hashtags: hashtagStats,
      totalHashtags: totalHashtags,
    },
  });
});

exports.getSavedPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12; // 12 for grid layout
  const skip = (page - 1) * limit;

  // Find the user and populate saved posts with pagination
  const user = await User.findById(userId).populate({
    path: "savedPosts",
    populate: {
      path: "user",
      select: "username bio profilePicture",
    },
    options: {
      sort: { createdAt: -1 },
      skip: skip,
      limit: limit,
    },
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Get total count of saved posts for pagination info
  const totalSavedPosts = user.savedPosts.length;
  const totalPages = Math.ceil(totalSavedPosts / limit);
  const hasMore = page < totalPages;

  return res.status(200).json({
    status: "success",
    results: user.savedPosts.length,
    data: {
      posts: user.savedPosts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: totalSavedPosts,
        hasMore,
        limit,
      },
    },
  });
});

exports.getLikedPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12; // 12 for grid layout
  const skip = (page - 1) * limit;

  // Find posts that the user has liked with pagination
  const posts = await Post.find({
    likes: userId,
  })
    .populate({
      path: "user",
      select: "username bio profilePicture",
    })
    .populate({
      path: "comments",
      select: "text user createdAt",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count of liked posts for pagination info
  const totalLikedPosts = await Post.countDocuments({
    likes: userId,
  });
  const totalPages = Math.ceil(totalLikedPosts / limit);
  const hasMore = page < totalPages;

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: totalLikedPosts,
        hasMore,
        limit,
      },
    },
  });
});

exports.getFollowingPosts = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // First, get the user to access their following list
  const user = await User.findById(userId).select("following");
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // If user is not following anyone, return empty results
  if (!user.following || user.following.length === 0) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: {
        posts: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalPosts: 0,
          hasMore: false,
          limit,
        },
      },
    });
  }

  // Get posts from users that this user follows
  const posts = await Post.find({ user: { $in: user.following } })
    .populate({ path: "user", select: "username bio profilePicture" })
    .populate({
      path: "comments",
      select: "text user createdAt",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count of posts from followed users for pagination info
  const totalFollowingPosts = await Post.countDocuments({
    user: { $in: user.following },
  });
  const totalPages = Math.ceil(totalFollowingPosts / limit);
  const hasMore = page < totalPages;

  return res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts: totalFollowingPosts,
        hasMore,
        limit,
      },
    },
  });
});

exports.getPostById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate({
      path: "user",
      select: "username bio profilePicture",
    })
    .populate({
      path: "comments",
      select: "text user createdAt",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "user",
        select: "username profilePicture",
      },
    });

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Post retrieved successfully",
    data: { post }, // Return the post with populated user
  });
});
