import AppError from "../utils/AppError.js";

export function requireVerifiedEmail() {
  return function requireVerifiedEmailMiddleware(req, _res, next) {
    if (!req.isAuthenticated()) return next();

    if (req.user.emailVerified === true) return next();

    return next(
      new AppError(403, "Please verify your email address to continue.", {
        code: "EMAIL_NOT_VERIFIED",
      }),
    );
  };
}
