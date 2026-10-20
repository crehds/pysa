import { test, expect } from '../fixtures.js';

// The podium's entrance and the top-3 glow, checked on the real computed CSS
// (jsdom runs no animations). The intro marker is pre-set so the intro does not
// sit in front of the page; with full motion the Home podium rises 3rd, 2nd,
// 1st and the top-3 glow pulses twice and stays lit.
const INTRO_KEY = 'pysa:intro-played';

async function skipIntro(page) {
  await page.addInitScript((key) => window.sessionStorage.setItem(key, '1'), INTRO_KEY);
}

const podiumCards = (page) => page.getByRole('list', { name: 'Podio' }).getByRole('listitem');

// Reads the computed animation of a card (or its ::after) as plain values.
function animationOf(locator, pseudo) {
  return locator.evaluate((el, pseudoElement) => {
    const style = getComputedStyle(el, pseudoElement);
    return {
      name: style.animationName,
      delay: style.animationDelay,
      duration: style.animationDuration,
      count: style.animationIterationCount,
      opacity: style.opacity,
    };
  }, pseudo);
}

const seconds = (value) => parseFloat(value) * (value.endsWith('ms') ? 0.001 : 1);

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

test.describe('with full motion', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the podium cards rise in the order 3rd, 2nd, 1st', async ({ page }) => {
    await skipIntro(page);
    await page.goto('/');
    await expect(podiumCards(page)).toHaveCount(3);

    // DOM order is 1-2-3.
    const [first, second, third] = await Promise.all(
      [0, 1, 2].map((i) => animationOf(podiumCards(page).nth(i)))
    );
    for (const card of [first, second, third]) {
      expect(card.name).not.toBe('none');
      expect(seconds(card.duration)).toBeGreaterThanOrEqual(0.5);
      expect(seconds(card.duration)).toBeLessThanOrEqual(0.6);
    }
    expect(seconds(third.delay)).toBeLessThan(seconds(second.delay));
    expect(seconds(second.delay)).toBeLessThan(seconds(first.delay));
    expect(seconds(second.delay) - seconds(third.delay)).toBeCloseTo(0.25, 2);
    // The whole sequence ends in under 1.5 s.
    expect(seconds(first.delay) + seconds(first.duration)).toBeLessThan(1.5);
  });

  test('the glow pulses twice for under 5 s, then stays lit', async ({ page }) => {
    await skipIntro(page);
    await page.goto('/');
    await expect(podiumCards(page)).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const card = podiumCards(page).nth(i);
      const glow = await animationOf(card, '::after');
      expect(glow.count).toBe('2');
      expect(seconds(glow.duration) * Number(glow.count)).toBeLessThan(5);
      // Its own card has to be in before it pulses.
      expect(seconds(glow.delay)).toBeGreaterThanOrEqual(0.5);
    }

    // After the whole sequence the glow rests lit (not dark, not fully bright).
    await page.waitForTimeout(4500);
    const resting = await animationOf(podiumCards(page).nth(0), '::after');
    expect(Number(resting.opacity)).toBeGreaterThan(0.4);
    const shadow = await podiumCards(page)
      .nth(0)
      .evaluate((el) => getComputedStyle(el, '::after').boxShadow);
    expect(shadow).not.toBe('none');
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test('the Players top 3 glow too, and the rest do not', async ({ page }) => {
    await skipIntro(page);
    await page.goto('/players');
    const cards = page.getByRole('article');
    await expect(cards.first()).toBeVisible();

    const glow = await animationOf(cards.nth(0), '::after');
    expect(glow.count).toBe('2');
    expect(glow.delay).toBe('0s');
    const count = await cards.count();
    if (count > 3) {
      const plain = await cards.nth(3).evaluate((el) => getComputedStyle(el, '::after').content);
      expect(plain === 'none' || plain === 'normal').toBe(true);
    }
  });

  for (const [name, viewport] of [
    ['a phone (390x844)', { width: 390, height: 844 }],
    ['a desktop (1280x800)', { width: 1280, height: 800 }],
  ]) {
    test(`no horizontal overflow on ${name}, during and after the entrance`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await skipIntro(page);
      await page.goto('/');
      await expect(podiumCards(page)).toHaveCount(3);
      expect(await noHorizontalOverflow(page)).toBe(true);
      await page.waitForTimeout(1800);
      expect(await noHorizontalOverflow(page)).toBe(true);

      await page.goto('/players');
      await expect(page.getByRole('article').first()).toBeVisible();
      expect(await noHorizontalOverflow(page)).toBe(true);
    });
  }
});

test.describe('with reduced motion', () => {
  test('nothing animates, and the glow is lit', async ({ page }) => {
    await page.goto('/');
    await expect(podiumCards(page)).toHaveCount(3);

    for (let i = 0; i < 3; i++) {
      const card = podiumCards(page).nth(i);
      expect((await animationOf(card)).name).toBe('none');
      const glow = await animationOf(card, '::after');
      expect(glow.name).toBe('none');
      expect(Number(glow.opacity)).toBeGreaterThan(0.4);
    }
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);

    await page.goto('/players');
    await expect(page.getByRole('article').first()).toBeVisible();
    expect((await animationOf(page.getByRole('article').first(), '::after')).name).toBe('none');
  });
});
