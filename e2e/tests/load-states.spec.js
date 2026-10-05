import { test, expect } from '../fixtures.js';

// The splash and the error state are what a visitor sees before the data is
// there. Colors are checked with screenshots; "spans the page" and "nothing
// overflows" are geometry, so they are asserted here.
const PLAYERS_URL = '**/players/getAllPlayers';

// Holds the players request so the splash stays on screen; returns a release.
async function holdPlayersRequest(page) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(PLAYERS_URL, async (route) => {
    await gate;
    await route.continue();
  });
  return release;
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

test.describe('on a desktop (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the splash spans the whole page width', async ({ page }) => {
    const release = await holdPlayersRequest(page);
    await page.goto('/');

    const splash = page.getByRole('status', { name: 'Cargando' });
    await expect(splash).toBeVisible();
    const box = await splash.boundingBox();
    expect(box.x).toBe(0);
    expect(box.width).toBe(1440);
    expect(await noHorizontalOverflow(page)).toBe(true);
    release();
  });
});

test.describe('on a phone (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the splash fits the screen with no sideways overflow', async ({ page }) => {
    const release = await holdPlayersRequest(page);
    await page.goto('/');

    const logo = page.getByRole('img', { name: 'logo de pysa' });
    await expect(logo).toBeVisible();
    const box = await logo.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(await noHorizontalOverflow(page)).toBe(true);
    release();
  });

  test('a failed request shows the error with a retry that recovers, and never the empty state', async ({
    page,
    allowConsoleError,
  }) => {
    // The aborted request is logged by Chromium, and the app logs the failure.
    allowConsoleError('Failed to load resource');
    allowConsoleError('Failed to fetch');
    let failing = true;
    await page.route(PLAYERS_URL, (route) =>
      failing ? route.abort('failed') : route.continue()
    );
    await page.goto('/');

    await expect(page.getByText('No pudimos cargar el ranking.')).toBeVisible();
    await expect(page.getByText('Todavía no hay jugadores en el ranking.')).toHaveCount(0);
    const retry = page.getByRole('button', { name: 'Reintentar' });
    await expect(retry).toBeVisible();
    const box = await retry.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    expect(await noHorizontalOverflow(page)).toBe(true);

    failing = false;
    await retry.click();
    await expect(page.getByRole('heading', { level: 1, name: 'Ranking' })).toBeVisible();
    await expect(page.getByText('No pudimos cargar el ranking.')).toHaveCount(0);
  });
});
