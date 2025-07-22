const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "A user must have a username"],
      unique: true,
      trim: true,
      maxlength: [30, "A username must have less or equal than 30 characters"],
      minlength: [3, "A username must have more or equal than 3 characters"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "A user must have an email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "A user must have a password"],
      minlength: [8, "A password must have more or equal than 8 characters"],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        validator: function (v) {
          return v === this.password;
        },
        message: "Passwords must match",
      },
    },
    profilePicture: {
      type: String,
    },
    profileBackground: {
      type: String,
    },
    profileBackgroundPosition: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      scale: { type: Number, default: 1 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    usernameColor: {
      type: String,
      default: "#000000", // Default black color
      validate: {
        validator: function (v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: "Username color must be a valid hex color code",
      },
    },
    bio: {
      type: String,
      maxlength: [150, "A bio must have less or equal than 150 characters"],
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    pushNotificationSettings: {
      pushEnabled: {
        type: Boolean,
        default: false,
      },
      postType: {
        type: String,
        enum: ["all", "following", "none"],
        default: "none",
      },
      likes: {
        type: Boolean,
        default: false,
      },
      comments: {
        type: Boolean,
        default: false,
      },
      follow: {
        type: Boolean,
        default: false,
      },
      unfollow: {
        type: Boolean,
        default: false,
      },
      fcmToken: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  // Hash password if it has been modified or is new
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined; // Remove passwordConfirm after hashing
  next();
});

userSchema.methods.correctPassword = async function (
  userPassword,
  databasePassword
) {
  return await bcrypt.compare(userPassword, databasePassword);
};
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

const User = mongoose.model("User", userSchema);
module.exports = User;
