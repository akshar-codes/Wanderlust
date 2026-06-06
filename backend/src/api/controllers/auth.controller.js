const userService = require("../../services/user.service");
const AppError = require("../../utils/AppError");
const { sendSuccess } = require("../../utils/apiResponse");
const User = require("../../models/user");

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  let registeredUser;
  try {
    registeredUser = await userService.registerUser(username, email, password);
  } catch (err) {
    // passport-local-mongoose throws plain Errors for duplicate username etc.
    return next(AppError.badRequest(err.message));
  }

  // Establish the session (same as web controller)
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
const login = (req, res) => {
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

// ── Helper: safe user shape (never expose hash/salt) ─────────────────────────
function serializeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
  };
}

module.exports = { signup, login, logout, me };
