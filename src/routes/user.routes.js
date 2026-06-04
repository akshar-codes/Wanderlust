const express = require("express");
const router = express.Router();
const passport = require("passport");

const userCtrl = require("../controllers/user.controller.js");
const saveRedirectUrl = require("../middlewares/saveRedirectUrl.js");

// ─── Signup ───────────────────────────────────────────────────────────────────
router.route("/signup").get(userCtrl.renderSignupForm).post(userCtrl.signup);

// ─── Login ────────────────────────────────────────────────────────────────────
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

// ─── Logout ───────────────────────────────────────────────────────────────────
router.get("/logout", userCtrl.logout);

module.exports = router;
