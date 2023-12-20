const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Filter = require("bad-words");
const ResourceSchema = require("../../models/resource/resourceSchema");
const User = require("../../models/user/userModel");
const sharp = require("sharp");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const moment = require("moment");
const Jimp = require("jimp");

/*  *************** Private Ctr **************** */
const createResource = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    const { _id } = req.user;

    const thumbnails = req.files["thumbnail"];
    const assets = req.files["assets"];

    const originalSlug = slugify(title, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
      strict: true,
    });

    let slug = originalSlug;
    let suffix = 1;

    while (await ResourceSchema.findOne({ slug })) {
      slug = `${originalSlug}-${suffix}`;
      suffix++;
    }

    if (!title || !description || !thumbnails || !assets) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    // Validate thumbnail format
    if (
      !thumbnails ||
      !thumbnails[0] ||
      (thumbnails[0].mimetype !== "image/jpeg" && thumbnails[0].mimetype !== "image/png")
    ) {
      res.status(400).json({ error: "Invalid thumbnail format. Please upload a JPEG or PNG image." });
      return;
    }

    const filter = new Filter();
    const isProfane = filter.isProfane(title);
    if (isProfane) {
      await User.findByIdAndUpdate(_id, { isBlocked: true });
      throw new Error("Creating failed because it contains profane words and you have been blocked");
    }

    /* // Use Jimp to check thumbnail dimensions
    const thumbnailImage = await Jimp.read(thumbnails[0].buffer);
    const thumbnailWidth = thumbnailImage.getWidth();
    const thumbnailHeight = thumbnailImage.getHeight();

    if (thumbnailWidth < 600 || thumbnailWidth > 900 || thumbnailHeight < 600 || thumbnailHeight > 900) {
      res.status(400).json({ error: "Thumbnail dimensions must be between 600x600 and 900x900." });
      return;
    }
 */

    // upload the image
    const timestamp = moment().format("YYYYMMDDHHmmssSSS");

    const thumbnailDir = path.join(__dirname, "..", "public", "resources", "thumbnail");
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    console.log(thumbnailDir);

    const assetsDir = path.join(__dirname, "..", "public", "resources", "assets");
    console.log(assetsDir);
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const thumbnailFilename = `${timestamp}_${thumbnails[0].originalname}`;
    const assetsFilename = `${timestamp}_${assets[0].originalname}`;

    const localThumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    const localAssetsPath = path.join(assetsDir, assetsFilename);

    fs.writeFileSync(localAssetsPath, assets[0].buffer);
    fs.writeFileSync(localThumbnailPath, thumbnails[0].buffer);

    const existingThumbnail = await cloudinary.search
      .expression(`folder=Pixel_nepal/Resource/Thumbnail AND public_id=${thumbnailFilename}`)
      .execute();
    const existingAssets = await cloudinary.search
      .expression(`folder=Pixel_nepal/Resource/Assets AND public_id=${assetsFilename}`)
      .execute();

    let thumbnailFile = {};
    let assetsFile = {};

    if (existingThumbnail.resources.length === 0) {
      console.log("Uploading thumbnail to Cloudinary...");
      const thumbnailResult = await cloudinary.uploader.upload(localThumbnailPath, {
        folder: "Pixel_nepal/Resource/Thumbnail",
      });
      thumbnailFile = {
        filePath: thumbnailResult.secure_url,
        public_id: thumbnailResult.public_id,
      };
    }

    if (existingAssets.resources.length === 0) {
      console.log("Uploading assets to Cloudinary...");
      const assetsResult = await cloudinary.uploader.upload(localAssetsPath, {
        folder: "Pixel_nepal/Resource/Assets",
      });
      assetsFile = {
        filePath: assetsResult.secure_url,
        public_id: assetsResult.public_id,
      };
    }
    // upload the image end

    // Create a new resource in the database
    const resourceCreate = await ResourceSchema.create({
      user: _id,
      title: title,
      slug: slug,
      description: description,
      thumbnail: thumbnailFile,
      assets: assetsFile,
    });

    res.status(201).json(resourceCreate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

const getResourceofUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const allresource = await ResourceSchema.find({ user: userId })
    .sort("-createAt")
    .populate("user")
    .sort("-createAt")
    .populate("category");

  if (!allresource) {
    res.status(500);
    throw new Error("Something went wrong");
  }

  res.status(200).json(allresource);
});

