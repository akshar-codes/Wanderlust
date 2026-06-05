const express = require("express");
const router = express.Router();

const authRoutes = require("./routes/auth.routes");
const listingRoutes = require("./routes/listing.routes");
const reviewRoutes = require("./routes/review.routes");
const userRoutes = require("./routes/user.routes");

// ── Health check ──────────────────────────────────────────────────────────────
router.get("/health", (_req, res) =>
  res.json({
    success: true,
    data: { status: "ok", ts: new Date().toISOString() },
  }),
);

// ── Resource routers ──────────────────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/listings", listingRoutes);

// Reviews are nested under listings: /api/listings/:listingId/reviews/…
router.use("/listings/:listingId/reviews", reviewRoutes);

router.use("/users", userRoutes);

// ── API 404 — never fall through to EJS 404 handler ──────────────────────────
router.use((_req, res) =>
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    code: "NOT_FOUND",
  }),
);

module.exports = router;
