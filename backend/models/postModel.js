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
      type: {
        url: {
          type: String,
          required: [true, "Image URL is required when image is provided"],
        },
        publicId: {
          type: String,
          required: [
            true,
            "Image public ID is required when image is provided",
          ],
        },
      },
      required: false,
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
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

// Custom validation to ensure if image is provided, both url and publicId are present
postSchema.pre("save", function (next) {
  if (this.image && (!this.image.url || !this.image.publicId)) {
    const error = new Error(
      "When image is provided, both url and publicId are required"
    );
    error.name = "ValidationError";
    return next(error);
  }
  if (this.caption) {
    // Extract hashtags from caption
    const hashtags = this.caption.match(/#([a-zA-Z0-9_]+)/g) || [];
    this.hashtags = hashtags.map((tag) => tag.substring(1).toLowerCase());
  }
  next();
});

postSchema.index({ user: 1, createdAt: -1 }); // Index for user posts sorted by creation date

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
