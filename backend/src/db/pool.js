const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
}

// Render Postgres (and most hosted Postgres) require SSL. Local Postgres usually
// does not, so only force SSL when the host is not localhost.
const isLocal = /@(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

/**
 * Create the messages table if it does not exist. Run once on boot.
 */
async function initSchema() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
}

module.exports = { pool, initSchema };
