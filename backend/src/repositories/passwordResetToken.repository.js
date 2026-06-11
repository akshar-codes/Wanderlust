"use strict";

const PasswordResetToken = require("../models/passwordResetToken");

// ── Write ─────────────────────────────────────────────────────────────────────

const create = (data) => PasswordResetToken.create(data);

const markUsed = (tokenHash, consumedByIp = null) =>
  PasswordResetToken.findOneAndUpdate(
    { tokenHash },
    { $set: { usedAt: new Date(), consumedByIp } },
    { new: true },
  );

const deleteAllForUser = (userId) =>
  PasswordResetToken.deleteMany({ userId, usedAt: null });

// ── Read ──────────────────────────────────────────────────────────────────────

const findValidByHash = (tokenHash) =>
  PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

const countRecentByIp = (ip, windowMs) =>
  PasswordResetToken.countDocuments({
    requestIp: ip,
    createdAt: { $gt: new Date(Date.now() - windowMs) },
  });

module.exports = {
  create,
  markUsed,
  deleteAllForUser,
  findValidByHash,
  countRecentByIp,
};
