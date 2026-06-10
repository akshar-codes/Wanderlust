"use strict";

const User = require("../models/user.js");

// ── Basic lookups ─────────────────────────────────────────────────────────────

const findById = (id) => User.findById(id);

const findByIdActive = (id) => User.findOne({ _id: id, isActive: true });

const findByUsername = (username) => User.findOne({ username });

const findByEmail = (email) =>
  User.findOne({ email: email.toLowerCase().trim() });

const findByGoogleId = (googleId) => User.findOne({ googleId });

const findByGithubId = (githubId) => User.findOne({ githubId });

// ── Registration ──────────────────────────────────────────────────────────────

/** passport-local-mongoose's register() handles password hashing */
const register = (userDoc, password) => User.register(userDoc, password);

// ── Profile updates ───────────────────────────────────────────────────────────

const updateById = (id, updates) =>
  User.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true },
  );

/** Atomically set the avatar sub-document */
const updateAvatar = (id, avatarData) =>
  User.findByIdAndUpdate(
    id,
    { $set: { avatar: avatarData } },
    { new: true, runValidators: true },
  );

/** Merge notification preferences (deep partial update) */
const updateNotificationPreferences = (id, prefs) => {
  const dotted = {};
  for (const [channel, events] of Object.entries(prefs)) {
    for (const [event, value] of Object.entries(events)) {
      dotted[`notificationPreferences.${channel}.${event}`] = value;
    }
  }
  return User.findByIdAndUpdate(
    id,
    { $set: dotted },
    { new: true, runValidators: true },
  );
};

/** Merge settings (partial update) */
const updateSettings = (id, settings) => {
  const dotted = {};
  for (const [key, value] of Object.entries(settings)) {
    dotted[`settings.${key}`] = value;
  }
  return User.findByIdAndUpdate(
    id,
    { $set: dotted },
    { new: true, runValidators: true },
  );
};

/** Update role (admin only) */
const updateRole = (id, role) =>
  User.findByIdAndUpdate(
    id,
    { $set: { role } },
    { new: true, runValidators: true },
  );

/** Mark email as verified */
const markEmailVerified = (id) =>
  User.findByIdAndUpdate(
    id,
    {
      $set: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    },
    { new: true },
  );

/** Touch lastLoginAt */
const touchLastLogin = (id) =>
  User.findByIdAndUpdate(id, { $set: { lastLoginAt: new Date() } });

/** Increment cached counter */
const incrementCounter = (id, field, amount = 1) =>
  User.findByIdAndUpdate(id, { $inc: { [field]: amount } }, { new: true });

// ── Soft-delete ───────────────────────────────────────────────────────────────

const softDelete = (id) =>
  User.findByIdAndUpdate(
    id,
    { $set: { isActive: false, deactivatedAt: new Date() } },
    { new: true },
  );

/** Hard delete — used by admin purge or account deletion tests */
const hardDelete = (id) => User.findByIdAndDelete(id);

// ── Listings owned by user ────────────────────────────────────────────────────

/** Used by user.controller → usersListings */
const findListingsByOwner = async (userId) => {
  const Listing = require("../models/listing.js");
  return Listing.find({ owner: userId });
};

module.exports = {
  findById,
  findByIdActive,
  findByUsername,
  findByEmail,
  findByGoogleId,
  findByGithubId,
  register,
  updateById,
  updateAvatar,
  updateNotificationPreferences,
  updateSettings,
  updateRole,
  markEmailVerified,
  touchLastLogin,
  incrementCounter,
  softDelete,
  hardDelete,
  findListingsByOwner,
};
