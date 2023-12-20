const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    thumbnail: {
      type: Array,
      default: {},
      required: [true, "Thumbnail is required"],
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the same model to achieve nesting
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
