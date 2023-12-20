const mongoose = require("mongoose");

const downloadRecordSchema = new mongoose.Schema(
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
    type: {
      type: String, // 'free' or 'premium'
      required: true,
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DownloadRecord", downloadRecordSchema);
/* // virtual method to populate
downloadRecordSchema.virtual("resourceInfo", {
  ref: "Resource",
  foreignField: "_id",
  localField: "resource",
}); */
