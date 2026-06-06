"use strict";

const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const passport = require("passport");

const AppError = require("./utils/AppError");
const errorHandler = require("./middlewares/errorHandler");

// ── Security & performance middleware ─────────────────────────────────────────
const securityHeaders = require("./config/helmet.config");
const corsMiddleware = require("./config/cors.config");
const { globalLimiter } = require("./config/rateLimiter.config");
const hppProtection = require("./middlewares/hpp");
const compressionMiddleware = require("./middlewares/compression");
const requestLogger = require("./middlewares/requestLogger");
const setupSwagger = require("./config/swagger.config");

// ── Routers ───────────────────────────────────────────────────────────────────
const apiRouter = require("./api");

function createApp(sessionMiddleware) {
  const app = express();

  // ── 1. Compression (first — compress everything that follows) ───────────────
  app.use(compressionMiddleware);

  // ── 2. Security headers (Helmet) ────────────────────────────────────────────
  app.use(securityHeaders);

  // ── 3. CORS ──────────────────────────────────────────────────────────────────
  app.use(corsMiddleware);

  // ── 4. Global rate limiter ───────────────────────────────────────────────────
  app.use(globalLimiter);

  // ── 5. HTTP request logger (Morgan → Winston) ────────────────────────────────
  app.use(requestLogger);

  // ── 6. View Engine ────────────────────────────────────────────────────────────
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  // ── 7. Core body/override middleware ─────────────────────────────────────────
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(methodOverride("_method"));

  // ── 8. HPP — must come AFTER body parsers ────────────────────────────────────
  app.use(hppProtection);

  // ── 9. Static assets ─────────────────────────────────────────────────────────
  app.use(express.static(path.join(__dirname, "public")));

  // ── 10. Session (injected by caller — MongoStore in prod, MemoryStore in test)
  app.use(sessionMiddleware);

  // ── 11. Passport — MUST come after session ───────────────────────────────────
  app.use(passport.initialize());
  app.use(passport.session());

  // ── 12. API docs (Swagger UI) ─────────────────────────────────────────────────
  setupSwagger(app);

  // ── 13. Routes ────────────────────────────────────────────────────────────────
  app.use("/api", apiRouter);

  // ── 14. 404 ───────────────────────────────────────────────────────────────────
  app.use((_req, _res, next) => next(AppError.notFound("Page Not Found")));

  // ── 15. Global error handler (must be last) ───────────────────────────────────
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
