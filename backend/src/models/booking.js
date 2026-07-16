import mongoose from "mongoose";

const { Schema } = mongoose;

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
];

// ── Pricing snapshot sub-schema ───────────────────────────────────────────────
// Frozen at booking time so later listing price changes never retroactively
// alter a guest's confirmed total.
const bookingPricingSchema = new Schema(
  {
    nightlyPrice: { type: Number, required: true, min: 0 },
    cleaningFee: { type: Number, default: 0, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    taxes: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

// ── Main Booking schema ───────────────────────────────────────────────────────
const bookingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    guestsCount: { type: Number, required: true, min: 1 },
    pricing: { type: bookingPricingSchema, required: true },
    status: {
      type: String,
      enum: {
        values: BOOKING_STATUSES,
        message: `Status must be one of: ${BOOKING_STATUSES.join(", ")}`,
      },
      default: "pending",
      index: true,
    },

    blockedDateId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
      default: null,
    },
    guestNote: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── Indexes ────────────────────────────────────────────────────────────────────
bookingSchema.index({ guest: 1, createdAt: -1 });
bookingSchema.index({ host: 1, createdAt: -1 });
bookingSchema.index({ host: 1, status: 1, checkOut: 1 });
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });

// ── Virtuals ────────────────────────────────────────────────────────────────────
bookingSchema.virtual("isPast").get(function () {
  return this.checkOut < new Date();
});

bookingSchema.virtual("isUpcoming").get(function () {
  return (
    this.checkIn >= new Date() &&
    (this.status === "confirmed" || this.status === "pending")
  );
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
