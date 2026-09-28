const DEV_API_URL = 'http://localhost:4000';

// Production builds must set VITE_API_URL at build time (vite.config.js fails
// the build otherwise); dev and test runs fall back to the local backend.
export function resolveApiBaseUrl(env) {
  const url = env.VITE_API_URL || (env.PROD ? '' : DEV_API_URL);
  return url.replace(/\/+$/, '');
}

// Pass only the keys this module reads, as static import.meta.env.X
// references: Vite inlines each one individually. A bare `import.meta.env`
// would be replaced with an object literal holding every exposed VITE_*
// variable, including Vercel's VITE_VERCEL_* commit metadata.
export const API_BASE_URL = resolveApiBaseUrl({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  PROD: import.meta.env.PROD,
});
