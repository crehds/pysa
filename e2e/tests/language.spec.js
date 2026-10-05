import { test, expect } from '../fixtures.js';
import {
  E2E_ADMIN_PASSWORD,
  E2E_ADMIN_USERNAME,
  E2E_BACKEND_URL,
} from '../playwright.config.js';

// The site speaks the browser's language (Spanish or English), and the ES | EN
// switch in the menu overrides it and is remembered. The config pins es-ES;
// these specs pick other locales explicitly.
test.describe('with a Spanish browser (the pinned locale)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('starts in Spanish and the switch changes it, and the choice survives a reload', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(nav.getByRole('button', { name: 'Español' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveTitle('Ranking · Pysa');

    await nav.getByRole('button', { name: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(nav.getByRole('button', { name: 'English' })).toHaveAttribute('aria-pressed', 'true');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('navigation').getByRole('button', { name: 'English' })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  test('has exactly one navigation landmark', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation')).toHaveCount(1);
  });
});

test.describe('with an English browser', () => {
  test.use({ locale: 'en-US', viewport: { width: 1440, height: 900 } });

  test('starts in English, and Spanish can be chosen', async ({ page }) => {
    await page.goto('/players');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Players · Pysa');

    await page.getByRole('navigation').getByRole('button', { name: 'Español' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page).toHaveTitle('Jugadores · Pysa');
  });
});

test.describe('on a phone (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the switch sits in the bottom bar, inside the screen', async ({ page }) => {
    await page.goto('/');
    const group = page.getByRole('navigation').getByRole('group', { name: 'Idioma' });
    await expect(group).toBeVisible();
    for (const name of ['Español', 'English']) {
      const box = await group.getByRole('button', { name }).boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
    }
  });

  test('logged in as admin, the switch and the five items share the bar without overlap', async ({
    page,
  }) => {
    const login = await page.request.post(`${E2E_BACKEND_URL}/auth/login`, {
      data: { username: E2E_ADMIN_USERNAME, password: E2E_ADMIN_PASSWORD },
    });
    expect(login.ok()).toBe(true);
    await page.goto('/');

    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('link', { name: 'Admin' })).toBeVisible();
    const boxes = await nav
      .locator('a:visible, button:visible')
      .evaluateAll((elements) =>
        elements.map((element) => {
          const { x, right, bottom } = element.getBoundingClientRect();
          const clipped = [element, ...element.querySelectorAll('*')].some(
            (node) => node.scrollWidth > node.clientWidth + 1
          );
          return { x, right, bottom, clipped };
        })
      );
    // Five items plus the two language buttons.
    expect(boxes).toHaveLength(7);
    for (const box of boxes) {
      expect(box.clipped).toBe(false);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.right).toBeLessThanOrEqual(390);
      expect(box.bottom).toBeLessThanOrEqual(844);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
    ).toBe(true);
  });
});
