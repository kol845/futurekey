const express = require('express');
const { queuePassword, ValidationError } = require('../controller/messages');

const router = express.Router();

/**
 * POST /api/sendPasswordToTheFuture
 * Body: { password: string, email: string, sendTime: number (epoch ms) }
 */
router.post('/sendPasswordToTheFuture', async (req, res) => {
  try {
    const { id } = await queuePassword(req.body || {});
    res.status(201).json({ id });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Error queueing password:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
