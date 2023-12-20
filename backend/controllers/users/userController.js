const asyncHandler = require("express-async-handler");
const User = require("../../models/user/userModel");
const { generateToken, hashToken } = require("../../utils/index");
const bcrypt = require("bcryptjs");
const parse = require("ua-parser-js");
const jwt = require("jsonwebtoken");
const sendEmail = require("../../utils/sendEmail");
const Token = require("../../models/user/tokenModel");
const crypto = require("crypto");
const Cryptr = require("cryptr");
const { OAuth2Client } = require("google-auth-library");
const cloudinary = require("cloudinary").v2;

const cryptr = new Cryptr(process.env.CRYPTR_KEY);
const client = new OAuth2Client(process.env.GOOGLE_ClIENT_ID);

// @route  POST   api/users/register
// @desc   Register users route
// @access Public
const register = asyncHandler(async (req, res) => {
  //  res.send("Register users")

  const { name, email, password } = req.body;

  //validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill in all the required fields.");
  }

  if (password?.length < 8) {
    res.status(400);
    throw new Error("Password should contain at least 8 characters.");
  }

  //Check if user exits
  const userExists = await User.findOne({
    email,
  });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists.");
  }

  //Get from which device user is loggedin
  // this used for 2FA
  const ua = parse(req.headers["user-agent"]);
  const userAgent = [ua.ua];
  //console.log(userAgent)

  // if not exits create new user
  const user = await User.create({
    name,
    email,
    password,
    userAgent,
  });

  // genrate token
  const token = generateToken(user._id);

  // send http-only cookie
  res.cookie("token", token, {
    path: "/", // set default
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 604800), // 7day
    sameSite: "none",
    secure: true,
  });

  //if user created then show this property
  if (user) {
    const { _id, name, email, phone, bio, avatar, role, isVerified } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      avatar,
      role,
      isVerified,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @route  POST   api/users/login
// @desc   Login users route
// @access Public

//Before teh 2FA login
/*const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // validation
  if (!email || !password) {
    res.status(400)
    throw new Error("Please add email and password are required fields.")
  }

  const user = await User.findOne({
    email,
  })

  if (!user) {
    res.status(400)
    throw new Error("User didn't find with this email. Please register")
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password)
  if (!passwordIsCorrect) {
    res.status(400)
    throw new Error("Invalid email or password")
  }

  // 2FA for unknow userAgent
  const token = generateToken(user._id)

  if (user && passwordIsCorrect) {
    // send http-only cookie
    res.cookie("token", token, {
      path: "/", // set default
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 604800), // 7day
      sameSite: "none",
      secure: true,
    })

    if (user) {
      const { _id, name, email, phone, bio, avtar, role, isVerified } = user
      res.status(200).json({
        _id,
        name,
        email,
        phone,
        bio,
        avtar,
        role,
        isVerified,
        token,
      })
    }
  } else {
    res.status(400)
    throw new Error("Something went wrong, please try again")
  }
})*/
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password are required fields.");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    res.status(400);
    throw new Error("User didn't find with this email. Please register");
  }

  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  // -- ------------ 2FA for unknow userAgent -----------
  const ua = parse(req.headers["user-agent"]);
  const currentUserAgent = [ua.ua];
  console.log(currentUserAgent);
  // check garxa db ma kunchai device ma login currently banera
  const allowedAgent = user.userAgent.includes(currentUserAgent);
  if (!allowedAgent) {
    // generate six digit code
    const loginCode = Math.floor(100000 + Math.random() * 900000); // it will generate six dig number from 100000 to 900000 sama
    console.log(loginCode);

    //Encrypt login code before saving to DB
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString()); // it will ecrypt 6 dig code
    console.log(encryptedLoginCode);
    // after encrypt then save it and delete token and save new token

    // Delete Token if it exists in DB
    let userToken = await Token.findOne({ userId: user._id });
    if (userToken) {
      await userToken.deleteOne();
    }

    // save new token to db
    await new Token({
      userId: user._id,
      loginToken: encryptedLoginCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * (60 * 1000), // 30mins
    }).save();

    res.status(400);
    throw new Error("New browser or device detected.");
  }
  // ------------ End 2FA userAgent => after it go to sendOTP() -----------

  //generate token
  const token = generateToken(user._id);

  if (user && passwordIsCorrect) {
    // send http-only cookie
    res.cookie("token", token, {
      path: "/", // set default
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 604800), // 7day
      sameSite: "none",
      secure: true,
    });

    if (user) {
      const { _id, name, email, phone, bio, avtar, role, isVerified } = user;
      res.status(200).json({
        _id,
        name,
        email,
        phone,
        bio,
        avtar,
        role,
        isVerified,
        token,
      });
    }
  } else {
    res.status(400);
    throw new Error("Something went wrong, please try again");
  }
});

