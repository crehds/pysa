import { test, expect } from '../fixtures.js';
import { E2E_ADMIN_USERNAME, E2E_ADMIN_PASSWORD } from '../playwright.config.js';

// AdminListOfPlayers (client/src/components/AdminListOfPlayers) is the only
// page that renders a player search bar; /players (ListOfPlayers) has none,
// so #searchInput being visible proves this is really the admin view and
// not just any page that happened not to redirect. Read-only: shares the
// single global seed, no re-seed needed.
//
// This is the one spec in the suite that logs in through the real login
// modal (client/src/components/Logging), exercising the actual backend
// POST /auth/login round trip; every other admin spec logs in faster
// through page.request.post('/auth/login', ...) instead (see
// avatar-upload.spec.js), which shares the browser context's cookies.
test('logging in through the real login modal renders the admin players page', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByText('Loguéate').click();

  await page.locator('#user').fill(E2E_ADMIN_USERNAME);
  await page.locator('#password').fill(E2E_ADMIN_PASSWORD);
  await page.locator('.swal2-confirm').click();

  await expect(page.getByText('Bienvenido papu')).toBeVisible();
  // Dismisses the success alert; SweetAlert2 reuses one popup, so this is
  // the same confirm button, now showing the success dialog's OK action.
  await page.locator('.swal2-confirm').click();

  await expect(page).toHaveURL('/adminPlayers');
  await expect(page.locator('#searchInput')).toBeVisible();
});
