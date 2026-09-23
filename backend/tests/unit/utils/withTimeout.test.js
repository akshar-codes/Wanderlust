import { describe, it, expect } from "vitest";
import withTimeout, {
  TimeoutError,
  isNetworkError,
} from "../../../src/utils/withTimeout.js";

describe("withTimeout", () => {
  it("resolves if promise completes before timeout", async () => {
    const fastPromise = new Promise((resolve) =>
      setTimeout(() => resolve("success"), 10),
    );
    const result = await withTimeout(fastPromise, 50);
    expect(result).toBe("success");
  });

  it("rejects with TimeoutError if promise takes too long", async () => {
    const slowPromise = new Promise((resolve) =>
      setTimeout(() => resolve("success"), 50),
    );
    await expect(
      withTimeout(slowPromise, 10, "Custom timeout message"),
    ).rejects.toThrowError(TimeoutError);

    await expect(
      withTimeout(slowPromise, 10, "Custom timeout message"),
    ).rejects.toThrow("Custom timeout message");
  });
});

describe("isNetworkError", () => {
  it("returns true for TimeoutError", () => {
    expect(isNetworkError(new TimeoutError())).toBe(true);
  });

  it("returns true for known network error codes", () => {
    const err = new Error("Connection Refused");
    err.code = "ECONNREFUSED";
    expect(isNetworkError(err)).toBe(true);
  });

  it("returns true for AggregateError containing network error", () => {
    const netErr = new Error();
    netErr.code = "ENOTFOUND";
    const appErr = new Error();
    const aggErr = new AggregateError([appErr, netErr]);
    expect(isNetworkError(aggErr)).toBe(true);
  });

  it("returns false for generic errors", () => {
    expect(isNetworkError(new Error("Normal app error"))).toBe(false);
    expect(isNetworkError(null)).toBe(false);
  });
});
