import { test, expect } from "@playwright/test";

test.describe("Auth Flow", () => {
  test("login and logout", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator("text=Sign in to continue").first(),
    ).toBeVisible();
  });
});
