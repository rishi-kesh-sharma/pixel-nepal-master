const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // plan: { type: mongoose.Schema.Types.ObjectId, ref: "PricePlan", required: true },
    startDate: { type: Date, required: true }, // Start date of the premium plan
    endDate: { type: Date, required: true },

    shippingInfo: {
      fullname: { type: String, required: true },
      address: { type: String, require: true },
      city: { type: String, require: true },
      phoneNo: { type: String, require: true },
      postalCode: { type: String, require: true },
      country: { type: String, require: true },
    },

    orderPlan: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        plan: { type: mongoose.Schema.Types.ObjectId, ref: "PricePlan", required: true },
      },
    ],
    paymentInfo: {
      id: { type: String },
      status: { type: String },
    },
    paidAt: {
      type: Date,
    },
    taxPrice: {
      type: Number,
      require: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      require: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      require: true,
      default: "Processing",
    },
    deliverAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
// virtual method to populate
subscriptionSchema.virtual("planInfo", {
  ref: "PricePlan",
  foreignField: "_id",
  localField: "plan",
});
module.exports = mongoose.model("Subscription", subscriptionSchema);
