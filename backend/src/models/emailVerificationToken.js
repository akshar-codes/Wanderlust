"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const emailVerificationTokenSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /** The email address this token is verifying (snapshot at issue time). */
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    /** SHA-256 hex digest of the raw token sent to the user's email. */
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    expiresAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },

    // ── Audit metadata ─────────────────────────────────────────────────────────

    /** IP address of the verification request (for audit / abuse detection). */
    requestIp: {
      type: String,
      default: null,
    },

    consumedByIp: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: "emailverificationtokens",
  },
);

// ── TTL index — MongoDB auto-deletes expired documents ───────────────────────
emailVerificationTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "ttl_expiresAt" },
);

// ── Compound index for fast per-user lookups (invalidation, resend checks) ───
emailVerificationTokenSchema.index({ userId: 1, usedAt: 1, expiresAt: 1 });

// ── IP abuse-detection index ──────────────────────────────────────────────────
emailVerificationTokenSchema.index(
  { requestIp: 1, createdAt: -1 },
  { name: "requestIp_createdAt", sparse: true },
);

module.exports = mongoose.model(
  "EmailVerificationToken",
  emailVerificationTokenSchema,
);
