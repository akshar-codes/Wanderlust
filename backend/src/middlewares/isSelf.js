"use strict";

const AppError = require("../utils/AppError");

module.exports = (req, _res, next) => {
  if (!req.isAuthenticated()) {
    return next(AppError.unauthorized("Authentication required"));
  }

  if (req.user.username !== req.params.username && req.user.role !== "admin") {
    return next(AppError.forbidden("You can only modify your own account"));
  }

  next();
};
