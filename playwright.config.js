import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.js",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3100",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "npm run dev -- -p 3100",
    env: { SOS_DB_PATH: `data/e2e-${Date.now()}.db`, SOLAPI_API_KEY: "", SOLAPI_API_SECRET: "", SOLAPI_SENDER: "" },
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
});




