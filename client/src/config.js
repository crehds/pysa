// Single source of truth for the backend base URL. Override it with the
// VITE_API_URL env var (see the README) when the backend does not run on
// http://localhost:4000.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
