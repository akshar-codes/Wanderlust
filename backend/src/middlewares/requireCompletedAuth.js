import AppError from "../utils/AppError.js";

/**
 * Middleware that ensures the session is fully authenticated and NOT in a pending-2FA state.
 * Replaces instances of requireAuth() where full access is needed.
 */
export const requireCompletedAuth = () => {
  return (req, res, next) => {
    // 1. Must be authenticated
    if (!req.isAuthenticated()) {
      return next(AppError.unauthorized("Authentication required"));
    }

    // 2. Must NOT be in a pending 2FA state
    // Wait, the pending 2FA state is only active before req.logIn.
    // If req.isAuthenticated() is true, Passport has established the session.
    // But let's double check if pendingTwoFactor exists.
    if (req.session?.pendingTwoFactor) {
      return next(AppError.forbidden("Two-factor authentication required"));
    }

    next();
  };
};
