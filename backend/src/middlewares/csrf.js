import crypto from "crypto";
import AppError from "../utils/AppError.js";

/**
 * Double-submit cookie pattern CSRF generation middleware.
 * Ensures every client gets a `csrf_token` cookie.
 */
export const csrfCookie = (req, res, next) => {
  if (!req.cookies.csrf_token) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie("csrf_token", token, {
      httpOnly: false, // SPA needs to read this to send back in header
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }
  next();
};

import logger from "../utils/logger.js";
export const csrfProtect = (req, res, next) => {
  // 1. Skip safe methods
  const method = req.method.toLowerCase();
  if (["get", "head", "options"].includes(method)) {
    return next();
  }

  // 2. Skip OAuth callbacks (Passport manages its own state validation)
  const path = req.path;
  if (path === "/auth/google/callback" || path === "/auth/github/callback") {
    // Note: State validation is handled by passport-google-oauth20 / passport-github2.
    // If state validation is broken/missing there, it must be fixed at the strategy level.
    return next();
  }

  // 3. Verify token
  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies.csrf_token;

  if (!headerToken || !cookieToken) {
    logger.warn("CSRF token missing", {
      hasHeaderToken: Boolean(headerToken),
      hasCookieToken: Boolean(cookieToken),
    });
    return next(
      new AppError(403, "CSRF token missing", {
        code: "CSRF_VALIDATION_FAILED",
      }),
    );
  }

  try {
    const headerBuffer = Buffer.from(headerToken, "utf8");
    const cookieBuffer = Buffer.from(cookieToken, "utf8");

    if (
      headerBuffer.length !== cookieBuffer.length ||
      !crypto.timingSafeEqual(headerBuffer, cookieBuffer)
    ) {
      logger.warn("CSRF token mismatch");
      throw new Error("Mismatch");
    }

    next();
  } catch (err) {
    return next(
      new AppError(403, "CSRF token invalid", {
        code: "CSRF_VALIDATION_FAILED",
      }),
    );
  }
};
