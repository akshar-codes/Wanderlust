import mongoose from "mongoose";

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "booking_created",
        "booking_confirmed",
        "booking_declined",
        "booking_cancelled",
        "booking_completed",
        "review_received",
        "review_reply",
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 120 },
    body: { type: String, required: true, maxlength: 500 },
    link: { type: String, default: null },
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    metadata: {
      bookingId: { type: Schema.Types.ObjectId, default: null },
      listingId: { type: Schema.Types.ObjectId, default: null },
      listingTitle: { type: String, default: null },
      actorName: { type: String, default: null },
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
