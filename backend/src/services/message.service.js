import Booking from "../models/booking.js";
import Message from "../models/message.js";
import AppError from "../utils/AppError.js";
import { publishMessageToUsers } from "../realtime/messageEventHub.js";

const sameId = (a, b) => String(a?._id ?? a) === String(b?._id ?? b);

async function getParticipantBooking(bookingId, userId) {
  const booking = await Booking.findById(bookingId)
    .populate({ path: "listing", select: "title image location country" })
    .populate({ path: "guest", select: "username firstName lastName avatar" })
    .populate({ path: "host", select: "username firstName lastName avatar" });
  if (!booking) throw AppError.notFound("Booking not found");
  if (!sameId(booking.guest, userId) && !sameId(booking.host, userId)) {
    throw AppError.forbidden(
      "Only the guest and host can access this conversation",
    );
  }
  return booking;
}

export async function listConversations(userId) {
  const bookings = await Booking.find({
    $or: [{ guest: userId }, { host: userId }],
  })
    .sort({ updatedAt: -1 })
    .populate({ path: "listing", select: "title image location country" })
    .populate({ path: "guest", select: "username firstName lastName avatar" })
    .populate({ path: "host", select: "username firstName lastName avatar" });
  if (!bookings.length) return [];
  const ids = bookings.map((booking) => booking._id);
  const recent = await Message.aggregate([
    { $match: { booking: { $in: ids } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$booking", message: { $first: "$$ROOT" } } },
  ]);
  const latestByBooking = new Map(
    recent.map(({ _id, message }) => [String(_id), message]),
  );
  return bookings
    .map((booking) => {
      const isGuest = sameId(booking.guest, userId);
      const latest = latestByBooking.get(String(booking._id));
      const other = isGuest ? booking.host : booking.guest;
      return {
        booking: {
          id: booking._id,
          status: booking.status,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          listing: booking.listing,
        },
        otherParticipant: other,
        latestMessage: latest
          ? {
              body: latest.body,
              createdAt: latest.createdAt,
              sender: latest.sender,
            }
          : null,
        updatedAt: latest?.createdAt ?? booking.createdAt,
      };
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function listMessages(bookingId, userId) {
  const booking = await getParticipantBooking(bookingId, userId);
  const messages = await Message.find({ booking: booking._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate({ path: "sender", select: "username firstName lastName avatar" });
  return { booking, messages: messages.reverse() };
}

export async function sendMessage(bookingId, userId, body) {
  const booking = await getParticipantBooking(bookingId, userId);
  const message = await Message.create({
    booking: booking._id,
    sender: userId,
    body,
  });
  await message.populate({
    path: "sender",
    select: "username firstName lastName avatar",
  });
  publishMessageToUsers([booking.guest._id, booking.host._id], message);
  return message;
}
