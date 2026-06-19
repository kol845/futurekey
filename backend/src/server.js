require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { initSchema } = require('./db/pool');
const messagesRoutes = require('./routes/messages');
const cronRoutes = require('./routes/cron');

const app = express();
const PORT = process.env.PORT || 3001;
const origin = process.env.FRONTEND_ORIGIN || '*';

app.use(cors({ origin }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api', messagesRoutes);
app.use('/cron', cronRoutes);

async function start() {
  await initSchema();
  app.listen(PORT, () => {
    console.log(`FutureKey API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
