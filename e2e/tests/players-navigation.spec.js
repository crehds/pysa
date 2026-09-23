import { test, expect } from '../fixtures.js';

// Also a regression test for a blank players page: the seeded players have
// no image, and PlayerImageMedail used to throw on that while rendering.
//
// The players page (GetPlayers with user='player') renders the very same
// ranking data as Home, just through a different component
// (client/src/components/ListOfPlayers instead of PlayersInRanking), so
// asserting player names/scores here would also pass on Home by accident.
// #playersCarousel only exists in ListOfPlayers's markup, never on Home.
test('navigating to the players page via the navbar shows the players page', async ({
  page,
}) => {
  await page.goto('/');

  await page.locator('a[href="/players"]').click();

  await expect(page).toHaveURL('/players');
  await expect(page.locator('#playersCarousel')).toBeVisible();
});
