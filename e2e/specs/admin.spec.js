import { test } from "../fixtures/auth.fixture.js";
import { expect } from "@playwright/test";
test.describe("Admin", () => {
  test("admin dashboard", async ({ guestContext }) => {
    const page = await guestContext.newPage();
    await page.goto("/");
  });
});
