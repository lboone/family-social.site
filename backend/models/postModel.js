const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      trim: true,
      maxlength: [
        2200,
        "A post caption must have less or equal than 2200 characters",
      ],
    },
    image: {
      url: { type: String, required: [true, "A post must have an image URL"] },
      publicId: {
        type: String,
        required: [true, "A post must have a public ID for the image"],
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A post must have a user"],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

postSchema.index({ user: 1, createdAt: -1 }); // Index for user posts sorted by creation date

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