const deleteResources = asyncHandler(async (req, res) => {
  try {
    const resourceId = req.body.id;
    const { _id } = req.user;

    const resource = await ResourceSchema.findById(resourceId);
    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    // Check if the current user is the owner of the resource
    const userIdString = _id.toString();
    const resourceUserIdString = resource.user.toString();
    if (userIdString !== resourceUserIdString) {
      res.status(403).json({ error: "You are not authorized to delete this resource" });
      return;
    }
    /* 
   // Delete files from local storage
    if (resource.thumbnail.fileName) {
      const thumbnailPath = path.join(__dirname, '..', 'public', 'resources', 'thumbnail', resource.thumbnail.fileName);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    if (resource.assets.fileName) {
      const assetsPath = path.join(__dirname, '..', 'public', 'resources', 'assets', resource.assets.fileName);
      if (fs.existsSync(assetsPath)) {
        fs.unlinkSync(assetsPath);
      }
    }
 */
    // Delete thumbnail and assets from Cloudinary
    if (resource.thumbnail.public_id) {
      await cloudinary.uploader.destroy(resource.thumbnail.public_id);
    }

    if (resource.assets.public_id) {
      await cloudinary.uploader.destroy(resource.assets.public_id);
    }

    // Delete the resource from the database
    await ResourceSchema.findByIdAndDelete(resourceId);

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Deletion failed" });
  }
});

