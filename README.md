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

3. Install and start the backend:

   ```bash
   cd backend
   npm ci
   npm run dev
   ```

   The API listens on `http://localhost:4000`.

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
