# Pysa

Ranking app for Pysa players: `backend/` (Express + MongoDB) and `client/` (React).

## Local development

Requirements: Node.js 24 and Docker.

1. Start MongoDB (runs in Docker, bound to `127.0.0.1:27017`):

   ```bash
   docker compose up -d --wait
   ```

   Still start it first: it's faster and gives clearer errors. But the
   backend no longer requires it to already be up — if MongoDB isn't
   reachable yet (e.g. `npm run dev` racing Docker), it retries the
   connection with backoff instead of failing every request until a manual
   restart. A malformed `MONGODB_URI` is the one exception: retrying can
   never fix that, so it logs a single clear error instead and does not
   retry — fix the value and restart.

   Each retry attempt waits up to the MongoDB driver's default of 30s before
   giving up on that attempt, which is safe in production but slow if you
   just want the backend to notice Docker came up. Set
   `MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000` in `backend/.env` (step 2) to
   make each attempt fail fast locally instead — see the table below.

2. Create `backend/.env`:

   ```dotenv
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/pysa
   ```

   The public (read-only) pages work with just the two vars above. To also
   use the admin login, add `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` and
   `JWT_SECRET` — see [Admin login](#admin-login) below for how to generate
   each one; without them the backend still starts, but `POST /auth/login`
   answers 503 and every admin action answers 401.

3. Install, seed and start the backend:

   ```bash
   cd backend
   npm ci
   npm run seed   # optional: fills medails/roles/players/scores/calibrations with sample data
   npm run dev
   ```

   The API listens on `http://localhost:4000`. `npm run seed` only touches the
   collections it owns and is safe to run again (it resets them first), and it
   refuses to run against a non-local `MONGODB_URI` unless you pass `--force`.

4. Install and start the client:

   ```bash
   cd client
   npm ci
   npm run dev
   ```

   The client (Vite) listens on `http://localhost:5173` and calls the backend
   directly at `http://localhost:4000` by default. Override that with the
   `VITE_API_URL` env var (e.g. `VITE_API_URL=http://localhost:4001 npm run
   dev`) if the backend runs elsewhere; there is no committed `.env` file for
   the client, so set it inline or in your shell.

   Production builds have no default: `npm run build` fails unless
   `VITE_API_URL` is set (e.g. `VITE_API_URL=https://api.example.com npm run
   build`), so a bundle never ships pointing at `localhost`.

   Run the client's tests with `npm test` (inside `client/`).

### Running everything from the root

```bash
npm ci             # root tooling (concurrently); backend/ and client/ need their own npm ci
npm run db:up      # start MongoDB (equivalent to step 1)
npm run dev        # backend + client together, via concurrently
npm run db:down    # stop MongoDB
```

`npm run dev` requires `backend/.env` to already exist (step 2). If either
process exits with an error (for example, missing `node_modules`),
concurrently stops the other one too.

A backend crash does not stop anything: `node --watch` logs the error (for
example `EADDRINUSE` when something is already listening on port 4000) and
waits for a file change instead of exiting, so the client keeps running.
Fix the cause, then save a backend file or restart `npm run dev`.

### Tests

`npm test` (inside `backend/`) runs the integration test suite against
`TEST_MONGODB_URI` (defaults to `mongodb://127.0.0.1:27017/pysa_test`), so the
Docker MongoDB from step 1 must be running first.

### End-to-end tests

Playwright tests in `e2e/` drive the real client against the real backend and
database, fully isolated from the dev setup above: it uses ports
`4100`/`5180` (instead of `4000`/`5173`) and the `pysa_e2e` database (instead
of `pysa`), so running it never touches your `npm run dev` session or your
dev data.

Prerequisites (`backend/` and `client/` need their own `npm ci` too, see
above):

```bash
npm run db:up                            # MongoDB must be running
npm --prefix e2e ci
npx --prefix e2e playwright install chromium
```

Run it from the root:

```bash
npm run test:e2e
```

This seeds `pysa_e2e` before the run (see `e2e/global-setup.js`), starts the
backend on `4100` and the client on `5180`, and runs the Chromium smoke suite
against them. A spec that mutates data (e.g. the avatar-upload spec) reseeds
the database again immediately before it runs, so it always starts from the
same known state; read-only specs just share the single seed above.

### Backend environment variables

| Variable             | Required | Default                  | Description                                                                 |
| --------------------- | -------- | ------------------------- | ----------------------------------------------------------------------------- |
| `MONGODB_URI`          | Yes      | —                          | MongoDB connection string.                                                    |
| `MONGODB_SERVER_SELECTION_TIMEOUT_MS` | No | driver default (`30000`) | How long (ms) the MongoDB driver waits to select a server — applied to every operation, not just the initial connect. Leave unset in production: a replica set like Atlas can take longer than a few seconds to elect a primary, and the driver default handles that safely. Locally, set it low (e.g. `5000`) so a `connect()` attempt fails fast while the backend's own retry loop takes over. An invalid (non-positive-integer) value logs a startup warning and falls back to the driver default instead of crashing. |
| `PORT`                 | No       | `4000`                     | Port the API listens on.                                                      |
| `ADMIN_USERNAME`       | No\*     | —                          | The admin login's username.                                                   |
| `ADMIN_PASSWORD_HASH`  | No\*     | —                          | bcrypt hash of the admin password. Generate with `npm run hash-password`.     |
| `JWT_SECRET`           | No\*     | —                          | Signs admin session cookies. At least 32 characters. Generate with the command below. |
| `ALLOWED_ORIGINS`      | No       | `http://localhost:5173`   | Comma-separated exact origins allowed to call the API with credentials (CORS).|
| `TRUST_PROXY`          | No       | off (`false`)              | Express `trust proxy` setting: `false` (or unset) for off, a hop count (e.g. `1`), or a comma-separated list of IPs/CIDRs/presets (`loopback`, `linklocal`, `uniquelocal`). Only set this behind a reverse proxy — see "Deploying" below. `true` is refused (it would let any client spoof its IP and dodge the login rate limit), and so is any value Express itself cannot parse (e.g. a typo); either logs a startup warning with the reason and stays off instead of crashing. |
| `LOGIN_RATE_LIMIT_WINDOW_MS` | No | `900000` (15 min)          | Login rate-limit window, in milliseconds. A non-numeric or zero value falls back to the default. |
| `LOGIN_RATE_LIMIT_MAX` | No       | `10`                       | Max login attempts per window, per client. A non-numeric or zero value falls back to the default. |

\* The three admin vars are a set: if any is missing or invalid, the backend
still starts and the public pages keep working, but `POST /auth/login`
answers `503` and every admin route answers `401` until all three are set
(see `backend/auth/config.js`). The backend logs one warning at startup when
this happens.

### Admin login

The app has a single admin account, configured entirely through the env vars
above — there is no user database.

1. Generate `ADMIN_PASSWORD_HASH` by hashing your chosen password (bcrypt,
   cost 12). This prompts for the password interactively and never echoes it
   or takes it as an argument:

   ```bash
   cd backend
   npm run hash-password
   ```

2. Generate `JWT_SECRET` (32 random bytes, hex-encoded):

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. Add all three to `backend/.env`:

   ```dotenv
   ADMIN_USERNAME=youradminname
   ADMIN_PASSWORD_HASH='$2b$12$....................................................'
   JWT_SECRET=64-hex-characters-from-the-command-above
   ```

   Single-quote `ADMIN_PASSWORD_HASH`: a bcrypt hash contains `$` characters,
   and single quotes keep it intact byte-for-byte (verified against Node's
   `--env-file`, which the backend's `npm start`/`npm run dev` scripts use).

4. Restart the backend (`npm run dev`/`npm start` picks up `backend/.env`
   automatically via `--env-file-if-exists`).

**Logout is stateless**: sessions are signed JWTs with no server-side store,
so logout only clears the cookie client-side — the token itself stays valid
for its full 8-hour lifetime even after logging out (see
`backend/test/auth-network.test.js`). To end every existing session at once
(for example after a leaked cookie), rotate `JWT_SECRET` to a new value and
restart the backend; every previously issued token then fails verification.

**Deploying**: the session cookie is `SameSite=Lax` and `Secure`, scoped to
the API's own domain. Serve the client and the API from the same site (or
put the API behind a same-site reverse proxy at, say, `/api`) — a
cross-site cookie (client and API on different registrable domains) is
blocked by Safari and other browsers' tracking-prevention defaults even with
`credentials: 'include'` on the client. When you do put a reverse proxy in
front of the API, also set `TRUST_PROXY` to the number of proxy hops in
front of it (usually `1`), so the login rate limiter keys on each visitor's
real IP instead of the proxy's — without it, every visitor shares one
bucket and 10 bad logins from anyone lock the real admin out.

### Stopping MongoDB

```bash
docker compose down      # keeps the data
docker compose down -v   # also deletes the data volume
```
