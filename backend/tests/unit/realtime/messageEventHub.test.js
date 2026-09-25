import { afterEach, describe, expect, it, vi } from "vitest";
import {
  activeMessageStreams,
  publishMessageToUsers,
  subscribeToUserMessages,
} from "../../../src/realtime/messageEventHub.js";

describe("message event hub", () => {
  afterEach(() => vi.restoreAllMocks());

  it("pushes a new message only to subscribed participants", () => {
    const guestResponse = {
      write: vi.fn(),
      writableEnded: false,
      destroyed: false,
    };
    const hostResponse = {
      write: vi.fn(),
      writableEnded: false,
      destroyed: false,
    };
    const otherResponse = {
      write: vi.fn(),
      writableEnded: false,
      destroyed: false,
    };
    const unsubscribeGuest = subscribeToUserMessages("guest-2", guestResponse);
    const unsubscribeHost = subscribeToUserMessages("host-2", hostResponse);
    const unsubscribeOther = subscribeToUserMessages("other-2", otherResponse);

    publishMessageToUsers(["guest-2", "host-2"], {
      booking: "booking-2",
      body: "Hello",
    });

    expect(guestResponse.write).toHaveBeenCalledOnce();
    expect(hostResponse.write).toHaveBeenCalledOnce();
    expect(otherResponse.write).not.toHaveBeenCalled();
    expect(guestResponse.write.mock.calls[0][0]).toContain(
      '"bookingId":"booking-2"',
    );
    unsubscribeGuest();
    unsubscribeHost();
    unsubscribeOther();
    expect(activeMessageStreams()).toBe(0);
  });
});
