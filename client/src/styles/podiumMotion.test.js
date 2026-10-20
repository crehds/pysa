import { PODIUM_MOTION, entranceFor, glowFor } from './podiumMotion';

describe('podium motion', () => {
  test('the durations are named and keep inside the budget', () => {
    const { entranceMs, staggerMs, fadeMs, glowCycleMs, glowPulses } = PODIUM_MOTION;
    expect({ entranceMs, staggerMs, fadeMs, glowCycleMs, glowPulses }).toEqual({
      entranceMs: 550,
      staggerMs: 250,
      fadeMs: 300,
      glowCycleMs: 1100,
      glowPulses: 2,
    });
    // Three cards in turn finish in under 1.5 s.
    expect(2 * staggerMs + entranceMs).toBeLessThan(1500);
    // The glow pulses for under 5 s (WCAG 2.2.2).
    expect(glowCycleMs * glowPulses).toBeLessThan(5000);
  });

  describe('entranceFor', () => {
    test('full: 3rd, then 2nd, then 1st, each one a rise', () => {
      const [first, second, third] = [1, 2, 3].map((rank) => entranceFor('full', rank, 3));
      expect(third).toEqual({ kind: 'rise', delayMs: 0, durationMs: 550 });
      expect(second).toEqual({ kind: 'rise', delayMs: 250, durationMs: 550 });
      expect(first).toEqual({ kind: 'rise', delayMs: 500, durationMs: 550 });
    });

    test('full: with fewer than three, the last place still goes first', () => {
      expect(entranceFor('full', 2, 2).delayMs).toBe(0);
      expect(entranceFor('full', 1, 2).delayMs).toBe(250);
      expect(entranceFor('full', 1, 1).delayMs).toBe(0);
    });

    test('lite: all at once with a short fade', () => {
      [1, 2, 3].forEach((rank) =>
        expect(entranceFor('lite', rank, 3)).toEqual({ kind: 'fade', delayMs: 0, durationMs: 300 })
      );
    });

    test('none: static', () => {
      expect(entranceFor('none', 1, 3)).toBeNull();
    });
  });

  describe('glowFor', () => {
    test('full: two pulses of about a second, after the given delay', () => {
      expect(glowFor('full', 800)).toEqual({ delayMs: 800, cycleMs: 1100, pulses: 2 });
      expect(glowFor('full')).toEqual({ delayMs: 0, cycleMs: 1100, pulses: 2 });
    });

    test('lite and none: lit and static', () => {
      expect(glowFor('lite')).toBeNull();
      expect(glowFor('none')).toBeNull();
    });
  });
});
