import { randomInt, pick, addDays } from "../utils/random.js";

/**
 * Builds a realistic availability calendar: a handful of upcoming "booked"
 * windows (simulating real reservations) plus occasional host-managed
 * "blocked"/"maintenance" windows, spread across the next 12 months.
 *
 * Returns an array compatible with the Listing.availabilityCalendar
 * sub-schema: [{ startDate, endDate, reason }]
 */
export function buildAvailabilityCalendar({
  minBlocks = 0,
  maxBlocks = 4,
} = {}) {
  const blockCount = randomInt(minBlocks, maxBlocks);
  const calendar = [];
  const today = new Date();

  // Track used day-offsets loosely to avoid heavily overlapping blocks
  let cursorOffset = randomInt(1, 20);

  for (let i = 0; i < blockCount; i++) {
    const length = randomInt(2, 12);
    const start = addDays(today, cursorOffset);
    const end = addDays(start, length);

    calendar.push({
      startDate: start,
      endDate: end,
      reason: pick(["booked", "booked", "booked", "blocked", "maintenance"]),
    });

    // Move cursor past this block plus a gap, so future bookings remain
    // possible and the calendar doesn't degenerate into one giant block.
    cursorOffset += length + randomInt(5, 40);
    if (cursorOffset > 360) break;
  }

  return calendar;
}

/**
 * Builds availability calendars for a batch of listing _ids, returned as
 * a Map<listingId, calendar[]> ready for bulkWrite.
 */
export function buildAvailabilityForListings(listingIds) {
  const map = new Map();
  for (const id of listingIds) {
    map.set(id, buildAvailabilityCalendar());
  }
  return map;
}
