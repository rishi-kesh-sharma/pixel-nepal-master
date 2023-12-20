const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Please add your description."],
      unique: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comment",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("comment", commentSchema);
