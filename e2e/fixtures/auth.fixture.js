import { test as base } from "@playwright/test";
import { seedUser } from "../helpers/api.js";

export const test = base.extend({
  guestContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const user = await seedUser("guest");
    await page.goto("http://127.0.0.1:5173/login", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('input[name="username"]');
    await page.waitForTimeout(500);
    await page.fill('input[name="username"]', user.username);
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://127.0.0.1:5173/listings");
    await context.storageState({ path: "guestStorageState.json" });
    await use(context);
    await context.close();
  },
  hostContext: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const user = await seedUser("host");
    await page.goto("http://127.0.0.1:5173/login", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector('input[name="username"]');
    await page.waitForTimeout(500);
    await page.fill('input[name="username"]', user.username);
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');
    await page.waitForURL("http://127.0.0.1:5173/listings");
    await context.storageState({ path: "hostStorageState.json" });
    await use(context);
    await context.close();
  },
});
