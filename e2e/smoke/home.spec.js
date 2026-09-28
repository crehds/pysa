import { test, expect } from '@playwright/test';

// Read-only: a GET navigation plus the GET request the page fires on its
// own; see the "Smoke suite" note in README.md.
//
// Status alone can't prove the proxy is wired: a missing/misconfigured
// `/api` rewrite can still answer 200, just with the SPA's index.html (see
// client/vercel.json) instead of JSON, so this also checks the response's
// content type.
test('home page loads and its own players request succeeds through the proxy', async ({
  page,
}) => {
  // Start waiting before navigating: the request fires as soon as the
  // page's own script runs (client/src/hooks/useGetData.js), which can
  // happen before page.goto() resolves.
  const playersResponse = page.waitForResponse((response) =>
    response.url().includes('/api/players/getAllPlayers')
  );

  await page.goto('/');

  const response = await playersResponse;
  expect(response.status()).toBe(200);
  const contentType = await response.headerValue('content-type');
  expect(contentType).toContain('application/json');

  // The navbar landmark (client/src/components/NavBar renders a <nav>) —
  // reused from e2e/tests/players-navigation.spec.js. It renders once the
  // app's initial load settles, regardless of which players exist, so this
  // never depends on specific seed/player data.
  await expect(page.getByRole('navigation')).toBeVisible();
});
