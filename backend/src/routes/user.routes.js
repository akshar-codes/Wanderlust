import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import * as userCtrl from "../controllers/user.controller.js";
import validate from "../middlewares/validate.js";
import upload from "../middlewares/upload.js";
import {
  updateProfileBodySchema,
  updateSettingsBodySchema,
  notificationPreferencesBodySchema,
  changeRoleBodySchema,
} from "../validators/index.js";
import {
  requireAuth,
  requirePermission,
  requireSelfOrAdmin,
} from "../middlewares/rbac.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────────────────

router.get("/:username", asyncHandler(userCtrl.profile));
router.get("/:username/listings", asyncHandler(userCtrl.listings));
router.get(
  "/:username/reviews-received",
  asyncHandler(userCtrl.reviewsReceived),
);

// ── Self-only mutations ───────────────────────────────────────────────────────

router.patch(
  "/:username/profile",
  requireAuth(),
  requireSelfOrAdmin(),
  validate(updateProfileBodySchema),
  asyncHandler(userCtrl.updateProfile),
);

router.put(
  "/:username/avatar",
  requireAuth(),
  requireSelfOrAdmin(),
  upload.single("avatar"),
  asyncHandler(userCtrl.updateAvatar),
);

router.delete(
  "/:username/avatar",
  requireAuth(),
  requireSelfOrAdmin(),
  asyncHandler(userCtrl.removeAvatar),
);

router.patch(
  "/:username/settings",
  requireAuth(),
  requireSelfOrAdmin(),
  validate(updateSettingsBodySchema),
  asyncHandler(userCtrl.updateSettings),
);

router.patch(
  "/:username/notifications",
  requireAuth(),
  requireSelfOrAdmin(),
  validate(notificationPreferencesBodySchema),
  asyncHandler(userCtrl.updateNotificationPreferences),
);

// ── Admin-only ────────────────────────────────────────────────────────────────

router.patch(
  "/:username/role",
  requireAuth(),
  requirePermission("user", "changeRole"),
  validate(changeRoleBodySchema),
  asyncHandler(userCtrl.changeRole),
);

// ── Account deletion ──────────────────────────────────────────────────────────

router.delete(
  "/:username",
  requireAuth(),
  requireSelfOrAdmin(),
  asyncHandler(userCtrl.destroy),
);

export default router;
