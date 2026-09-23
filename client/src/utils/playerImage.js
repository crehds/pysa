import defaultUserImage from '../assets/default-user.png';
import { API_BASE_URL } from '../config';

// No `g` flag: this regex is shared across calls, and a global regex keeps
// its lastIndex between test() calls, so the same path would alternate
// between matching and not matching.
const SERVER_PATH = /^[/][a-z]+[/].*/i;

// A player's image is a path the backend serves (e.g.
// '/default/default-user.png'), an uploaded image stored as
// { data, mimetype }, or missing: POST /players/newPlayers never stores one.
export function playerImageSrc(imgURL) {
  if (!imgURL) {
    return defaultUserImage;
  }
  return SERVER_PATH.test(imgURL)
    ? `${API_BASE_URL}${imgURL}`
    : `data:image/${imgURL.mimetype};base64,${imgURL.data}`;
}
