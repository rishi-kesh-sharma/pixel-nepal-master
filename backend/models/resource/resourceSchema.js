const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    resourceType: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
    },
    numOfViews: {
      type: Number,
      default: 0,
    },
    /* isLiked: {
      type: Boolean,
      default: false,
    },
    isDisLiked: {
      type: Boolean,
      default: false,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    Dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please author is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    assets: {
      type: Object,
      default: {},
    },
    thumbnail: {
      type: Object,
      default: {},
    },
    download: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DownloadRecord",
      },
    ],
    // Add references to User model for liked and disliked resources
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
