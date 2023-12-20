const express = require("express");
const { protect, verified } = require("../../middleware/authMiddleware");
const { toggleFavorite, getFavoriteLists } = require("../../controllers/users/favoriteController");
const router = express.Router();

router.post("/", protect, verified, toggleFavorite);
router.get("/", protect, verified, getFavoriteLists);

module.exports = router;
