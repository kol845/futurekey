const { pool } = require('./pool');

/**
 * Queue a new password to be delivered in the future.
 *
 * @param {{ password: string, email: string, sendTime: number }} msg
 *        sendTime is epoch milliseconds (UTC).
 * @returns {Promise<{ id: number }>}
 */
async function insertMessage({ password, email, sendTime }) {
  const result = await pool.query(
    `INSERT INTO messages (password, email, send_time)
     VALUES ($1, $2, to_timestamp($3 / 1000.0))
     RETURNING id`,
    [password, email, sendTime]
  );
  return result.rows[0];
}

/**
 * Fetch all queued messages whose send_time has passed.
 */
async function getDueMessages() {
  const result = await pool.query(
    `SELECT id, password, email, send_time
     FROM messages
     WHERE status = 'queued' AND send_time <= now()
     ORDER BY send_time ASC`
  );
  return result.rows;
}

async function markSent(id) {
  await pool.query(
    `UPDATE messages SET status = 'sent', sent_at = now() WHERE id = $1`,
    [id]
  );
}

async function markFailed(id) {
  await pool.query(`UPDATE messages SET status = 'failed' WHERE id = $1`, [id]);
}

/**
 * Count messages grouped by status.
 *
 * @returns {Promise<{ queued: number, sent: number, failed: number }>}
 */
async function getCounts() {
  const result = await pool.query(
    `SELECT status, COUNT(*)::int AS count FROM messages GROUP BY status`
  );
  const counts = { queued: 0, sent: 0, failed: 0 };
  for (const row of result.rows) {
    counts[row.status] = row.count;
  }
  return counts;
}

module.exports = { insertMessage, getDueMessages, markSent, markFailed, getCounts };
