import { test as base, expect } from '@playwright/test';

// The app currently emits no console.error on any page under test, so this
// starts empty. It is an opt-in allowlist: add a narrow substring here only
// once a real, pre-existing console.error shows up that a spec has no
// business failing on. Never add a page error here — page errors (uncaught
// exceptions) must always fail the test, by design.
//
// In particular, do not allowlist 401s in general to paper over a noisy
// session check: GET /auth/me (useCheckAuth,
// client/src/hooks/useCheckAuth.js) always answers 200, even for a
// logged-out visitor (see backend/auth/network.js) precisely so it never
// produces this console noise in the first place, and so a real regression
// (e.g. an admin write silently losing its session cookie and getting a
// genuine 401) still fails a test here instead of being masked by too
// broad a pattern.
export const KNOWN_CONSOLE_ERRORS = [];

// Extends the base `test` so every test fails on any uncaught page error and
// on any console.error the page emits, unless it contains a narrow substring
// listed in KNOWN_CONSOLE_ERRORS, or one passed to the allowConsoleError
// fixture below by that specific test. This is what lets the suite catch
// crashes that only happen with real data, like a TypeError thrown while
// reducing or rendering: the page just goes blank, and a mocked-fetch unit
// test never sees it.
export const test = base.extend({
  // Per-test, opt-in allowance for one specific, expected console.error —
  // e.g. a deliberate wrong-password login through the real UI: the
  // resulting (correct, intentional) 401 from POST /auth/login is still
  // logged by Chromium as "Failed to load resource" independent of and
  // before any application code runs, same as any non-2xx fetch response.
  // Call it before triggering the action. Unlike adding to
  // KNOWN_CONSOLE_ERRORS, this only ever excuses the one test that calls
  // it, so it can never mask an unrelated regression in another spec (for
  // example, an authenticated admin write that starts silently losing its
  // session cookie and getting a real 401 would still fail every other
  // test here).
  allowConsoleError: async ({}, use) => {
    const patterns = [];
    const allow = (pattern) => patterns.push(pattern);
    allow.patterns = patterns;
    await use(allow);
  },

  page: async ({ page, allowConsoleError }, use) => {
    const pageErrors = [];
    const unexpectedConsoleErrors = [];

    page.on('pageerror', (error) => {
      pageErrors.push(error);
    });

    page.on('console', (message) => {
      if (message.type() !== 'error') {
        return;
      }
      const text = message.text();
      const isKnown =
        KNOWN_CONSOLE_ERRORS.some((pattern) => text.includes(pattern)) ||
        allowConsoleError.patterns.some((pattern) => text.includes(pattern));
      if (!isKnown) {
        unexpectedConsoleErrors.push(text);
      }
    });

    await use(page);

    expect(
      pageErrors,
      `Uncaught page error(s):\n${pageErrors.map(String).join('\n')}`
    ).toEqual([]);
    expect(
      unexpectedConsoleErrors,
      `Unexpected console.error(s) (add a narrow pattern to KNOWN_CONSOLE_ERRORS in e2e/fixtures.js if pre-existing and suite-wide, or call allowConsoleError(pattern) in this test if it is expected only here):\n${unexpectedConsoleErrors.join('\n')}`
    ).toEqual([]);
  },
});

export { expect };
