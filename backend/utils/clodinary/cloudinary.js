const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cluud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

const cloudinaryUploadImg = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      folder: "Pixel_nepal/Thumbnail",
      resource_type: "auto",
    });
    return { url: data?.secure_url, name: data?.original_filename };
  } catch (error) {
    return error;
  }
};

module.exports = cloudinaryUploadImg;
