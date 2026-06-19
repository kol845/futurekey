const { timelockDecrypt, mainnetClient } = require('tlock-js');

// drand mainnet "quicknet" chain — the one that supports timelock encryption.
// The decryption key for a future round literally does not exist until that
// round is published by the network, so nothing here (including this server)
// can recover a password before its send_time.
const client = mainnetClient();

/**
 * Decrypt a tlock ciphertext back to the original password.
 *
 * @param {string} ciphertext - AGE-armored tlock blob produced in the browser.
 * @returns {Promise<string>} the plaintext password.
 * @throws if the target round has not been reached yet (see isTooEarly).
 */
async function decryptPassword(ciphertext) {
  const buf = await timelockDecrypt(ciphertext, client);
  return buf.toString('utf8');
}

/**
 * True when a decrypt failed only because the drand round isn't published yet
 * (e.g. minor clock skew between us and the beacon). Such a message should stay
 * queued and be retried on the next tick, not marked failed.
 */
function isTooEarly(err) {
  return /too early/i.test(err && err.message ? err.message : '');
}

module.exports = { decryptPassword, isTooEarly };
