# FutureKey

Lock yourself out of an account, then send the key to your future self. Create a
password, change your account to it, and schedule it to be emailed back to you on
a future date. Until then, you can't get in — and neither can anyone else,
**including the server operator**.

The password is **timelock-encrypted in your browser** before it's ever sent,
using [drand](https://drand.love) (the League of Entropy beacon) via
[`tlock-js`](https://github.com/drand/tlock-js). The decryption key for a future
moment literally does not exist until that moment arrives, so the stored data
cannot be opened early by anyone. At the delivery time the backend decrypts it
and emails the original password back.

This is two independently deployable apps:

- **`frontend/`** — React (Vite). One page: a password field with a generator, a
  recipient email, and a delivery date (with an optional whole-hour time). It
  timelock-encrypts the password locally and uploads only the ciphertext.
- **`backend/`** — Express API + Postgres. One endpoint to queue the ciphertext,
  plus a protected `/cron/dispatch` endpoint an external scheduler pings hourly;
  it decrypts anything that's now unlockable and emails it (via
  [Resend](https://resend.com)).

```
browser: generate pw ─▶ tlock-encrypt to delivery time ─▶ ciphertext only
   │
   └─POST /api/sendPasswordToTheFuture─▶ backend ──▶ Postgres (stores ciphertext)
                                            ▲
   hourly cron (GitHub Actions) ─POST /cron/dispatch─┘
                                            │  (at delivery time)
                          tlock-decrypt ◀── drand beacon key ──▶ Resend ──▶ email
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

Database migrations run automatically on boot (see [Database migrations](#database-migrations)),
so the schema is created/updated for you.

### Plain text mode (testing only)

The frontend always timelock-encrypts. But the API also accepts a plaintext
password for manual testing (e.g. Postman) by sending `encrypted: false`:

```bash
curl -X POST localhost:3001/api/sendPasswordToTheFuture \
  -H 'Content-Type: application/json' \
  -d '{"payload":"hunter2","encrypted":false,"email":"you@example.com","sendTime":1750000000000}'
```

With `encrypted: false` the `payload` is stored and emailed as-is (readable in the
DB). With `encrypted: true` (the default) it must be a tlock blob.

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

## How the timelock works

The browser asks the drand beacon for its chain info, converts the delivery time
to a future drand **round number**, and `tlock`-encrypts the password to that
round. drand publishes a threshold BLS signature for each round on a fixed 3s
schedule; that signature *is* the decryption key, and it doesn't exist until the
round is reached. So before the delivery time, the ciphertext is unopenable by
anyone — the server, a database leak, or you. After it, the backend fetches the
round key and decrypts. Free to use, no API key.

The relevant timelock chain is drand mainnet **quicknet**. If a dispatch runs a
hair before the round publishes (clock skew), decryption raises a "too early"
error; the dispatcher leaves that message **queued** and retries on the next tick
rather than marking it failed.

## How delivery works

The backend does **not** run its own timer. Free hosts sleep when idle, so an
in-process scheduler can't be trusted to fire. Instead an external scheduler calls
`POST /cron/dispatch` once an hour at `xx:00`; the endpoint decrypts and sends
anything due and the request also wakes the sleeping host. It's idempotent —
calling it twice sends nothing the second time.

`.github/workflows/dispatch.yml` is set up to do this for free. After deploying,
add two repository secrets (**Settings → Secrets and variables → Actions**):

- `BACKEND_URL` — your deployed API base URL (e.g. `https://futurekey-api.onrender.com`)
- `CRON_SECRET` — the same value as the backend's `CRON_SECRET`

Alternatives: [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com),
both pointing at the same endpoint with the secret.

## Database migrations

Schema changes are versioned with [node-pg-migrate](https://github.com/salsita/node-pg-migrate).
Migration files live in `backend/migrations/` and are tracked in a `pgmigrations`
table, so each runs exactly once — including against an already-created database.
`runMigrations()` applies anything pending **on boot** (`backend/src/db/migrate.js`),
so deploys are self-applying. You can also run them by hand:

```bash
cd backend
npm run migrate          # apply all pending (uses DATABASE_URL)
npm run migrate:down     # roll back the last one
```

To add a change, create a new file in `backend/migrations/` with a higher
timestamp prefix (e.g. `1718999999999_add_column.sql`) containing
`-- Up Migration` and `-- Down Migration` sections. Never edit a migration that
has already run — add a new one.

### One-time baseline for an existing database

The first migration (`1700000000000_init.sql`) does a clean `CREATE TABLE`. If
your database (e.g. an existing Neon DB) already has an old `messages` table from
earlier testing, drop it once so the baseline applies cleanly:

```sql
DROP TABLE IF EXISTS messages;
```

Run that in the Neon SQL editor, then deploy/boot — `1700000000000_init` creates
the current schema and records itself. After this, you never touch the DB by hand
again; future migrations apply automatically.

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
{ "ciphertext": "-----BEGIN AGE ENCRYPTED FILE-----\n...", "email": "you@example.com", "sendTime": 1750000000000 }
```

`ciphertext` is the tlock blob produced in the browser (the server rejects
anything that isn't one, so plaintext can't be uploaded by mistake). `sendTime`
is epoch **milliseconds** (UTC). Returns `201 { "id": number }`, or `400 { "error" }`
on bad input.

### `POST /cron/dispatch`

Protected by `CRON_SECRET` (header `Authorization: Bearer <secret>` or `?key=`).
Returns `{ due, sent, failed, notReady }` — `notReady` counts messages that were
due but whose drand round wasn't published yet (left queued, retried next tick).

## Security notes

- The database only ever holds **timelock ciphertext**, never plaintext passwords.
  A leaked DB, backup, or connection string reveals nothing usable before the
  delivery time.
- This protects against everyone *up to* the delivery moment. At delivery time the
  backend (which you control) decrypts to send the email, so the guarantee is
  "unrecoverable until `sendTime`," not "never visible to the operator."
- **Network-longevity risk:** decryption depends on the drand quicknet chain still
  publishing at the delivery time. This is solid for locks of days-to-months;
  for multi-year locks there's real risk the chain is retired and the password
  becomes **permanently unrecoverable**. Don't timelock anything you can't afford
  to lose for very long horizons.
- This locks the *password*, not the *account* — you can still reset most accounts
  via their email recovery flow. FutureKey is a discipline aid, not a vault.
