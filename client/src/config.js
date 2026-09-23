const DEV_API_URL = 'http://localhost:4000';

// Production builds must set VITE_API_URL at build time (vite.config.js fails
// the build otherwise); dev and test runs fall back to the local backend.
export function resolveApiBaseUrl(env) {
  const url = env.VITE_API_URL || (env.PROD ? '' : DEV_API_URL);
  return url.replace(/\/+$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env);
