const express = require("express");
const { createComment, getAllComment, deleteComment } = require("../../controllers/resource/commentCtr");
const { protect, checkBlockedUser } = require("../../middleware/authMiddleware");
const routes = express.Router();

// Private Routes
routes.post("/", protect, checkBlockedUser, createComment);
routes.delete("/", protect, checkBlockedUser, deleteComment);

// Public Routes
routes.get("/", getAllComment);

module.exports = routes;
