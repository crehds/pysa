import { test, expect } from '../fixtures.js';
import {
  E2E_ADMIN_PASSWORD,
  E2E_ADMIN_USERNAME,
  E2E_BACKEND_URL,
} from '../playwright.config.js';

// The login dialog is SweetAlert2. Its colors are checked with screenshots;
// labeled fields, Escape and the logged-in phone bar are behavior and geometry.
test.describe('the login dialog on a desktop (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('has labeled fields on the dark surface', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    const popup = page.locator('.swal2-popup');
    await expect(popup).toBeVisible();
    await expect(page.getByLabel('Usuario')).toHaveAttribute('id', 'user');
    await expect(page.getByLabel('Contraseña')).toHaveAttribute('id', 'password');
    // --color-surface (#303841), not SweetAlert2's white.
    await expect(popup).toHaveCSS('background-color', 'rgb(48, 56, 65)');
  });

  test('Escape closes the dialog without touching the medal ranges', async ({ page }) => {
    await page.goto('/');
    const ranges = page.getByRole('button', { name: 'Rangos de medallas' });
    await ranges.click();
    await expect(ranges).toHaveAttribute('aria-expanded', 'true');

    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.locator('.swal2-popup')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.swal2-popup')).toBeHidden();

    await expect(ranges).toHaveAttribute('aria-expanded', 'true');
    await expect(ranges).not.toBeFocused();
  });
});

test.describe('the dialogs speak plainly (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the logout dialog asks "¿Cerrar sesión?" and then says the session is closed', async ({
    page,
  }) => {
    const login = await page.request.post(`${E2E_BACKEND_URL}/auth/login`, {
      data: { username: E2E_ADMIN_USERNAME, password: E2E_ADMIN_PASSWORD },
    });
    expect(login.ok()).toBe(true);
    await page.goto('/');
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    const popup = page.locator('.swal2-popup');
    await expect(popup).toContainText('¿Cerrar sesión?');
    await expect(popup.locator('.swal2-cancel')).toHaveText('Quedarme');
    await popup.locator('.swal2-confirm').click();

    await expect(popup).toContainText('Sesión cerrada.');
    await expect(popup).not.toContainText(/papu|ñafo/i);
    await popup.locator('.swal2-confirm').click();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });
});

test.describe('the login dialog on a phone (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('fits the screen', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    const box = await page.locator('.swal2-popup').boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });

  test('logged in as admin, all five bottom-bar items fit with no clipping', async ({ page }) => {
    // The session cookie is set on the backend and sent with the page's calls.
    const login = await page.request.post(`${E2E_BACKEND_URL}/auth/login`, {
      data: { username: E2E_ADMIN_USERNAME, password: E2E_ADMIN_PASSWORD },
    });
    expect(login.ok()).toBe(true);
    await page.goto('/');

    const nav = page.getByRole('navigation');
    const names = ['Ranking', 'Jugadores', 'Admin', 'Juego', 'Cerrar sesión'];
    await expect(nav.getByRole('link', { name: 'Admin' })).toBeVisible();

    const items = [];
    for (const name of names) {
      const item = nav.getByRole(name === 'Cerrar sesión' ? 'button' : 'link', { name });
      await expect(item).toBeVisible();
      const info = await item.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        // Text clipped by the item's own box shows as scrollWidth > clientWidth
        // on the item or on any child (the label).
        const clipped = [element, ...element.querySelectorAll('*')].some(
          (node) => node.scrollWidth > node.clientWidth + 1
        );
        return { x: rect.x, right: rect.right, y: rect.y, bottom: rect.bottom, clipped };
      });
      expect(info.clipped, `${name} is clipped`).toBe(false);
      expect(info.x).toBeGreaterThanOrEqual(0);
      expect(info.right).toBeLessThanOrEqual(390);
      expect(info.bottom).toBeLessThanOrEqual(844);
      items.push(info);
    }
    // In one row, in order, not overlapping.
    for (let i = 1; i < items.length; i += 1) {
      expect(items[i].x).toBeGreaterThanOrEqual(items[i - 1].right - 1);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
});
