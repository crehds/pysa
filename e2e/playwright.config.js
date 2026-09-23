import { defineConfig, devices } from '@playwright/test';

// Fully isolated from the user's dev setup: different ports than
// backend/client's dev servers (4000/5173) and a different database
// (pysa_e2e instead of pysa), so this suite never touches either.
const BACKEND_PORT = 4100;
const CLIENT_PORT = 5180;
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;
const CLIENT_URL = `http://localhost:${CLIENT_PORT}`;
export const E2E_MONGODB_URI = 'mongodb://127.0.0.1:27017/pysa_e2e';

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
      url: `${BACKEND_URL}/roles/getRoles`,
      env: {
        PORT: String(BACKEND_PORT),
        MONGODB_URI: E2E_MONGODB_URI,
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
