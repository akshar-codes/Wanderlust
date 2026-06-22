import mongoose from "mongoose";

const { Schema } = mongoose;

const passwordResetTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
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
    timestamps: true,
    collection: "passwordresettokens",
  },
);

// ── TTL index ─────────────────────────────────────────────────────────────────
passwordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "ttl_expiresAt" },
);

passwordResetTokenSchema.index({ userId: 1, usedAt: 1, expiresAt: 1 });

const PasswordResetToken = mongoose.model(
  "PasswordResetToken",
  passwordResetTokenSchema,
);
export default PasswordResetToken;
