import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// config.js must inline only the specific import.meta.env keys it reads. A
// bare `import.meta.env` is replaced by Vite, at build time, with an object
// literal holding EVERY exposed VITE_* variable -- on Vercel that includes
// framework-injected system variables such as
// VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN, leaking them into the public bundle.
// That replacement only happens in a real production build, so this test
// shells out to Vite's own CLI in a child process instead of unit-testing
// resolveApiBaseUrl. The child process also fully isolates the build's env
// from vitest's own process env, which runs with NODE_ENV=test.
const BUILD_TIMEOUT = 60_000;

const clientDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const viteBin = path.join(clientDir, 'node_modules', 'vite', 'bin', 'vite.js');

function readAllFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return readAllFiles(fullPath);
    if (!entry.isFile()) return [];
    return [readFileSync(fullPath, 'utf8')];
  });
}

describe('production bundle', () => {
  let outDir;
  let apiMarker;
  let canary;
  let bundleText;

  beforeAll(() => {
    outDir = mkdtempSync(path.join(tmpdir(), 'pysa-build-leak-'));
    apiMarker = `/api-marker-${randomBytes(8).toString('hex')}`;
    canary = `leak-canary-${randomBytes(16).toString('hex')}`;

    execFileSync(process.execPath, [viteBin, 'build', '--outDir', outDir, '--emptyOutDir'], {
      cwd: clientDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        VITE_API_URL: apiMarker,
        // Stands in for a VITE_*-prefixed variable the app never reads, such
        // as Vercel's injected VITE_VERCEL_GIT_COMMIT_AUTHOR_LOGIN.
        VITE_LEAK_CANARY: canary,
      },
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024,
      timeout: BUILD_TIMEOUT - 5_000,
    });

    bundleText = readAllFiles(outDir).join('\n');
  }, BUILD_TIMEOUT);

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  // Positive control: without this, the assertion below could pass
  // vacuously by scanning an empty or wrong directory.
  test(
    'contains the VITE_API_URL value config.js actually reads',
    () => {
      expect(bundleText).toContain(apiMarker);
    },
    BUILD_TIMEOUT
  );

  test(
    'does not contain a VITE_* value the app never reads',
    () => {
      expect(bundleText).not.toContain(canary);
    },
    BUILD_TIMEOUT
  );
});
