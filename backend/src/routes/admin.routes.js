import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as adminCtrl from "../controllers/admin.controller.js";
import validate from "../middlewares/validate.js";
import validateQuery from "../middlewares/validateQuery.js";
import {
  adminUsersQuerySchema,
  updateUserStatusBodySchema,
  adminListingsQuerySchema,
  updateListingStatusBodySchema,
  adminReviewsQuerySchema,
  adminAnalyticsQuerySchema,
} from "../validators/admin.schemas.js";
import { requireAuth, requirePermission } from "../middlewares/rbac.js";

const router = express.Router();

// Every route below is admin-only. This outer gate plus the finer-grained
// per-route permission checks mirrors the pattern used in analytics.routes.js.
router.use(requireAuth(), requirePermission("admin", "access"));

// ── Platform statistics ────────────────────────────────────────────────────────

router.get(
  "/stats",
  requirePermission("admin", "viewStats"),
  asyncHandler(adminCtrl.getStats),
);

// ── Analytics ──────────────────────────────────────────────────────────────────

router.get(
  "/analytics",
  requirePermission("admin", "viewStats"),
  validateQuery(adminAnalyticsQuerySchema),
  asyncHandler(adminCtrl.getAnalytics),
);

// ── User management ───────────────────────────────────────────────────────────

router.get(
  "/users",
  requirePermission("admin", "manageUsers"),
  validateQuery(adminUsersQuerySchema),
  asyncHandler(adminCtrl.listUsers),
);

router.patch(
  "/users/:username/status",
  requirePermission("admin", "manageUsers"),
  validate(updateUserStatusBodySchema),
  asyncHandler(adminCtrl.updateUserStatus),
);

// ── Listing moderation ─────────────────────────────────────────────────────────

router.get(
  "/listings",
  requirePermission("admin", "manageListings"),
  validateQuery(adminListingsQuerySchema),
  asyncHandler(adminCtrl.listListings),
);

router.patch(
  "/listings/:id/status",
  requirePermission("admin", "manageListings"),
  validate(updateListingStatusBodySchema),
  asyncHandler(adminCtrl.updateListingStatus),
);

// ── Review moderation ──────────────────────────────────────────────────────────

router.get(
  "/reviews",
  requirePermission("admin", "manageListings"),
  validateQuery(adminReviewsQuerySchema),
  asyncHandler(adminCtrl.listReviews),
);

export default router;