const updateResource = asyncHandler(async (req, res) => {
  try {
    const resourceId = req.params.id;
    const { title, description } = req.body;
    const { _id } = req.user;

    const resource = await ResourceSchema.findById(resourceId);

    if (!resource) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    // Check if the current user is the owner of the resource
    const userIdString = _id.toString();
    const resourceUserIdString = resource.user.toString();
    if (userIdString !== resourceUserIdString) {
      res.status(403).json({ error: "You are not authorized to update this resource" });
      return;
    }

    const thumbnails = req.files["thumbnail"];
    const assets = req.files["assets"];

    // Delete previous files from Cloudinary
    if (resource.thumbnail.public_id) {
      await cloudinary.uploader.destroy(resource.thumbnail.public_id);
    }
    if (resource.assets.public_id) {
      await cloudinary.uploader.destroy(resource.assets.public_id);
    }

    // Upload new images and files
    if (!title || !description || !thumbnails || !assets) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }
    // Validate thumbnail format
    if (
      !thumbnails ||
      !thumbnails[0] ||
      (thumbnails[0].mimetype !== "image/jpeg" && thumbnails[0].mimetype !== "image/png")
    ) {
      res.status(400).json({ error: "Invalid thumbnail format. Please upload a JPEG or PNG image." });
      return;
    }

    const filter = new Filter();
    const isProfane = filter.isProfane(title);
    if (isProfane) {
      await User.findByIdAndUpdate(_id, { isBlocked: true });
      throw new Error("Creating failed because it contains profane words and you have been blocked");
    }

    /* // Use Jimp to check thumbnail dimensions
    const thumbnailImage = await Jimp.read(thumbnails[0].buffer);
    const thumbnailWidth = thumbnailImage.getWidth();
    const thumbnailHeight = thumbnailImage.getHeight();

    if (thumbnailWidth < 600 || thumbnailWidth > 900 || thumbnailHeight < 600 || thumbnailHeight > 900) {
      res.status(400).json({ error: "Thumbnail dimensions must be between 600x600 and 900x900." });
      return;
    }
 */

    // upload the image
    const timestamp = moment().format("YYYYMMDDHHmmssSSS");

    const thumbnailDir = path.join(__dirname, "..", "public", "resources", "thumbnail");
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    console.log(thumbnailDir);

    const assetsDir = path.join(__dirname, "..", "public", "resources", "assets");
    console.log(assetsDir);
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const thumbnailFilename = `${timestamp}_${thumbnails[0].originalname}`;
    const assetsFilename = `${timestamp}_${assets[0].originalname}`;

    const localThumbnailPath = path.join(thumbnailDir, thumbnailFilename);
    const localAssetsPath = path.join(assetsDir, assetsFilename);

    fs.writeFileSync(localAssetsPath, assets[0].buffer);
    fs.writeFileSync(localThumbnailPath, thumbnails[0].buffer);

    const existingThumbnail = await cloudinary.search
      .expression(`folder=Pixel_nepal/Resource/Thumbnail AND public_id=${thumbnailFilename}`)
      .execute();
    const existingAssets = await cloudinary.search
      .expression(`folder=Pixel_nepal/Resource/Assets AND public_id=${assetsFilename}`)
      .execute();

    let thumbnailFile = {};
    let assetsFile = {};

    if (existingThumbnail.resources.length === 0) {
      console.log("Uploading thumbnail to Cloudinary...");
      const thumbnailResult = await cloudinary.uploader.upload(localThumbnailPath, {
        folder: "Pixel_nepal/Resource/Thumbnail",
      });
      thumbnailFile = {
        filePath: thumbnailResult.secure_url,
        public_id: thumbnailResult.public_id,
      };
    }

    if (existingAssets.resources.length === 0) {
      console.log("Uploading assets to Cloudinary...");
      const assetsResult = await cloudinary.uploader.upload(localAssetsPath, {
        folder: "Pixel_nepal/Resource/Assets",
      });
      assetsFile = {
        filePath: assetsResult.secure_url,
        public_id: assetsResult.public_id,
      };
    }

    // Update resource details
    const originalSlug = slugify(title, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
      strict: true,
    });

    let slug = originalSlug;
    let suffix = 1;

    while (await ResourceSchema.findOne({ slug, _id: { $ne: resourceId } })) {
      slug = `${originalSlug}-${suffix}`;
      suffix++;
    }

    resource.title = title;
    resource.slug = slug;
    resource.description = description;

    if (thumbnailFile) {
      resource.thumbnail = thumbnailFile;
    }

    if (assetsFile) {
      resource.assets = assetsFile;
    }

    await resource.save();

    res.status(200).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Update failed" });
  }
});

/* const likesCtr = asyncHandler(async (req, res) => {
  //1. Find the resource to be like
  const { resourceId } = req.body;
  const resource = await ResourceSchema.findById(resourceId);

  //2 .Find the login user
  const loginUser = req?.user?._id;
  //console.log(loginUser)

  //3. Find if the user is liked this post
  const isLiked = resource?.isLiked;
  //console.log(isLiked)

  //4. Check user have disliked or not before to likes
  const alreadyDisliked = resource?.Dislikes?.find((userId) => userId?.toString() === loginUser?.toString());
  //console.log(alreadyDisliked)

  // 4. Remove the user from dislikes array if exists
  if (alreadyDisliked) {
    const resource = await ResourceSchema.findByIdAndUpdate(
      resourceId,
      {
        //$pull => remove data from array
        $pull: { Dislikes: loginUser },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(resource);
  }

  let updatedResource;

  //5. Toggle => remove the user if he has liked the post
  if (isLiked) {
    updatedResource = await ResourceSchema.findByIdAndUpdate(
      resourceId,
      {
        $pull: { likes: loginUser },
        isLiked: false,
      },
      { new: true }
    );
    res.json(resource);
  } else {
    //add to likes
    updatedResource = await ResourceSchema.findByIdAndUpdate(
      resourceId,
      {
        $push: { likes: loginUser },
        isLiked: true,
      },
      { new: true }
    );
    // Populate user data for liked resources
    // await updatedResource.populate("user");
    res.json(updatedResource);
  }
});

const DislikesCtr = asyncHandler(async (req, res) => {
  //1. Find the resourcename to be like
  const { resourceId } = req.body;

  const resource = await ResourceSchema.findById(resourceId);

  //2 .Find the login user
  const loginUser = req?.user?._id;
  //console.log(loginUser)

  //3. Find if the user is liked this resourcename
  const isDisLiked = resource?.isDisLiked;
  //console.log(isDiskLiked)

  //4. Check user have liked or not before to dislikes
  const alreadyLiked = resource?.likes?.find((userId) => userId?.toString() === loginUser?.toString());
  //console.log(alreadyLiked)

  // 4. Remove the user from already likes from array if exists
  if (alreadyLiked) {
    const resource = await ResourceSchema.findByIdAndUpdate(
      resourceId,
      {
        //$pull => remove data from array
        $pull: { likes: loginUser },
        isLiked: false,
      },
      { new: true }
    );
    res.json(resource);
  }

  //5. Toggle => remove the user if he has disliked
  if (isDisLiked) {
    const resource = await ResourceSchema.findByIdAndUpdate(
      resourceId,
      {
        $pull: { Dislikes: loginUser },
        isDisLiked: false,
      },
      { new: true }
    );
    res.json(resource);
  } else {
    //add to dislikes
    const resource = await ResourceSchema.findByIdAndUpdate(
      resourceId,
      {
        $push: { Dislikes: loginUser },
        isDisLiked: true,
      },
      { new: true }
    );
    res.json(resource);
  }
}); */

