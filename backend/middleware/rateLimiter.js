const rateLimit = require("express-rate-limit");

// General rate limiter for API endpoints
const createRateLimiter = (
  windowMs,
  max,
  message,
  skipSuccessfulRequests = false
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: "error",
      message: message || "Too many requests, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests, // Don't count successful requests
    handler: (req, res) => {
      res.status(429).json({
        status: "error",
        message: message || "Too many requests, please try again later.",
      });
    },
  });
};

// Strict rate limiter for authentication endpoints
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // Limit each IP to 5 requests per windowMs
  "Too many authentication attempts, please try again in 15 minutes.",
  true // Don't count successful requests
);

// Rate limiter for login specifically (more restrictive)
const loginLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  3, // Limit each IP to 3 login attempts per windowMs
  "Too many login attempts, please try again in 15 minutes.",
  true // Don't count successful requests
);

// Rate limiter for password reset requests
const passwordResetLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  3, // Limit each IP to 3 password reset requests per hour
  "Too many password reset requests, please try again in 1 hour."
);

// Rate limiter for OTP requests (signup, resend OTP)
const otpLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // Limit each IP to 5 OTP requests per hour
  "Too many OTP requests, please try again in 1 hour."
);

// Rate limiter for file uploads
const uploadLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10, // Limit each IP to 10 uploads per 15 minutes
  "Too many upload requests, please try again in 15 minutes."
);

// General API rate limiter (less restrictive)
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  10000000, // Limit each IP to 300 requests per windowMs
  "Too many API requests, please try again later."
);

// Admin action rate limiter
const adminLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  200, // Limit each IP to 20 admin actions per hour
  "Too many admin requests, please try again in 1 hour."
);

module.exports = {
  authLimiter,
  loginLimiter,
  passwordResetLimiter,
  otpLimiter,
  uploadLimiter,
  apiLimiter,
  adminLimiter,
  createRateLimiter,
};
