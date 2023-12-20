const mongoose = require("mongoose");

const userRoleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rolename: {
      type: String,
      required: [true, "Role Name is required"],
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("userRole", userRoleSchema);
