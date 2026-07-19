import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as analyticsCtrl from "../controllers/analytics.controller.js";
import validateQuery from "../middlewares/validateQuery.js";
import { analyticsQuerySchema } from "../validators/index.js";
import { requireAuth, requirePermission } from "../middlewares/rbac.js";

const router = express.Router();

// Every handler below filters strictly by req.user._id (as host/owner), so
// "readOwn" here means "read your own hosting analytics" — never another
// host's data, regardless of role.
router.use(requireAuth(), requirePermission("analytics", "readOwn"));

router.get(
  "/host/summary",
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsCtrl.summary),
);

router.get(
  "/host/revenue",
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsCtrl.revenue),
);

router.get(
  "/host/occupancy",
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsCtrl.occupancy),
);

router.get(
  "/host/booking-trends",
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsCtrl.bookingTrends),
);

router.get(
  "/host/listing-performance",
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsCtrl.listingPerformance),
);

router.get(
  "/host/reviews",
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsCtrl.reviewsAnalytics),
);

export default router;
