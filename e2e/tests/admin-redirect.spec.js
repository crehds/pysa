import { test, expect } from '../fixtures.js';

// App.jsx guards /adminPlayers with `isLogging ? <AdminPlayers /> :
// <Navigate to='/' replace />`; isLogging is decided from GET /auth/me
// (useCheckAuth), which answers 401 in a fresh browser context with no
// session cookie, so an unauthenticated visit must bounce back to Home once
// that check resolves.
test('visiting /adminPlayers while logged out redirects to home', async ({
  page,
}) => {
  await page.goto('/adminPlayers');

  await expect(page).toHaveURL('/');
});
