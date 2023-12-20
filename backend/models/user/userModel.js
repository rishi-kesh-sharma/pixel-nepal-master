const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      validator: [validator.isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      require: [
        true,
        "Password should contain at least 8 characters, including at least one lowercase letter, one uppercase letter, and one number",
      ],
    },
    avatar: {
      type: Object,
      default:
        "https://res.cloudinary.com/dweodnbkq/image/upload/v1692776158/Pixel_nepal/Resource/Thumbnail/tikxqeiyi8mz4jklj2aq.png",
    },
    cover: {
      type: Object,
      default: "",
    },
    phone: { type: Number, default: "+977 " },
    bio: { type: String, default: "Hello App Tech" },
    role: {
      type: String,
      default: "subscriber",
      require: true,
      eum: ["guest", "subscriber", "author", "admin"],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isVerified: { type: Boolean, default: false },
    userAgent: { type: Array, required: true, default: [] },

    isFollowing: { type: Boolean, default: false },
    isUnFollowing: { type: Boolean, default: false },
    followers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    following: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    viewedBy: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] },

    isSeller: { type: Boolean, default: false }, // Set to true if user is a seller
    sellerDiscount: { type: Number, default: 0 }, // Discount applied by the seller

    isSubscribed: { type: Boolean, default: false },

    downloadCount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DownloadRecord",
    },

    favoritelist: { type: Array, required: false, default: [] },

    estimationIncome: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EstimationIncome",
    },

    isTeam: { type: Boolean, default: false },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    isMainPerson: { type: Boolean, default: false },
    remainingTeamAccounts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    minimize: false, // when we save empty object then mongose refelect to document
  }
);
// Encrypt password before save to DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  //Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
});

// virtual method to populate created post by user
userSchema.virtual("resource", {
  ref: "Resource",
  foreignField: "user",
  localField: "_id",
});

userSchema.virtual("followersList", {
  ref: "User",
  foreignField: "following",
  localField: "_id",
});

userSchema.virtual("followingList", {
  ref: "User",
  foreignField: "followers",
  localField: "_id",
});
module.exports = mongoose.model("User", userSchema);
