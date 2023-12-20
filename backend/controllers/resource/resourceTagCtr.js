const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Filter = require("bad-words");
const User = require("../../models/user/userModel");
const Tags = require("../../models/resource/resourceTags");

/*  *************** Private Ctr **************** */
const createTags = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { _id } = req.user;

  console.log("Tag:", title);

  const slug = slugify(req.body.title, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    strict: true,
  });

  console.log(slug);

  if (!title) {
    res.status(404);
    throw new Error("Please enter a tag");
  }

  const filter = new Filter();
  const isProfane = filter.isProfane(title);

  // block user
  if (isProfane) {
    await User.findByIdAndUpdate(_id, { isBlocked: true });
    throw new Error("Creating Failed beacause it contains profane words and you have been blocked");
  }

  const tagCreate = await Tags.create({
    user: req.user._id,
    title: title,
    slug: slug,
  });
  res.status(201).json(tagCreate);
});

const getTagsofUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const allTag = await Tags.find({ user: userId }).sort("-createAt").populate("user");

  if (!allTag) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  res.status(200).json(allTag);
});

const updateTag = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const { slug } = req.params;

  const findTag = await Tags.findOne({ slug });

  if (!findTag) {
    res.status(404);
    throw new Error("Tag not found!");
  }
  // update tags
  findTag.title = title;
  const updatedTag = await findTag.save();

  // Regenerate the slug for the updated tag
  console.log("Updated tag value:", updatedTag.title);

  const newSlug = slugify(req.body.title, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    strict: true,
  });

  // Update the tag's slug
  updatedTag.slug = newSlug;

  await updatedTag.save();
  res.status(200).json(updatedTag);
});

const deleteTag = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const getTag = await Tags.findOne({ slug: slug });

  if (!getTag) {
    res.status(404);
    throw new Error("Tag not found!");
  }

  // Check if the authenticated user's ID matches the category's user ID
  if (getTag.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this category");
  }

  await Tags.deleteOne({ slug });
  res.status(200).json({ message: "Tag deleted successfully" });
});
/*  *************** Private Ctr **************** */

/*  ############# Public Ctr ############# */
const getALLTags = asyncHandler(async (req, res) => {
  const allTag = await Tags.find({}).sort("-createAt").populate("user");

  if (!allTag) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  res.status(200).json(allTag);
});

const getTag = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const getTag = await Tags.findOne({ slug: slug }).populate("user").sort("-createAt");

  if (!getTag) {
    res.status(404);
    throw new Error("Tag not found!");
  }
  res.status(200).json(getTag);
});
/*  ############# Public Ctr ############# */

/* ---------------- Only For Admin Access ---------------------- */
const admindeleteTag = asyncHandler(async (req, res) => {
  //for single tag delete
  /*  const { slug } = req.params;

  const getTag = await Tags.findOne({ slug: slug });

  if (!getTag) {
    res.status(404);
    throw new Error("Tag not found!");
  }
  await Tags.deleteOne({ slug });
  res.status(200).json({ message: "Tag deleted successfully" }); 
  */

  const { tagsSlugs } = req.body;

  const deletetag = await Tags.deleteMany({ slug: { $in: tagsSlugs } });
  res.status(200).json({ data: deletetag, message: "Tags deleted successfully" });
});
const check2 = asyncHandler(async (req, res) => {
  res.send("Check Route");
});
/* ---------------- Only For Admin Access ---------------------- */

module.exports = {
  createTags,
  getALLTags,
  getTag,
  getTagsofUser,
  deleteTag,
  admindeleteTag,
  updateTag,
};
