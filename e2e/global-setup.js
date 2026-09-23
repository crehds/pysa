import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { E2E_MONGODB_URI } from './playwright.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '../backend');

// Seeds the isolated e2e database (pysa_e2e) by running the backend's own
// seed script in a child process, the same way `npm run seed` does — but
// without --env-file-if-exists (that would load backend/.env and point at
// the dev database) and with MONGODB_URI overridden below. The script wipes
// and recreates only the collections it owns, so this is safe to re-run.
export default async function globalSetup() {
  const result = spawnSync(process.execPath, ['seed/index.js'], {
    cwd: BACKEND_DIR,
    env: {
      ...process.env,
      MONGODB_URI: E2E_MONGODB_URI,
    },
    stdio: 'inherit',
  });

  if (result.error || result.status !== 0) {
    throw new Error(
      `Failed to seed the e2e database (${E2E_MONGODB_URI}). ` +
        'Is MongoDB running? Start it with `npm run db:up` from the repo root, then retry `npm run test:e2e`.'
    );
  }
}
