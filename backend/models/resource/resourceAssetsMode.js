const mongoose = require("mongoose");

const premiumResourceSchema = new mongoose.Schema(
  {
    assets: {
      type: Array,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResourceAssets", premiumResourceSchema);