const likesCtr = asyncHandler(async (req, res) => {
  const { resourceId } = req.body;
  const loginUser = req.user._id;

  const resource = await ResourceSchema.findById(resourceId);

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  // Check if the user has already liked this resource
  const isLiked = resource.likedBy.includes(loginUser);
  const isDisliked = resource.dislikedBy.includes(loginUser);

  if (isLiked) {
    // User has already liked, so remove the like
    resource.likedBy.pull(loginUser);
  } else {
    // User hasn't liked before, so add the like
    resource.likedBy.push(loginUser);

    // If the user has previously disliked, remove the dislike
    if (isDisliked) {
      resource.dislikedBy.pull(loginUser);
    }
  }

  const updatedResource = await resource.save();

  res.json(updatedResource);
});

const DislikesCtr = asyncHandler(async (req, res) => {
  const { resourceId } = req.body;
  const loginUser = req.user._id;

  const resource = await ResourceSchema.findById(resourceId);

  if (!resource) {
    return res.status(404).json({ message: "Resource not found" });
  }

  // Check if the user has already disliked this resource
  const isDisliked = resource.dislikedBy.includes(loginUser);
  const isLiked = resource.likedBy.includes(loginUser);

  if (isDisliked) {
    // User has already disliked, so remove the dislike
    resource.dislikedBy.pull(loginUser);
  } else {
    // User hasn't disliked before, so add the dislike
    resource.dislikedBy.push(loginUser);

    // If the user has previously liked, remove the like
    if (isLiked) {
      resource.likedBy.pull(loginUser);
    }
  }

  const updatedResource = await resource.save();

  res.json(updatedResource);
});

// Total resource liked by user or you
const LikeResourceByYou = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const likedResources = await ResourceSchema.find({ likedBy: userId })
    .select("title thumbnail slug numOfViews dislikedBy likedBy createdAt")
    .populate({
      path: "likedBy",
      select: "name avatar.filePath",
    })
    .populate({
      path: "dislikedBy",
      select: "name avatar.filePath",
    })
    .populate({
      path: "user",
      select: "name avatar.filePath",
    });
  const dislikedResources = await ResourceSchema.find({ dislikedBy: userId })
    .select("title thumbnail slug numOfViews dislikedBy likedBy createdAt user")
    .populate({
      path: "likedBy",
      select: "name avatar.filePath",
    })
    .populate({
      path: "dislikedBy",
      select: "name avatar.filePath",
    })
    .populate({
      path: "user",
      select: "name avatar.filePath",
    });

  const userData = {
    name: user.name,
    avatar: user?.avatar?.filePath,
  };
  res.json({
    userData,
    likedResources,
    dislikedResources,
  });
});
/*  *************** Private Ctr **************** */

