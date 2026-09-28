// api/send-confirmation.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // The legacy signup flow stores verification codes in a public Retool API.
  // Keep email sending disabled until that flow is replaced with a private backend.
  if (process.env.ENABLE_EMAIL_VERIFICATION !== 'true') {
    return res.status(503).json({ error: 'Email verification is not configured' });
  }

  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: 'Missing email or code' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)) || !/^\d{6}$/.test(String(code))) {
    return res.status(400).json({ error: 'Invalid email or code' });
  }
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    return res.status(503).json({ error: 'Email sender is not configured' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: email,
      subject: 'Tu código de verificación',
      html: `<p>Tu código es <strong>${code}</strong></p>`
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Email send failed' });
  }
}
