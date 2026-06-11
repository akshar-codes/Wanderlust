"use strict";

const multer = require("multer");
const { storage } = require("../config/cloudConfig");
const AppError = require("../utils/AppError");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];
const MAX_FILE_SIZE_MB = 10;

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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 10, // max 10 files per request (multi-upload endpoints)
  },
});

module.exports = upload;
