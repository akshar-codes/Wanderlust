import passport from "passport";
import logger from "../utils/logger.js";

const authFailureLogger = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      logger.auth.error("Authentication error", {
        ip: req.ip,
        username: req.body?.username,
        error: err.message,
        stack: err.stack,
      });
      return next(err);
    }

    if (!user) {
      logger.auth.warn("Authentication failure", {
        ip: req.ip,
        username: req.body?.username,
        reason: info?.message ?? "Unknown",
        userAgent: req.get("user-agent"),
        path: req.originalUrl,
      });

      if (req.flash) req.flash("error", info?.message ?? "Invalid credentials");

      const acceptsHtml = req.accepts("html");
      if (acceptsHtml) return res.redirect("/login");

      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        code: "UNAUTHORIZED",
      });
    }

    logger.auth.info("Authentication success", {
      ip: req.ip,
      username: user.username,
      userId: user._id,
    });

    req.logIn(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      next();
    });
  })(req, res, next);
};

export default authFailureLogger;
