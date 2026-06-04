const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const ejsMate = require("ejs-mate");

const ExpressError = require("./utils/ExpressError.js");

// ── Routers ──────────────────────────────────────────────────────────────────
const listingRouter = require("./routes/listing.routes.js");
const reviewsRouter = require("./routes/review.routes.js");
const userRouter = require("./routes/user.routes.js");
const legalRouter = require("./routes/legal.routes.js");

const app = express();

// ── View Engine ───────────────────────────────────────────────────────────────
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ── Session (basic fallback — server.js replaces this with MongoStore) ────────
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-dev-secret",
    resave: false,
    saveUninitialized: false,
  }),
);

app.use(flash());

// ── Passport ──────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── Locals ────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.redirect("/listings"));
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);
app.use("/", legalRouter);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ── Central Error Handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error", { message });
});

module.exports = app;
