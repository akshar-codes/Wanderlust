import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "forks",
    fileParallelism: false,
    testTimeout: 30000,
    env: {
      MAP_TOKEN: "pk.eyJ1IjoibW9jayJ9.mock",
    },
    include: ["tests/**/*.test.js"],
    exclude: ["tests/helpers/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**"],
    },
  },
});
