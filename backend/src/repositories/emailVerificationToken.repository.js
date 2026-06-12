"use strict";

const EmailVerificationToken = require("../models/emailVerificationToken");

// ── Write ─────────────────────────────────────────────────────────────────────

const create = (data) => EmailVerificationToken.create(data);

const markUsed = (tokenHash, consumedByIp = null) =>
  EmailVerificationToken.findOneAndUpdate(
    { tokenHash },
    { $set: { usedAt: new Date(), consumedByIp } },
    { new: true },
  );

const deleteAllForUser = (userId) =>
  EmailVerificationToken.deleteMany({ userId, usedAt: null });

// ── Read ──────────────────────────────────────────────────────────────────────

const findValidByHash = (tokenHash) =>
  EmailVerificationToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

const countRecentByIp = (ip, windowMs) =>
  EmailVerificationToken.countDocuments({
    requestIp: ip,
    createdAt: { $gt: new Date(Date.now() - windowMs) },
  });

const findLatestActiveForUser = (userId) =>
  EmailVerificationToken.findOne(
    { userId, usedAt: null, expiresAt: { $gt: new Date() } },
    {},
    { sort: { createdAt: -1 } },
  );

module.exports = {
  create,
  markUsed,
  deleteAllForUser,
  findValidByHash,
  countRecentByIp,
  findLatestActiveForUser,
};
