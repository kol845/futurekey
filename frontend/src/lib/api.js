const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Queue a password for future delivery.
 *
 * @param {{ password: string, email: string, sendTime: number }} payload
 *        sendTime is epoch milliseconds (UTC).
 * @returns {Promise<{ id: number }>}
 */
export async function sendPasswordToTheFuture(payload) {
  const res = await fetch(`${API_URL}/api/sendPasswordToTheFuture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
