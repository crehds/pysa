import { test, expect } from '../fixtures.js';

// The hover spotlight of the Players grid, checked on the real computed CSS
// (jsdom runs no hover). The intro marker is pre-set so the intro does not sit in
// front of the page. The hovered card comes forward and lights up while the
// others recede; touch devices and reduced motion get no movement.
const INTRO_KEY = 'pysa:intro-played';

async function openPlayers(page) {
  await page.addInitScript((key) => window.sessionStorage.setItem(key, '1'), INTRO_KEY);
  await page.goto('/players');
  await expect(page.getByRole('article').first()).toBeVisible();
  return page.getByRole('article');
}

// The computed look of a card (or its ::before) as plain values.
const lookOf = (card, pseudo) =>
  card.evaluate((el, pseudoElement) => {
    const style = getComputedStyle(el, pseudoElement);
    return { transform: style.transform, opacity: Number(style.opacity) };
  }, pseudo);

async function noHorizontalOverflow(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
  );
}

test.describe('with full motion and a mouse', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1280, height: 800 } });

  test('the hovered card comes forward and the others recede, then all restore', async ({
    page,
  }) => {
    const cards = await openPlayers(page);
    const hovered = cards.nth(4);
    const other = cards.nth(5);
    expect((await lookOf(hovered)).transform).toBe('none');

    await hovered.hover();
    await expect.poll(async () => (await lookOf(hovered)).transform).not.toBe('none');
    await expect.poll(async () => (await lookOf(other)).opacity).toBeLessThan(1);
    expect((await lookOf(other)).transform).not.toBe('none');
    await expect.poll(async () => (await lookOf(hovered, '::before')).opacity).toBe(1);
    expect((await lookOf(hovered)).opacity).toBe(1);

    await page.mouse.move(0, 0);
    await expect.poll(async () => (await lookOf(hovered)).transform).toBe('none');
    await expect.poll(async () => (await lookOf(other)).opacity).toBe(1);
    await expect.poll(async () => (await lookOf(other)).transform).toBe('none');
    await expect.poll(async () => (await lookOf(hovered, '::before')).opacity).toBe(0);
  });

  test('a top-3 card lights up too, and keeps its glow', async ({ page }) => {
    const cards = await openPlayers(page);
    await cards.nth(0).hover();
    await expect.poll(async () => (await lookOf(cards.nth(0))).transform).not.toBe('none');
    // The glow is still drawn (it may be mid-pulse).
    const glow = await cards.nth(0).evaluate((el) => getComputedStyle(el, '::after').boxShadow);
    expect(glow).not.toBe('none');
  });

  test('no horizontal overflow while the right-edge card is hovered', async ({ page }) => {
    const cards = await openPlayers(page);
    // Three columns at 1280px: the third card sits against the right edge.
    await cards.nth(2).hover();
    await expect.poll(async () => (await lookOf(cards.nth(2))).transform).not.toBe('none');
    expect(await noHorizontalOverflow(page)).toBe(true);
  });

  test('the hovered card is not covered by its neighbours', async ({ page }) => {
    const cards = await openPlayers(page);
    await cards.nth(4).hover();
    await expect.poll(async () => (await lookOf(cards.nth(4))).transform).not.toBe('none');
    const onTop = await cards.nth(4).evaluate((el) => {
      const box = el.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top + 8);
      return el.contains(hit);
    });
    expect(onTop).toBe(true);
  });
});

test.describe('on a touch device', () => {
  test.use({
    reducedMotion: 'no-preference',
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test('a tap lifts nothing and dims nobody', async ({ page }) => {
    const cards = await openPlayers(page);
    await cards.nth(1).tap();
    // Give a transition time to show up if the rule wrongly applied.
    await page.waitForTimeout(400);
    for (const index of [0, 1, 2]) {
      const look = await lookOf(cards.nth(index));
      expect(look.transform).toBe('none');
      expect(look.opacity).toBe(1);
    }
    expect(await noHorizontalOverflow(page)).toBe(true);
  });
});

test.describe('with reduced motion', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('hovering lights a card up but moves nothing', async ({ page }) => {
    const cards = await openPlayers(page);
    await cards.nth(4).hover();
    await expect.poll(async () => (await lookOf(cards.nth(4), '::before')).opacity).toBe(1);
    expect((await lookOf(cards.nth(4))).transform).toBe('none');
    expect((await lookOf(cards.nth(5))).transform).toBe('none');
    // The others still dim, instantly.
    expect((await lookOf(cards.nth(5))).opacity).toBeLessThan(1);
  });
});