// @route  GET   api/users/logout
// @desc   Logout users route
// @access Private
const logout = asyncHandler(async (req, res) => {
  // send http-only cookie
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({
    message: "Logout successful",
  });
});

// @route  GET   api/users/get-user
// @desc   Get user route
// @access Private
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { _id, name, email, phone, bio, avatar, role, isVerified, isBlocked, cover } = user;
    res.status(200).json({ _id, name, email, phone, bio, avatar, role, isVerified, isBlocked, cover });
  } else {
    res.status(404);
    throw new Error("User not found!");
  }
});

// @route  PATCH   api/users/update-user
// @desc   Update user route
// @access Private
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, phone, bio, avatar } = user;

    if (avatar && avatar.public_id) {
      await cloudinary.uploader.destroy(avatar.public_id);
    }

    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;

    // Upload new avatar image to Cloudinary if provided
    if (req.file) {
      const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Pixel_nepal/Avatars",
        transformation: [{ width: 250, height: 250, crop: "fill" }],
      });
      user.avatar = {
        filePath: uploadedFile.secure_url,
        public_id: uploadedFile.public_id,
        fileType: req.file.mimetype,
      };
    }

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    });
  } else {
    res.status(404);
    throw new Error("User not found!");
  }
});

// @route  PATCH   api/users/update-profile
// @desc   Update profile route
// @access Private
const profileUpload = asyncHandler(async (req, res) => {
  const id = req.user._id;

  if (!req.file) {
    res.status(400).json({ message: "No image file provided" });
    return;
  }

  try {
    const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
      folder: "Pixel_nepal/Profile",
    });

    const updatedProfile = await User.findByIdAndUpdate(
      { _id: id },
      {
        cover: {
          filePath: uploadedFile.secure_url,
          fileType: req.file.mimetype,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image could not be uploaded" });
  }
});

// @route  DELETE   api/users/:id
// @desc   Delete user route
// @access Private and Amdin
const deleteUser = asyncHandler(async (req, res) => {
  const user = User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User didn't found. Please register");
  }

  await user.findOneAndRemove();
  res.status(200).json({
    message: "User deleted successfully",
  });
});

// @route  GET   api/users/all-users
// @desc   Get users route
// @access Private and Amdin & Author
const getAllUser = asyncHandler(async (req, res) => {
  const user = await User.find().sort("-createdAt").select("-password");

  if (!user) {
    res.status(500);
    throw new Error("Something went wrong");
  }
  // If the subscriptionInfo virtual field is defined, you can remove it here
  user.forEach((user) => {
    if (user.subscription) {
      user.subscriptionInfo = user.subscription;
    }
  });
  res.status(200).json({ totalUser: user?.length, user });
});

// @route  GET   api/users/login-status
// @desc   Get loginstatus route
// @access Just Check true or false
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json(false);
  }

  //verify toke
  const verified = jwt.verify(token, process.env.JWT_SECRET);

  if (verified) {
    return res.json(true);
  } else {
    return res.json(false);
  }
});

