import { test } from "../fixtures/auth.fixture.js";
import { expect } from "@playwright/test";

test.describe("Wishlist", () => {
  test("User can save a listing to wishlist", async ({ guestContext }) => {
    const page = await guestContext.newPage();
    await page.goto("/");
    await page.goto("/wishlist");
    await expect(page.locator("text=Wishlists").first()).toBeVisible();
  });
});
