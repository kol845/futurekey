const db = require('../db/messages');
const { sendPasswordEmail } = require('../services/email');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PASSWORD_LEN = 256;

/**
 * Validate input and queue a password for future delivery.
 *
 * @param {{ password?: unknown, email?: unknown, sendTime?: unknown }} body
 * @returns {Promise<{ id: number }>}
 * @throws {ValidationError} on bad input
 */
async function queuePassword(body) {
  const password = typeof body.password === 'string' ? body.password : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const sendTime = Number(body.sendTime);

  if (!password) throw new ValidationError('password is required');
  if (password.length > MAX_PASSWORD_LEN) {
    throw new ValidationError(`password must be at most ${MAX_PASSWORD_LEN} characters`);
  }
  if (!EMAIL_RE.test(email)) throw new ValidationError('a valid email is required');
  if (!Number.isFinite(sendTime)) throw new ValidationError('sendTime must be a number (epoch ms)');

  return db.insertMessage({ password, email, sendTime });
}

/**
 * Send every queued message that is due. Idempotent and safe to call anytime.
 *
 * @returns {Promise<{ due: number, sent: number, failed: number }>}
 */
async function dispatchDue() {
  const due = await db.getDueMessages();
  let sent = 0;
  let failed = 0;

  for (const message of due) {
    try {
      await sendPasswordEmail(message);
      await db.markSent(message.id);
      sent += 1;
    } catch (err) {
      console.error(`Failed to send message ${message.id}:`, err.message);
      await db.markFailed(message.id);
      failed += 1;
    }
  }

  return { due: due.length, sent, failed };
}

class ValidationError extends Error {}

module.exports = { queuePassword, dispatchDue, ValidationError };
