const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const listingRoutes = require("./listing.routes");
const reviewRoutes = require("./review.routes");
const userRoutes = require("./user.routes");

router.get("/health", (_req, res) =>
  res.json({
    success: true,
    data: { status: "ok", ts: new Date().toISOString() },
  }),
);

router.use("/auth", authRoutes);
router.use("/listings", listingRoutes);
router.use("/listings/:listingId/reviews", reviewRoutes);
router.use("/users", userRoutes);

router.use((_req, res) =>
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    code: "NOT_FOUND",
  }),
);

module.exports = router;
