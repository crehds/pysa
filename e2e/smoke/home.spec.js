import { test, expect } from '@playwright/test';

// Read-only: a GET navigation plus the GET request the page fires on its
// own; see the "Smoke suite" note in README.md.
//
// Matched by path only (not the full URL), so this also catches a bundle
// that bypasses the proxy entirely — e.g. an absolute VITE_API_URL pointing
// at another deployment or at the backend host directly — since both still
// end in /players/getAllPlayers, with or without an /api prefix.
function isPlayersRequestUrl(url) {
  try {
    return new URL(url).pathname.endsWith('/players/getAllPlayers');
  } catch {
    return false;
  }
}

test('home page loads and its own players request succeeds through the proxy', async ({
  page,
  baseURL,
}) => {
  // Start waiting before navigating: the request fires as soon as the
  // page's own script runs (client/src/hooks/useGetData.js), which can
  // happen before page.goto() resolves.
  //
  // A cross-origin bypass (an absolute VITE_API_URL pointing elsewhere)
  // never produces a 'response' event at all: the browser blocks it as a
  // CORS failure before exposing it to the page, and Playwright only
  // surfaces that as 'requestfailed' (net::ERR_FAILED) — confirmed empirically
  // against this app (a same-origin ALLOWED_ORIGINS means any other origin
  // is CORS-blocked). Racing both events, instead of waiting on 'response'
  // alone, turns that case into a fast, clear failure instead of a
  // 30-second timeout with no useful message.
  const responseOutcome = page
    .waitForResponse((response) => isPlayersRequestUrl(response.url()), {
      timeout: 15000,
    })
    .then((response) => ({ response }))
    .catch(() => ({ timedOut: true }));
  const failureOutcome = page
    .waitForEvent('requestfailed', {
      predicate: (request) => isPlayersRequestUrl(request.url()),
      timeout: 15000,
    })
    .then((request) => ({ failed: request }))
    .catch(() => ({ timedOut: true }));

  await page.goto('/');

  const outcome = await Promise.race([responseOutcome, failureOutcome]);
  const expectedOrigin = new URL(baseURL).origin;

  if (outcome.failed) {
    const request = outcome.failed;
    throw new Error(
      `the players request to "${request.url()}" failed before completing ` +
        `(${request.failure()?.errorText ?? 'unknown network error'}) instead of ` +
        'succeeding — most likely blocked by CORS because it called a ' +
        `different origin than this page ("${expectedOrigin}"), which means ` +
        'the client is bypassing the proxy'
    );
  }
  if (outcome.timedOut) {
    throw new Error(
      'no players request (a path ending in /players/getAllPlayers) was ' +
        'observed within 15s — the page may never have called the API at all'
    );
  }

  const response = outcome.response;
  const responseUrl = new URL(response.url());

  // Same origin, not just the same path: a bundle whose VITE_API_URL is an
  // absolute URL to another deployment (or to the backend host directly)
  // can still answer 200 with the right JSON shape, so status and content
  // type alone can't catch it — only the origin can. (This still catches a
  // wrong origin that *isn't* CORS-restricted, which would reach here
  // instead of the 'failed' branch above.)
  expect(
    responseUrl.origin,
    `the players request went to origin "${responseUrl.origin}", not this site's own origin "${expectedOrigin}" — the client is bypassing the proxy`
  ).toBe(expectedOrigin);
  // Exactly /api/players/getAllPlayers, not just ending in that path: a
  // same-origin request missing the /api prefix would skip
  // client/vercel.json's rewrite and hit a 404 on Vercel's static host
  // instead of the proxy.
  expect(
    responseUrl.pathname,
    `the players request path was "${responseUrl.pathname}", expected exactly "/api/players/getAllPlayers"`
  ).toBe('/api/players/getAllPlayers');

  // Status alone can't prove the proxy is wired either: a missing/
  // misconfigured `/api` rewrite can still answer 200, just with the SPA's
  // index.html (see client/vercel.json) instead of JSON.
  expect(response.status()).toBe(200);
  const contentType = await response.headerValue('content-type');
  expect(contentType).toContain('application/json');

  // The navbar landmark (client/src/components/NavBar renders a <nav>) —
  // reused from e2e/tests/players-navigation.spec.js. It renders once the
  // app's initial load settles, regardless of which players exist, so this
  // never depends on specific seed/player data.
  await expect(page.getByRole('navigation')).toBeVisible();
});
