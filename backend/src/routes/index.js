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
import userRoutes from "./user.routes.js";
import wishlistRoutes from "./wishlist.routes.js";
import wishlistCollectionRoutes from "./wishlistCollection.routes.js";

const router = express.Router();

router.get("/health", (_req, res) =>
  res.json({
    success: true,
    data: { status: "ok", ts: new Date().toISOString() },
  }),
);

router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/listings", listingRoutes);
router.use("/listings/:listingId/reviews", reviewRoutes);
router.use("/reviews", myReviewsRoutes);
router.use("/reports", reportRoutes);
router.use("/search", searchRoutes);
router.use("/users", userRoutes);
router.use("/wishlist", wishlistRoutes);
router.use("/wishlists", wishlistCollectionRoutes);

router.use((_req, res) =>
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    code: "NOT_FOUND",
  }),
);

export default router;
