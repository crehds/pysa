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

test.describe('hiding the menu on a desktop (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('hide removes the rail and the content takes the full width, the choice survives a reload, show brings it back', async ({
    page,
  }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();

    // The old ranking table sizes itself as <main>'s measured width minus
    // 100px, so it must follow the freed space even though the window did not
    // resize. True when an ancestor of the header has exactly that width.
    const rankingFillsMain = () =>
      page.getByText('Nº Partidas').evaluate((header) => {
        const main = header.closest('main');
        for (let el = header; el && el !== main; el = el.parentElement) {
          if (Math.abs(el.getBoundingClientRect().width - (main.clientWidth - 100)) <= 1) {
            return true;
          }
        }
        return false;
      });
    await expect(page.getByText('Nº Partidas')).toBeVisible();
    expect(await rankingFillsMain()).toBe(true);

    await page.getByRole('button', { name: 'Ocultar menú' }).click();
    await expect(nav).toBeHidden();
    await expect.poll(rankingFillsMain).toBe(true);
    const show = page.getByRole('button', { name: 'Mostrar menú' });
    await expect(show).toBeVisible();
    await expect(show).toBeFocused();
    expect((await page.getByRole('main').boundingBox()).x).toBe(0);

    // "Actualizar" (top right) and "Mostrar menú" (top left) must not overlap.
    const refresh = await page.getByRole('button', { name: 'Actualizar' }).boundingBox();
    const showBox = await show.boundingBox();
    expect(showBox.x + showBox.width).toBeLessThan(refresh.x);

    await page.reload();
    await expect(page.getByRole('button', { name: 'Mostrar menú' })).toBeVisible();
    await expect(page.getByRole('navigation')).toBeHidden();

    await page.getByRole('button', { name: 'Mostrar menú' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ocultar menú' })).toBeFocused();
    expect((await page.getByRole('navigation').boundingBox()).x).toBe(0);
  });
});

test.describe('hiding the menu on a phone (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the bottom bar always shows and neither toggle appears, whatever was stored', async ({
    page,
  }) => {
    await page.addInitScript(() => window.localStorage.setItem('pysa:menu', 'hidden'));
    await page.goto('/');

    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ranking' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ocultar menú' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Mostrar menú' })).toBeHidden();
  });
});
