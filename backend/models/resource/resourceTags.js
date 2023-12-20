const mongoose = require("mongoose");

const resourceTagSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
      },
    ],
    rank: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResourceTag", resourceTagSchema);
