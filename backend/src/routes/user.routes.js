"use strict";

const express = require("express");
const router = express.Router();

const asyncHandler = require("../utils/asyncHandler");
const userCtrl = require("../controllers/user.controller");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isSelf = require("../middlewares/isSelf");
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload");
const {
  updateProfileBodySchema,
  updateSettingsBodySchema,
  notificationPreferencesBodySchema,
  changeRoleBodySchema,
} = require("../validators/schemas");

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * GET  /api/users/:username          → public profile
 * GET  /api/users/:username/listings → listings owned by this user
 */
router.get("/:username", asyncHandler(userCtrl.profile));
router.get("/:username/listings", asyncHandler(userCtrl.listings));

// ── Authenticated — self-only operations ──────────────────────────────────────

/**
 * PATCH /api/users/:username/profile      → update bio, name, phone
 * PUT   /api/users/:username/avatar       → upload new avatar (multipart)
 * DELETE /api/users/:username/avatar      → remove avatar
 * PATCH /api/users/:username/settings     → update language, theme, etc.
 * PATCH /api/users/:username/notifications → update notification prefs
 */
router.patch(
  "/:username/profile",
  isLoggedIn,
  isSelf,
  validate(updateProfileBodySchema),
  asyncHandler(userCtrl.updateProfile),
);

router.put(
  "/:username/avatar",
  isLoggedIn,
  isSelf,
  upload.single("avatar"),
  asyncHandler(userCtrl.updateAvatar),
);

router.delete(
  "/:username/avatar",
  isLoggedIn,
  isSelf,
  asyncHandler(userCtrl.removeAvatar),
);

router.patch(
  "/:username/settings",
  isLoggedIn,
  isSelf,
  validate(updateSettingsBodySchema),
  asyncHandler(userCtrl.updateSettings),
);

router.patch(
  "/:username/notifications",
  isLoggedIn,
  isSelf,
  validate(notificationPreferencesBodySchema),
  asyncHandler(userCtrl.updateNotificationPreferences),
);

// ── Admin-only ────────────────────────────────────────────────────────────────

/**
 * PATCH /api/users/:username/role  → change role (admin only)
 */
router.patch(
  "/:username/role",
  isLoggedIn,
  validate(changeRoleBodySchema),
  asyncHandler(userCtrl.changeRole),
);

// ── Account deletion ──────────────────────────────────────────────────────────

/**
 * DELETE /api/users/:username  → delete account (self or admin)
 */
router.delete("/:username", isLoggedIn, asyncHandler(userCtrl.destroy));

module.exports = router;
