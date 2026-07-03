import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "@fluidjs/multer-cloudinary";
import logger from "../utils/logger.js";

if (
  !process.env.CLOUD_NAME ||
  !process.env.CLOUD_API_KEY ||
  !process.env.CLOUD_API_SECRET
) {
  logger.warn(
    "[CloudConfig] CLOUD_NAME / CLOUD_API_KEY / CLOUD_API_SECRET are not fully set — image uploads will fail.",
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "wanderlust_DEV",
    allowedFormats: ["png", "jpg", "jpeg"],

    timeout: 20000,
  },
});

export { cloudinary, storage };
