const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const path = require("path");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

// Configure Multer for uploading images and videos
const storage = multer.memoryStorage();

/*  ----------------  Resources  ----------------*/
// file type check
const multerFilter = (req, file, cb) => {
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: multerFilter });

// Middleware to upload thumbnails and assets
const uploadThumbnailsAndAssets = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "assets", maxCount: 1 },
]);
/*  ---------------- End Resources  ----------------*/

/*  ---------------- For profile picture ----------------*/
const storageProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const multerFilterForProfile = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};
const profilePictureUpload = multer({
  storage: storageProfile,
  fileFilter: multerFilterForProfile,
});

// Profile Picture Resizing
const profilePhotoResize = async (req, res, next) => {
  //check if there is no file
  if (!req.file) return next();

  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/profile/${req.file.filename}`));
  next();
};

const cloudinaryUploadImg = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      folder: "Pixel_nepal/Profile",
    });
    return { url: data?.secure_url, name: data?.original_filename };
  } catch (error) {
    return error;
  }
};

/*  ---------------- End profile picture ----------------*/

module.exports = { uploadThumbnailsAndAssets, profilePictureUpload, profilePhotoResize, cloudinaryUploadImg };
