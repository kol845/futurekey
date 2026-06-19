const express = require('express');
const { dispatchDue } = require('../controller/messages');

const router = express.Router();

/**
 * POST /cron/dispatch
 * Protected by CRON_SECRET. An external scheduler (GitHub Actions, cron-job.org,
 * UptimeRobot) calls this once an hour at xx:00 to deliver due passwords.
 *
 * Auth: header `Authorization: Bearer <CRON_SECRET>` or `?key=<CRON_SECRET>`.
 */
router.post('/dispatch', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  const header = req.get('authorization') || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7) : req.query.key;

  if (!secret || provided !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await dispatchDue();
    res.json(result);
  } catch (err) {
    console.error('Dispatch failed:', err);
    res.status(500).json({ error: 'Dispatch failed' });
  }
});

module.exports = router;
