const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const ejsMate = require("ejs-mate");

const AppError = require("./utils/AppError");
const errorHandler = require("./middlewares/errorHandler");

// ── Security & performance middleware ─────────────────────────────────────────
const securityHeaders = require("./config/helmet.config");
const corsMiddleware = require("./config/cors.config");
const { globalLimiter } = require("./config/rateLimiter.config");
const hppProtection = require("./middlewares/hpp");
const compressionMiddleware = require("./middlewares/compression");
const requestLogger = require("./middlewares/requestLogger");

// ── Routers ───────────────────────────────────────────────────────────────────
const listingRouter = require("./routes/listing.routes");
const reviewsRouter = require("./routes/review.routes");
const userRouter = require("./routes/user.routes");
const legalRouter = require("./routes/legal.routes");

const app = express();

// ── 1. Compression (first — compress everything that follows) ─────────────────
app.use(compressionMiddleware);

// ── 2. Security headers (Helmet) ──────────────────────────────────────────────
app.use(securityHeaders);

// ── 3. CORS ───────────────────────────────────────────────────────────────────
app.use(corsMiddleware);

// ── 4. Global rate limiter ────────────────────────────────────────────────────
app.use(globalLimiter);

// ── 5. HTTP request logger (Morgan → Winston) ─────────────────────────────────
app.use(requestLogger);

// ── 6. View Engine ───────────────────────────────────────────────────────────
app.engine("ejs", ejsMate);
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

// ── 10. Session (basic fallback — server.js replaces with MongoStore) ─────────
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "fallback-dev-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(flash());

// ── 11. Passport ──────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── 12. Template locals ───────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ── 13. Routes ────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.redirect("/listings"));
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use("/", legalRouter);

// ── 14. 404 ───────────────────────────────────────────────────────────────────
app.use((_req, _res, next) => next(AppError.notFound("Page Not Found")));

// ── 15. Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
