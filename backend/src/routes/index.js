import express from "express";
import authRoutes from "./auth.routes.js";
import listingRoutes from "./listing.routes.js";
import reviewRoutes from "./review.routes.js";
import userRoutes from "./user.routes.js";
import searchRoutes from "./search.routes.js";

const router = express.Router();

router.get("/health", (_req, res) =>
  res.json({
    success: true,
    data: { status: "ok", ts: new Date().toISOString() },
  }),
);

router.use("/search", searchRoutes);
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

export default router;
