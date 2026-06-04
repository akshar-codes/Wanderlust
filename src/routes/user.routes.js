/**
 * routes/user.routes.js
 *
 * Changes from original:
 *  • validate(signupBodySchema) added before signup handler
 *  • asyncHandler wraps async controllers
 *  • saveRedirectUrl preserved as-is
 */

const express = require("express");
const router = express.Router();
const passport = require("passport");

const asyncHandler = require("../utils/asyncHandler");
const userCtrl = require("../controllers/user.controller");
const saveRedirectUrl = require("../middlewares/saveRedirectUrl");
const validate = require("../middlewares/validate");
const { signupBodySchema } = require("../validators/schemas");

// ── Signup ────────────────────────────────────────────────────────────────────
router
  .route("/signup")
  .get(userCtrl.renderSignupForm)
  .post(validate(signupBodySchema), asyncHandler(userCtrl.signup));

// ── Login ─────────────────────────────────────────────────────────────────────
router
  .route("/login")
  .get(userCtrl.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userCtrl.login,
  );

// ── Logout ────────────────────────────────────────────────────────────────────
router.get("/logout", asyncHandler(userCtrl.logout));

module.exports = router;
