import { test, expect } from '../fixtures.js';

// Layout checks for the Players page. Colors and spacing are verified with
// screenshots; "how many cards per row", "nothing overflows" and "the title does
// not sit under the show-menu button" are geometry, so they are asserted here.
async function cardBoxes(page) {
  const cards = page.getByRole('article');
  await expect(cards.first()).toBeVisible();
  const count = await cards.count();
  const boxes = [];
  for (let i = 0; i < count; i += 1) {
    boxes.push(await cards.nth(i).boundingBox());
  }
  return boxes;
}

// How many cards start on the same row as the first one.
function firstRowSize(boxes) {
  return boxes.filter((box) => Math.abs(box.y - boxes[0].y) <= 1).length;
}

function overlaps(a, b) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

test.describe('on a phone (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the cards stack in one column and the page does not overflow sideways', async ({
    page,
  }) => {
    await page.goto('/players');
    await expect(page.getByRole('heading', { level: 1, name: 'Jugadores' })).toBeVisible();
    const boxes = await cardBoxes(page);

    expect(boxes.length).toBeGreaterThan(1);
    expect(firstRowSize(boxes)).toBe(1);
    for (const box of boxes) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
    }

    const noHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    expect(noHorizontalOverflow).toBe(true);
  });
});

test.describe('on a small tablet (700x900)', () => {
  test.use({ viewport: { width: 700, height: 900 } });

  test('the cards sit two to a row', async ({ page }) => {
    await page.goto('/players');
    expect(firstRowSize(await cardBoxes(page))).toBe(2);
  });
});

test.describe('on a desktop (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('at least three cards share the first row', async ({ page }) => {
    await page.goto('/players');
    expect(firstRowSize(await cardBoxes(page))).toBeGreaterThanOrEqual(3);
  });

  test('the title leaves room for "Mostrar menú" when the menu is hidden', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('pysa:menu', 'hidden'));
    await page.goto('/players');

    const show = await page.getByRole('button', { name: 'Mostrar menú' }).boundingBox();
    const title = await page.getByRole('heading', { level: 1, name: 'Jugadores' }).boundingBox();
    expect(overlaps(show, title)).toBe(false);
  });
});
