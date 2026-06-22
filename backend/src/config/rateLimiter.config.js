import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

// ── Shared handler: log every rate-limit hit ──────────────────────────────────

function onLimitReached(req, _res, options) {
  logger.warn("Rate limit exceeded", {
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get("user-agent"),
    limit: options.limit,
    window: options.windowMs,
  });
}

// ── 1. Global limiter — all routes ───────────────────────────────────────────
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests — please try again later.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  handler(req, res, next, options) {
    onLimitReached(req, res, options);
    res.status(options.statusCode).json(options.message);
  },
});

// ── 2. Auth limiter — /login, /signup ────────────────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many authentication attempts — please wait 15 minutes.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  handler(req, res, next, options) {
    logger.auth.warn("Auth rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("user-agent"),
      limit: options.limit,
    });
    res.status(options.statusCode).json(options.message);
  },
});

// ── 3. API write limiter — POST /listings, POST /reviews ─────────────────────
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "You have created too many resources — please slow down.",
    code: "CREATE_RATE_LIMIT_EXCEEDED",
  },
  handler(req, res, next, options) {
    onLimitReached(req, res, options);
    res.status(options.statusCode).json(options.message);
  },
});

// ── 4. Resend-verification limiter ────────────────────────────────────────────
export const resendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many verification email requests — please try again in an hour.",
    code: "RESEND_RATE_LIMIT_EXCEEDED",
  },
  handler(req, res, next, options) {
    logger.auth.warn("Resend-verification rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("user-agent"),
      limit: options.limit,
    });
    res.status(options.statusCode).json(options.message);
  },
});
