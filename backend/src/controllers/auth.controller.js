"use strict";

const userService = require("../services/user.service.js");
const userRepo = require("../repositories/user.repository.js");
const passwordResetService = require("../services/passwordReset.service.js");
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
  const hasLocalPassword = !!user.hash;

  if (!hasOtherOAuth && !hasLocalPassword) {
    return next(
      AppError.badRequest(
        `Cannot unlink ${provider}: it is your only login method. ` +
          "Please set a password or link another provider first.",
      ),
    );
  }

  await userRepo.updateById(user._id, { [providerIdField]: null });

  logger.auth.info("Provider unlinked", {
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
  const { email } = req.body; // validated by forgotPasswordBodySchema

  const result = await passwordResetService.initiateForgotPassword({
    email,
    requestIp: req.ip,
  });

  const responsePayload = {
    message:
      "If that email address is registered, you will receive a password reset link shortly.",
  };

  // Expose raw token in non-production for integration/e2e testing convenience
  if (result._devToken) {
    responsePayload._devToken = result._devToken;
  }

  return sendSuccess(res, responsePayload);
};

// ── POST /api/auth/reset-password ────────────────────────────────────────────

const resetPassword = async (req, res, next) => {
  const { token, password } = req.body; // validated by resetPasswordBodySchema

  try {
    await passwordResetService.consumeResetToken({
      token,
      newPassword: password,
      consumedByIp: req.ip,
    });
  } catch (err) {
    return next(err); // AppError from service layer — passed straight through
  }

  return sendSuccess(res, {
    message:
      "Your password has been updated successfully. Please log in with your new password.",
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
    linkedProviders: {
      google: !!obj.googleId,
      github: !!obj.githubId,
      local: !!obj.hash,
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