// @route  POST   api/users/update-role
// @desc   Post update role route
// @access Admin only
const updateRole = asyncHandler(async (req, res) => {
  const { role, id } = req.body;

  const user = await User.findById(id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  user.role = role;
  await user.save();
  res.status(200).json({ message: `User Role Updated to ${role} successfully` });
});

// @route  POST   api/users/send-email
// @desc   Send Email to login user email
// @access Login User only
const sendAutomatedEmail = asyncHandler(async (req, res) => {
  const { subject, send_to, reply_to, template, url } = req.body;

  if (!subject || !send_to || !reply_to || !template) {
    res.status(500);
    throw new Error("Missing email parameter");
  }

  //get user
  const user = await User.findOne({ email: send_to });

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  const sent_from = process.env.EMAIL_USER;
  const name = user.name;
  const link = `${process.env.FORNTEND_URL}${url}`;

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);
    res.status(200).json({ message: "Email Send" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not send, please try again");
  }
});

// @route  POST  api/users/send-verification-email
// @desc   Send verification token to user
// @access Login User only
const sendVerificationEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error("User already verified");
  }

  //Delete token if it exits on DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  // create verification token and save it
  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;
  //console.log(verificationToken);

  // hash token and save
  const hashTokens = hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashTokens,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // 30min => chnage 30 to 10 it will be 10mins
  }).save();

  // construct verification URL
  const verificationUrl = `${process.env.FORNTEND_URL}/verify/${verificationToken}`;

  //send verification email
  const subject = "Verify your Account - GorkCoder";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@gorkcoder.com";
  const template = "verifyEmail";
  const name = user.name;
  const link = verificationUrl;

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);
    res.status(200).json({ message: "Email Send" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not send, please try again");
  }
});

// @route  POST api/users/user-verification-email
// @desc   Send user verification token to user
// @access Login User only can get this link
const sendVerificationUserEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  const hashedToken = hashToken(verificationToken);

  const usertoken = await Token.findOne({
    verificationToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!usertoken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  // Find User
  const user = await User.findOne({ _id: usertoken.userId });

  if (user.isVerified) {
    res.status(400);
    throw new Error("User is already verified");
  }

  // Now verify user
  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "Account Verfication Successful" });
});
// @route  POST api/users/forgot-password
// @desc   Password Reset
// @access Login User only can get this link
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("No user with this email");
  }

  // Delete Token if it exists in DB
  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  //   Create Verification Token and Save
  const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  console.log(resetToken);

  // Hash token and save
  const hashedToken = hashToken(resetToken);
  await new Token({
    userId: user._id,
    resetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), // 30mins
  }).save();

  // Construct Reset URL
  const resetUrl = `${process.env.FORNTEND_URL}/auth/resetpassword/${resetToken}`;

  // Send Email
  const subject = "Password Reset Request - GorkCoder";
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@gorkcoder.com";
  const template = "forgotPassword";
  const name = user.name;
  const link = resetUrl;

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);
    res.status(200).json({ message: "Password Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

// @route  POST api/users/reset-password/:resetToken
// @desc   Password Reset
// @access Login User
const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const hashedToken = hashToken(resetToken);

  const usertoken = await Token.findOne({
    resetToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!usertoken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  // Find User
  const user = await User.findOne({ _id: usertoken.userId });

  // Now reset user password
  user.password = password;
  await user.save();
  res.status(200).json({ message: "Password Reset Successful" });
});

// @route  POST api/users/change-password
// @desc   Password Reset
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  //res.send("User password change")
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, Please signup");
  }
  // validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }
  // check if oldPassword match password in DB
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  // save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password Change Successful");
  } else {
    res.status(400);
    throw new Error("Old Password is incorrect");
  }
});

// @route  POST api/users/send-otp/:email
// @desc   send OTP
// @access Public
const sendOTP = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  // find login code(OTP) in DB
  let userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired token,please login again");
  }

  const loginCode = userToken.loginToken;
  const decryptedLoginCode = cryptr.decrypt(loginCode.toString());

  console.log(decryptedLoginCode);

  // Send OTP Code
  const subject = "Login Access Code - GorkCoder";
  const send_to = email;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@gorkcoder.com";
  const template = "SendOTP";
  const name = user.name;
  const link = decryptedLoginCode;

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name, link);
    res.status(200).json({ message: `Send OTP To this ${email}` });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

