import { test } from "../fixtures/auth.fixture.js";
import { expect } from "@playwright/test";
test.describe("Host", () => {
  test("create listing", async ({ hostContext }) => {
    const page = await hostContext.newPage();
    await page.goto("/");
  });
});
