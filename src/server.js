require("dotenv").config();

const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = require("./app.js");
const configPassport = require("./config/passport.js");

const PORT = process.env.PORT || 8080;
const DB_URL = process.env.MONGO_URL;

(async function startServer() {
  try {
    // ── 1. Database ───────────────────────────────────────────────────────────
    await mongoose.connect(DB_URL);
    console.log("✅ MongoDB connected");

    // ── 2. Production-grade session with MongoDB backing ──────────────────────
    const store = MongoStore.create({
      mongoUrl: DB_URL,
      touchAfter: 24 * 60 * 60, // lazy session update — max once per 24 h
    });

    store.on("error", (err) => console.error("❌ MongoStore error:", err));

    // Replace the in-memory session middleware applied in app.js
    app.use(
      session({
        store,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true, // block client-side JS access
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
      }),
    );

    // ── 3. Passport strategies ────────────────────────────────────────────────
    configPassport();

    // ── 4. Listen ─────────────────────────────────────────────────────────────
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    );
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
})();
