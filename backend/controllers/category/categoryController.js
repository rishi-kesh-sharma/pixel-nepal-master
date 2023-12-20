const asyncHandler = require("express-async-handler");
const Category = require("../../models/category/categoryModel");
const slugify = require("slugify");
const sendEmail = require("../../utils/sendEmail");
const Filter = require("bad-words");
const User = require("../../models/user/userModel");
const { fileSizeFormatter } = require("../../utils/imagesUpload");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const createCategory = asyncHandler(async (req, res) => {
  const { title, description, parentCategoryId } = req.body;
  const { _id } = req.user;

  if (!title || !description) {
    res.status(400);
    throw new Error("Please Fill in all fields");
  }

  const originalSlug = slugify(title, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    strict: true,
  });

  let slug = originalSlug;
  let suffix = 1;

  while (await Category.findOne({ slug })) {
    slug = `${originalSlug}-${suffix}`;
    suffix++;
  }

  // check title is exits or not
  const isTitleExits = await Category.findOne({ title });
  if (isTitleExits) {
    res.status(400);
    throw new Error("Category already exists");
  }

  // check for bad words
  const filter = new Filter();
  const isProfane = filter.isProfane(title);
  const isProfaneDescription = filter.isProfane(description);

  // block user
  if (isProfane || isProfaneDescription) {
    await User.findByIdAndUpdate(_id, { isBlocked: true });
    throw new Error("Creating Failed because it contains profane words and you have been blocked");
  }

  const fileData = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      console.log(req.files); // Add this line to inspect the files before the loop

      const uniqueFileName = `${Date.now()}-${file.originalname}`;
      const localFilePath = path.join(__dirname, "..", "public", "category", "thumbnail", uniqueFileName);

      // Save the file locally
      fs.writeFileSync(localFilePath, file.buffer);

      fileData.push({
        fileName: file.originalname,
        localFilePath: localFilePath,
        fileType: file.mimetype,
        fileSize: file.size,
      });
    }
  }

  const categoryData = {
    user: req.user._id,
    title: title,
    description: description,
    slug: slug,
    thumbnail: fileData,
  };

  if (parentCategoryId) {
    const parentCategory = await Category.findById(parentCategoryId);
    if (!parentCategory) {
      res.status(400);
      throw new Error("Parent category not found");
    }
    categoryData.parentCategory = parentCategory._id;
  }

  const categoryCreate = await Category.create(categoryData);

  // Upload images to Cloudinary and update the document
  const uploadedFiles = [];
  for (const file of categoryCreate.thumbnail) {
    const uploadedFile = await cloudinary.uploader.upload(file.buffer, {
      folder: "Pixel_nepal/Category",
      public_id: `category_${file.fileName}`, // Set a unique public_id for each file
    });
    uploadedFiles.push({
      fileName: file.fileName,
      filePath: uploadedFile.secure_url,
      fileType: file.fileType,
      fileSize: file.fileSize,
      public_id: uploadedFile.public_id,
    });
  }

  categoryCreate.thumbnail = uploadedFiles;
  await categoryCreate.save();

  res.status(201).json(categoryCreate);
});

/*  *************** Private Ctr **************** */
// @route  POST   api/category/
// @desc   Create catgeory route
// @access Private
const createCategorysss = asyncHandler(async (req, res) => {
  const { title, description, parentCategoryId } = req.body;
  const { _id } = req.user;

  if (!title || !description) {
    res.status(400);
    throw new Error("Please Fill in all field");
  }
  const slug = slugify(req.body.title, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    strict: true,
  });

  // check title is exits or not
  const isTitleExits = await Category.findOne({ title });
  if (isTitleExits) {
    res.status(400);
    throw new Error("Category already exits");
  }

  //check for bad word
  const filter = new Filter();
  const isProfane = filter.isProfane(title);
  const isProfaneDescription = filter.isProfane(description);
  // block user
  if (isProfane || isProfaneDescription) {
    await User.findByIdAndUpdate(_id, { isBlocked: true });
    throw new Error("Creating Failed beacause it contains profane words and you have been blocked");
  }

  const fileData = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      let uploadedFile;
      try {
        uploadedFile = await cloudinary.uploader.upload(file.path, {
          folder: "Pixel_nepal/Category",
        });
        // console.log(uploadedFile);
      } catch (error) {
        res.status(500);
        throw new Error("Image could not be uploaded");
      }

      fileData.push({
        fileName: file.originalname,
        filePath: uploadedFile.secure_url,
        fileType: file.mimetype,
        // fileSize: fileSizeFormatter(file.size, 3000),
        fileSize: file.size,
        Public_Id: uploadedFile.public_id,
      });
    }
  }

  const categoryData = await Category.create({
    user: req.user._id,
    title: title,
    description: description,
    slug: slug,
    thumbnail: fileData,
  });

  if (parentCategoryId) {
    const parentCategory = await Category.findById(parentCategoryId);
    if (!parentCategory) {
      res.status(400);
      throw new Error("Parent category not found");
    }
    categoryData.parentCategory = parentCategory._id;
  }
  const categoryCreate = await Category.create(categoryData);
  res.status(201).json(categoryCreate);
});
// @route  Get   api/category/
// @desc   Get all catgeory route
// @access Private
const getALlCategory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const allCategory = await Category.find({ user: userId }).sort("-createAt").populate("user");

  if (!allCategory) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  res.status(200).json(allCategory);
});

