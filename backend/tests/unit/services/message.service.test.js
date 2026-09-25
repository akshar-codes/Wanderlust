import { beforeEach, describe, expect, it, vi } from "vitest";
import Booking from "../../../src/models/booking.js";
import Message from "../../../src/models/message.js";
import * as messageService from "../../../src/services/message.service.js";
import { publishMessageToUsers } from "../../../src/realtime/messageEventHub.js";

vi.mock("../../../src/models/booking.js", () => ({
  default: { findById: vi.fn(), find: vi.fn() },
}));
vi.mock("../../../src/models/message.js", () => ({
  default: { aggregate: vi.fn(), find: vi.fn(), create: vi.fn() },
}));
vi.mock("../../../src/realtime/messageEventHub.js", () => ({
  publishMessageToUsers: vi.fn(),
}));

const objectId = (value) => ({ _id: value, toString: () => value });
const query = (value, methods = ["populate"]) => {
  const result = {
    then: (resolve, reject) => Promise.resolve(value).then(resolve, reject),
  };
  for (const method of methods)
    result[method] = vi.fn().mockReturnValue(result);
  return result;
};

describe("message service", () => {
  const guestId = "guest-1";
  const hostId = "host-1";
  const bookingId = "booking-1";
  const booking = {
    _id: objectId(bookingId),
    guest: objectId(guestId),
    host: objectId(hostId),
    listing: { title: "Lake cabin" },
    status: "confirmed",
  };

  beforeEach(() => vi.clearAllMocks());

  it("returns the conversation in chronological order for a participant", async () => {
    const first = { _id: "m1", body: "Hi", createdAt: new Date("2026-01-01") };
    const second = {
      _id: "m2",
      body: "Hello",
      createdAt: new Date("2026-01-02"),
    };
    Booking.findById.mockReturnValue(query(booking));
    Message.find.mockReturnValue(
      query([second, first], ["sort", "limit", "populate"]),
    );

    const result = await messageService.listMessages(bookingId, guestId);

    expect(result.messages.map((message) => message._id)).toEqual(["m1", "m2"]);
    expect(result.booking).toBe(booking);
  });

  it("denies users who are neither the booking guest nor host", async () => {
    Booking.findById.mockReturnValue(query(booking));

    await expect(
      messageService.listMessages(bookingId, "stranger"),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(Message.find).not.toHaveBeenCalled();
  });

  it("returns not found for an unknown booking", async () => {
    Booking.findById.mockReturnValue(query(null));
    await expect(
      messageService.listMessages(bookingId, guestId),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  it("stores a message and pushes it to both conversation participants", async () => {
    const saved = {
      _id: "m3",
      body: "See you soon",
      booking: booking._id,
      sender: guestId,
      populate: vi.fn(),
    };
    saved.populate.mockResolvedValue(saved);
    Booking.findById.mockReturnValue(query(booking));
    Message.create.mockResolvedValue(saved);

    await expect(
      messageService.sendMessage(bookingId, guestId, "See you soon"),
    ).resolves.toBe(saved);

    expect(Message.create).toHaveBeenCalledWith({
      booking: booking._id,
      sender: guestId,
      body: "See you soon",
    });
    expect(publishMessageToUsers).toHaveBeenCalledWith(
      [guestId, hostId],
      saved,
    );
  });
});
