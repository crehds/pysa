import { test, expect } from '../fixtures.js';

// AdminListOfPlayers (client/src/components/AdminListOfPlayers) is the only
// page that renders a player search bar; /players (ListOfPlayers) has none,
// so #searchInput being visible proves this is really the admin view and
// not just any page that happened not to redirect. Read-only: shares the
// single global seed, no re-seed needed.
test('logging in renders the admin players page', async ({ page }) => {
  // The login modal itself is out of scope here (it checks credentials from
  // client/src/api/login.json); App reads isAuth straight from
  // sessionStorage on load (client/src/Context.jsx), so setting the flag
  // before any app script runs is equivalent to having logged in already.
  await page.addInitScript(() => window.sessionStorage.setItem('token', 'true'));
  await page.goto('/adminPlayers');

  await expect(page).toHaveURL('/adminPlayers');
  await expect(page.locator('#searchInput')).toBeVisible();
});
