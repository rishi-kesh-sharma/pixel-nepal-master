const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
});

// virtual method to populate
teamMemberSchema.virtual("teamInfo", {
  ref: "Team",
  foreignField: "_id",
  localField: "teams",
});

module.exports = mongoose.model("TeamMember", teamMemberSchema);
