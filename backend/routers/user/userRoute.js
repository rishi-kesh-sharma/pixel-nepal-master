const express = require("express");
const {
  register,
  login,
  logout,
  getUser,
  updateUser,
  deleteUser,
  getAllUser,
  loginStatus,
  updateRole,
  sendAutomatedEmail,
  sendVerificationEmail,
  sendVerificationUserEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOTP,
  loginWithOTP,
  loginWithGoogle,
  followingToUser,
  unFollowingToUser,
  loginAsSellerAccount,
  profileUpload,
} = require("../../controllers/users/userController");
const { protect, admin, author } = require("../../middleware/authMiddleware");
const { profilePhotoResize, profilePictureUpload } = require("../../middleware/resourceMiddleware");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/get-user", protect, getUser);
router.patch("/update-user", profilePictureUpload.single("avatar"), protect, updateUser);

router.delete("/:id", protect, author, deleteUser);
router.get("/all-users", protect, admin, getAllUser);
router.get("/login-status", loginStatus);
router.post("/update-role", protect, author, updateRole);

router.post("/send-email", protect, sendAutomatedEmail);
router.post("/send-verification-email", protect, sendVerificationEmail);
router.patch("/user-verification-email/:verificationToken", sendVerificationUserEmail);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:resetToken", resetPassword);
router.patch("/change-password", protect, changePassword);

router.post("/send-otp/:email", sendOTP);
router.post("/loginwith-otp/:email", loginWithOTP);

router.post("/google/callback", loginWithGoogle);

router.put("/follow", protect, followingToUser);
router.put("/unfollow", protect, unFollowingToUser);

// router.put("/update-profile", protect, profilePictureUpload.single("avatar"), profilePhotoResize, profileUpload);
router.put("/update-cover", profilePictureUpload.single("cover"), protect, profileUpload);

// for seller routes
router.post("/seller/login", protect, loginAsSellerAccount);

module.exports = router;
