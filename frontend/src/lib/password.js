const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SPECIAL = '!@#$%^&*()-_=+[]{};:,.<>?';

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 64;
export const DEFAULT_LENGTH = 16;

/**
 * Cryptographically random integer in [0, max).
 */
function randomInt(max) {
  const buf = new Uint32Array(1);
  // Reject values in the unfair tail to avoid modulo bias.
  const limit = Math.floor(0xffffffff / max) * max;
  let n;
  do {
    crypto.getRandomValues(buf);
    n = buf[0];
  } while (n >= limit);
  return n % max;
}

/**
 * Generate a random password of the given length containing at least one
 * uppercase letter, lowercase letter, digit, and special character.
 *
 * @param {number} length
 * @returns {string}
 */
export function generatePassword(length = DEFAULT_LENGTH) {
  const len = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, Math.floor(length) || DEFAULT_LENGTH));
  const all = UPPER + LOWER + DIGITS + SPECIAL;

  // Guarantee one of each class, then fill the rest from the full set.
  const chars = [
    UPPER[randomInt(UPPER.length)],
    LOWER[randomInt(LOWER.length)],
    DIGITS[randomInt(DIGITS.length)],
    SPECIAL[randomInt(SPECIAL.length)],
  ];
  while (chars.length < len) {
    chars.push(all[randomInt(all.length)]);
  }

  // Fisher-Yates shuffle so the guaranteed characters are not always up front.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}
