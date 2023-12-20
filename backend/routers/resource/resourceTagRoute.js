const express = require("express");
const { createTags, getALLTags, getTagsofUser, getTag, deleteTag, admindeleteTag, updateTag } = require("../../controllers/resource/resourceTagCtr");
const { protect, verified, checkBlockedUser, admin } = require("../../middleware/authMiddleware");
const router = express.Router();

// Private Routes
router.post("/", protect, verified, checkBlockedUser, createTags);
router.get("/user-tags", protect, verified, getTagsofUser);
router.delete("/:slug", protect, verified, deleteTag);
router.put("/:slug", protect, verified, updateTag);

// Public Routes
router.get("/", getALLTags);
router.get("/:slug", getTag);

// Admin Routes
// router.delete("/admin/:slug", protect, verified, admin, admindeleteTag);
router.delete("/admin/delete", protect, verified, admin, admindeleteTag);

module.exports = router;
