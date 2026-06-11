"use strict";

const crypto = require("crypto");

const userService = require("../services/user.service.js");
const userRepo = require("../repositories/user.repository.js");
const AppError = require("../utils/AppError.js");
const { sendSuccess, sendError } = require("../utils/apiResponse.js");
const logger = require("../utils/logger.js");

// ── POST /api/auth/signup ─────────────────────────────────────────────────────

const signup = async (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;

  let registeredUser;
  try {
    registeredUser = await userService.registerUser(username, email, password, {
      firstName,
      lastName,
    });
  } catch (err) {
    return next(AppError.badRequest(err.message));
  }

  await new Promise((resolve, reject) => {
    req.login(registeredUser, (err) => (err ? reject(err) : resolve()));
  });

  return sendSuccess(
    res,
    {
      message: "Account created successfully",
      user: serializeUser(registeredUser),
    },
    201,
  );
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────

const login = async (req, res) => {
  userRepo.touchLastLogin(req.user._id).catch(() => {});
  return sendSuccess(res, {
    message: "Logged in successfully",
    user: serializeUser(req.user),
  });
};

// ── POST /api/auth/logout ─────────────────────────────────────────────────────

const logout = async (req, res, next) => {
  await new Promise((resolve, reject) => {
    req.logout((err) => (err ? reject(err) : resolve()));
  });
  return sendSuccess(res, { message: "Logged out successfully" });
};

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

const me = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next(AppError.unauthorized("Not authenticated"));
  }
  return sendSuccess(res, { user: serializeUser(req.user) });
};

// ── DELETE /api/auth/unlink/:provider ─────────────────────────────────────────

const unlinkProvider = async (req, res, next) => {
  const { provider } = req.params;
  const SUPPORTED = ["google", "github"];

  if (!SUPPORTED.includes(provider)) {
    return next(AppError.badRequest(`Unsupported provider: ${provider}`));
  }

  const user = await userRepo.findById(req.user._id);
  if (!user) return next(AppError.notFound("User not found"));

  const providerIdField = `${provider}Id`;

  if (!user[providerIdField]) {
    return next(
      AppError.badRequest(`Your account is not linked to ${provider}`),
    );
  }

  // Safety check — ensure the user won't be locked out
  const otherProviders = SUPPORTED.filter((p) => p !== provider);
  const hasOtherOAuth = otherProviders.some((p) => user[`${p}Id`]);
  const hasLocalPassword = !!user.hash; // passport-local-mongoose stores hash field

  if (!hasOtherOAuth && !hasLocalPassword) {
    return next(
      AppError.badRequest(
        `Cannot unlink ${provider}: it is your only login method. ` +
          "Please set a password or link another provider first.",
      ),
    );
  }

  await userRepo.updateById(user._id, { [providerIdField]: null });

  logger.auth.info(`Provider unlinked`, {
    userId: user._id,
    username: user.username,
    provider,
  });

  return sendSuccess(res, {
    message: `${provider} has been unlinked from your account`,
    user: serializeUser({ ...user.toObject(), [providerIdField]: null }),
  });
};

// ── POST /api/auth/forgot-password ───────────────────────────────────────────

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(AppError.badRequest("Email is required"));

  // Always respond with 200 — never reveal whether an email exists
  const user = await userRepo.findByEmail(email);
  if (!user) {
    return sendSuccess(res, {
      message: "If that email is registered, a reset link has been sent.",
    });
  }

  // OAuth-only accounts cannot reset a password they never set
  if (user.provider !== "local" && !user.hash) {
    logger.auth.warn("Forgot-password attempt on OAuth-only account", {
      email,
      provider: user.provider,
    });
    return sendSuccess(res, {
      message: "If that email is registered, a reset link has been sent.",
    });
  }

  // Generate a secure random token (hex, 32 bytes)
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await userRepo.updateById(user._id, {
    emailVerificationToken: tokenHash, // re-using the field; rename in production
    emailVerificationExpires: expires,
  });

  // ── TODO: Send the email ──────────────────────────────────────────────────

  logger.auth.info("Password reset token generated", {
    userId: user._id,
    email: user.email,
  });

  return sendSuccess(res, {
    message: "If that email is registered, a reset link has been sent.",
    // Remove in production — only for development convenience:
    ...(process.env.NODE_ENV !== "production" && { _devToken: rawToken }),
  });
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────

const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return next(AppError.badRequest("Token and new password are required"));
  }

  if (password.length < 6) {
    return next(AppError.badRequest("Password must be at least 6 characters"));
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  // Find user with matching token that hasn't expired
  const User = require("../models/user");
  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    return next(AppError.badRequest("Reset token is invalid or has expired"));
  }

  // passport-local-mongoose's setPassword returns a promise
  await user.setPassword(password);
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  logger.auth.info("Password reset completed", {
    userId: user._id,
    username: user.username,
  });

  return sendSuccess(res, {
    message: "Password updated successfully. Please log in.",
  });
};

// ── Serializer helper (never expose hash / salt / tokens) ────────────────────

function serializeUser(user) {
  const obj = typeof user.toObject === "function" ? user.toObject() : user;
  return {
    id: obj._id,
    username: obj.username,
    email: obj.email,
    firstName: obj.firstName ?? null,
    lastName: obj.lastName ?? null,
    displayName: obj.displayName ?? obj.username,
    avatar: obj.avatar?.url ?? null,
    bio: obj.bio ?? null,
    role: obj.role,
    emailVerified: obj.emailVerified,
    profileCompletion: obj.profileCompletion,
    provider: obj.provider,
    isHost: obj.isHost ?? (obj.role === "host" || obj.role === "admin"),
    // Expose which providers are linked so the frontend can render "connected" badges
    linkedProviders: {
      google: !!obj.googleId,
      github: !!obj.githubId,
      local: !!obj.hash, // has a local password
    },
    notificationPreferences: obj.notificationPreferences,
    settings: obj.settings,
    createdAt: obj.createdAt,
    lastLoginAt: obj.lastLoginAt,
  };
}

module.exports = {
  signup,
  login,
  logout,
  me,
  unlinkProvider,
  forgotPassword,
  resetPassword,
};
