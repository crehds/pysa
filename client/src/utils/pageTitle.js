const BRAND = 'Pysa';

const TITLES = {
  '/': 'Ranking',
  '/players': 'Jugadores',
  '/adminPlayers': 'Admin',
};

// "/players/" is the same page as "/players".
function normalize(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

// The document title for a route: "<page> · Pysa", or just "Pysa" for a path
// that has no page.
export function pageTitle(pathname) {
  const page = TITLES[normalize(pathname)];
  return page ? `${page} · ${BRAND}` : BRAND;
}

export { normalize as normalizePath };
