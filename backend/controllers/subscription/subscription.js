const asyncHandler = require("express-async-handler");
const SubscriptionSchema = require("../../models/pricing/subscriptionModel");
const PricePlanSchema = require("../../models/pricing/pricingPlan");
const UserSchema = require("../../models/user/userModel");
const TeamMemberSchema = require("../../models/pricing/team/teamMemberModel");

const subscribeToPlan = asyncHandler(async (req, res) => {
  const { planId, shippingInfo, numberOfUsers } = req.body;

  if (!planId || !shippingInfo) {
    res.status(400);
    throw new Error("Please provide plan ID  and shipping information");
  }

  // Validate plan ID
  const plan = await PricePlanSchema.findById(planId);
  if (!plan) {
    res.status(400);
    throw new Error("Invalid plan ID");
  }

  const { planType, individualMonthlyPrice, individualYearlyPrice, teamYearlyPrice } = plan;
  const user = req.user;

  const startDate = new Date();
  // const endDate = calculateEndDate(startDate, planType);

  let endDate;
  if (planType === "individual") {
    endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 5); // End date is 5 minutes after start date
  } else if (planType === "team") {
    endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 5); // End date is 15 minutes after start date
  }

  const subscription = await SubscriptionSchema.create({
    user: user._id,
    startDate: startDate,
    endDate: endDate,
    shippingInfo: shippingInfo,
    orderPlan: [
      {
        name: planType,
        price: calculatePlanPrice(planType, individualMonthlyPrice, individualYearlyPrice, teamYearlyPrice),
        plan: planId,
      },
    ],
    planPrice: calculatePlanPrice(planType, individualMonthlyPrice, individualYearlyPrice, teamYearlyPrice),
    taxPrice: 0.0, // Default tax price (to be set by admin)
    totalPrice: calculateTotalPrice(planType, individualMonthlyPrice, individualYearlyPrice, teamYearlyPrice),
    orderStatus: "Processing",
  });

  // Update user's field
  if (planType === "individual") {
    user.isSubscribed = true;
  } else if (planType === "team") {
    user.isSubscribed = true;
    user.isTeam = true;
    user.isMainPerson = true;
    user.remainingTeamAccounts = numberOfUsers;
    // user.remainingTeamAccounts = numberOfUsers - 1; // Subtract main person
  }
  await user.save();

  res.status(201).json(subscription);
});

// Function to calculate the end date based on plan type
const calculateEndDate = (startDate, planType) => {
  const durationInMonths = getPlanDurationInMonths(planType);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationInMonths);
  return endDate;
};

// Function to get the plan duration in months
const getPlanDurationInMonths = (planType) => {
  return planType === "individual" ? 1 : 12; // 1 month for individual, 12 months for team
};

// Function to calculate plan price based on plan type
const calculatePlanPrice = (planType, individualMonthlyPrice, individualYearlyPrice, teamYearlyPrice) => {
  switch (planType) {
    case "individual":
      return individualMonthlyPrice;
    case "team":
      return teamYearlyPrice / 12;
    default:
      return individualYearlyPrice / 12;
  }
};

// Function to calculate total price (including tax)
const calculateTotalPrice = (planType, individualMonthlyPrice, individualYearlyPrice, teamYearlyPrice) => {
  const planPrice = calculatePlanPrice(planType, individualMonthlyPrice, individualYearlyPrice, teamYearlyPrice);
  // Calculate taxPrice based on your admin-defined tax rate
  const taxPrice = 0.0; // Default tax price (to be set by admin)

  if (planType === "individual") {
    return planPrice + taxPrice;
  } else if (planType === "team") {
    return teamYearlyPrice + taxPrice;
  } else {
    return individualYearlyPrice + taxPrice;
  }
};

/* const updateSubscriptionStatus = asyncHandler(async (req, res) => {
  try {
    const user = await UserSchema.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Fetch user's subscription data from SubscriptionSchema
    const subscription = await SubscriptionSchema.findOne({ user: user._id });

    if (!subscription) {
      // No subscription found
      user.isSubscribed = false;
      user.isTeam = false;
      user.isMainPerson = false;

      await user.save();

      return res.status(200).json({ isSubscribed: false, isTeam: false, isMainPerson: false });
    }

    // Check if subscription is active
    const currentDate = new Date();
    if (subscription.endDate && currentDate <= subscription.endDate) {
      // Subscription is active
      return res.status(200).json({ isSubscribed: true, isTeam: user.isTeam, isMainPerson: user.isMainPerson });
    } else {
      // Subscription has expired
      user.isSubscribed = false;
      user.isTeam = false;
      user.isMainPerson = false;

      await user.save();

      // return res.status(200).json({ isSubscribed: false, isTeam: false, isMainPerson: false });
      return res.status(200).json();
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
}); */