/*  ############# Public Ctr ############# */
// @route  GET   api/resource
// @desc   Get resources
// @access Public
const allResourceList = asyncHandler(async (req, res) => {
  const resourceList = await ResourceSchema.find({})
    .sort("-createAt")
    .populate({
      path: "user",
      select: "name avatar.filePath",
    })
    .populate({
      path: "likedBy",
      select: "name avatar.filePath",
    })
    .populate({
      path: "dislikedBy",
      select: "name avatar.filePath",
    });

  res.status(200).json(resourceList);
});

// @route  GET   api/resource/accessible/resources
// @desc   Get  Just for logging user to the resource
// @access Private
const allResourcesForLoginUser = asyncHandler(async (req, res) => {
  const user = req.user;

  // Fetch resources based on user's subscription status
  const resources = await ResourceSchema.find({});

  // Determine which resources the user can access based on subscription status
  let accessibleResources;
  if (!user) {
    accessibleResources = resources.filter((resource) => resource.resourceType === "free");
  } else if (user.isSubscribed) {
    accessibleResources = resources;
  } else {
    accessibleResources = resources.filter(
      (resource) => resource.resourceType === "free" || resource.resourceType === "premium"
    );
  }

  const resourcesToReturn = accessibleResources.map((resource) => {
    const resourceData = {
      id: resource._id,
      title: resource.title,
      description: resource.description,
      slug: resource.slug,
      resourceType: resource.resourceType,
      likes: resource.likes,
      Dislikes: resource.Dislikes,
      category: resource.category,
      tags: resource.tags,
      numOfViews: resource.numOfViews,
      discountExpirationDate: resource.discountExpirationDate,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt,
    };

    // Only include thumbnail if available
    if (resource.thumbnail) {
      resourceData.thumbnail = resource.thumbnail;
    }

    // Show assets field only for subscribed users or free resources
    if (user && user.isSubscribed) {
      resourceData.assets = resource.assets;
    } else if (!user || resource.resourceType === "free") {
      resourceData.assets = null;
    }

    return resourceData;
  });

  res.status(200).json(resourcesToReturn);
});

const getResource = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const resource = await ResourceSchema.findOne({ slug });
  if (!resource) {
    res.status(404);
    throw new Error("Resource not found!");
  }

  // Increment the view count
  resource.numOfViews += 1;
  await resource.save();

  const populatedResource = await ResourceSchema.findOne({ slug })
    .populate({
      path: "user",
      select: "name avatar.filePath",
    })
    .populate({
      path: "likedBy",
      select: "name avatar.filePath",
    })
    .populate({
      path: "dislikedBy",
      select: "name avatar.filePath",
    });

  res.status(200).json(populatedResource);
});
/*  ############# Public Ctr ############# */

/* ---------------- Only For Admin Access ---------------------- */
const allResourceByAdmin = asyncHandler(async (req, res) => {
  const resourceList = await ResourceSchema.find({}).sort("-createAt");
  const resourceData = {
    totalResources: resourceList.length,
    totalFreeResources: resourceList.filter((resource) => resource.resourceType === "free").length,
    totalPremiumResources: resourceList.filter((resource) => resource.resourceType === "premium").length,
    resourceList,
  };
  res.status(200).json(resourceData);
});

const deleteMultipleResource = asyncHandler(async (req, res) => {
  const { resourceSlugs } = req.body;

  const deleteResource = await ResourceSchema.deleteMany({ slug: { $in: resourceSlugs } });
  //$in: match specified values in array
  res.status(200).json({ data: deleteResource, message: "Resources deleted successfully" });
});
/* ---------------- Only For Admin Access ---------------------- */

