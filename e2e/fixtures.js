import { test as base, expect } from '@playwright/test';

// Pre-existing console errors the current app emits on the pages under test,
// unrelated to what these specs verify. Do not add a page error here: page
// errors (uncaught exceptions) always fail the test, by design.
export const KNOWN_CONSOLE_ERRORS = [];

// Extends the base `test` so every test fails on any uncaught page error and
// on any console.error the page emits, unless it contains a narrow substring
// listed in KNOWN_CONSOLE_ERRORS. This is what lets the suite catch crashes
// that only happen with real data, like a TypeError thrown while reducing or
// rendering: the page just goes blank, and a mocked-fetch unit test never
// sees it.
export const test = base.extend({
  page: async ({ page }, use) => {
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
      const isKnown = KNOWN_CONSOLE_ERRORS.some((pattern) =>
        text.includes(pattern)
      );
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
      `Unexpected console.error(s) (add a narrow pattern to KNOWN_CONSOLE_ERRORS in e2e/fixtures.js if pre-existing):\n${unexpectedConsoleErrors.join('\n')}`
    ).toEqual([]);
  },
});

export { expect };
