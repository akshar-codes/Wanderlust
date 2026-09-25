import { describe, expect, it } from "vitest";
import { createMessageBodySchema } from "../../../src/validators/message.schemas.js";

describe("createMessageBodySchema", () => {
  it("trims a valid message body", () => {
    expect(createMessageBodySchema.parse({ body: "  Hello  " })).toEqual({
      body: "Hello",
    });
  });

  it("rejects an empty or whitespace-only message", () => {
    expect(createMessageBodySchema.safeParse({ body: "   " }).success).toBe(
      false,
    );
    expect(createMessageBodySchema.safeParse({ body: "" }).success).toBe(false);
  });

  it("rejects messages over 2000 characters", () => {
    expect(
      createMessageBodySchema.safeParse({ body: "x".repeat(2001) }).success,
    ).toBe(false);
  });
});
