import crypto from "crypto";
import User from "../models/user.js";
import * as resetTokenRepo from "../repositories/passwordResetToken.repository.js";
import * as emailService from "./email.service.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const TOKEN_BYTES = 32;
export const TOKEN_EXPIRY_MS = 60 * 60 * 1000;
export const TOKEN_EXPIRY_MINUTES = TOKEN_EXPIRY_MS / 1000 / 60;

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken() {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

export function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// ── Public API ────────────────────────────────────────────────────────────────

export const initiateForgotPassword = async ({ email, requestIp }) => {
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || !user.isActive) {
    logger.auth.warn("Forgot-password: email not found or account inactive", {
      email,
      ip: requestIp,
    });
    return { sent: false };
  }

  if (!user.hash && user.provider !== "local") {
    logger.auth.warn("Forgot-password: OAuth-only account", {
      userId: user._id,
      provider: user.provider,
      ip: requestIp,
    });
    return { sent: false };
  }

  await resetTokenRepo.deleteAllForUser(user._id);

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

  try {
    await emailService.sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      resetToken: rawToken,
      expiresInMinutes: TOKEN_EXPIRY_MINUTES,
    });
  } catch (emailErr) {
    logger.error("[PasswordReset] Email delivery failed", {
      userId: user._id,
      error: emailErr.message,
    });
    return { sent: false };
  }

  const result = { sent: true };
  if (process.env.NODE_ENV !== "production") {
    result._devToken = rawToken;
  }
  return result;
};

export const consumeResetToken = async ({ token, newPassword, consumedByIp }) => {
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw AppError.badRequest("Reset token is required");
  }

  if (!newPassword || newPassword.length < 6) {
    throw AppError.badRequest("Password must be at least 6 characters");
  }

  const tokenHash = hashToken(token.trim());
  const record = await resetTokenRepo.findValidByHash(tokenHash);

  if (!record) {
    logger.auth.warn("Password reset: invalid or expired token", {
      ip: consumedByIp,
    });
    throw AppError.badRequest("Reset token is invalid or has expired");
  }

  const user = await User.findById(record.userId);
  if (!user || !user.isActive) {
    await resetTokenRepo.markUsed(tokenHash, consumedByIp);
    throw AppError.badRequest("Reset token is invalid or has expired");
  }

  await resetTokenRepo.markUsed(tokenHash, consumedByIp);

  await user.setPassword(newPassword);
  await user.save();

  await resetTokenRepo.deleteAllForUser(user._id);

  logger.auth.info("Password reset completed", {
    userId: user._id,
    username: user.username,
    ip: consumedByIp,
  });

  return user;
};
