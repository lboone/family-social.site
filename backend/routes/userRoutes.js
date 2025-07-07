const express = require("express");
const {
  signup,
  verifyAccount,
  resendOtp,
  login,
  setActive,
  setAdmin,
} = require("../controllers/authController");
const isSignedUp = require("../middleware/isSignedUp");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.post("/signup", signup);
router.post("/verify", isSignedUp, verifyAccount);
router.post("/resend-otp", isSignedUp, resendOtp);
router.post("/login", login);
router.post("/set-active", isAdmin, setActive);
router.post("/set-admin", isAdmin, setAdmin);

module.exports = router;
