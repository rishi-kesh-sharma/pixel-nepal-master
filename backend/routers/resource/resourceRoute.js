const express = require("express");
const router = express.Router();
const { protect, verified, admin, checkBlockedUser, checkSellerUser } = require("../../middleware/authMiddleware");
const {
  createResource,
  getResourceofUser,
  deleteResources,
  allResourceList,
  getResource,
  deleteMultipleResource,
  updateResource,
  likesCtr,
  DislikesCtr,
  allResourceByAdmin,
  allResourcesForLoginUser,
  downloadResource,
  LikeResourceByYou,
} = require("../../controllers/resource/resourceCtr");
const { uploadThumbnailsAndAssets } = require("../../middleware/resourceMiddleware");

router.post("/user/create", uploadThumbnailsAndAssets, protect, verified, checkBlockedUser, createResource);
router.get("/user/resource", protect, verified, checkBlockedUser, checkSellerUser, getResourceofUser);
router.delete("/user/resource", protect, verified, checkBlockedUser, checkSellerUser, deleteResources);
router.put("/user/update/:id", uploadThumbnailsAndAssets, protect, verified, checkBlockedUser, updateResource);

router.patch("/user/likes", protect, verified, checkBlockedUser, likesCtr);
router.patch("/user/dislikes", protect, verified, checkBlockedUser, DislikesCtr);

router.get("/user/likes", protect, LikeResourceByYou);

// Private Routes

// Public Routes
router.get("/", allResourceList);
router.get("/:slug", getResource);
router.get("/accessible/resources", protect, allResourcesForLoginUser);
// Public Routes

// Admin Routes
router.delete("/admin/resource/:slug", protect, verified, checkBlockedUser, admin, deleteMultipleResource);
router.get("/admin/resource", protect, verified, checkBlockedUser, admin, allResourceByAdmin);
// Admin Routes

module.exports = router;
