import { defineConfig, devices } from '@playwright/test';

// Fully isolated from the user's dev setup: different ports than
// backend/client's dev servers (4000/5173) and a different database
// (pysa_e2e instead of pysa), so this suite never touches either.
const BACKEND_PORT = 4100;
const CLIENT_PORT = 5180;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const CLIENT_URL = `http://localhost:${CLIENT_PORT}`;
export const E2E_MONGODB_URI = 'mongodb://127.0.0.1:27017/pysa_e2e';

// Test-only admin credentials for the isolated e2e backend (port 4100)
// only: they unlock nothing else and are safe to commit. Specs log in
// through the real UI or via page.request.post('/auth/login', ...) with
// E2E_ADMIN_USERNAME/E2E_ADMIN_PASSWORD (see e2e/tests/admin-players.spec.js).
export const E2E_ADMIN_USERNAME = 'e2e-admin';
export const E2E_ADMIN_PASSWORD = 'E2E-Admin-Passw0rd!';
// bcrypt hash (cost 10) of E2E_ADMIN_PASSWORD above.
const E2E_ADMIN_PASSWORD_HASH =
  '$2b$10$ywEhDuDjV4JZobu8X3p8ZOaFqebJpqh9NYjqJNLBlCiuuWajMQkkO';
// Test-only signing secret, well over the 32-char minimum; never used
// outside this isolated e2e backend.
const E2E_JWT_SECRET = '106e3aeadefe9bbbe004956d73f092a5fe48ad8a1e87f43bb4a5af7f7039be9f';

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.js',
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: CLIENT_URL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      // Not `npm run dev`/`npm start`: those load backend/.env via
      // --env-file-if-exists, which would point MONGODB_URI at the dev
      // database instead of the env below.
      command: 'node ./bin/www',
      cwd: '../backend',
      // Not a DB-backed route like /roles/getRoles: Playwright starts
      // webServers BEFORE running globalSetup, so with MongoDB down a DB
      // route would just hang until the generic webServer timeout, and
      // global-setup's friendlier "run npm run db:up" error would never get
      // a chance to show. /default serves backend/public/images statically
      // (see backend/app.js), so this only proves the backend process itself
      // came up.
      url: `${BACKEND_URL}/default/default-user.png`,
      env: {
        PORT: String(BACKEND_PORT),
        MONGODB_URI: E2E_MONGODB_URI,
        ALLOWED_ORIGINS: CLIENT_URL,
        ADMIN_USERNAME: E2E_ADMIN_USERNAME,
        ADMIN_PASSWORD_HASH: E2E_ADMIN_PASSWORD_HASH,
        JWT_SECRET: E2E_JWT_SECRET,
      },
      reuseExistingServer: false,
    },
    {
      command: `npm run dev -- --port ${CLIENT_PORT} --strictPort`,
      cwd: '../client',
      url: CLIENT_URL,
      env: {
        VITE_API_URL: BACKEND_URL,
      },
      reuseExistingServer: false,
    },
  ],
});
