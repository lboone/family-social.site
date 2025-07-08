const express = require("express");

const router = express.Router();
const {
  createPost,
  getAllPost,
  getUserPosts,
  saveOrUnsavePost,
  deletePost,
} = require("../controllers/postController");
const isAllowedUser = require("../middleware/isAllowedUser");
const upload = require("../middleware/multer");

router.post("/create", isAllowedUser, upload.single("image"), createPost);
router.get("/all", isAllowedUser, getAllPost);
router.get("/user/:id", isAllowedUser, getUserPosts);
router.post("/save-unsave/:postId", isAllowedUser, saveOrUnsavePost);
router.delete("/delete/:postId", isAllowedUser, deletePost);

module.exports = router;
