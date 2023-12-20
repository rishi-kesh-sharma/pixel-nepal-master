const asyncHandler = require("express-async-handler");
const TeamSchema = require("../../../models/pricing/team/teamModel");
const TeamMemberSchema = require("../../../models/pricing/team/teamMemberModel");
const UserSchema = require("../../../models/user/userModel");
const { generateToken } = require("../../../utils");
const parse = require("ua-parser-js");
const { default: mongoose } = require("mongoose");

const createTeam = asyncHandler(async (req, res) => {
  const { teamName } = req.body;
  const userId = req.user._id; // Extracted from the authenticated user

  // Check if the main person's plan has expired
  const mainPerson = await UserSchema.findById(userId);

  if (!mainPerson || !mainPerson.isSubscribed || !mainPerson.isTeam || !mainPerson.isMainPerson) {
    return res.status(400).json({ message: "Only Main person can create a team" });
  }

  // Get the numberOfUsers from the main person's data
  const numberOfUsers = mainPerson.remainingTeamAccounts;

  // Update main person's remainingTeamAccounts
  mainPerson.remainingTeamAccounts = numberOfUsers - 1; // Subtract main person
  //   mainPerson.isTeam = true;
  //   mainPerson.isMainPerson = true;
  //   mainPerson.isSubscribed = true;
  await mainPerson.save();

  // Create a new team
  const team = await TeamSchema.create({
    mainPerson: userId,
    numberOfUsers: numberOfUsers,
    teamName,
  });

  /*  // Create team members and associate them with the team
  for (let i = 1; i < numberOfUsers; i++) {
    await TeamMemberSchema.create({
      user: mainPerson._id,
      team: team._id,
    });
  } */

  res.status(201).json({ message: "Team created successfully", team });
});

// Create a new team member
const createTeamMember = asyncHandler(async (req, res) => {
  const { email, password, teamId } = req.body;
  const userId = req.user._id;

  // Check if the main person's plan has expired
  const mainPersons = await UserSchema.findById(userId);

  if (!mainPersons || !mainPersons.isSubscribed || !mainPersons.isTeam || !mainPersons.isMainPerson) {
    return res.status(400).json({ message: "Only Main person can create a team" });
  }

  // Generate a common ID for both UserSchema and TeamMemberSchema
  const commonId = new mongoose.Types.ObjectId();

  //validation
  if (!email || !password || !teamId) {
    res.status(400);
    throw new Error("Please fill in all the required fields.");
  }

  if (password?.length < 8) {
    res.status(400);
    throw new Error("Password should contain at least 8 characters.");
  }

  // Check if the team exists
  const team = await TeamSchema.findById(teamId);
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Create a new team member
  const teamMember = await TeamMemberSchema.create({
    _id: commonId,
    email,
    password,
    team: teamId,
  });

  // Update team's members
  team.members.push(teamMember._id);
  await team.save();

  // Update main person's remainingTeamAccounts
  const mainPerson = await UserSchema.findById(team.mainPerson);
  if (mainPerson.remainingTeamAccounts > 0) {
    mainPerson.remainingTeamAccounts -= 1;
    await mainPerson.save();
  }

  //Check if user exits
  const userExists = await UserSchema.findOne({
    email,
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists.");
  }

  //Get from which device user is loggedin
  // this used for 2FA
  const ua = parse(req.headers["user-agent"]);
  const userAgent = [ua.ua];
  //console.log(userAgent)

  // if not exits create new user
  const user = await UserSchema.create({
    _id: commonId,
    email,
    password,
    userAgent,
  });

  // Update the user's fields immediately after creating the user
  user.isVerified = true;
  user.isTeam = true;
  user.isSubscribed = true;
  await user.save();

  // genrate token
  const token = generateToken(user._id);

  /* // send http-only cookie
  res.cookie("token", token, {
    path: "/", // set default
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 604800), // 7day
    sameSite: "none",
    secure: true,
  });
 */
  //if user created then show this property
  if (teamMember && user) {
    const { _id, name, email, phone, bio, avtar, role, isVerified } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      avtar,
      role,
      isVerified,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const deleteTeam = asyncHandler(async (req, res) => {
  const { id } = req.body;
  const authenticatedUserId = req.user.id; // Replace with how you get the authenticated user's ID

  // Find the team member to be deleted
  const teamMember = await TeamMemberSchema.findById(id);

  if (!teamMember) {
    res.status(404);
    throw new Error("Team member not found");
  }
  // Find the user corresponding to the team member
  const user = await UserSchema.findById(id);

  // Find the team to which the team member belongs
  const team = await TeamSchema.findById(teamMember.team);
  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  // Check if the authenticated user is the creator of the team
  if (team.mainPerson.toString() !== authenticatedUserId) {
    res.status(403);
    throw new Error("You don't have permission to delete this team member");
  }

  // Delete the team member and user
  await teamMember.deleteOne();
  if (user) {
    await user.deleteOne();
  }

  // Remove the team member from the team's members array
  team.members = team.members.filter((memberId) => memberId.toString() !== id);
  await team.save();

  res.status(201).json({
    message: "Team member and user deleted successfully",
    teamMember,
    user,
  });
});

const getAllTeam = asyncHandler(async (req, res) => {
  const authenticatedUserId = req.user._id;
  const { id } = req.params;

  // Check if the authenticated user's ID matches the provided user ID
  if (authenticatedUserId !== id) {
    res.status(403);
    throw new Error("You don't have permission to access this information");
  }

  const allTeam = await TeamSchema.find({ id }).populate("members");

  res.status(201).json(allTeam);
});

/* ---------------- Admin -----------------  */
// @route  GET   api/team-member/all-member
// @desc   Get loginstatus route
// @access Just Check true or false

const getAllTeamMember = asyncHandler(async (req, res) => {
  const authenticatedUserId = req.user._id;
  const { id } = req.params;

  // Check if the authenticated user's ID matches the provided user ID
  if (authenticatedUserId !== id) {
    res.status(403);
    throw new Error("You don't have permission to access this information");
  }

  const allTeam = await TeamMemberSchema.find({ user: id }).populate("team");
  console.log(allTeam);
  res.status(201).json(allTeam);
});
module.exports = {
  createTeam,
  createTeamMember,
  getAllTeam,
  getAllTeamMember,
  deleteTeam,
};
