import { test, expect } from '@playwright/test';

// Read-only: a single GET through Playwright's request context, no browser
// involved. See the "Smoke suite" note in README.md for what this suite
// checks and why it's safe to run against the live site.
//
// baseURL is SMOKE_BASE_URL (playwright.smoke.config.js), so this goes
// through the deployed proxy (client/vercel.json's `/api/:path*` rewrite) —
// the same relative path the client itself calls (client/src/config.js) —
// never Railway directly, which would prove the API is up without proving
// the proxy in front of it is wired correctly.
test('GET /api/players/getAllPlayers responds with the success envelope', async ({
  request,
}) => {
  const response = await request.get('/api/players/getAllPlayers');

  expect(response.status()).toBe(200);
  // APIResponse (unlike a browser-level Response) has no headerValue(); its
  // headers() keys are lower-cased (verified against the installed
  // playwright-core's RawHeaders implementation).
  const contentType = response.headers()['content-type'];
  expect(contentType).toContain('application/json');

  // { error: '', body: [...] } — see backend/response/index.js's success().
  const payload = await response.json();
  expect(payload.error).toBe('');
  expect(Array.isArray(payload.body)).toBe(true);
});
