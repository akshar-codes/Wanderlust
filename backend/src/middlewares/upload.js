import multer from "multer";
import { cloudinary, storage } from "../config/cloudConfig.js";
import AppError from "../utils/AppError.js";
import { fileTypeFromStream } from "file-type";
import https from "https";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError(400, "Only JPG, JPEG, PNG, and WebP images are allowed", {
        code: "BAD_REQUEST",
      }),
      false,
    );
  }
  cb(null, true);
};

export const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

export const listingImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 10,
  },
});

/**
 * Middleware to validate magic bytes of uploaded files.
 * Since files are streamed directly to Cloudinary, this fetches the first
 * few bytes from the uploaded URL to verify actual content type.
 * If invalid, it rolls back (deletes) the uploaded files.
 */
export const validateFileType = async (req, res, next) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (req.files)
    files.push(
      ...(Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat()),
    );

  if (files.length === 0) return next();

  const cleanup = async () => {
    try {
      await Promise.all(
        files.map((f) => {
          if (f.filename) return cloudinary.uploader.destroy(f.filename);
        }),
      );
    } catch (err) {
      // Best effort cleanup
    }
  };

  try {
    for (const file of files) {
      if (!file.path || !file.path.startsWith("http")) continue;

      const actualType = await new Promise((resolve, reject) => {
        const request = https.get(file.path, (response) => {
          if (response.statusCode !== 200) {
            request.destroy();
            return reject(new Error("Failed to fetch file"));
          }
          fileTypeFromStream(response)
            .then((type) => {
              request.destroy(); // stop downloading
              resolve(type);
            })
            .catch((err) => {
              request.destroy();
              reject(err);
            });
        });
        request.on("error", reject);
      });

      if (!actualType || !ALLOWED_MIME_TYPES.includes(actualType.mime)) {
        await cleanup();
        return next(
          new AppError(
            400,
            "Invalid file content. Only JPG, PNG, and WebP images are allowed.",
            {
              code: "BAD_REQUEST",
            },
          ),
        );
      }
    }
    next();
  } catch (err) {
    await cleanup();
    return next(
      new AppError(500, "Failed to validate uploaded file type.", {
        code: "INTERNAL_SERVER_ERROR",
      }),
    );
  }
};
