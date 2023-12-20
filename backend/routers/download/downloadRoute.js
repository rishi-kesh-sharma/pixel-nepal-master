const express = require("express");
const { protect, verified, checkBlockedUser, admin } = require("../../middleware/authMiddleware");
const { downloadResource, getUserDownloads, downloadgetAllResourcebyAdmin } = require("../../controllers/download/downloadCtr");
const router = express.Router();

// Private Routes
router.get("/:id", protect, verified, checkBlockedUser, downloadResource);
router.get("/user/download-count", protect, verified, checkBlockedUser, getUserDownloads);

// Admin Routes
router.get("/admin/all", protect, verified, checkBlockedUser, admin, downloadgetAllResourcebyAdmin);

module.exports = router;
