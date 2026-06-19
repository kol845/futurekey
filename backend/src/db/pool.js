const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

// Render/Neon (and most hosted Postgres) require SSL. Local Postgres usually
// does not, so only force SSL when the host is not localhost.
const isLocal = /@(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

module.exports = { pool };
