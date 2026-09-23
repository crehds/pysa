import { test, expect } from '../fixtures.js';

// Regression test for a blank page after the loading logo: the seed used to
// create players without a `medail`, so the reducer's setMedail() threw
// `TypeError: Cannot read properties of undefined (reading 'name')`. A
// Vitest test with a mocked fetch could not see this, because it never
// exercises the real seed data or the real reducer against it.
test('shows the calibrated active players ranked by mmr', async ({ page }) => {
  await page.goto('/');

  // Nnnnnnn is the top mmr (3400) among the seed's calibrated, active
  // players (backend/seed/data/players.json: estado 1, calibration.estado
  // 0) — the reducer only assigns a medail (instead of 'Sin Calibrar') to a
  // calibrated player, and the ranking only shows calibrated, active ones.
  //
  // RowPlayerRanking (client/src/components/RowPlayerRanking) renders one
  // row per player as a <div> whose direct children are five <p> cells
  // (name, partidas, mmr, kda, medail), so `div:has(> p)` matches exactly
  // one row per player regardless of what wraps the name text — unlike a
  // single `xpath=..` hop, which breaks the moment a wrapper element is
  // added between the name and its row.
  const topPlayerRow = page
    .locator('div:has(> p)')
    .filter({ hasText: 'Nnnnnnn' });
  await expect(topPlayerRow).toBeVisible();
  await expect(topPlayerRow.getByText('3400', { exact: true })).toBeVisible();

  // Oaps is active but still uncalibrated (calibration.estado: 1), so it
  // must not appear in the ranking.
  await expect(page.getByText('Oaps', { exact: true })).toHaveCount(0);
});
