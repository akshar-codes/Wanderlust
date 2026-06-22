import mongoose from "mongoose";

const { Schema } = mongoose;

const emailVerificationTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
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
    collection: "emailverificationtokens",
  },
);

// ── TTL index ─────────────────────────────────────────────────────────────────
emailVerificationTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "ttl_expiresAt" },
);

emailVerificationTokenSchema.index({ userId: 1, usedAt: 1, expiresAt: 1 });

emailVerificationTokenSchema.index(
  { requestIp: 1, createdAt: -1 },
  { name: "requestIp_createdAt", sparse: true },
);

const EmailVerificationToken = mongoose.model(
  "EmailVerificationToken",
  emailVerificationTokenSchema,
);
export default EmailVerificationToken;
