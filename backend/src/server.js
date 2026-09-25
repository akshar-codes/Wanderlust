// src/server.js
import "dotenv/config";
import "./config/validateEnv.js";

import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import logger from "./utils/logger.js";
import configurePassport from "./config/passport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;
const DB_URL = process.env.MONGO_URL;

const LOG_DIR = path.resolve(__dirname, "../logs");
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", { reason });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception — shutting down", {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

(async function startServer() {
  try {
    await mongoose.connect(DB_URL);
    logger.db.info("MongoDB connected", {
      url: DB_URL?.replace(/\/\/.*@/, "//***@"),
    });

    const store = MongoStore.create({
      mongoUrl: DB_URL,
      touchAfter: 24 * 60 * 60,
    });

    store.on("error", (err) =>
      logger.db.error("MongoStore session error", { error: err.message }),
    );

    const sessionMiddleware = session({
      store,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    });

    const { default: createApp } = await import("./app.js");
    const app = createApp(sessionMiddleware);

    configurePassport();

    const httpServer = app.listen(PORT, process.env.HOST ?? "127.0.0.1", () =>
      logger.info("Server running", {
        port: PORT,
        env: process.env.NODE_ENV ?? "development",
      }),
    );

    const shutdown = async (signal) => {
      logger.info(`${signal} received: stopping server`);

      const shutdownTimer = setTimeout(() => {
        logger.error("Shutdown timed out. Forcing exit.");
        process.exit(1);
      }, 10000);

      httpServer.close(async (err) => {
        if (err) {
          logger.error("Error closing server", { error: err.message });
        }
        logger.info("HTTP server closed");

        try {
          await mongoose.disconnect();
          logger.info("MongoDB disconnected");
        } catch (dbErr) {
          logger.error("Error disconnecting MongoDB", { error: dbErr.message });
        }

        clearTimeout(shutdownTimer);
        process.exit(err ? 1 : 0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    logger.error("Startup failed", { error: err.message, stack: err.stack });
    process.exit(1);
  }
})();
