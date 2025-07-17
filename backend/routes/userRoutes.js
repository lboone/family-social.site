const express = require("express");
const {
  signup,
  verifyAccount,
  resendOtp,
  login,
  setActive,
  setAdmin,
  logout,
  forgetPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const {
  getProfile,
  editProfile,
  suggestedUser,
  followUnfollow,
  getMe,
  getUnauthorizedUsers,
  allUsers,
  getAllUsersGeneral,
} = require("../controllers/userController");
const isSignedUp = require("../middleware/isSignedUp");
const isAllowedUser = require("../middleware/isAllowedUser");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/multer");
const { getPostById } = require("../controllers/postController");

const router = express.Router();
// Auth Routes
router.post("/signup", signup);
router.post("/verify", isSignedUp, verifyAccount);
router.post("/resend-otp", isSignedUp, resendOtp);
router.post("/login", login);
router.post("/logout", isAllowedUser, logout);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", isAllowedUser, changePassword);
router.post("/set-active", isAdmin, setActive);
router.post("/set-admin", isAdmin, setAdmin);
router.get("/all", isAdmin, allUsers);

// User Routes
router.get("/profile/:id", isAllowedUser, getProfile);
router.post(
  "/edit-profile",
  isAllowedUser,
  upload.single("profilePicture"),
  editProfile
);
router.get("/suggested-users", isAllowedUser, suggestedUser);
router.post("/follow-unfollow/:id", isAllowedUser, followUnfollow);
router.get("/me", isAllowedUser, getMe);
router.get("/unauthorized-users", isAdmin, getUnauthorizedUsers);
router.get("/all-general", isAllowedUser, getAllUsersGeneral);

module.exports = router;
