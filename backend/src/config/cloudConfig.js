import { v2 as cloudinary } from "cloudinary";
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

export const ALLOWED_FORMATS = ["png", "jpg", "jpeg", "webp"];
export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const storage = {
  _handleFile(_req, file, callback) {
    let complete = false;
    const finish = (...args) => {
      if (complete) return;
      complete = true;
      clearTimeout(timeout);
      callback(...args);
    };
    const upload = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_UPLOAD_FOLDER ?? "wanderlust",
        allowed_formats: ALLOWED_FORMATS,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return finish(error);
        if (!result)
          return finish(new Error("Cloudinary returned no upload result"));
        finish(null, {
          path: result.secure_url,
          filename: result.public_id,
          size: result.bytes,
        });
      },
    );
    const timeout = setTimeout(() => {
      upload.destroy(new Error("Cloudinary upload timed out"));
    }, 20000);
    upload.once("error", finish);
    file.stream.pipe(upload);
  },

  _removeFile(_req, file, callback) {
    cloudinary.uploader.destroy(file.filename, (error, result) => {
      if (error) return callback(error);
      if (!result)
        return callback(new Error("Cloudinary returned no deletion result"));
      callback(null, result);
    });
  },
};

export { cloudinary, storage };
