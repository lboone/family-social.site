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

// Test endpoint for file upload debugging

router.post("/create", isAllowedUser, upload.single("postImage"), createPost);
router.get("/all", isAllowedUser, getAllPost);
router.get("/user/:id", isAllowedUser, getUserPosts);
router.get("/saved/:id", isAllowedUser, getSavedPosts);
router.get("/liked/:id", isAllowedUser, getLikedPosts);
router.get("/following/:id", isAllowedUser, getFollowingPosts);
router.post("/save-unsave/:postId", isAllowedUser, saveOrUnsavePost);
router.post("/like-unlike/:postId", isAllowedUser, likeOrUnlikePost);
router.post("/comment/:postId", isAllowedUser, addComment);
router.delete("/delete/:postId", isAllowedUser, deletePost);
router.get("/by-hashtag/:hashtag", isAllowedUser, getPostsByHashtag);
router.get("/hashtags", isAllowedUser, getAllHashtags);
router.get("/post/:id", isAllowedUser, getPostById);

module.exports = router;
