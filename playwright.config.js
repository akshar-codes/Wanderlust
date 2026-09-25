import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

export default defineConfig({
  testDir: "./e2e/specs",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60000,
  reporter: "html",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
    video: "off",
  },
  projects: [
    {
      name: "Chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.env.E2E_USE_SYSTEM_CHROME === "1"
          ? { channel: "chrome" }
          : {}),
      },
    },
    {
      name: "Mobile Chromium",
      use: {
        ...devices["Pixel 5"],
        ...(process.env.E2E_USE_SYSTEM_CHROME === "1"
          ? { channel: "chrome" }
          : {}),
      },
    },
  ],
  webServer: [
    {
      command: "npm run start",
      cwd: path.resolve("backend"),
      url: "http://127.0.0.1:8080/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: "pipe",
    },
    {
      command: "npm run dev",
      cwd: path.resolve("frontend"),
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: "pipe",
    },
  ],
});
