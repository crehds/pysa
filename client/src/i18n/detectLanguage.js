// Which language the site speaks for a visitor. The rule (the owner's, in order):
//   0. a language the visitor picked with the switch wins;
//   1. the first Spanish or English entry in navigator.languages;
//   2. if there is none, the device's country: the region of its locales, else
//      the one its IANA time zone belongs to. A Spanish-speaking country means
//      Spanish;
//   3. otherwise English.
// It never asks for geolocation and never looks an IP address up.

export const LANGUAGES = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'en';
export const STORAGE_KEY = 'pysa:lang';

const SPANISH_SPEAKING_COUNTRIES = new Set([
  'ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN',
  'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ',
]);

// IANA time zones of the Spanish-speaking countries, by country. A zone that is
// not listed belongs to some other country, so it falls through to English.
const TIME_ZONES_BY_COUNTRY = {
  ES: ['Europe/Madrid', 'Africa/Ceuta', 'Atlantic/Canary'],
  MX: [
    'America/Mexico_City', 'America/Cancun', 'America/Merida', 'America/Monterrey',
    'America/Matamoros', 'America/Chihuahua', 'America/Ciudad_Juarez', 'America/Ojinaga',
    'America/Mazatlan', 'America/Bahia_Banderas', 'America/Hermosillo', 'America/Tijuana',
  ],
  AR: [
    'America/Argentina/Buenos_Aires', 'America/Argentina/Cordoba', 'America/Argentina/Salta',
    'America/Argentina/Jujuy', 'America/Argentina/Tucuman', 'America/Argentina/Catamarca',
    'America/Argentina/La_Rioja', 'America/Argentina/San_Juan', 'America/Argentina/Mendoza',
    'America/Argentina/San_Luis', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Ushuaia',
    'America/Buenos_Aires',
  ],
  CO: ['America/Bogota'],
  PE: ['America/Lima'],
  VE: ['America/Caracas'],
  CL: ['America/Santiago', 'America/Punta_Arenas', 'Pacific/Easter'],
  EC: ['America/Guayaquil', 'Pacific/Galapagos'],
  GT: ['America/Guatemala'],
  CU: ['America/Havana'],
  BO: ['America/La_Paz'],
  DO: ['America/Santo_Domingo'],
  HN: ['America/Tegucigalpa'],
  PY: ['America/Asuncion'],
  SV: ['America/El_Salvador'],
  NI: ['America/Managua'],
  CR: ['America/Costa_Rica'],
  PA: ['America/Panama'],
  UY: ['America/Montevideo'],
  PR: ['America/Puerto_Rico'],
  GQ: ['Africa/Malabo'],
};

const COUNTRY_BY_TIME_ZONE = new Map(
  Object.entries(TIME_ZONES_BY_COUNTRY).flatMap(([country, zones]) =>
    zones.map((zone) => [zone, country])
  )
);

export function isSupportedLanguage(value) {
  return LANGUAGES.includes(value);
}

// The two-letter region of a language tag ("es-MX" -> "MX"), or null.
function regionOf(tag) {
  const part = String(tag)
    .split(/[-_]/)
    .slice(1)
    .find((subtag) => /^[A-Za-z]{2}$/.test(subtag));
  return part ? part.toUpperCase() : null;
}

function primaryLanguageOf(tag) {
  return String(tag).split(/[-_]/)[0].toLowerCase();
}

// Reading storage can throw (blocked cookies, private windows): that is just
// "nothing stored".
function defaultStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function defaultLanguages() {
  try {
    return Array.from(navigator.languages ?? []);
  } catch {
    return [];
  }
}

function defaultTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

export function readStoredLanguage(storage = defaultStorage()) {
  try {
    const value = storage?.getItem(STORAGE_KEY);
    return isSupportedLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

// Returns whether the choice was saved; a blocked storage only loses the memory.
export function storeLanguage(language, storage = defaultStorage()) {
  try {
    storage.setItem(STORAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}

// Every input can be injected (for tests); one that is left out is read from the
// browser, and `null` means "not available".
export function detectLanguage({
  languages = defaultLanguages(),
  timeZone = defaultTimeZone(),
  storage = defaultStorage(),
} = {}) {
  const stored = readStoredLanguage(storage);
  if (stored) return stored;

  const tags = languages ?? [];
  const preferred = tags.map(primaryLanguageOf).find(isSupportedLanguage);
  if (preferred) return preferred;

  const region = tags.map(regionOf).find(Boolean) ?? COUNTRY_BY_TIME_ZONE.get(timeZone);
  if (region && SPANISH_SPEAKING_COUNTRIES.has(region)) return 'es';

  return DEFAULT_LANGUAGE;
}
