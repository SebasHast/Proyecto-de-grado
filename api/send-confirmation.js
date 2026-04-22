// api/send-confirmation.js
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, code } = req.body || {};
  if (!email || !code) return res.status(400).json({ error: 'Missing email or code' });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY); // la clave del servicio de correos
    await resend.emails.send({
      from: 'Clothes <noreply@tudominio.com>',
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
