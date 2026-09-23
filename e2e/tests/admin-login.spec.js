import { test, expect } from '../fixtures.js';
import { E2E_ADMIN_USERNAME } from '../playwright.config.js';

// Abuse case: a wrong password must show the same generic error the
// original fake login used to show (client/src/components/Logging), and
// must never navigate to the admin page. Read-only: shares the single
// global seed, no re-seed needed.
test('a wrong password shows the error and does not reach the admin page', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByText('Loguéate').click();

  await page.locator('#user').fill(E2E_ADMIN_USERNAME);
  await page.locator('#password').fill('definitely-the-wrong-password');
  await page.locator('.swal2-confirm').click();

  await expect(page.getByText('Lo más probable es que aún no eres digno')).toBeVisible();
  await page.locator('.swal2-confirm').click();

  await expect(page).toHaveURL('/');
  await expect(page.locator('#searchInput')).toHaveCount(0);
});
