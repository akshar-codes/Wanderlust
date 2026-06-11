"use strict";

const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const authCtrl = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const { signupBodySchema, loginBodySchema } = require("../validators/schemas");
const { authLimiter } = require("../config/rateLimiter.config");
const saveRedirectUrl = require("../middlewares/saveRedirectUrl");
const authFailureLogger = require("../middlewares/authFailureLogger");
const { requireAuth } = require("../middlewares/rbac");

/**
 * POST /api/auth/signup  → public
 */
router.post(
  "/signup",
  authLimiter,
  validate(signupBodySchema),
  asyncHandler(authCtrl.signup),
);

/**
 * POST /api/auth/login  → public
 */
router.post(
  "/login",
  authLimiter,
  saveRedirectUrl,
  authFailureLogger,
  asyncHandler(authCtrl.login),
);

/**
 * POST /api/auth/logout  → authenticated users only
 */
router.post("/logout", requireAuth(), asyncHandler(authCtrl.logout));

/**
 * GET /api/auth/me  → authenticated users only
 */
router.get("/me", requireAuth(), asyncHandler(authCtrl.me));

module.exports = router;
