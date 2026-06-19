CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  password    TEXT NOT NULL,
  email       TEXT NOT NULL,
  send_time   TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'queued',   -- queued | sent | failed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at     TIMESTAMPTZ
);

-- The dispatcher scans for queued rows that are due, so index that path.
CREATE INDEX IF NOT EXISTS idx_messages_due ON messages (status, send_time);