const checkSubscriptionExpiration = asyncHandler(async (req, res) => {
  try {
    const user = await UserSchema.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch user's subscription data from SubscriptionSchema
    const subscription = await SubscriptionSchema.findOne({ user: user._id });

    if (!subscription || !subscription.endDate) {
      return res.status(404).json({ message: "Subscription data not found" });
    }

    const currentDate = new Date();
    const expirationDate = subscription.endDate;
    const timeRemaining = expirationDate - currentDate; // Difference in milliseconds

    if (timeRemaining <= 0) {
      // Subscription has expired
      return res.status(200).json({
        message: "Subscription has expired",
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    }

    // Calculate days, hours, minutes, and seconds remaining
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const secondsRemaining = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    /*  const yearsRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24 * 365));
    const monthsRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const daysRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
 */

    return res.status(200).json({
      days: daysRemaining,
      hours: hoursRemaining,
      minutes: minutesRemaining,
      seconds: secondsRemaining,
    });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred" });
  }
});

/* ------------- Admin ----------------- */
const getallSubscriptionByAdmin = asyncHandler(async (req, res, next) => {
  const purchase = await SubscriptionSchema.find({}).populate("user");

  let totalAmount = 0;
  purchase.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json(purchase);

  /* res.status(200).json({
    totalAmount,
    purchase,
  }); */
});

// Controller to get a single subscription by ID
const getSubscription = asyncHandler(async (req, res) => {
  const subscriptionId = req.params.id;

  const subscription = await SubscriptionSchema.findById(subscriptionId).populate("planInfo").populate("user");

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  res.status(200).json(subscription);
});

const deletePurchaseByAdmin = asyncHandler(async (req, res, next) => {
  const subscriptionId = req.params.id;

  const subscription = await SubscriptionSchema.findById(subscriptionId);

  // console.log(subscription.orderPlan[0].name);
  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  // Update user's isSubscribed and isTeam fields if needed
  const user = await UserSchema.findById(subscription.user);
  //console.log(user);

  if (subscription.orderPlan[0].name === "individual") {
    user.isSubscribed = false;
  } else if (subscription.orderPlan[0].name === "team") {
    user.isSubscribed = false;
    user.isTeam = false;
    user.isMainPerson = false;
    user.remainingTeamAccounts = 0;
  }

  await user.save();

  // Delete the subscription
  await subscription.deleteOne();

  res.status(200).json({ message: "Subscription canceled successfully" });
});

const updateTeamMemberSubscriptionStatus = async (mainPersonId) => {
  // Find team members associated with the main person
  const teamMembers = await UserSchema.find({ mainPerson: mainPersonId });

  // Update subscription status for team members
  for (const teamMember of teamMembers) {
    teamMember.isSubscribed = false;
    teamMember.isTeam = false;
    await teamMember.save();
  }
};
// Define the function to update user subscription status
const updateUserSubscriptionStatus = asyncHandler(async (req, res, next) => {
  try {
    const currentDate = new Date();

    // Find users with expired subscriptions
    const expiredSubscriptions = await SubscriptionSchema.find({
      endDate: { $lt: currentDate },
    });

    for (const subscription of expiredSubscriptions) {
      const user = await UserSchema.findById(subscription.user);

      if (user) {
        user.isSubscribed = false;
        user.isTeam = false;
        user.isMainPerson = false;
        user.remainingTeamAccounts = 0;
        await user.save();

        /*   // Update team members' subscription status if the main person's subscription expires
        const teamMembers = await TeamMemberSchema.find({ mainPerson: user._id });
        for (const member of teamMembers) {
          member.isSubscribed = false;
          await member.save();
        }
 */
        // Update team members' subscription status
      }
      if (user.isMainPerson) {
        await updateTeamMemberSubscriptionStatus(user._id);
      }
      // Delete the expired subscription document
      await SubscriptionSchema.findByIdAndDelete(subscription._id);

      console.log("Deleted expired subscription:", subscription);
    }
    // console.log("Updated subscription status for expired subscriptions:", expiredSubscriptions.length);
  } catch (error) {
    console.error("Error updating subscription status:", error);
  }
});

module.exports = {
  subscribeToPlan,
  getallSubscriptionByAdmin,
  getSubscription,
  deletePurchaseByAdmin,
  checkSubscriptionExpiration,
  updateUserSubscriptionStatus,
};
