import { translate } from '../i18n/dictionary';

// Dictionary keys of each route's page name.
const TITLE_KEYS = {
  '/': 'title.ranking',
  '/players': 'title.players',
  '/adminPlayers': 'title.admin',
};

// "/players/" is the same page as "/players".
function normalize(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

// The document title for a route in a language: "<page> · Pysa", or just
// "Pysa" for a path that has no page.
export function pageTitle(pathname, language) {
  const brand = translate(language, 'title.brand');
  const key = TITLE_KEYS[normalize(pathname)];
  return key ? `${translate(language, key)} · ${brand}` : brand;
}

export { normalize as normalizePath };
