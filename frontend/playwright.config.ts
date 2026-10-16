import { defineConfig, devices } from "@playwright/test";

/**
 * Two stacks, one runner (docs/TESTING.md):
 *  - default           → mock API (`MOCK_API=1`), no backend needed; tests tagged `@backend` are excluded.
 *  - `E2E_BACKEND=1`   → real API on :4010 (`docker compose up -d db backend`); runs everything.
 * Ports differ from the Docker frontend (:3010) so a stale server is never reused by mistake.
 */
const backend = process.env.E2E_BACKEND === "1";
const port = Number(process.env.E2E_PORT ?? (backend ? 3012 : 3011));
const baseURL = `http://localhost:${port}`;
const skip = backend ? [] : ["@backend"];
const invert = (...tags: string[]) => {
  const all = [...skip, ...tags];
  return all.length ? new RegExp(all.join("|")) : undefined;
};

export default defineConfig({
  testDir: "e2e",
  retries: 0,
  repeatEach: Number(process.env.E2E_REPEAT ?? 3),
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL,
    locale: "ru-RU",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, grepInvert: invert("@mobile") },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/, grepInvert: invert() },
  ],
  webServer: {
    command: `${backend ? "" : "MOCK_API=1 "}npx next dev -p ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
    env: backend ? { API_INTERNAL_URL: process.env.API_INTERNAL_URL ?? "http://localhost:4010" } : {},
  },
});
