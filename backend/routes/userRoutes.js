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
  updateProfileBackground,
} = require("../controllers/userController");
const isSignedUp = require("../middleware/isSignedUp");
const isAllowedUser = require("../middleware/isAllowedUser");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../middleware/multer");
const { getPostById } = require("../controllers/postController");
const {
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  otpLimiter,
  uploadLimiter,
  apiLimiter,
  adminLimiter,
} = require("../middleware/rateLimiter");

const router = express.Router();
// Auth Routes
router.post("/signup", authLimiter, signup);
router.post("/verify", otpLimiter, isSignedUp, verifyAccount);
router.post("/resend-otp", otpLimiter, isSignedUp, resendOtp);
router.post("/login", loginLimiter, login);
router.post("/logout", isAllowedUser, logout);
router.post("/forget-password", passwordResetLimiter, forgetPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
router.post("/change-password", authLimiter, isAllowedUser, changePassword);
router.post("/set-active", adminLimiter, isAdmin, setActive);
router.post("/set-admin", adminLimiter, isAdmin, setAdmin);
router.get("/all", adminLimiter, isAdmin, allUsers);

// User Routes
router.get("/profile/:id", apiLimiter, isAllowedUser, getProfile);
router.post(
  "/edit-profile",
  uploadLimiter,
  isAllowedUser,
  upload.single("profilePicture"),
  editProfile
);
router.post(
  "/update-background",
  uploadLimiter,
  isAllowedUser,
  upload.single("profileBackground"),
  updateProfileBackground
);
router.get("/suggested-users", apiLimiter, isAllowedUser, suggestedUser);
router.post("/follow-unfollow/:id", apiLimiter, isAllowedUser, followUnfollow);
router.get("/me", apiLimiter, isAllowedUser, getMe);
router.get("/unauthorized-users", adminLimiter, isAdmin, getUnauthorizedUsers);
router.get("/all-general", apiLimiter, isAllowedUser, getAllUsersGeneral);

module.exports = router;
