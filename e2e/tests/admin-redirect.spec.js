import { test, expect } from '../fixtures.js';

// App.jsx guards /adminPlayers with `isLogging ? <AdminPlayers /> :
// <Navigate to='/' replace />`; isLogging mirrors isAuth, which is
// null/true/false (client/src/Context.jsx): null until useCheckAuth's GET
// /auth/me resolves, then true or false. GET /auth/me always answers 200,
// even with no session cookie — "not logged in" is authenticated: false in
// the body, not an HTTP error (backend/auth/network.js) — so an
// unauthenticated visit must bounce back to Home once that check resolves.
test('visiting /adminPlayers while logged out redirects to home', async ({
  page,
}) => {
  await page.goto('/adminPlayers');

  await expect(page).toHaveURL('/');
});
