"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passwordResetTokenSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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

    /** IP address of the reset request (for audit / abuse detection). */
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
    collection: "passwordresettokens",
  },
);

// ── TTL index ─────────────────────────────────────────────────────────────────
passwordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "ttl_expiresAt" },
);

// Additional compound index for fast per-user lookups (e.g. invalidation).
passwordResetTokenSchema.index({ userId: 1, usedAt: 1, expiresAt: 1 });

module.exports = mongoose.model("PasswordResetToken", passwordResetTokenSchema);
