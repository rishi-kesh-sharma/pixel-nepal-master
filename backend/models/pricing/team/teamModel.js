const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  mainPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teamName: {
    type: String,
    required: [true, "Team Name is required"],
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamMember",
    },
  ],
});

// virtual method to populate
teamSchema.virtual("teamMemberInfo", {
  ref: "TeamMember",
  foreignField: "_id",
  localField: "team",
});
module.exports = mongoose.model("Team", teamSchema);
