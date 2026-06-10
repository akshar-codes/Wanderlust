"use strict";

const userService = require("../services/user.service.js");
const userRepo = require("../repositories/user.repository.js");
const AppError = require("../utils/AppError.js");
const { sendSuccess } = require("../utils/apiResponse.js");

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
    // passport-local-mongoose throws plain Errors for duplicate username etc.
    return next(AppError.badRequest(err.message));
  }

  // Establish the session
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
  // Touch lastLoginAt non-blocking
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

// ── Helper: safe user shape (never expose hash/salt or sensitive tokens) ──────

function serializeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    displayName: user.displayName ?? user.username,
    avatar: user.avatar?.url ?? null,
    bio: user.bio ?? null,
    role: user.role,
    emailVerified: user.emailVerified,
    profileCompletion: user.profileCompletion,
    provider: user.provider,
    isHost: user.isHost,
    notificationPreferences: user.notificationPreferences,
    settings: user.settings,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

module.exports = { signup, login, logout, me };
