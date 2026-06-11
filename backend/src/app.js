"use strict";

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const passport = require("passport");

const AppError = require("./utils/AppError");
const errorHandler = require("./middlewares/errorHandler");

const securityHeaders = require("./config/helmet.config");
const corsMiddleware = require("./config/cors.config");
const { globalLimiter } = require("./config/rateLimiter.config");
const hppProtection = require("./middlewares/hpp");
const compressionMiddleware = require("./middlewares/compression");
const requestLogger = require("./middlewares/requestLogger");
const setupSwagger = require("./config/swagger.config");

// ── RBAC active-account guard ─────────────────────────────────────────────
const { requireActiveAccount } = require("./middlewares/rbac");

const apiRouter = require("./routes");

function createApp(sessionMiddleware) {
  const app = express();

  // 1. Compression
  app.use(compressionMiddleware);

  // 2. Security headers
  app.use(securityHeaders);

  // 3. CORS
  app.use(corsMiddleware);

  // 4. Global rate limiter
  app.use(globalLimiter);

  // 5. HTTP request logger
  app.use(requestLogger);

  // 6. View engine
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // 7. Body parsers + method override
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(methodOverride("_method"));

  // 8. HPP
  app.use(hppProtection);

  // 9. Static assets
  app.use(express.static(path.join(__dirname, "public")));

  // 10. Session
  app.use(sessionMiddleware);

  // 11. Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // ── 12. RBAC: reject stale sessions for deactivated accounts ─────────────────
  app.use(requireActiveAccount());

  // 13. API docs
  setupSwagger(app);

  // 14. Routes
  app.use("/api", apiRouter);

  // 15. 404
  app.use((_req, _res, next) => next(AppError.notFound("Page Not Found")));

  // 16. Global error handler
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
