"use strict";

const crypto = require("crypto");
const User = require("../models/user");
const verificationRepo = require("../repositories/emailVerificationToken.repository");
const emailService = require("./email.service");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

// ── Constants ─────────────────────────────────────────────────────────────────

const TOKEN_BYTES = 32; // 256 bits of entropy
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const TOKEN_EXPIRY_HOURS = TOKEN_EXPIRY_MS / 1000 / 60 / 60;

/** Minimum gap between resend requests per user (5 minutes). */
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

/** Max resend requests per IP per hour (independent of express-rate-limit). */
const IP_RESEND_LIMIT = 5;
const IP_RESEND_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateToken() {
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

function hashToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

// ── Issue (internal helper shared by signup + resend) ─────────────────────────

async function issueVerificationToken(user, requestIp) {
  // Invalidate all existing unused tokens for this user
  await verificationRepo.deleteAllForUser(user._id);

  const { rawToken, tokenHash } = generateToken();

  await verificationRepo.create({
    userId: user._id,
    email: user.email,
    tokenHash,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
    requestIp: requestIp ?? null,
  });

  logger.auth.info("Email verification token issued", {
    userId: user._id,
    username: user.username,
    email: user.email,
    ip: requestIp,
    expiresInHours: TOKEN_EXPIRY_HOURS,
  });

  return rawToken;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Called immediately after signup to issue and send a verification email.
 * Silent on email-delivery failure — the user can resend later.
 *
 * @param {object} user   - Mongoose User document
 * @param {string} requestIp
 * @returns {{ sent: boolean, _devToken?: string }}
 */
const sendVerificationEmail = async (user, requestIp) => {
  if (user.emailVerified) {
    logger.auth.info("Email verification skipped — already verified", {
      userId: user._id,
    });
    return { sent: false };
  }

  const rawToken = await issueVerificationToken(user, requestIp);

  try {
    await emailService.sendEmailVerificationEmail({
      to: user.email,
      username: user.username,
      verificationToken: rawToken,
      expiresInHours: TOKEN_EXPIRY_HOURS,
    });
  } catch (emailErr) {
    logger.error("[EmailVerification] Email delivery failed", {
      userId: user._id,
      error: emailErr.message,
    });
    // Non-fatal: user can resend. Don't block signup.
  }

  const result = { sent: true };

  // Expose raw token in non-production for integration/e2e testing
  if (process.env.NODE_ENV !== "production") {
    result._devToken = rawToken;
  }

  return result;
};

/**
 * Verify an email address using the raw token from the email link.
 *
 * @param {{ token: string, consumedByIp?: string }}
 * @returns {User} The updated user document
 */
const verifyEmail = async ({ token, consumedByIp }) => {
  if (!token || typeof token !== "string" || token.trim() === "") {
    throw AppError.badRequest("Verification token is required");
  }

  const tokenHash = hashToken(token.trim());
  const record = await verificationRepo.findValidByHash(tokenHash);

  if (!record) {
    logger.auth.warn("Email verification: invalid or expired token", {
      ip: consumedByIp,
    });
    throw AppError.badRequest(
      "Verification link is invalid or has expired. Please request a new one.",
    );
  }

  // Verify user still exists and is active
  const user = await User.findById(record.userId);
  if (!user || !user.isActive) {
    await verificationRepo.markUsed(tokenHash, consumedByIp);
    throw AppError.badRequest(
      "Verification link is invalid or has expired. Please request a new one.",
    );
  }

  // Guard: already verified (e.g. double-click on link)
  if (user.emailVerified) {
    // Consume token silently — don't error, just confirm
    await verificationRepo.markUsed(tokenHash, consumedByIp);
    logger.auth.info("Email verification: already verified", {
      userId: user._id,
    });
    return user;
  }

  // Ensure the token's email matches the user's current email
  // (guards against a token issued before an email change)
  if (record.email !== user.email) {
    logger.auth.warn(
      "Email verification: token email mismatch (email changed since issue)",
      {
        userId: user._id,
        tokenEmail: record.email,
        currentEmail: user.email,
      },
    );
    throw AppError.badRequest(
      "Verification link is invalid or has expired. Please request a new one.",
    );
  }

  // Mark token used BEFORE updating user (prevents replay on write error)
  await verificationRepo.markUsed(tokenHash, consumedByIp);

  // Mark user as verified
  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  // Clean up remaining tokens for this user
  await verificationRepo.deleteAllForUser(user._id);

  logger.auth.info("Email verification completed", {
    userId: user._id,
    username: user.username,
    email: user.email,
    ip: consumedByIp,
  });

  return user;
};

/**
 * Resend a verification email for an authenticated (but unverified) user.
 * Enforces:
 *   - Already-verified guard
 *   - Per-user cooldown (RESEND_COOLDOWN_MS)
 *   - Per-IP rate limit (IP_RESEND_LIMIT per IP_RESEND_WINDOW_MS)
 *
 * @param {object} user      - Mongoose User document (req.user)
 * @param {string} requestIp
 * @returns {{ sent: boolean, cooldownMs?: number, _devToken?: string }}
 */
const resendVerificationEmail = async (user, requestIp) => {
  if (user.emailVerified) {
    throw AppError.badRequest("Your email address is already verified.");
  }

  // ── Per-IP abuse guard (DB-level) ─────────────────────────────────────────
  if (requestIp) {
    const recentCount = await verificationRepo.countRecentByIp(
      requestIp,
      IP_RESEND_WINDOW_MS,
    );
    if (recentCount >= IP_RESEND_LIMIT) {
      logger.auth.warn("Email verification resend: IP rate limit exceeded", {
        ip: requestIp,
        count: recentCount,
      });
      throw AppError.badRequest(
        "Too many verification emails sent from this IP. Please try again later.",
      );
    }
  }

  // ── Per-user cooldown ─────────────────────────────────────────────────────
  const existing = await verificationRepo.findLatestActiveForUser(user._id);
  if (existing) {
    const elapsed = Date.now() - existing.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const remainingMs = RESEND_COOLDOWN_MS - elapsed;
      const remainingSecs = Math.ceil(remainingMs / 1000);
      throw AppError.badRequest(
        `Please wait ${remainingSecs} seconds before requesting another verification email.`,
      );
    }
  }

  const rawToken = await issueVerificationToken(user, requestIp);

  try {
    await emailService.sendEmailVerificationEmail({
      to: user.email,
      username: user.username,
      verificationToken: rawToken,
      expiresInHours: TOKEN_EXPIRY_HOURS,
    });
  } catch (emailErr) {
    logger.error("[EmailVerification] Resend email delivery failed", {
      userId: user._id,
      error: emailErr.message,
    });
    throw AppError.badRequest(
      "Failed to send verification email. Please try again shortly.",
    );
  }

  logger.auth.info("Email verification resent", {
    userId: user._id,
    username: user.username,
    email: user.email,
    ip: requestIp,
  });

  const result = { sent: true };

  if (process.env.NODE_ENV !== "production") {
    result._devToken = rawToken;
  }

  return result;
};

module.exports = {
  sendVerificationEmail,
  verifyEmail,
  resendVerificationEmail,
  // Exported for testing
  hashToken,
  TOKEN_EXPIRY_MS,
  TOKEN_EXPIRY_HOURS,
  RESEND_COOLDOWN_MS,
};
