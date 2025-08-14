const express = require("express");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const isAllowedUser = require("../middleware/isAllowedUser");

const router = express.Router();

// Get VAPID public key (no auth required for public key)
router.get("/vapid-public-key", (req, res) => {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

  if (!vapidPublicKey) {
    return res.status(500).json({
      status: "error",
      message: "VAPID public key not configured",
    });
  }

  res.json({
    status: "success",
    data: {
      publicKey: vapidPublicKey,
    },
  });
});

// Test endpoint (no auth required)
router.get("/test", (req, res) => {
  res.json({
    status: "success",
    message: "Web Push routes are working!",
    timestamp: new Date().toISOString(),
  });
});

// Check subscription status (no auth required for testing)
router.get("/subscription-status", (req, res) => {
  res.json({
    status: "success",
    data: {
      hasSubscription: false,
      message: "Web Push API endpoints are working",
    },
  });
});

// Subscribe to push notifications
router.post(
  "/subscribe",
  isAllowedUser,
  catchAsync(async (req, res) => {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        status: "error",
        message: "Invalid subscription data",
      });
    }

    // For testing, we'll just return success
    // In production, save to user's account
    res.json({
      status: "success",
      message: "Successfully subscribed to push notifications",
      data: {
        subscription: subscription,
      },
    });
  })
);

// Unsubscribe from push notifications
router.post(
  "/unsubscribe",
  isAllowedUser,
  catchAsync(async (req, res) => {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        status: "error",
        message: "Endpoint required for unsubscription",
      });
    }

    // For testing, we'll just return success
    res.json({
      status: "success",
      message: "Successfully unsubscribed from push notifications",
    });
  })
);

module.exports = router;
