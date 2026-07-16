import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as bookingCtrl from "../controllers/booking.controller.js";
import validate from "../middlewares/validate.js";
import {
  createBookingBodySchema,
  cancelBookingBodySchema,
  hostDeclineBodySchema,
  adminUpdateStatusBodySchema,
} from "../validators/index.js";
import { requireAuth, requirePermission } from "../middlewares/rbac.js";
import { createLimiter } from "../config/rateLimiter.config.js";

const router = express.Router();

// ── Guest ────────────────────────────────────────────────────────────────────

router.get(
  "/",
  requireAuth(),
  requirePermission("booking", "readOwn"),
  asyncHandler(bookingCtrl.index),
);

router.post(
  "/",
  requireAuth(),
  requirePermission("booking", "create"),
  createLimiter,
  validate(createBookingBodySchema),
  asyncHandler(bookingCtrl.create),
);

router.patch(
  "/:id/cancel",
  requireAuth(),
  requirePermission("booking", "cancelOwn"),
  validate(cancelBookingBodySchema),
  asyncHandler(bookingCtrl.cancel),
);

// ── Host ─────────────────────────────────────────────────────────────────────

router.get(
  "/host",
  requireAuth(),
  requirePermission("booking", "manageAsHost"),
  asyncHandler(bookingCtrl.hostIndex),
);

router.patch(
  "/:id/confirm",
  requireAuth(),
  requirePermission("booking", "manageAsHost"),
  asyncHandler(bookingCtrl.confirm),
);

router.patch(
  "/:id/decline",
  requireAuth(),
  requirePermission("booking", "manageAsHost"),
  validate(hostDeclineBodySchema),
  asyncHandler(bookingCtrl.decline),
);

router.patch(
  "/:id/complete",
  requireAuth(),
  requirePermission("booking", "manageAsHost"),
  asyncHandler(bookingCtrl.complete),
);

// ── Admin ────────────────────────────────────────────────────────────────────

router.get(
  "/admin",
  requireAuth(),
  requirePermission("booking", "manageAny"),
  asyncHandler(bookingCtrl.adminIndex),
);

router.patch(
  "/admin/:id/status",
  requireAuth(),
  requirePermission("booking", "manageAny"),
  validate(adminUpdateStatusBodySchema),
  asyncHandler(bookingCtrl.adminUpdateStatus),
);

export default router;
