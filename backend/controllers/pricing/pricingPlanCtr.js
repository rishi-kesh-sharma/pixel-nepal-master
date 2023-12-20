const asyncHandler = require("express-async-handler");
const PricePlanSchema = require("../../models/pricing/pricingPlan");

const createPricingPlan = asyncHandler(async (req, res) => {
  const { planType, individualMonthlyPrice, individualYearlyPrice, teamYearlyPrice, freeFeatures, premiumFeatures } = req.body;

  if (!planType || !individualMonthlyPrice || !individualYearlyPrice || !teamYearlyPrice || !freeFeatures || !premiumFeatures) {
    res.status(400);
    throw new Error("Please Fill in all field");
  }

  const pricing = await PricePlanSchema.create({
    user: req.user._id,
    planType: planType,
    individualMonthlyPrice: individualMonthlyPrice,
    individualYearlyPrice: individualYearlyPrice,
    teamYearlyPrice: teamYearlyPrice,
    freeFeatures: freeFeatures,
    premiumFeatures: premiumFeatures,
  });

  res.json(pricing);
});

const getAllPlan = asyncHandler(async (req, res) => {
  //   const plan = await PricePlanSchema.find({}).populate("user").sort("-createAt");
  const allplan = await PricePlanSchema.find({}).sort("-createAt");

  if (!allplan) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  res.status(200).json(allplan);
});

const deletePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const plan = await PricePlanSchema.findByIdAndDelete(id);

  if (!plan) {
    res.status(404);
    throw new Error("Search plan not found");
  }

  res.status(200).json({ message: "Successfully deleted" });
});

const applyDiscount = asyncHandler(async (req, res) => {
  try {
    const { planId, discountType, discountPercentage, discountExpirationHours } = req.body;
    const subscriptionPlan = await PricePlanSchema.findById(planId);
    if (!subscriptionPlan) {
      return res.status(404).json({ message: "Subscription plan not found" });
    }

    if (discountType === "individual") {
      subscriptionPlan.individualDiscountPercentage = discountPercentage;

      if (discountExpirationHours) {
        const currentTimestamp = Date.now();
        const expirationTimestamp = currentTimestamp + discountExpirationHours * 60 * 60 * 1000;
        subscriptionPlan.individualDiscountExpirationDate = new Date(expirationTimestamp);
      }

      /*  const discountedMonthlyPrice = subscriptionPlan.individualMonthlyPrice - (subscriptionPlan.individualMonthlyPrice * discountPercentage) / 100;
      const discountedAnnualPrice = subscriptionPlan.individualYearlyPrice - (subscriptionPlan.individualYearlyPrice * discountPercentage) / 100;

      subscriptionPlan.individualMonthlyPrice = discountedMonthlyPrice;
      subscriptionPlan.individualYearlyPrice = discountedAnnualPrice; */
    } else if (discountType === "team") {
      subscriptionPlan.teamDiscountPercentage = discountPercentage;

      if (discountExpirationHours) {
        const currentTimestamp = Date.now();
        const expirationTimestamp = currentTimestamp + discountExpirationHours * 60 * 60 * 1000;
        subscriptionPlan.teamDiscountExpirationDate = new Date(expirationTimestamp);
      }
      /*  const discountedAnnualPrice = subscriptionPlan.teamYearlyPrice - (subscriptionPlan.teamYearlyPrice * discountPercentage) / 100;
      subscriptionPlan.teamYearlyPrice = discountedAnnualPrice; */
    }

    await subscriptionPlan.save();
    res.status(200).json(subscriptionPlan);
  } catch (error) {
    res.status(500).json({ message: "An error occurred" });
  }
});
module.exports = {
  createPricingPlan,
  getAllPlan,
  deletePlan,
  applyDiscount,
};
