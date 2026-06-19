import { useState } from 'react';
import {
  generatePassword,
  MIN_LENGTH,
  MAX_LENGTH,
  DEFAULT_LENGTH,
} from '../lib/password.js';
import { encryptForTime } from '../lib/timelock.js';
import { sendPasswordToTheFuture } from '../lib/api.js';
import ClockPicker from './ClockPicker.jsx';

const IDLE = { type: 'idle' };

function formatDate(dateStr, hour, minute) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d, hour, minute);
  return dt.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function PasswordForm() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(DEFAULT_LENGTH);
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState({ hour: 0, minute: 0 });
  const [status, setStatus] = useState(IDLE);

  function clampLength(n) {
    return Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, n));
  }

  function handleGenerate() {
    setPassword(generatePassword(length));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(IDLE);

    if (!password) return setStatus({ type: 'error', message: 'Enter or generate a password.' });
    if (!email) return setStatus({ type: 'error', message: 'Enter a recipient email.' });
    if (!date) return setStatus({ type: 'error', message: 'Pick a delivery date.' });

    const [year, month, day] = date.split('-').map(Number);
    const sendTime = new Date(year, month - 1, day, time.hour, time.minute, 0, 0).getTime();

    // The password is timelock-encrypted to this exact moment, so it must be in
    // the future — a timelock can only point forward.
    if (sendTime <= Date.now()) {
      return setStatus({
        type: 'error',
        message: 'Pick a future date and time — a timelock can only point forward.',
      });
    }

    setStatus({ type: 'loading', message: 'Locking your key to the future…' });
    try {
      // Encrypt in the browser. The plaintext never leaves this page; the server
      // only ever stores a blob nobody can open until the delivery time.
      const ciphertext = await encryptForTime(password, sendTime);
      await sendPasswordToTheFuture({ payload: ciphertext, encrypted: true, email, sendTime });
      setStatus({
        type: 'success',
        message: `Sealed. ${email} gets the key around ${formatDate(date, time.hour, time.minute)} — until then nobody can open it, not even us.`,
      });
      setPassword('');
      setEmail('');
      setDate('');
      setTime({ hour: 0, minute: 0 });
      setLength(DEFAULT_LENGTH);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  }

  const loading = status.type === 'loading';

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="field">
        <span className="field__label">Password</span>
        <div className="field__row">
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type one or let Kee roll it"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className="btn btn--ghost" onClick={handleGenerate}>
            Generate
          </button>
        </div>
        <div className="field__row field__row--sub">
          <span className="field__sublabel">Length</span>
          <div className="stepper">
            <button
              type="button"
              onClick={() => setLength((l) => clampLength(l - 1))}
              aria-label="Shorter"
            >
              −
            </button>
            <span className="stepper__value">{length}</span>
            <button
              type="button"
              onClick={() => setLength((l) => clampLength(l + 1))}
              aria-label="Longer"
            >
              +
            </button>
          </div>
          <span className="field__hint">upper · lower · number · symbol</span>
        </div>
      </div>

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

      <label className="field">
        <span className="field__label">Deliver on</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </label>

      <div className="field">
        <span className="field__label">At what time</span>
        <ClockPicker hour={time.hour} minute={time.minute} onChange={setTime} />
        <p className="field__hint">Leave it at 12:00 AM for midnight.</p>
      </div>

      <button type="submit" className="btn btn--primary" disabled={loading}>
        {loading ? 'Locking…' : 'Send my key to the future'}
      </button>

      <p className="field__hint">
        Set this as your account password now. Kee encrypts it in your browser, so
        it can only be unlocked on the delivery date — by anyone, including you.
      </p>

      {status.type === 'loading' && <p className="status">{status.message}</p>}
      {status.type === 'error' && <p className="status status--error">{status.message}</p>}
      {status.type === 'success' && <p className="status status--success">🔒 {status.message}</p>}
    </form>
  );
}
