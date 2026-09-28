import { test, expect } from '@playwright/test';

// Read-only: navigates only, and asserts on the logged-out shell. Never
// fills the login form or clicks its confirm button; see the "Smoke suite"
// note in README.md.
//
// `/admin` is not one of the client's own routes (client/src/App.jsx only
// defines '/', '/players' and '/adminPlayers'), so a 200 here can only come
// from Vercel's SPA fallback rewrite (the catch-all in client/vercel.json)
// serving the built app, which then renders its logged-out shell for any
// unmatched path. A broken/missing rewrite answers 404 instead, which is
// exactly what a misconfigured production deploy once did to this app.
test('/admin is served by the SPA fallback and shows the logged-out shell', async ({
  page,
}) => {
  const response = await page.goto('/admin');

  expect(response).toBeTruthy();
  expect(response.status()).toBe(200);

  // The login trigger (client/src/components/Logging) — reused from
  // e2e/tests/admin-login.spec.js. Asserted visible only, never clicked.
  await expect(page.getByText('Loguéate')).toBeVisible();
});
