import { defineConfig } from "@playwright/test";

const PORT = process.env.PLAYWRIGHT_PORT ?? "3100";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Clerk's dev instance rate-limits its API ("too_many_requests") under enough
  // concurrent test traffic, which only shows up when running the full suite with
  // several parallel workers. Retry once to absorb that transient external limit
  // without masking real failures.
  retries: 1,
  workers: 2,
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
