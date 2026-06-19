-- Up Migration
CREATE TABLE messages (
  id          SERIAL PRIMARY KEY,
  payload     TEXT NOT NULL,                    -- timelock ciphertext OR plaintext password (see `encrypted`)
  encrypted   BOOLEAN NOT NULL DEFAULT true,    -- true: tlock (drand) blob; false: stored as plain text
  email       TEXT NOT NULL,
  send_time   TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'queued',   -- queued | sent | failed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at     TIMESTAMPTZ
);

CREATE INDEX idx_messages_due ON messages (status, send_time);

-- Down Migration
DROP TABLE messages;
