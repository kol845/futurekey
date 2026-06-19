import { timelockEncrypt, mainnetClient, roundAt, Buffer } from 'tlock-js';

// drand mainnet "quicknet" — the timelock-capable beacon. All crypto runs
// locally in the browser; we only fetch the public chain info over HTTP.
const client = mainnetClient();

let chainInfoPromise = null;
function getChainInfo() {
  if (!chainInfoPromise) {
    chainInfoPromise = client.chain().info();
  }
  return chainInfoPromise;
}

/**
 * Timelock-encrypt a password so it can only be decrypted at/after `sendTimeMs`.
 * The password never leaves the browser in the clear — only this ciphertext is
 * uploaded, and not even the server can open it before the target time.
 *
 * @param {string} password
 * @param {number} sendTimeMs - epoch milliseconds (UTC) of the delivery time.
 * @returns {Promise<string>} AGE-armored tlock ciphertext.
 */
export async function encryptForTime(password, sendTimeMs) {
  const info = await getChainInfo();
  const round = roundAt(sendTimeMs, info);
  const ciphertext = await timelockEncrypt(round, Buffer.from(password, 'utf8'), client);
  return ciphertext;
}
