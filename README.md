# Pysa

Ranking app for Pysa players: `backend/` (Express + MongoDB) and `client/` (React).

## Local development

Requirements: Node.js 24 and Docker.

1. Start MongoDB (runs in Docker, bound to `127.0.0.1:27017`):

   ```bash
   docker compose up -d --wait
   ```

2. Create `backend/.env`:

   ```dotenv
   PORT=4000
   MONGODB_URI=mongodb://127.0.0.1:27017/pysa
   ```

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

### Backend environment variables

| Variable      | Required | Default | Description                    |
| ------------- | -------- | ------- | ------------------------------ |
| `MONGODB_URI` | Yes      | —       | MongoDB connection string.     |
| `PORT`        | No       | `4000`  | Port the API listens on.       |

### Stopping MongoDB

```bash
docker compose down      # keeps the data
docker compose down -v   # also deletes the data volume
```
