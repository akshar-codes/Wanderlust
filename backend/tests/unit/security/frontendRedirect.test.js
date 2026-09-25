import { describe, expect, it } from "vitest";
import { getFrontendRedirectUrl } from "../../../src/utils/frontendRedirect.js";

const state = (redirectTo) =>
  Buffer.from(JSON.stringify({ redirectTo })).toString("base64");

describe("OAuth frontend redirect", () => {
  const baseUrl = "https://wanderlust.example";

  it("allows return paths on the configured frontend origin", () => {
    expect(
      getFrontendRedirectUrl({
        baseUrl,
        stateParam: state("/messages?source=oauth"),
      }),
    ).toBe("https://wanderlust.example/messages?source=oauth");
  });

  it.each([
    "https://attacker.example/phishing",
    "//attacker.example/phishing",
    "\\\\attacker.example\\phishing",
  ])("rejects an external OAuth return target: %s", (redirectTo) => {
    expect(
      getFrontendRedirectUrl({ baseUrl, stateParam: state(redirectTo) }),
    ).toBe(`${baseUrl}/`);
  });

  it("keeps auth errors on the trusted frontend origin", () => {
    const result = getFrontendRedirectUrl({
      baseUrl,
      stateParam: state("https://attacker.example/"),
      error: "oauth_error",
    });

    expect(new URL(result).origin).toBe(baseUrl);
    expect(new URL(result).searchParams.get("auth_error")).toBe("oauth_error");
  });
});
