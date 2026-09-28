import { defineConfig, devices } from '@playwright/test';

// Base URL of the deployed site to check, e.g. https://pysa.vercel.app, or a
// deliberately broken target for a RED run. Required, not defaulted: a smoke
// run silently checking the wrong site is worse than one that refuses to
// start.
const SMOKE_BASE_URL = process.env.SMOKE_BASE_URL;

if (!SMOKE_BASE_URL) {
  throw new Error(
    'SMOKE_BASE_URL is required, e.g. ' +
      'SMOKE_BASE_URL=https://pysa.vercel.app npm --prefix e2e run test:smoke'
  );
}

// Deliberately not e2e/playwright.config.js: no webServer (the target is
// already deployed, nothing to start), no globalSetup or seeding (read-only,
// and the target's data isn't ours to reset), and no fixtures.js (its page
// fixture fails a test on any console.error, which is a good guard for the
// regular suite's own dev-server runs but not something this suite should
// assert about someone else's already-deployed bundle).
export default defineConfig({
  testDir: './smoke',
  workers: 1,
  // A couple of retries absorb a genuine network blip against a live site
  // (unlike the regular suite's own local servers). A pass that only
  // happens on retry is still worth knowing about, though — see
  // failOnFlakyTests below.
  retries: 2,
  // In CI, a test that fails once and only passes on retry ("flaky") still
  // fails the whole run instead of quietly going green, so an intermittent
  // production error surfaces instead of hiding behind a retry. Locally
  // (no CI env var), stay lenient. This is Playwright's own documented
  // pattern for the option (its own doc comment shows this exact line —
  // see e2e/node_modules/playwright/types/test.d.ts).
  failOnFlakyTests: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: SMOKE_BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
