import { test, expect } from '../fixtures.js';

// App.jsx guards /adminPlayers with `isLogging ? <AdminPlayers /> :
// <Navigate to='/' replace />`; isLogging starts from
// sessionStorage.getItem('token'), which is empty in a fresh browser
// context, so an unauthenticated visit must bounce straight back to Home.
test('visiting /adminPlayers while logged out redirects to home', async ({
  page,
}) => {
  await page.goto('/adminPlayers');

  await expect(page).toHaveURL('/');
});
