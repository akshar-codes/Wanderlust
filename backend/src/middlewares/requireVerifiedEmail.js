"use strict";

const AppError = require("../utils/AppError");


function requireVerifiedEmail() {
  return function requireVerifiedEmailMiddleware(req, _res, next) {
    // Unauthenticated requests are not our concern here — let requireAuth handle them
    if (!req.isAuthenticated()) return next();

    if (req.user.emailVerified === true) return next();

    return next(
      new AppError(403, "Please verify your email address to continue.", {
        code: "EMAIL_NOT_VERIFIED",
      }),
    );
  };
}

module.exports = { requireVerifiedEmail };
