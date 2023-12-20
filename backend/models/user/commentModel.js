const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: [true, "Resource is required"],
    },
    user: {
      type: Object,
      required: [true, "User is required"],
    }, // The author of the comment
    content: {
      type: String,
      required: [true, "Comment description is required"],
    }, // The content of the comment
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
