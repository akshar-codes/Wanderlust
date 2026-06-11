"use strict";

const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const userCtrl = require("../controllers/user.controller");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const {
  updateProfileBodySchema,
  updateSettingsBodySchema,
  notificationPreferencesBodySchema,
  changeRoleBodySchema,
} = require("../validators/schemas");

const {
  requireAuth,
  requirePermission,
  requireSelfOrAdmin,
} = require("../middlewares/rbac");

// ── Public ────────────────────────────────────────────────────────────────────

router.get("/:username", asyncHandler(userCtrl.profile));
router.get("/:username/listings", asyncHandler(userCtrl.listings));

// ── Self-only profile mutations ───────────────────────────────────────────────

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

// ── Admin-only role management ────────────────────────────────────────────────

router.patch(
  "/:username/role",
  requireAuth(),
  requirePermission("user", "changeRole"),
  validate(changeRoleBodySchema),
  asyncHandler(userCtrl.changeRole),
);

// ── Account deletion (self or admin) ─────────────────────────────────────────

router.delete(
  "/:username",
  requireAuth(),
  requireSelfOrAdmin(),
  asyncHandler(userCtrl.destroy),
);

module.exports = router;
