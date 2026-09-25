import { test } from "../fixtures/auth.fixture.js";
import { expect } from "@playwright/test";
test.describe("Reviews", () => {
  test("leave review", async ({ guestContext }) => {
    const page = await guestContext.newPage();
    await page.goto("/");
  });
});
