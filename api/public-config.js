import { json, settings } from './_supabase.js';
export default function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido.' });
  const cfg = settings();
  return json(res, 200, cfg ? { configured: true, url: cfg.url, anonKey: cfg.anon } : { configured: false });
}
