import express from "express";

import adminRoutes from "./admin.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import authRoutes from "./auth.routes.js";
import bookingRoutes from "./booking.routes.js";
import listingRoutes from "./listing.routes.js";
import myReviewsRoutes from "./myReviews.routes.js";
import reportRoutes from "./report.routes.js";
import reviewRoutes from "./review.routes.js";
import searchRoutes from "./search.routes.js";
import twoFactorRoutes from "./twoFactor.routes.js";
import userRoutes from "./user.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import wishlistCollectionRoutes from "./wishlistCollection.routes.js";
import notificationRoutes from "./notification.routes.js";
import messageRoutes from "./message.routes.js";

const router = express.Router();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
let pkg = { version: "unknown" };
try {
  pkg = JSON.parse(
    fs.readFileSync(
      path.resolve(path.dirname(__filename), "../../../package.json"),
      "utf-8",
    ),
  );
} catch (e) {}

router.get("/health", (_req, res) =>
  res.json({
    success: true,
    data: {
      status: "ok",
      db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      uptime: process.uptime(),
      version: pkg.version,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage().rss,
      ts: new Date().toISOString(),
    },
  }),
);

router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/auth", authRoutes);
router.use("/2fa", twoFactorRoutes);
router.use("/bookings", bookingRoutes);
router.use("/listings", listingRoutes);
router.use("/listings/:listingId/reviews", reviewRoutes);
router.use("/reviews", myReviewsRoutes);
router.use("/reports", reportRoutes);
router.use("/search", searchRoutes);
router.use("/users", userRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/wishlists", wishlistCollectionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/messages", messageRoutes);

router.use((_req, res) =>
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    code: "NOT_FOUND",
  }),
);

export default router;
