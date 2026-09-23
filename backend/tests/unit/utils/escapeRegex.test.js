import { describe, it, expect } from "vitest";
import {
  escapeRegex,
  makeRegexFilter,
} from "../../../src/utils/escapeRegex.js";

describe("escapeRegex (ReDoS tests)", () => {
  it("returns empty string for non-string input", () => {
    expect(escapeRegex(123)).toBe("");
    expect(escapeRegex(null)).toBe("");
    expect(escapeRegex(undefined)).toBe("");
  });

  it("escapes all metacharacters properly", () => {
    expect(escapeRegex(".*+?^${}()|[]\\")).toBe(
      "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\",
    );
  });

  it("safely escapes known ReDoS payloads", () => {
    expect(escapeRegex("(a+)+$")).toBe("\\(a\\+\\)\\+\\$");
    expect(escapeRegex("((a|aa)+)+")).toBe("\\(\\(a\\|aa\\)\\+\\)\\+");
  });

  it("handles catastrophic backtracking strings safely", () => {
    const payload = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!";
    const filter = makeRegexFilter(payload);
    const regexObj = new RegExp(filter.$regex, filter.$options);

    // Testing timing wouldn't be precise here, but we can verify it doesn't hang
    // and matches the escaped literal rather than evaluating regex
    expect(regexObj.test(payload)).toBe(true);
  });
});

describe("makeRegexFilter", () => {
  it("trims input and applies correct options", () => {
    const filter = makeRegexFilter(" hello ");
    expect(filter.$regex).toBe("hello");
    expect(filter.$options).toBe("i");
  });

  it("returns matchable literal string without executing regex operators", () => {
    const unsafeFilter = makeRegexFilter("(a+)+$");
    const regexObj = new RegExp(unsafeFilter.$regex, unsafeFilter.$options);

    expect(regexObj.test("(a+)+$")).toBe(true);
    expect(regexObj.test("aaaaa")).toBe(false); // If it evaluated the regex, this would be true
  });
});
