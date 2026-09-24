import { resolveApiBaseUrl } from './config';

describe('resolveApiBaseUrl', () => {
  test('falls back to the local backend outside production', () => {
    expect(resolveApiBaseUrl({ PROD: false })).toBe('http://localhost:4000');
  });

  test('uses VITE_API_URL when it is set', () => {
    const env = { PROD: true, VITE_API_URL: 'https://api.example.com' };
    expect(resolveApiBaseUrl(env)).toBe('https://api.example.com');
  });

  test('drops trailing slashes so paths never get a double slash', () => {
    const env = { PROD: false, VITE_API_URL: 'http://localhost:4000/' };
    expect(resolveApiBaseUrl(env)).toBe('http://localhost:4000');
  });
});
