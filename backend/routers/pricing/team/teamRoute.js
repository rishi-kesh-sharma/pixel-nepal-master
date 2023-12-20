const express = require("express");
const { createTeam, getAllTeam, createTeamMember, getAllTeamMember, deleteTeam } = require("../../../controllers/pricing/team/teamController");
const { protect, isMainPerson } = require("../../../middleware/authMiddleware");
const router = express.Router();

// Private Routes
router.post("/create-team", protect, isMainPerson, createTeam);
router.post("/team-member/create-member", protect, isMainPerson, createTeamMember);
router.get("/team-member/all-member", protect, isMainPerson, getAllTeamMember);
router.delete("/team-member", protect, isMainPerson, deleteTeam);

router.get("/", protect, isMainPerson, getAllTeam);

module.exports = router;
