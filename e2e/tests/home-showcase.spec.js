import { test, expect } from '../fixtures.js';

// Layout checks for the Home showcase. Colors and spacing are verified with
// screenshots; "which card is where" and "the panel does not cover its button"
// are geometry, so they are asserted here.
async function podiumBoxes(page) {
  const items = page.getByRole('list', { name: 'Podio' }).getByRole('listitem');
  await expect(items).toHaveCount(3);
  return [await items.nth(0).boundingBox(), await items.nth(1).boundingBox(), await items.nth(2).boundingBox()];
}

function overlaps(a, b) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

test.describe('on a desktop (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the podium shows 2-1-3 from left to right', async ({ page }) => {
    await page.goto('/');
    const [first, second, third] = await podiumBoxes(page);

    expect(second.x).toBeLessThan(first.x);
    expect(first.x).toBeLessThan(third.x);
    // One row: the cards share a baseline.
    expect(Math.abs(first.y + first.height - (second.y + second.height))).toBeLessThanOrEqual(1);
  });

  test('the header leaves room for "Mostrar menú" when the menu is hidden', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('pysa:menu', 'hidden'));
    await page.goto('/');

    const show = await page.getByRole('button', { name: 'Mostrar menú' }).boundingBox();
    const title = await page.getByRole('heading', { level: 1, name: 'Ranking' }).boundingBox();
    expect(overlaps(show, title)).toBe(false);
  });
});

test.describe('on a phone (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the podium stacks 1-2-3 from top to bottom and the page does not overflow', async ({
    page,
  }) => {
    await page.goto('/');
    const [first, second, third] = await podiumBoxes(page);

    expect(first.y).toBeLessThan(second.y);
    expect(second.y).toBeLessThan(third.y);
    expect(first.x + first.width).toBeLessThanOrEqual(390);

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(noHorizontalOverflow).toBe(true);
  });

  test('the medal ranges button is visible, opens the panel on tap and the panel does not cover it', async ({
    page,
  }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Rangos de medallas' });
    await expect(button).toBeVisible();

    const panel = page.locator('#medails');
    await expect(panel).toBeHidden();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Inmortal');

    expect(overlaps(await button.boundingBox(), await panel.boundingBox())).toBe(false);
    const box = await panel.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('the logo shows in the header on a phone and the footer is reachable', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('heading', { level: 1, name: 'Ranking' }).locator('xpath=ancestor::header');
    await expect(header.locator('img')).toBeVisible();

    const link = page.getByRole('link', { name: /GitHub/ });
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
  });
});
