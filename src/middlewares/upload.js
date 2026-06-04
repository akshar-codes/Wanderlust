const multer = require("multer");
const { storage } = require("../config/cloudConfig.js");
const ExpressError = require("../utils/ExpressError.js");

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(
      new ExpressError(400, "Only JPG, JPEG, and PNG images are allowed"),
      false,
    );
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