// This function code is correct
//router.post("/user/create", uploadThumbnailsAndAssets, protect, verified, checkBlockedUser, createResource);
const createResourcess = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    const { _id } = req.user;

    const thumbnails = req.files["thumbnail"];
    const assets = req.files["assets"];

    const originalSlug = slugify(title, {
      lower: true,
      remove: /[*+~.()'"!:@]/g,
      strict: true,
    });

    let slug = originalSlug;
    let suffix = 1;

    while (await ResourceSchema.findOne({ slug })) {
      slug = `${originalSlug}-${suffix}`;
      suffix++;
    }

    if (!title || !description || !thumbnails || !assets) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    const filter = new Filter();
    const isProfane = filter.isProfane(title);
    if (isProfane) {
      await User.findByIdAndUpdate(_id, { isBlocked: true });
      throw new Error("Creating failed because it contains profane words and you have been blocked");
    }

    let thumbnailFile = {};
    let assetsFile = {};
    // Upload thumbnails to Cloudinary
    const thumbnailBuffer = thumbnails[0].buffer;
    console.log("Uploading thumbnail to Cloudinary...");
    const thumbnailUpload = await cloudinary.uploader.upload_stream(
      { folder: "Pixel_nepal/Resource/Thumbnail" },
      async (error, thumbnailResult) => {
        if (error) {
          console.error(error);
          throw new Error("Thumbnail upload failed");
        }

        // Upload assets to Cloudinary
        const assetsBuffer = assets[0].buffer;
        console.log("Uploading assets to Cloudinary...");
        const assetsUpload = await cloudinary.uploader.upload_stream(
          { folder: "Pixel_nepal/Resource/assets" },
          async (assetsError, assetsResult) => {
            if (assetsError) {
              console.error(assetsError);
              throw new Error("Assets upload failed");
            }

            // Save thumbnail and assets locally
            const thumbnailFilename = `${thumbnailResult.public_id}.${thumbnailResult.format}`;
            const localThumbnailPath = path.join(
              __dirname,
              "public",
              "images",
              "resources",
              "thumbnail",
              thumbnailFilename
            );

            const assetsFilename = `${assetsResult.public_id}.${assetsResult.format}`;
            const localAssetsPath = path.join(__dirname, "public", "images", "resources", "assets", assetsFilename);

            thumbnailFile = {
              filePath: thumbnailResult.secure_url,
              public_id: thumbnailResult.public_id,
            };
            assetsFile = {
              filePath: assetsResult.secure_url,
              public_id: assetsResult.public_id,
            };
            // Create necessary directories if they don't exist
            const thumbnailDir = path.dirname(localThumbnailPath);
            if (!fs.existsSync(thumbnailDir)) {
              fs.mkdirSync(thumbnailDir, { recursive: true });
            }
            const assetsDir = path.dirname(localAssetsPath);
            if (!fs.existsSync(assetsDir)) {
              fs.mkdirSync(assetsDir, { recursive: true });
            }
            fs.writeFileSync(localAssetsPath, assetsBuffer);

            await sharp(thumbnailBuffer)
              .resize(600, 600)
              .toFormat("jpeg")
              .jpeg({ quality: 90 })
              .toFile(localThumbnailPath);

            // Create a new resource in the database
            const resourceCreate = await ResourceSchema.create({
              user: _id,
              title: title,
              slug: slug,
              description: description,
              thumbnail: thumbnailFile,
              assets: assetsFile,
            });

            res.status(201).json({
              message: "Resource created successfully",
              resource: resourceCreate,
              thumbnailLocalPath: localThumbnailPath,
              assetsLocalPath: localAssetsPath,
            });
          }
        );
        assetsUpload.end(assetsBuffer);
      }
    );
    thumbnailUpload.end(thumbnailBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});
// --------------- end This function code is correct

module.exports = {
  createResource,
  getResourceofUser,
  deleteResources,
  allResourceList,
  allResourcesForLoginUser,
  getResource,
  deleteMultipleResource,
  updateResource,
  likesCtr,
  DislikesCtr,
  allResourceByAdmin,
  LikeResourceByYou,
};
