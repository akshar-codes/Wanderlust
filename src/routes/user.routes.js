const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const userCtrl = require("../controllers/user.controller");
const saveRedirectUrl = require("../middlewares/saveRedirectUrl");
const authFailureLogger = require("../middlewares/authFailureLogger");
const validate = require("../middlewares/validate");
const { signupBodySchema } = require("../validators/schemas");
const { authLimiter } = require("../config/rateLimiter.config");

// ── Signup ────────────────────────────────────────────────────────────────────
router.route("/signup").get(userCtrl.renderSignupForm).post(
  authLimiter, // brute-force protection
  validate(signupBodySchema),
  asyncHandler(userCtrl.signup),
);

// ── Login ─────────────────────────────────────────────────────────────────────
router.route("/login").get(userCtrl.renderLoginForm).post(
  authLimiter, // brute-force / credential-stuffing protection
  saveRedirectUrl,
  authFailureLogger, // logs failures + success; replaces passport.authenticate
  userCtrl.login, // called only on success
);

// ── Logout ────────────────────────────────────────────────────────────────────
router.get("/logout", asyncHandler(userCtrl.logout));

module.exports = router;
