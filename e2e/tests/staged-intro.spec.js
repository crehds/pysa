import { test, expect } from '../fixtures.js';

// The first load in a tab plays the staged intro; a reload in the same tab (and
// every wait after the first load) shows the fast loader. The rest of the suite
// runs with reduced motion, which skips the intro (see playwright.config.js), so
// this file asks for full motion. Every test starts in a fresh context, so its
// first page.goto is a first load in a fresh tab.
test.use({ reducedMotion: 'no-preference' });

const PLAYERS_URL = '**/players/getAllPlayers';

// Holds the players request so a loading screen stays up; returns a release.
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

const loadingStatus = (page) => page.getByRole('status', { name: 'Cargando' });
const skipButton = (page) => page.getByRole('button', { name: 'Saltar intro' });
const rankingHeading = (page) => page.getByRole('heading', { level: 1, name: 'Ranking' });

test('the first load plays the intro, which ends by itself and reveals the page', async ({ page }) => {
  await page.goto('/');
  await expect(loadingStatus(page)).toBeVisible();
  await expect(skipButton(page)).toBeVisible();

  // About 2.5 s: the page shows once the curtain has opened and the intro is gone.
  await expect(rankingHeading(page)).toBeVisible({ timeout: 10_000 });
  await expect(loadingStatus(page)).toHaveCount(0);
});

test('the intro waits for slow data and the skip button falls back to the fast loader', async ({
  page,
}) => {
  const release = await holdPlayersRequest(page);
  await page.goto('/');
  await expect(skipButton(page)).toBeVisible();
  // Past the intro's minimum, it is still there: the data have not landed.
  await page.waitForTimeout(3000);
  await expect(skipButton(page)).toBeVisible();

  await skipButton(page).click();
  await expect(skipButton(page)).toHaveCount(0);
  await expect(loadingStatus(page)).toBeVisible();

  release();
  await expect(rankingHeading(page)).toBeVisible();
  await expect(loadingStatus(page)).toHaveCount(0);
});

test('Esc skips the intro', async ({ page }) => {
  await page.goto('/');
  await expect(skipButton(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(skipButton(page)).toHaveCount(0);
  await expect(rankingHeading(page)).toBeVisible();
});

test('a reload in the same tab shows the fast loader, not the intro', async ({ page }) => {
  await page.goto('/');
  await expect(rankingHeading(page)).toBeVisible({ timeout: 10_000 });

  const release = await holdPlayersRequest(page);
  await page.reload();
  await expect(loadingStatus(page)).toBeVisible();
  await expect(skipButton(page)).toHaveCount(0);
  release();
  await expect(rankingHeading(page)).toBeVisible();
});

for (const [name, viewport] of [
  ['a desktop (1440x900)', { width: 1440, height: 900 }],
  ['a phone (390x844)', { width: 390, height: 844 }],
]) {
  test.describe(`on ${name}`, () => {
    test.use({ viewport });

    test('the intro and the fast loader span the screen with no sideways overflow', async ({
      page,
    }) => {
      const release = await holdPlayersRequest(page);
      await page.goto('/');

      const clientWidth = () => page.evaluate(() => document.documentElement.clientWidth);
      for (const stage of ['intro', 'fast loader']) {
        const status = loadingStatus(page);
        await expect(status, stage).toBeVisible();
        const box = await status.boundingBox();
        expect(Math.abs(box.x), stage).toBeLessThanOrEqual(1);
        expect(Math.abs(box.width - (await clientWidth())), stage).toBeLessThanOrEqual(1);
        const logo = await status.locator('img').boundingBox();
        expect(logo.x, stage).toBeGreaterThanOrEqual(0);
        expect(logo.x + logo.width, stage).toBeLessThanOrEqual(viewport.width);
        expect(await noHorizontalOverflow(page), stage).toBe(true);

        if (stage === 'intro') {
          await skipButton(page).click();
          await expect(skipButton(page)).toHaveCount(0);
        }
      }
      release();
    });
  });
}
