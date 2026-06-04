const passport = require("passport");
const logger = require("../utils/logger");

const authFailureLogger = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    // ── Unexpected error (DB down, etc.) ──────────────────────────────────────
    if (err) {
      logger.auth.error("Authentication error", {
        ip: req.ip,
        username: req.body?.username,
        error: err.message,
        stack: err.stack,
      });
      return next(err);
    }

    // ── Bad credentials ───────────────────────────────────────────────────────
    if (!user) {
      logger.auth.warn("Authentication failure", {
        ip: req.ip,
        username: req.body?.username, // never log the password
        reason: info?.message ?? "Unknown",
        userAgent: req.get("user-agent"),
        path: req.originalUrl,
      });

      // Replicate Passport's built-in flash + redirect behaviour
      if (req.flash) req.flash("error", info?.message ?? "Invalid credentials");

      const acceptsHtml = req.accepts("html");
      if (acceptsHtml) return res.redirect("/login");

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        code: "UNAUTHORIZED",
      });
    }

    // ── Success — log it for the audit trail ──────────────────────────────────
    logger.auth.info("Authentication success", {
      ip: req.ip,
      username: user.username,
      userId: user._id,
    });

    // Establish the session the same way passport.authenticate would
    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      next();
    });
  })(req, res, next);
};

module.exports = authFailureLogger;