// @route  POST api/users/loginwith-otp/:email
// @desc   send OTP
// @access Public
const loginWithOTP = asyncHandler(async (req, res) => {
  const { email } = req.params;
  const { loginCode } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found!");
  }

  // find login code(OTP) in DB
  let userToken = await Token.findOne({
    userId: user._id,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired token,please login again");
  }

  const decryptedLoginCode = cryptr.decrypt(userToken.loginToken);
  console.log(decryptedLoginCode);

  if (loginCode !== decryptedLoginCode) {
    res.status(404);
    throw new Error("Incorrect OTP Code. Please try again.");
  } else {
    // Register userAgent
    const ua = parse(req.headers["user-agent"]);
    const currentUserAgent = ua.ua;
    user.userAgent.push(currentUserAgent);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // send http-only cookie
    res.cookie("token", token, {
      path: "/", // set default
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 604800), // 7day
      sameSite: "none",
      secure: true,
    });

    const { _id, name, email, phone, bio, avtar, role, isVerified } = user;
    res.status(200).json({
      _id,
      name,
      email,
      phone,
      bio,
      avtar,
      role,
      isVerified,
      token,
    });
  }
});

const loginWithGoogle = asyncHandler(async (req, res) => {
  const { userToken } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: userToken,
    audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  const { name, email, picture, sub } = payload;
  const password = Date.now() + sub;

  // get user device
  const ua = parse(req.headers["user-agent"]);
  const userAgent = [ua.ua];

  // check if users exits
  const user = await User.findOne({ email });

  if (!user) {
    //create new user or register
    const newUser = await User.create({
      name,
      email,
      password,
      avtar: picture,
      isVerified: true,
      userAgent,
    });

    if (newUser) {
      // genrate token
      const token = generateToken(newUser._id);

      // send http-only cookie
      res.cookie("token", token, {
        path: "/", // set default
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 604800), // 7day
        sameSite: "none",
        secure: true,
      });
      //if user created then show this property
      const { _id, name, email, phone, bio, avtar, role, isVerified } = newUser;
      res.status(201).json({
        _id,
        name,
        email,
        phone,
        bio,
        avtar,
        role,
        isVerified,
        token,
      });
    }
  }

  // user exits => then login
  if (user) {
    // genrate token
    const token = generateToken(user._id);

    // send http-only cookie
    res.cookie("token", token, {
      path: "/", // set default
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 604800), // 7day
      sameSite: "none",
      secure: true,
    });
    //if user created then show this property
    const { _id, name, email, phone, bio, avtar, role, isVerified } = user;
    res.status(201).json({
      _id,
      name,
      email,
      phone,
      bio,
      avtar,
      role,
      isVerified,
      token,
    });
  }
});

const followingToUser = asyncHandler(async (req, res) => {
  const { followId } = req.body;
  const loginUserId = req.user.id;

  //find the target user and check if the loginn id exits
  const targetUser = await User.findById(followId);
  const alreadyFollowing = targetUser?.followers?.find((user) => user.toString() == loginUserId.toString());

  if (alreadyFollowing) throw new Error("You have already followed this user");

  // 1. Find the user u want to follow and update it's folowers field
  await User.findByIdAndUpdate(
    followId,
    {
      $push: { followers: loginUserId },
      isFollowing: true,
    },
    { new: true }
  );

  // 2. Update the login user following field
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: { following: followId },
    },
    { new: true }
  );
  res.json("You have successfully followed this user");
});

