const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Credentials are kept in env vars to support multiple environments
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer storage that uploads files directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // All project images are grouped under a single folder
    folder: "wanderlust_DEV",

    // Restrict uploads to images only
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});

module.exports = {
  cloudinary, // used later for delete/update operations
  storage,
};
