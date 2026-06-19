const path = require('path');

/**
 * Apply any pending database migrations (forward only) on boot.
 *
 * Uses node-pg-migrate, which records applied migrations in a `pgmigrations`
 * table, so each file in ../../migrations runs exactly once — including against
 * an already-created database like Neon. node-pg-migrate v8 is ESM-only, hence
 * the dynamic import from this CommonJS module.
 */
async function runMigrations() {
  const { runner } = await import('node-pg-migrate');

  // Match pool.js: local Postgres doesn't use SSL; hosted (Neon/Render) does.
  const isLocal = /@(localhost|127\.0\.0\.1)/.test(process.env.DATABASE_URL || '');

  await runner({
    databaseUrl: {
      connectionString: process.env.DATABASE_URL,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    },
    dir: path.join(__dirname, '..', '..', 'migrations'),
    direction: 'up',
    count: Infinity,
    migrationsTable: 'pgmigrations',
  });
}

module.exports = { runMigrations };