const unFollowingToUser = asyncHandler(async (req, res) => {
  const { unFollowId } = req.body;
  const loginUserId = req.user.id;

  // 1. Find the user u want to follow and update it's unfolowers field
  await User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: { followers: loginUserId },
      isUnFollowing: true,
    },
    { new: true }
  );

  // 2. Update the login user unfollowing field
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: { following: unFollowId },
    },
    { new: true }
  );
  res.json("You have successfully unfollowed this user");
});

/* const loginAsSellerAccount = asyncHandler(async (req, res) => {
  const { sellerEmail, sellerPassword } = req.body;

  // Check if the logged-in user is an admin
  if (req.user.role !== "admin") {
    res.status(403);
    throw new Error("Access denied. Only admin users can use this feature.");
  }

  // Find the seller user by email
  const sellerUser = await User.findOne({ email: sellerEmail });

  if (!sellerUser || sellerUser.role !== "seller") {
    res.status(400);
    throw new Error("Invalid seller email.");
  }

  // Compare provided password with the seller's hashed password
  const passwordIsCorrect = await bcrypt.compare(sellerPassword, sellerUser.password);

  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invalid seller password.");
  }

  // Generate a token for the seller user
  const token = generateToken(sellerUser._id);

  // Log out the admin user (remove the admin user's token)
  res.clearCookie("token");

  // Send the seller user's token as a response
  res.cookie("token", token, {
    path: "/", // set default
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 604800), // 7 days
    sameSite: "none",
    secure: true,
  });

  // Respond with information about the seller user
  const { _id, name, email, phone, bio, avtar, role, isVerified } = sellerUser;
  res.status(200).json({
    _id,
    name,
    email,
    phone,
    bio,
    avtar,
    role,
    isVerified,
    token,
  });
});
 */

const loginAsSellerAccount = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Please provide both email and password.");
  }

  // Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error("User not found. Please register.");
  }

  // Compare passwords
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Invalid email or password");
  }

  /* // Check if the user is a seller
  if (!user.isSeller) {
    res.status(400);
    throw new Error("This user is not a seller.");
  }
 */
  // Check user agent
  const ua = parse(req.headers["user-agent"]);
  const currentUserAgent = [ua.ua];
  const allowedAgent = user.userAgent.includes(currentUserAgent);

  if (!allowedAgent) {
    // Generate and encrypt login code
    const loginCode = Math.floor(100000 + Math.random() * 900000);
    const encryptedLoginCode = cryptr.encrypt(loginCode.toString());
    console.log(loginCode);

    // Delete previous tokens
    await Token.deleteMany({ userId: user._id });

    // Save new token to DB
    await new Token({
      userId: user._id,
      loginToken: encryptedLoginCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
    }).save();

    res.status(400);
    throw new Error("New browser or device detected. Enter OTP.");
  }

  // Generate token for successful login
  const token = generateToken(user._id);

  // Update the user model to indicate that the user is a seller
  user.isSeller = true;
  await user.save();

  // Send HTTP-only cookie with the token
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 604800), // 7 days
    sameSite: "none",
    secure: true,
  });

  // Return user information and token
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    phone: user.phone,
    bio: user.bio,
    role: user.role,
    isBlocked: user.isBlocked,
    isVerified: user.isVerified,
    userAgent: user.userAgent,
    isFollowing: user.isFollowing,
    isUnFollowing: user.isUnFollowing,
    followers: user.followers,
    following: user.following,
    viewedBy: user.viewedBy,
    isSeller: user.isSeller,
    sellerDiscount: user.sellerDiscount,
    favoritelist: user.favoritelist,
    isTeam: user.isTeam,
    isMainPerson: user.isMainPerson,
    tagsUsed: user.tagsUsed,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token,
  });
});

module.exports = {
  register,
  login,
  logout,
  getUser,
  updateUser,
  profileUpload,
  deleteUser,
  getAllUser,
  loginStatus,
  updateRole,
  sendAutomatedEmail,
  sendVerificationEmail,
  sendVerificationUserEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  sendOTP,
  loginWithOTP,
  loginWithGoogle,
  followingToUser,
  unFollowingToUser,
  loginAsSellerAccount,
};
