const db = require('../db/messages');
const { sendPasswordEmail } = require('../services/email');
const { decryptPassword, isTooEarly } = require('../services/timelock');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AGE_HEADER = '-----BEGIN AGE ENCRYPTED FILE-----';
const MAX_CIPHERTEXT_LEN = 16384; // a tlock blob for a password is well under 1 KB
const MAX_PLAINTEXT_LEN = 256;

/**
 * Validate input and queue a password for future delivery.
 *
 * Two modes, distinguished by `encrypted`:
 *   - encrypted (default): `payload` is a tlock blob the server cannot open until
 *     its drand round is reached. Plaintext can never be uploaded by mistake.
 *   - plaintext: `payload` is the password itself, stored readable on the server.
 *
 * @param {{ payload?: unknown, encrypted?: unknown, email?: unknown, sendTime?: unknown }} body
 * @returns {Promise<{ id: number }>}
 * @throws {ValidationError} on bad input
 */
async function queuePassword(body) {
  const payload = typeof body.payload === 'string' ? body.payload.trim() : '';
  const encrypted = body.encrypted !== false; // default to the safe (encrypted) mode
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const sendTime = Number(body.sendTime);

  if (!payload) throw new ValidationError('payload is required');

  if (encrypted) {
    if (payload.length > MAX_CIPHERTEXT_LEN) throw new ValidationError('payload is too large');
    // Enforce that an "encrypted" payload really is a tlock blob.
    if (!payload.startsWith(AGE_HEADER)) {
      throw new ValidationError('encrypted payload must be a timelock-encrypted blob');
    }
  } else if (payload.length > MAX_PLAINTEXT_LEN) {
    throw new ValidationError(`plaintext password must be at most ${MAX_PLAINTEXT_LEN} characters`);
  }

  if (!EMAIL_RE.test(email)) throw new ValidationError('a valid email is required');
  if (!Number.isFinite(sendTime)) throw new ValidationError('sendTime must be a number (epoch ms)');

  return db.insertMessage({ payload, encrypted, email, sendTime });
}

/**
 * Send every queued message that is due. Encrypted messages are decrypted first
 * (only possible once their drand round is published); plaintext messages are
 * sent as-is. Idempotent and safe to call anytime.
 *
 * @returns {Promise<{ due: number, sent: number, failed: number, notReady: number }>}
 */
async function dispatchDue() {
  const due = await db.getDueMessages();
  let sent = 0;
  let failed = 0;
  let notReady = 0;

  for (const message of due) {
    try {
      const password = message.encrypted
        ? await decryptPassword(message.payload)
        : message.payload;
      await sendPasswordEmail({ email: message.email, password });
      await db.markSent(message.id);
      sent += 1;
    } catch (err) {
      if (message.encrypted && isTooEarly(err)) {
        // drand round not published yet (clock skew). Leave queued, retry later.
        console.warn(`Message ${message.id} not yet decryptable; leaving queued.`);
        notReady += 1;
        continue;
      }
      console.error(`Failed to send message ${message.id}:`, err.message);
      await db.markFailed(message.id);
      failed += 1;
    }
  }

  return { due: due.length, sent, failed, notReady };
}

class ValidationError extends Error {}

module.exports = { queuePassword, dispatchDue, ValidationError };
