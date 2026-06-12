"use strict";

const express = require("express");
const router = express.Router();
const passport = require("passport");

const asyncHandler = require("../utils/asyncHandler");
const authCtrl = require("../controllers/auth.controller");
const validate = require("../middlewares/validate");
const {
  signupBodySchema,
  loginBodySchema,
  forgotPasswordBodySchema,
  resetPasswordBodySchema,
} = require("../validators/schemas");
const { authLimiter } = require("../config/rateLimiter.config");
const saveRedirectUrl = require("../middlewares/saveRedirectUrl");
const authFailureLogger = require("../middlewares/authFailureLogger");
const { requireAuth } = require("../middlewares/rbac");
const { verifyEmailBodySchema } = require("../validators/schemas");
const { resendLimiter } = require("../config/rateLimiter.config");

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFrontendRedirectUrl(req, error = null) {
  const base = process.env.FRONTEND_URL ?? "http://localhost:5173";

  try {
    if (req.query.state) {
      const state = JSON.parse(
        Buffer.from(req.query.state, "base64").toString(),
      );
      if (state.redirectTo) {
        const url = new URL(state.redirectTo, base);
        if (error) url.searchParams.set("auth_error", error);
        return url.toString();
      }
    }
  } catch {
    // ignore malformed state
  }

  return error
    ? `${base}/login?auth_error=${encodeURIComponent(error)}`
    : `${base}/`;
}

function oauthCallbackHandler(provider) {
  return (req, res, next) => {
    passport.authenticate(
      provider,
      { session: true },
      async (err, user, info) => {
        if (err) {
          return res.redirect(getFrontendRedirectUrl(req, "oauth_error"));
        }

        if (!user) {
          const reason = info?.message ?? "authentication_failed";
          return res.redirect(getFrontendRedirectUrl(req, reason));
        }

        req.logIn(user, async (loginErr) => {
          if (loginErr) return next(loginErr);

          const userRepo = require("../repositories/user.repository");
          userRepo.touchLastLogin(user._id).catch(() => {});

          return res.redirect(getFrontendRedirectUrl(req));
        });
      },
    )(req, res, next);
  };
}

// ── Local auth ─────────────────────────────────────────────────────────────────

router.post(
  "/signup",
  authLimiter,
  validate(signupBodySchema),
  asyncHandler(authCtrl.signup),
);

router.post(
  "/login",
  authLimiter,
  saveRedirectUrl,
  authFailureLogger,
  asyncHandler(authCtrl.login),
);

router.post("/logout", requireAuth(), asyncHandler(authCtrl.logout));

router.get("/me", requireAuth(), asyncHandler(authCtrl.me));

// ── Password recovery ──────────────────────────────────────────────────────────

router.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordBodySchema),
  asyncHandler(authCtrl.forgotPassword),
);

router.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordBodySchema),
  asyncHandler(authCtrl.resetPassword),
);

// ── Email verification ─────────────────────────────────────────────────────────

router.post(
  "/verify-email",
  validate(verifyEmailBodySchema),
  asyncHandler(authCtrl.verifyEmail),
);

router.post(
  "/resend-verification",
  requireAuth(),
  resendLimiter,
  asyncHandler(authCtrl.resendVerification),
);

// ── Google OAuth ───────────────────────────────────────────────────────────────

router.get("/google", (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: req.query.state,
    prompt: "select_account",
  })(req, res, next);
});

router.get("/google/callback", oauthCallbackHandler("google"));

// ── GitHub OAuth ───────────────────────────────────────────────────────────────

router.get("/github", (req, res, next) => {
  passport.authenticate("github", {
    scope: ["user:email"],
    state: req.query.state,
  })(req, res, next);
});

router.get("/github/callback", oauthCallbackHandler("github"));

// ── Provider linking (must be authenticated) ──────────────────────────────────

router.get(
  "/link/google",
  requireAuth(),
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

router.get(
  "/link/google/callback",
  requireAuth(),
  oauthCallbackHandler("google"),
);

router.get(
  "/link/github",
  requireAuth(),
  passport.authenticate("github", { scope: ["user:email"] }),
);

router.get(
  "/link/github/callback",
  requireAuth(),
  oauthCallbackHandler("github"),
);

// ── Provider unlinking ─────────────────────────────────────────────────────────

router.delete(
  "/unlink/:provider",
  requireAuth(),
  asyncHandler(authCtrl.unlinkProvider),
);

module.exports = router;
