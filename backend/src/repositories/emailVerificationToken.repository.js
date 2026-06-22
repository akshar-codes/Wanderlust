import EmailVerificationToken from "../models/emailVerificationToken.js";

// ── Write ─────────────────────────────────────────────────────────────────────

export const create = (data) => EmailVerificationToken.create(data);

export const markUsed = (tokenHash, consumedByIp = null) =>
  EmailVerificationToken.findOneAndUpdate(
    { tokenHash },
    { $set: { usedAt: new Date(), consumedByIp } },
    { new: true },
  );

export const deleteAllForUser = (userId) =>
  EmailVerificationToken.deleteMany({ userId, usedAt: null });

// ── Read ──────────────────────────────────────────────────────────────────────

export const findValidByHash = (tokenHash) =>
  EmailVerificationToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

export const countRecentByIp = (ip, windowMs) =>
  EmailVerificationToken.countDocuments({
    requestIp: ip,
    createdAt: { $gt: new Date(Date.now() - windowMs) },
  });

export const findLatestActiveForUser = (userId) =>
  EmailVerificationToken.findOne(
    { userId, usedAt: null, expiresAt: { $gt: new Date() } },
    {},
    { sort: { createdAt: -1 } },
  );
