# FutureKey

Lock yourself out of an account, then send the key to your future self. Create a
password, change your account to it, and schedule it to be emailed back to you on
a future date. Until then, you can't get in.

This is two independently deployable apps:

- **`frontend/`** — React (Vite). One page: a password field with a generator, a
  recipient email, and a delivery date (with an optional whole-hour time).
- **`backend/`** — Express API + Postgres. One endpoint to queue a password, plus
  a protected `/cron/dispatch` endpoint an external scheduler pings hourly to send
  anything that's due (via [Resend](https://resend.com)).

```
frontend ──POST /api/sendPasswordToTheFuture──▶ backend ──▶ Postgres
                                                   ▲
        hourly cron (GitHub Actions) ──POST /cron/dispatch──┘ ──▶ Resend ──▶ email
```

## Run locally

You need Node 18+, a Postgres database, and a free [Resend](https://resend.com) API key.

### Backend

```bash
cd backend
npm install
cp .env.example .env     # then fill in the values (see below)
npm run dev              # http://localhost:3001
```

`.env` values:

| Var               | What                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`    | Postgres connection string. Local: `postgres://postgres:postgres@localhost:5432/futurekey` |
| `RESEND_API_KEY`  | From the Resend dashboard → API Keys                                 |
| `MAIL_FROM`       | `FutureKey <onboarding@resend.dev>` works for testing with no domain |
| `CRON_SECRET`     | Any random string; the dispatcher must send it                       |
| `PORT`            | `3001`                                                               |

CORS is open to all origins (no cookies/auth are used, and `/cron/dispatch` is
guarded by `CRON_SECRET`), so the API is reachable from any frontend, Postman, or
curl without extra config.

The `messages` table is created automatically on first boot.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_URL=http://localhost:3001
npm run dev              # http://localhost:5173
```

### Trigger a delivery manually

`/cron/dispatch` sends every queued password whose time has passed:

```bash
curl -X POST localhost:3001/cron/dispatch \
  -H "Authorization: Bearer <CRON_SECRET>"
# -> {"due":1,"sent":1,"failed":0}
```

## How delivery works

The backend does **not** run its own timer. Free hosts sleep when idle, so an
in-process scheduler can't be trusted to fire. Instead an external scheduler calls
`POST /cron/dispatch` once an hour at `xx:00`; the endpoint sends anything due and
the request also wakes the sleeping host. It's idempotent — calling it twice sends
nothing the second time.

`.github/workflows/dispatch.yml` is set up to do this for free. After deploying,
add two repository secrets (**Settings → Secrets and variables → Actions**):

- `BACKEND_URL` — your deployed API base URL (e.g. `https://futurekey-api.onrender.com`)
- `CRON_SECRET` — the same value as the backend's `CRON_SECRET`

Alternatives: [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com),
both pointing at the same endpoint with the secret.

## Deploy (free tier)

### Backend → Render

1. New **Web Service** from this repo, root directory `backend` (or use the
   included `backend/render.yaml` as a Blueprint).
2. Add a free **Render Postgres**; copy its connection string into `DATABASE_URL`.
3. Set `RESEND_API_KEY`, `MAIL_FROM`, and `CRON_SECRET`.
4. Build `npm install`, start `npm start`, health check path `/health`.

> Render's free web service sleeps after ~15 min idle and has **no persistent
> disk** — that's why this uses Postgres (not SQLite) and an external cron ping.

### Frontend → Netlify

1. New site from this repo, base directory `frontend` (settings come from
   `frontend/netlify.toml`).
2. Set `VITE_API_URL` to your Render backend URL.

## API

### `POST /api/sendPasswordToTheFuture`

```json
{ "password": "string", "email": "you@example.com", "sendTime": 1750000000000 }
```

`sendTime` is epoch **milliseconds** (UTC). Returns `201 { "id": number }`, or
`400 { "error" }` on bad input.

### `POST /cron/dispatch`

Protected by `CRON_SECRET` (header `Authorization: Bearer <secret>` or `?key=`).
Returns `{ due, sent, failed }`.

## Note on password storage

Passwords are stored in the database as plain text — the whole point is to email
the original password back later, so it can't be hashed. Treat the database as
sensitive. A reasonable next step is encrypting the password column at rest with a
key held only in an env var.
