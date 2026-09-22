import * as notificationRepo from "../repositories/notification.repository.js";
import logger from "../utils/logger.js";

// Fire-and-forget notification dispatcher
const dispatch = async (data) => {
  try {
    await notificationRepo.create(data);
  } catch (error) {
    logger.error("Failed to dispatch notification", { error: error.message, data });
  }
};

export const createBookingNotification = (type, booking, actor) => {
  const isHostActor = String(booking.host) === String(actor._id);
  const recipient = isHostActor ? booking.guest : booking.host;
  
  // Need to extract listing details carefully if populated or just ID
  const listingId = booking.listing?._id || booking.listing;
  const listingTitle = booking.listing?.title || "a listing";
  const actorName = actor.displayName || actor.username;

  let title = "";
  let body = "";
  let link = `/dashboard`;

  switch (type) {
    case "booking_created":
      title = "New booking request";
      body = `${actorName} requested to book ${listingTitle}.`;
      link = `/dashboard`;
      break;
    case "booking_confirmed":
      title = "Booking confirmed";
      body = `${actorName} confirmed your booking for ${listingTitle}.`;
      link = `/dashboard`;
      break;
    case "booking_declined":
      title = "Booking declined";
      body = `${actorName} declined your booking request for ${listingTitle}.`;
      link = `/dashboard`;
      break;
    case "booking_cancelled":
      title = "Booking cancelled";
      body = `${actorName} cancelled their booking for ${listingTitle}.`;
      link = `/dashboard`;
      break;
    case "booking_completed":
      title = "Booking completed";
      body = `Your booking for ${listingTitle} is now complete.`;
      link = `/dashboard`;
      break;
    default:
      return;
  }

  return dispatch({
    recipient,
    type,
    title,
    body,
    link,
    metadata: {
      bookingId: booking._id,
      listingId,
      listingTitle,
      actorName,
    }
  });
};

export const createReviewNotification = (type, review, listing, actor) => {
  let recipient;
  let title = "";
  let body = "";
  let link = `/listings/${listing._id}`;
  
  const actorName = actor.displayName || actor.username;

  switch (type) {
    case "review_received":
      recipient = listing.owner;
      title = "New review received";
      body = `${actorName} left a ${review.rating}-star review on ${listing.title}.`;
      break;
    case "review_reply":
      recipient = review.author;
      title = "Host replied to your review";
      body = `${actorName} replied to your review on ${listing.title}.`;
      break;
    default:
      return;
  }

  return dispatch({
    recipient,
    type,
    title,
    body,
    link,
    metadata: {
      listingId: listing._id,
      listingTitle: listing.title,
      actorName,
    }
  });
};

export const getNotifications = (userId, opts) => {
  return notificationRepo.findPaginated(userId, opts);
};

export const getUnreadCount = (userId) => {
  return notificationRepo.countUnread(userId);
};

export const markRead = (notificationId, userId) => {
  return notificationRepo.markRead(notificationId, userId);
};

export const markAllRead = (userId) => {
  return notificationRepo.markAllRead(userId);
};
