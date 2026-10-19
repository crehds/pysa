import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Crawlers and link previews read the static index.html (the app never runs for
// them), so its metadata is checked as text.
const root = resolve(__dirname, '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const manifest = JSON.parse(readFileSync(resolve(root, 'public/manifest.json'), 'utf8'));
const BACKGROUND = '#222831';

function meta(attr, key) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return document.querySelector(`meta[${attr}="${key}"]`)?.getAttribute('content');
}

test('has a real description, not just the name', () => {
  const description = meta('name', 'description');
  expect(description).toMatch(/Dota 2/);
  expect(description.length).toBeGreaterThan(40);
});

test('has the Open Graph tags for a link preview', () => {
  expect(meta('property', 'og:title')).toBeTruthy();
  expect(meta('property', 'og:description')).toBe(meta('name', 'description'));
  expect(meta('property', 'og:type')).toBe('website');
  expect(meta('property', 'og:url')).toBe('https://pysa.vercel.app/');
  expect(meta('property', 'og:image')).toBe('https://pysa.vercel.app/logo512.png');
});

test('the browser chrome and the manifest use the background color', () => {
  expect(meta('name', 'theme-color')).toBe(BACKGROUND);
  expect(manifest.theme_color).toBe(BACKGROUND);
  expect(manifest.background_color).toBe(BACKGROUND);
});

test('paints the background before React injects the tokens, so nothing flashes white', () => {
  expect(meta('name', 'color-scheme')).toBe('dark');
  expect(html).toMatch(/<style>[^<]*background-color:\s*#222831/);
});
