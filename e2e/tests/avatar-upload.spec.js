import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '../fixtures.js';
import { seedDatabase } from '../global-setup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVATAR_PATH = path.join(__dirname, '..', 'fixtures', 'avatar.png');

// This spec uploads an avatar, which mutates the seeded player it targets,
// so reseed right before it runs instead of relying on the single global
// seed every read-only spec shares (see e2e/global-setup.js).
test.beforeEach(() => {
  seedDatabase();
});

// Brings a specific seeded player into focus in the admin carousel
// regardless of AdminListOfPlayers's random initial focus
// (client/src/components/AdminListOfPlayers/index.jsx: randomPlayer()).
async function focusPlayer(page, nickname) {
  const searchInput = page.locator('#searchInput');
  await searchInput.fill(nickname);
  await searchInput.press('Enter');
}

test('uploading an avatar renders it, both immediately and after a reload', async ({
  page,
}) => {
  await page.addInitScript(() => window.sessionStorage.setItem('token', 'true'));
  await page.goto('/adminPlayers');

  // Seeded players have no imgURL (backend/seed/data/players.json), so Jean
  // starts on the bundled default avatar, not a data: URL.
  await focusPlayer(page, 'Jean');
  const avatar = page.locator('img[alt="imagen del jugador"]');
  await expect(avatar).toBeVisible();
  await expect(avatar).not.toHaveAttribute('src', /^data:/);

  await page.locator('#input_to_setImage').setInputFiles(AVATAR_PATH);

  // The confirm (AiOutlineCheck) and cancel (BsX) icons both render with
  // name="check" and class="icon__control" (pre-existing markup in
  // PlayerFocus/index.jsx), so tell them apart by DOM order: confirm is
  // first.
  await page.locator('.icon__control').first().click();

  await expect(page.getByText('Guardado y actualizado con éxito')).toBeVisible();

  // playerImageSrc() (client/src/utils/playerImage.js) must build a data URL
  // from the stored { data, mimetype } that the browser can actually decode,
  // not just one that looks plausible.
  await expect(avatar).toHaveAttribute('src', /^data:image\/png;base64,/);
  await expect
    .poll(() => avatar.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true);

  // After a reload the image comes from GET /players/getAllPlayers instead
  // of the upload response, which is the other half of what playerImage.js
  // has to handle correctly.
  await page.reload();
  await focusPlayer(page, 'Jean');
  const avatarAfterReload = page.locator('img[alt="imagen del jugador"]');
  await expect(avatarAfterReload).toHaveAttribute('src', /^data:image\/png;base64,/);
  await expect
    .poll(() =>
      avatarAfterReload.evaluate((img) => img.complete && img.naturalWidth > 0)
    )
    .toBe(true);
});
