const express = require("express");
const { createPricingPlan, getAllPlan, deletePlan, applyDiscount } = require("../../controllers/pricing/pricingPlanCtr");
const { admin, protect } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, admin, createPricingPlan);
router.get("/", getAllPlan);
router.delete("/:id", protect, admin, deletePlan);

router.put("/apply-discount", protect, admin, applyDiscount);

module.exports = router;
