import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";
import passport from "passport";

import AppError from "./utils/AppError.js";
import errorHandler from "./middlewares/errorHandler.js";

import securityHeaders from "./config/helmet.config.js";
import corsMiddleware from "./config/cors.config.js";
import { globalLimiter } from "./config/rateLimiter.config.js";
import hppProtection from "./middlewares/hpp.js";
import compressionMiddleware from "./middlewares/compression.js";
import requestLogger from "./middlewares/requestLogger.js";
import setupSwagger from "./config/swagger.config.js";

import { requireActiveAccount } from "./middlewares/rbac.js";

import apiRouter from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function createApp(sessionMiddleware) {
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

  // 12. RBAC: reject stale sessions for deactivated accounts
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
