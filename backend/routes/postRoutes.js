const express = require("express");

const router = express.Router();
const {
  createPost,
  getAllPost,
  getUserPosts,
  saveOrUnsavePost,
  deletePost,
  likeOrUnlikePost,
  addComment,
  getPostsByHashtag,
  getAllHashtags,
} = require("../controllers/postController");
const isAllowedUser = require("../middleware/isAllowedUser");
const upload = require("../middleware/multer");

// Test endpoint for file upload debugging

router.post("/create", isAllowedUser, upload.single("postImage"), createPost);
router.get("/all", isAllowedUser, getAllPost);
router.get("/user/:id", isAllowedUser, getUserPosts);
router.post("/save-unsave/:postId", isAllowedUser, saveOrUnsavePost);
router.post("/like-unlike/:postId", isAllowedUser, likeOrUnlikePost);
router.post("/comment/:postId", isAllowedUser, addComment);
router.delete("/delete/:postId", isAllowedUser, deletePost);
router.get("/by-hashtag/:hashtag", isAllowedUser, getPostsByHashtag);
router.get("/hashtags", isAllowedUser, getAllHashtags);

module.exports = router;
