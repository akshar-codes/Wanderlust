import PasswordResetToken from "../models/passwordResetToken.js";

// ── Write ─────────────────────────────────────────────────────────────────────

export const create = (data) => PasswordResetToken.create(data);

export const markUsed = (tokenHash, consumedByIp = null) =>
  PasswordResetToken.findOneAndUpdate(
    { tokenHash },
    { $set: { usedAt: new Date(), consumedByIp } },
    { new: true },
  );

export const deleteAllForUser = (userId) =>
  PasswordResetToken.deleteMany({ userId, usedAt: null });

// ── Read ──────────────────────────────────────────────────────────────────────

export const findValidByHash = (tokenHash) =>
  PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

export const countRecentByIp = (ip, windowMs) =>
  PasswordResetToken.countDocuments({
    requestIp: ip,
    createdAt: { $gt: new Date(Date.now() - windowMs) },
  });
