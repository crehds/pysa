import { API_BASE_URL } from './config';

test('defaults to the local backend when VITE_API_URL is not set', () => {
  expect(API_BASE_URL).toBe('http://localhost:4000');
});
