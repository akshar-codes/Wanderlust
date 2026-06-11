"use strict";

const crypto = require("crypto");
const User = require("../models/user");
const resetTokenRepo = require("../repositories/passwordResetToken.repository");
const emailService = require("./email.service");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

// ── Constants ─────────────────────────────────────────────────────────────────

const TOKEN_BYTES = 32; // 256 bits
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const TOKEN_EXPIRY_MINUTES = TOKEN_EXPIRY_MS / 1000 / 60; // used in email copy

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken() {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// ── Public API ────────────────────────────────────────────────────────────────

const initiateForgotPassword = async ({ email, requestIp }) => {
  // ── Lookup — silent no-op if unknown email (anti-enumeration) ────────────
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || !user.isActive) {
    logger.auth.warn("Forgot-password: email not found or account inactive", {
      email,
      ip: requestIp,
    });
    return { sent: false };
  }

  // ── OAuth-only guard ──────────────────────────────────────────────────────

  if (!user.hash && user.provider !== "local") {
    logger.auth.warn("Forgot-password: OAuth-only account", {
      userId: user._id,
      provider: user.provider,
      ip: requestIp,
    });
    // Still return { sent: false } silently — don't leak provider info
    return { sent: false };
  }

  // ── Invalidate all existing tokens for this user ──────────────────────────
  await resetTokenRepo.deleteAllForUser(user._id);

  // ── Generate and persist new token ───────────────────────────────────────
  const { rawToken, tokenHash } = generateToken();

  await resetTokenRepo.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
    requestIp: requestIp ?? null,
  });

  logger.auth.info("Password reset token issued", {
    userId: user._id,
    username: user.username,
    ip: requestIp,
    expiresInMinutes: TOKEN_EXPIRY_MINUTES,
  });

  // ── Dispatch email ────────────────────────────────────────────────────────
  try {
    await emailService.sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      resetToken: rawToken,
      expiresInMinutes: TOKEN_EXPIRY_MINUTES,
    });
  } catch (emailErr) {
    // Don't fail the request if email delivery fails — log and alert ops.
    logger.error("[PasswordReset] Email delivery failed", {
      userId: user._id,
      error: emailErr.message,
    });
    return { sent: false };
  }

  const result = { sent: true };

  // Expose raw token in non-production for integration testing
  if (process.env.NODE_ENV !== "production") {
    result._devToken = rawToken;
  }

  return result;
};

const consumeResetToken = async ({ token, newPassword, consumedByIp }) => {
  // ── Basic validation ──────────────────────────────────────────────────────
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw AppError.badRequest("Reset token is required");
  }

  if (!newPassword || newPassword.length < 6) {
    throw AppError.badRequest("Password must be at least 6 characters");
  }

  // ── Hash and look up ──────────────────────────────────────────────────────
  const tokenHash = hashToken(token.trim());
  const record = await resetTokenRepo.findValidByHash(tokenHash);

  if (!record) {
    logger.auth.warn("Password reset: invalid or expired token", {
      ip: consumedByIp,
    });
    throw AppError.badRequest("Reset token is invalid or has expired");
  }

  // ── Verify user still exists and is active ────────────────────────────────
  const user = await User.findById(record.userId);
  if (!user || !user.isActive) {
    await resetTokenRepo.markUsed(tokenHash, consumedByIp);
    throw AppError.badRequest("Reset token is invalid or has expired");
  }

  // ── Mark token as used BEFORE setting password (prevents replay on error) ─
  await resetTokenRepo.markUsed(tokenHash, consumedByIp);

  // ── Set new password via passport-local-mongoose ──────────────────────────
  await user.setPassword(newPassword);
  await user.save();

  // ── Clean up remaining tokens for this user ───────────────────────────────
  await resetTokenRepo.deleteAllForUser(user._id);

  logger.auth.info("Password reset completed", {
    userId: user._id,
    username: user.username,
    ip: consumedByIp,
  });

  return user;
};

module.exports = {
  initiateForgotPassword,
  consumeResetToken,
  // Exported for testing
  hashToken,
  TOKEN_EXPIRY_MS,
  TOKEN_EXPIRY_MINUTES,
};
