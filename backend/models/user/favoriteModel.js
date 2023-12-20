const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Favorite", FavoriteSchema);
