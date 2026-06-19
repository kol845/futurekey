import { useState } from 'react';
import {
  generatePassword,
  MIN_LENGTH,
  MAX_LENGTH,
  DEFAULT_LENGTH,
} from '../lib/password.js';
import { sendPasswordToTheFuture } from '../lib/api.js';

// "00:00" .. "23:00"
const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`);

const IDLE = { type: 'idle' };

export default function PasswordForm() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [hour, setHour] = useState(''); // '' means midnight (00:00)
  const [status, setStatus] = useState(IDLE);

  function handleGenerate() {
    setPassword(generatePassword(length));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(IDLE);

    if (!password) return setStatus({ type: 'error', message: 'Enter or generate a password.' });
    if (!email) return setStatus({ type: 'error', message: 'Enter a recipient email.' });
    if (!date) return setStatus({ type: 'error', message: 'Pick a delivery date.' });

    // Date is primary; time is optional and defaults to 00:00 of that date.
    // Build a local-time instant, then send epoch ms (UTC) to the backend.
    const [year, month, day] = date.split('-').map(Number);
    const hours = hour ? Number(hour.slice(0, 2)) : 0;
    const sendTime = new Date(year, month - 1, day, hours, 0, 0, 0).getTime();

    if (sendTime <= Date.now()) {
      const proceed = window.confirm(
        'That delivery time is in the past, so the password will be sent on the next hourly run. Continue?'
      );
      if (!proceed) return;
    }

    setStatus({ type: 'loading' });
    try {
      await sendPasswordToTheFuture({ password, email, sendTime });
      setStatus({
        type: 'success',
        message: `Locked in. ${email} will receive the password around ${date} ${hour || '00:00'}.`,
      });
      setPassword('');
      setEmail('');
      setDate('');
      setHour('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  }

  const loading = status.type === 'loading';

  return (
    <form className="card" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Password</span>
        <div className="field__row">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type one or generate it"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="btn btn--ghost" onClick={handleGenerate}>
            Generate
          </button>
        </div>
        <div className="field__row field__row--sub">
          <label className="field__sublabel" htmlFor="length">
            Length: {length}
          </label>
          <input
            id="length"
            type="range"
            min={MIN_LENGTH}
            max={MAX_LENGTH}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
          />
        </div>
      </label>

      <label className="field">
        <span className="field__label">Send to</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </label>

      <div className="field">
        <span className="field__label">Deliver on</span>
        <div className="field__row">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <select value={hour} onChange={(e) => setHour(e.target.value)} aria-label="Delivery hour">
            <option value="">Time (optional)</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <p className="field__hint">No time selected means midnight (00:00) on that date.</p>
      </div>

      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? 'Sending…' : 'Send password to the future'}
      </button>

      {status.type === 'error' && <p className="status status--error">{status.message}</p>}
      {status.type === 'success' && <p className="status status--success">{status.message}</p>}
    </form>
  );
}
