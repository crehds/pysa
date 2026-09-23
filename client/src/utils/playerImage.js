import defaultUserImage from '../assets/default-user.png';
import { API_BASE_URL } from '../config';

// No `g` flag: this regex is shared across calls, and a global regex keeps
// its lastIndex between test() calls, so the same path would alternate
// between matching and not matching.
const SERVER_PATH = /^[/][a-z]+[/].*/i;

// A player's image is a path the backend serves (e.g.
// '/default/default-user.png'), an uploaded image stored as { data,
// mimetype }, or missing: POST /players/newPlayers never stores one.
// mimetype is already the full MIME type (e.g. 'image/png', not just
// 'png' — see backend/components/player/controller.js updateImagePlayer,
// which stores image.mimetype as-is) and data is already a base64 string
// (verified against both the upload response and GET /players/getAllPlayers,
// which serialize the same Model3 document the same way), so the data URL
// below must not prepend another 'image/' of its own.
export function playerImageSrc(imgURL) {
  if (!imgURL) {
    return defaultUserImage;
  }
  return SERVER_PATH.test(imgURL)
    ? `${API_BASE_URL}${imgURL}`
    : `data:${imgURL.mimetype};base64,${imgURL.data}`;
}
