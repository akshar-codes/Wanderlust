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

const canReach = async (url) => {
  if (!url) return "unknown";
  try {
    // Any HTTP response proves the host is reachable; endpoint status is
    // intentionally not used because the configured URL may serve a SPA or 404.
    await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000) });
    return "up";
  } catch {
    return "down";
  }
};

router.get("/health", async (_req, res) => {
  const startTime = Date.now();
  const frontendUrl = process.env.FRONTEND_URL;
  const backendUrl = process.env.BACKEND_URL;

  const [frontendStatus, backendStatus] = await Promise.all([
    canReach(frontendUrl),
    canReach(backendUrl),
  ]);

  let databaseStatus = "down";
  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
      databaseStatus = "up";
    } else if (mongoose.connection.readyState === 2) {
      databaseStatus = "degraded";
    }
  } catch {
    databaseStatus = "down";
  }

  const healthy =
    (frontendStatus === "up" || !frontendUrl || frontendStatus === "down") &&
    backendStatus === "up" &&
    databaseStatus === "up";
  const response = {
    success: true,
    status: healthy ? "ok" : "degraded",
    data: {
      status: healthy ? "ok" : "degraded",
      db: databaseStatus === "up" ? "connected" : "disconnected",
    },
    services: {
      frontend: frontendStatus,
      backend: backendStatus,
      database: databaseStatus,
    },
    details: {
      frontendUrl: frontendUrl ?? null,
      backendUrl: backendUrl ?? null,
      databaseUrlConfigured: Boolean(process.env.MONGO_URL),
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
    },
  };

  if (process.env.NODE_ENV !== "production") {
    Object.assign(response.details, {
      version: pkg.version,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage().rss,
    });
  }

  return res.status(healthy ? 200 : 503).json(response);
});

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
