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
const isSignedUp = require("../middleware/isSignedUp");
const isAllowedUser = require("../middleware/isAllowedUser");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

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

module.exports = router;
