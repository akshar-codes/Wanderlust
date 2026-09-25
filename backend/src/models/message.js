import mongoose from "mongoose";

const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

messageSchema.index({ booking: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
