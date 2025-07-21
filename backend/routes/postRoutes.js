const express = require("express");

const router = express.Router();
const {
  createPost,
  getAllPost,
  getUserPosts,
  getSavedPosts,
  getLikedPosts,
  getFollowingPosts,
  saveOrUnsavePost,
  deletePost,
  likeOrUnlikePost,
  addComment,
  getPostsByHashtag,
  getAllHashtags,
  getPostById,
} = require("../controllers/postController");
const isAllowedUser = require("../middleware/isAllowedUser");
const upload = require("../middleware/multer");
const { uploadLimiter, apiLimiter } = require("../middleware/rateLimiter");

// Test endpoint for file upload debugging

router.post(
  "/create",
  uploadLimiter,
  isAllowedUser,
  upload.fields([
    { name: "postImage", maxCount: 1 },
    { name: "postVideo", maxCount: 1 },
  ]),
  createPost
);
router.get("/all", apiLimiter, isAllowedUser, getAllPost);
router.get("/user/:id", apiLimiter, isAllowedUser, getUserPosts);
router.get("/saved/:id", apiLimiter, isAllowedUser, getSavedPosts);
router.get("/liked/:id", apiLimiter, isAllowedUser, getLikedPosts);
router.get("/following/:id", apiLimiter, isAllowedUser, getFollowingPosts);
router.post(
  "/save-unsave/:postId",
  apiLimiter,
  isAllowedUser,
  saveOrUnsavePost
);
router.post(
  "/like-unlike/:postId",
  apiLimiter,
  isAllowedUser,
  likeOrUnlikePost
);
router.post("/comment/:postId", apiLimiter, isAllowedUser, addComment);
router.delete("/delete/:postId", apiLimiter, isAllowedUser, deletePost);
router.get(
  "/by-hashtag/:hashtag",
  apiLimiter,
  isAllowedUser,
  getPostsByHashtag
);
router.get("/hashtags", apiLimiter, isAllowedUser, getAllHashtags);
router.get("/post/:id", apiLimiter, isAllowedUser, getPostById);

module.exports = router;
