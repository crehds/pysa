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
  // The top three are the podium (an ordered list), so the top player is its
  // first item; the rest are rows of the ranking table.
  const topPlayer = page
    .getByRole('list', { name: 'Podio' })
    .getByRole('listitem')
    .first();
  await expect(topPlayer).toContainText('Nnnnnnn');
  await expect(topPlayer).toContainText('3400');

  // From rank 4 on, the players are rows of a real table, found by role so it
  // does not depend on how the cells are wrapped.
  const table = page.getByRole('table', { name: 'Ranking' });
  await expect(table.getByRole('row')).toHaveCount(1 + 9);
  await expect(
    table.getByRole('row').nth(1).getByRole('cell').first()
  ).toContainText('4');

  // Oaps is active but still uncalibrated (calibration.estado: 1), so it
  // must not appear in the ranking.
  await expect(page.getByText('Oaps', { exact: true })).toHaveCount(0);
});
