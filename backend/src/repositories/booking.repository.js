import Booking from "../models/booking.js";

// ── Write ──────────────────────────────────────────────────────────────────────

export const create = (data) => Booking.create(data);

export const updateStatus = (id, status, extra = {}) =>
  Booking.findByIdAndUpdate(
    id,
    { $set: { status, ...extra } },
    { new: true, runValidators: true },
  );

// ── Read ───────────────────────────────────────────────────────────────────────

export const findById = (id) =>
  Booking.findById(id)
    .populate({
      path: "listing",
      select: "title location country image slug price",
    })
    .populate("guest", "username firstName lastName avatar email")
    .populate("host", "username firstName lastName avatar email");

/**
 * Any active (pending/confirmed) booking on the listing whose date range
 * overlaps [checkIn, checkOut). Used to prevent double-booking.
 */
export const findOverlapping = (listingId, checkIn, checkOut) =>
  Booking.find({
    listing: listingId,
    status: { $in: ["pending", "confirmed"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

export const findPaginatedForGuest = async (
  guestId,
  { page = 1, limit = 10, status } = {},
) => {
  const filter = { guest: guestId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Booking.find(filter)
      .sort({ checkIn: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "listing",
        select: "title location country image slug",
      })
      .populate({ path: "host", select: "username firstName lastName avatar" }),
    Booking.countDocuments(filter),
  ]);

  return {
    docs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const findPaginatedForHost = async (
  hostId,
  { page = 1, limit = 10, status } = {},
) => {
  const filter = { host: hostId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Booking.find(filter)
      .sort({ checkIn: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "listing",
        select: "title location country image slug",
      })
      .populate({
        path: "guest",
        select: "username firstName lastName avatar",
      }),
    Booking.countDocuments(filter),
  ]);

  return {
    docs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
