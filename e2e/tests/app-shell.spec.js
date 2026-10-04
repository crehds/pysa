import { test, expect } from '../fixtures.js';

// Layout checks for the app shell. Pure styling is verified with screenshots,
// but "everything fits and is reachable" is observable, so it is asserted here.
test.describe('on a phone (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('every nav link is inside the viewport and the page does not overflow sideways', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    const links = nav.getByRole('link');
    const buttons = nav.getByRole('button');
    const controls = [
      ...(await links.all()),
      ...(await buttons.all()),
    ];
    const viewport = page.viewportSize();

    for (const control of controls) {
      // The logo link is hidden on phones; every visible control must fit.
      if (!(await control.isVisible())) continue;
      const box = await control.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }

    await expect(nav.getByRole('link', { name: 'Ranking' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Jugadores' })).toBeVisible();
    await expect(nav.getByRole('button', { name: 'Loguéate' })).toBeVisible();

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(noHorizontalOverflow).toBe(true);
  });
});

test.describe('on a desktop (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the nav is a labeled rail at the left edge', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    const navBox = await nav.boundingBox();
    expect(navBox.x).toBe(0);
    expect(navBox.width).toBeLessThan(300);

    for (const name of ['Ranking', 'Jugadores']) {
      const link = nav.getByRole('link', { name });
      await expect(link).toBeVisible();
      // The label is visible text, not just an accessible name.
      await expect(link.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(nav.getByRole('button', { name: 'Loguéate' })).toBeVisible();
  });
});
