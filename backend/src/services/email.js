const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set. Copy .env.example to .env and fill it in.');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.MAIL_FROM || 'FutureKey <onboarding@resend.dev>';

/**
 * Email a queued password to its recipient.
 *
 * @param {{ email: string, password: string }} message
 */
async function sendPasswordEmail({ email, password }) {
  const html = `
    <p>Here is the password you sent to your future self.</p>
    <p style="font-size:18px"><strong>Password:</strong>
      <code>${escapeHtml(password)}</code>
    </p>
    <p>Welcome back. You can use your account again now.</p>
  `;

  const { error } = await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your FutureKey has arrived',
    html,
  });

  if (error) {
    throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

module.exports = { sendPasswordEmail };
