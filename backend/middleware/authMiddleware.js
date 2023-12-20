const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/user/userModel");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, Please login");
    }

    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    // Get user id from token
    const user = await User.findById(verified.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    if (user.role === "suspended") {
      res.status(400);
      throw new Error("User has been suspended, please contact support");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, Please login");
  }
});

const admin = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin, Please login");
  }
});

const subscriber = asyncHandler(async (req, res, next) => {
  if (req.user.role === "subscriber" || req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an subscriber, Please login");
  }
});

const author = asyncHandler(async (req, res, next) => {
  if (req.user.role === "author" || req.user.role === "admin") {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an author, Please login");
  }
});

const verified = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an verified, Please login");
  }
});

const checkBlockedUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user.isBlocked) {
    res.status(403).json({ message: "You are blocked and cannot perform this action." });
  } else {
    next();
  }
});

const checkSellerUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  if (user.role === "admin" || user.isSeller) {
    req.user.isSeller = user.isSeller;
    next();
  } else {
    return res.status(403).json({ message: "Access denied. User is not an admin or seller." });
  }
});

const isMainPerson = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (user.isMainPerson) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as a main person");
  }
});

const isTeamPerson = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (user.isMainPerson || user.isTeam) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as a main person or team person");
  }
});

const checkSubscription = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const activeSubscription = await Subscription.findOne({
    user: user._id,
    endDate: { $gte: new Date() },
    orderStatus: "Completed",
  });

  if (activeSubscription) {
    req.user.isSubscribed = true;
  } else {
    req.user.isSubscribed = false;
  }

  next();
});

module.exports = { protect, admin, author, verified, subscriber, checkBlockedUser, checkSellerUser, isMainPerson, isTeamPerson };
