"use strict";

require("dotenv").config();

const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const fs = require("fs");

const logger = require("./utils/logger");
const configPassport = require("./config/passport.js");

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

    const createApp = require("./app.js");
    const app = createApp(sessionMiddleware);

    configPassport();

    // ── 5. Listen ─────────────────────────────────────────────────────────────
    app.listen(PORT, () =>
      logger.info("Server running", {
        port: PORT,
        env: process.env.NODE_ENV ?? "development",
      }),
    );
  } catch (err) {
    logger.error("Startup failed", { error: err.message, stack: err.stack });
    process.exit(1);
  }
})();
