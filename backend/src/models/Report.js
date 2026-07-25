import mongoose from "mongoose";

const { Schema } = mongoose;

export const REPORT_TARGET_TYPES = ["listing", "review", "user"];

export const REPORT_REASONS = [
  "spam",
  "inappropriate",
  "fraud",
  "fake",
  "harassment",
  "other",
];

export const REPORT_STATUSES = ["pending", "resolved", "dismissed"];

export const REPORT_RESOLUTION_ACTIONS = [
  "none",
  "content_removed",
  "user_suspended",
  "warning_issued",
];

// ── Report schema ──────────────────────────────────────────────────────────────
// Generic, polymorphic report against a listing, review, or user. Powers the
// admin Moderation Queue / Reports feature. `targetId` intentionally does not
// use a Mongoose `refPath` (the three target collections have unrelated
// shapes/lifecycles) — target snapshots are resolved manually in
// report.service.js so deleted/suspended targets degrade gracefully instead
// of throwing a populate error.
const reportSchema = new Schema(
  {
    targetType: {
      type: String,
      enum: {
        values: REPORT_TARGET_TYPES,
        message: `targetType must be one of: ${REPORT_TARGET_TYPES.join(", ")}`,
      },
      required: [true, "targetType is required"],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: [true, "targetId is required"],
    },
    reason: {
      type: String,
      enum: {
        values: REPORT_REASONS,
        message: `reason must be one of: ${REPORT_REASONS.join(", ")}`,
      },
      required: [true, "reason is required"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: null,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: REPORT_STATUSES,
        message: `status must be one of: ${REPORT_STATUSES.join(", ")}`,
      },
      default: "pending",
      index: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolutionAction: {
      type: String,
      enum: REPORT_RESOLUTION_ACTIONS,
      default: "none",
    },
    resolutionNote: {
      type: String,
      trim: true,
      maxlength: [1000, "Resolution note cannot exceed 1000 characters"],
      default: null,
    },
  },
  { timestamps: true },
);

// ── Indexes ────────────────────────────────────────────────────────────────────
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });
// Prevents the same user from spamming duplicate reports against one target.
reportSchema.index(
  { targetType: 1, targetId: 1, reportedBy: 1 },
  { unique: true },
);

const Report = mongoose.model("Report", reportSchema);
export default Report;
