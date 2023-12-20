const express = require("express");
const { subscribeToPlan, getallSubscriptionByAdmin, deletePurchaseByAdmin, getSubscription, checkSubscriptionExpiration } = require("../../controllers/subscription/subscription");
const { protect, checkBlockedUser, verified, admin } = require("../../middleware/authMiddleware");
const router = express.Router();

router.post("/", protect, checkBlockedUser, verified, subscribeToPlan);
// router.get("/check-subscription", protect, checkBlockedUser, verified, updateSubscriptionStatus);
router.get("/check-expiration", protect, checkBlockedUser, verified, checkSubscriptionExpiration);

// admin routes
router.get("/", protect, checkBlockedUser, verified, admin, getallSubscriptionByAdmin);
router.get("/:id", protect, checkBlockedUser, verified, admin, getSubscription);
router.delete("/:id", protect, checkBlockedUser, verified, admin, deletePurchaseByAdmin);

module.exports = router;