const deleteCatgeory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug });
  if (!category) {
    res.status(404);
    throw new Error("Category not found!");
  }

  // Check if the authenticated user's ID matches the category's user ID
  if (category.user.toString() !== req.user._id.toString() || req.user.role === "admin") {
    res.status(403);
    throw new Error("Not authorized to delete this category");
  }

  // Delete images from Cloudinary
  for (const image of category.thumbnail) {
    // Use your Cloudinary API or library to delete the image
    try {
      await cloudinary.uploader.destroy(image.Public_Id);
    } catch (error) {
      // Handle error if image deletion from Cloudinary fails
      res.status(500);
      throw new Error("Failed to delete image from Cloudinary");
    }
  }

  await Category.findOneAndDelete();

  res.status(200).json({ message: "Category Delete Successfully" });
});

// @route  Put   api/category/
// @desc   Update catgeory route
// @access Private
const updateCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { title, description, updatedThumbnailIndexes } = req.body;

  try {
    const category = await Category.findOne({ slug });

    if (!category) {
      res.status(404);
      throw new Error("Category not found");
    }

    if (title) {
      category.title = title;
    }

    if (description) {
      category.description = description;
    }

    if (updatedThumbnailIndexes && Array.isArray(updatedThumbnailIndexes) && updatedThumbnailIndexes.length > 0) {
      for (const index of updatedThumbnailIndexes) {
        if (index >= 0 && index < category.thumbnail.length) {
          const file = req.files[index];
          if (!file) {
            continue;
          }
          try {
            // Delete the existing image from Cloudinary and local folder
            if (category.thumbnail[index].filePath) {
              const publicId = category.thumbnail[index].filePath.split("/").pop().split(".")[0];
              await cloudinary.uploader.destroy(publicId);
            }
            // Upload the new image to Cloudinary and update the category's thumbnail data
            const uploadedFile = await cloudinary.uploader.upload(file.path, {
              folder: "Pixel_nepal/Category",
            });
            category.thumbnail[index] = {
              fileName: file.originalname,
              filePath: uploadedFile.secure_url,
              fileType: file.mimetype,
              fileSize: fileSizeFormatter(file.size, 20),
            };
          } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
          }
        }
      }
    }

    const updatedCategory = await Category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error: error.message });
  }
});

/*  *************** Private Ctr **************** */

/*  ############# Public Ctr ############# */
// @route  Get   api/category/
// @desc   Get all catgeory route
// @access Public
const allCategoryList = asyncHandler(async (req, res) => {
  const showOnlyApprovedCategory = await Category.find({ isApproved: true }).populate("user").sort("-createAt");
  res.status(200).json(showOnlyApprovedCategory);
});

// @route  Get   api/category/
// @desc   Get all catgeory route
// @access Public
const getCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug }).populate("user");

  if (!category) {
    res.status(404);
    throw new Error("Category not found!");
  }
  res.status(200).json(category);
});
/*  ############# Public Ctr ############# */

/* ---------------- Only For Admin Access ---------------------- */
// @route  Get   api/category/admin/all-category-list/
// @desc   Get all catgeory route by admin
// @access Admin
const getAllCategoryByAdmin = asyncHandler(async (req, res) => {
  const allCategory = await Category.find({}).sort("-createAt").populate("user").sort("-createAt");

  if (!allCategory) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  res.status(200).json(allCategory);
});
// @route  Get   api/category/admin/unapproved-categories
// @desc   Route to get unapproved categories visible only to admins
// @access Admin
const unapprovedCategories = asyncHandler(async (req, res) => {
  // find or get all unapproved categories
  const unapprovedCategory = await Category.find({ isApproved: false }).populate("user").sort("-createAt");
  res.json(unapprovedCategory);
});
// @route  Get   api/category/admin/approved-category
// @desc   Route to get approved categories visible only to admins
// @access Admin
const approveCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug }).populate("user");
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  category.isApproved = true;
  await category.save();

  // find user email
  const userEmail = category.user.email;

  // Send email to user
  const subject = "Approved Category - SnapHub";
  const send_to = userEmail;
  const sent_from = process.env.EMAIL_USER;
  const reply_to = "noreply@snaphub.com";
  const template = "approvedCategory";
  const name = category.user.name;

  try {
    await sendEmail(subject, send_to, sent_from, reply_to, template, name);
    res.status(200).json({ message: `Category approved successfully. Email sent to  ${userEmail}` });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to approve category or send email");
  }
});
const deleteCatgeoryByAdmin = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug });

  if (!category) {
    res.status(404);
    throw new Error("Category not found!");
  }

  const deleteCategory = await Category.findOneAndDelete();

  res.status(200).json({ data: deleteCategory, message: "Category Delete Successfully" });
});

// @route  Get   api/category/admin/delete-multiple-catgeory
// @desc   Route to delete multiple category visible only to admins
// @access Admin
const deleteMultipleCategories = asyncHandler(async (req, res) => {
  const { catgeorySlugs } = req.body;

  const deleteCategory = await Category.deleteMany({ slug: { $in: catgeorySlugs } });
  //$in: match specified values in array
  res.status(200).json({ data: deleteCategory, message: "Categories deleted successfully" });
});

const check2 = asyncHandler(async (req, res) => {
  res.send("Check Route");
});
/* ---------------- Only For Admin Access ---------------------- */
module.exports = {
  createCategory,
  getALlCategory,
  allCategoryList,
  getAllCategoryByAdmin,
  unapprovedCategories,
  approveCategory,
  getCategory,
  deleteCatgeoryByAdmin,
  deleteCatgeory,
  deleteMultipleCategories,
  updateCategory,
};
