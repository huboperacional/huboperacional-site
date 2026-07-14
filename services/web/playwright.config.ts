import { defineConfig, devices } from '@playwright/test';

// E2E runs against `next dev` by default (agnostic to route interception and
// sidesteps the NODE_ENV/standalone /404 prerender gotcha). Override the server
// command with PW_WEBSERVER_CMD to run against a production build when needed.
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Headroom for the first (cold) compile of a route under `next dev`, even after
  // the globalSetup warmup.
  timeout: 45_000,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  // Warm dev-server routes before the parallel tests run (see e2e/global-setup.ts).
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    navigationTimeout: 45_000,
    // Seed a "denied" cookie choice by default so the fixed-bottom consent banner
    // never overlays the UI in the form/wizard specs. consent.spec.ts overrides this
    // with an empty storageState to exercise the banner itself.
    storageState: {
      cookies: [],
      origins: [{ origin: BASE_URL, localStorage: [{ name: 'hub_consent', value: 'denied' }] }],
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: process.env.PW_WEBSERVER_CMD || 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // A test GA id so the consent banner renders under `next dev` (real value only
    // ships via the compose env). Requests to googletagmanager are intercepted in
    // consent.spec.ts, so no real GA call is ever made.
    env: { ...process.env, NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || 'G-TEST0000000' } as Record<string, string>,
  },
});
