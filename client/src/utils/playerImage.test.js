import { playerImageSrc } from './playerImage';
import defaultUserImage from '../assets/default-user.png';
import { API_BASE_URL } from '../config';

describe('playerImageSrc', () => {
  test('points a path the backend serves at the api', () => {
    expect(playerImageSrc('/default/default-user.png')).toBe(
      `${API_BASE_URL}/default/default-user.png`
    );
  });

  test('gives the same answer every time it is called', () => {
    const src = '/static/player.png';
    expect(playerImageSrc(src)).toBe(playerImageSrc(src));
  });

  test('falls back to the default image when the player has none', () => {
    expect(playerImageSrc(undefined)).toBe(defaultUserImage);
  });
});
