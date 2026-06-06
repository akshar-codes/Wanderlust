const multer = require("multer");
const { storage } = require("../config/cloudConfig");
const AppError = require("../utils/AppError");

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(
      new AppError(400, "Only JPG, JPEG, and PNG images are allowed", {
        code: "BAD_REQUEST",
      }),
      false,
    );
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
