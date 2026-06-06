const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authCtrl = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { signupBodySchema, loginBodySchema } = require("../validators/schemas");
const { authLimiter } = require("../config/rateLimiter.config");
const saveRedirectUrl = require("../middlewares/saveRedirectUrl");
const authFailureLogger = require("../middlewares/authFailureLogger");

/**
 * POST /api/auth/signup
 */
router.post(
  "/signup",
  authLimiter,
  validate(signupBodySchema),
  asyncHandler(authCtrl.signup),
);

/**
 * POST /api/auth/login
 */
router.post(
  "/login",
  authLimiter,
  saveRedirectUrl,
  authFailureLogger, // sets req.user via req.logIn on success; calls next()
  asyncHandler(authCtrl.login),
);

/**
 * POST /api/auth/logout
 */
router.post("/logout", asyncHandler(authCtrl.logout));

/**
 * GET /api/auth/me
 */
router.get("/me", asyncHandler(authCtrl.me));

module.exports = router;
