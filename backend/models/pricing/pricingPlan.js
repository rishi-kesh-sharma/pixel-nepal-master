const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    planType: { type: String, enum: ["individual", "team"], required: true },

    individualMonthlyPrice: { type: Number, required: true },
    individualYearlyPrice: { type: Number, required: true },
    teamYearlyPrice: { type: Number, required: true },

    individualDiscountPercentage: { type: Number, default: 0 },
    individualDiscountExpirationDate: { type: Date, default: null },
    teamDiscountPercentage: {
      type: Number,
      default: 0,
    },
    teamDiscountExpirationDate: {
      type: Date,
      default: null,
    },
    freeFeatures: [
      {
        access: Boolean,
        title: String,
      },
    ],
    premiumFeatures: [
      {
        access: Boolean,
        title: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricePlan", subscriptionPlanSchema);
