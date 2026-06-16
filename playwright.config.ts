import { defineConfig } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
  },
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      PLAYWRIGHT_TEST_BYPASS_AUTH: "1",
    },
  },
});
