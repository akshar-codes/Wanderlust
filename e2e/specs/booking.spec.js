import { test } from "../fixtures/auth.fixture.js";
import { expect } from "@playwright/test";
test.describe("Booking", () => {
  test("book listing", async ({ guestContext }) => {
    const page = await guestContext.newPage();
    await page.goto("/");
  });
});
