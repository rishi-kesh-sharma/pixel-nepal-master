const asyncHandler = require("express-async-handler");
const Filter = require("bad-words");
const UserSchema = require("../../models/user/userModel");
const CommentSchema = require("../../models/resource/commentModel");

/*  *************** Private Ctr **************** */
// @route  POST   api/comment/
// @desc   Create comment route
// @access Private
const createComment = asyncHandler(async (req, res) => {
  const { resourceId, content, parentCommentId } = req.body;
  const { _id } = req.user;
  console.log(_id);
  if (!resourceId || !content) {
    res.status(400);
    throw new Error("User, resource, and content are required fields.");
  }

  //check for bad word
  const filter = new Filter();
  const isProfane = filter.isProfane(content);

  // block user
  if (isProfane) {
    await UserSchema.findByIdAndUpdate(_id, { isBlocked: true });
    throw new Error("Creating Failed beacause it contains profane words and you have been blocked");
  }

  const commentData = await CommentSchema.create({
    user: req.user._id,
    resource: resourceId,
    content: content,
  });

  if (parentCommentId) {
    const parentComment = await CommentSchema.findById(parentCommentId);
    if (!parentCommentId) {
      res.status(400);
      throw new Error("Parent comment not found");
    }
    commentData.parentComment = parentComment._id;
  }
  const commentCreate = await CommentSchema.create(commentData);
  res.status(201).json(commentCreate);
});

// @route  Delete   api/comment/
// @desc   Delete comment route
// @access Private
const deleteComment = asyncHandler(async (req, res) => {
  const { _id } = req.body;

  const comment = await CommentSchema.findOne({ _id });
  if (!comment) {
    res.status(404);
    throw new Error("comment not found!");
  }

  // Check if the authenticated user's ID matches the category's user ID
  if (comment.user.toString() !== req.user._id.toString() || req.user.role === "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this comment");
  }

  await CommentSchema.findOneAndDelete();
  res.status(200).json({ message: "Comment Delete Successfully" });
});
/*  *************** Private Ctr **************** */

/*  *************** Public Ctr **************** */
// @route  Get   api/comment/
// @desc   Get comment route
// @access Public
const getAllComment = asyncHandler(async (req, res) => {
  const allComment = await CommentSchema.find({}).populate("user").populate("parentComment");
  // const allComment = await CommentSchema.find({}).populate("parentComment");

  if (!allComment) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  res.status(200).json(allComment);
});
/*  *************** Public Ctr **************** */

module.exports = { createComment, getAllComment, deleteComment };
