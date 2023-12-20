const express = require("express");
const { createCategory, getALlCategory, allCategoryList, getAllCategoryByAdmin, unapprovedCategories, approveCategory, getCategory, deleteCatgeory, deleteMultipleCategories, updateCategory } = require("../../controllers/category/categoryController");
const { protect, verified, admin, checkBlockedUser } = require("../../middleware/authMiddleware");
const { upload } = require("../../utils/imagesUpload");
const router = express.Router();

/* ----------------Public Route ---------------------- */
router.get("/", allCategoryList);
router.get("/:slug", getCategory);
/* ----------------Public Route ---------------------- */

/* ---------------- Access for create user (Private) ---------------------- */
// router.post("/", protect, verified, createCategory);
router.post("/", upload.array("thumbnail"), protect, verified, checkBlockedUser, createCategory);
router.get("/user/all-category/", protect, verified, getALlCategory);
router.delete("/user/:slug", protect, verified, deleteCatgeory);
router.put("/user/:slug", upload.array("thumbnail"), protect, verified, updateCategory);
/* ---------------- Access for created user ---------------------- */

/* ---------------- Only For Admin Access ---------------------- */
router.get("/admin/all-category-list/", protect, verified, admin, getAllCategoryByAdmin);
router.get("/admin/all-unapproved-category-list/", protect, verified, admin, unapprovedCategories);

router.put("/admin/approved-category/:slug", protect, verified, admin, approveCategory);

// router.delete("/admin/:slug", protect, verified, admin, deleteCatgeoryByAdmin);
router.delete("/admin/delete-multiple-catgeory", protect, verified, admin, deleteMultipleCategories);
/* ---------------- Only For Admin Access ---------------------- */

module.exports = router;
