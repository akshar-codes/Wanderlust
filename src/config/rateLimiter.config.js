const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// ── Shared handler: log every rate-limit hit ──────────────────────────────────
function onLimitReached(req, _res, options) {
  logger.warn("Rate limit exceeded", {
    ip: req.ip,
    method: req.method,
    path: req.path,
    userAgent: req.get("user-agent"),
    limit: options.max,
    window: options.windowMs,
  });
}

// ── 1. Global limiter — all routes ───────────────────────────────────────────
// 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true, // RateLimit-* headers (RFC 6585)
  legacyHeaders: false, // drop X-RateLimit-* headers
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
// 20 attempts per 15 minutes per IP (brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,

  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: "Too many authentication attempts — please wait 15 minutes.",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
  },
  handler(req, res, next, options) {
    // Log as auth context so it lands in auth.log as well as combined.log
    logger.auth.warn("Auth rate limit exceeded", {
      ip: req.ip,
      path: req.path,
      userAgent: req.get("user-agent"),
    });
    res.status(options.statusCode).json(options.message);
  },
});

// ── 3. API write limiter — POST /listings, POST /reviews ─────────────────────
// 30 creates per hour per IP
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
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

module.exports = { globalLimiter, authLimiter, createLimiter };
