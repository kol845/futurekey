require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { runMigrations } = require('./db/migrate');
const { getCounts } = require('./db/messages');
const messagesRoutes = require('./routes/messages');
const cronRoutes = require('./routes/cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from any origin. There are no cookies/sessions here, and the
// only sensitive endpoint (/cron/dispatch) is guarded by CRON_SECRET, so an
// open CORS policy is safe and keeps the API reachable from anywhere.
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const counts = await getCounts();
    res.json({
      ok: true,
      pending: counts.queued, // queued, not yet sent
      sent: counts.sent, // delivered
      failed: counts.failed, // attempted but errored
    });
  } catch (err) {
    // Stay a passing liveness check even if the DB is unreachable, so the
    // platform health check doesn't flap; flag the DB so it's visible.
    console.error('Health DB query failed:', err.message);
    res.json({ ok: true, db: 'unavailable' });
  }
});

app.use('/api', messagesRoutes);
app.use('/cron', cronRoutes);

async function start() {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`FutureKey API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
