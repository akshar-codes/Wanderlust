import { defineConfig, devices } from "@playwright/test";

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
      name: "Google Chrome",
      use: {
        ...devices["Desktop Chrome"],
        channel: "chrome", // Uses the Chrome browser already installed on your PC
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        channel: "chrome",
      },
    },
  ],
  webServer: [
    {
      command: "cd backend && npm run start",
      url: "http://127.0.0.1:8080/api/health",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: "cd frontend && npm run dev",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
