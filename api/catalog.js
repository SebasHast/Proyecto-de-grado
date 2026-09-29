import { settings, json } from './_supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido.' });
  const cfg = settings();
  if (!cfg) return json(res, 503, { error: 'Catálogo remoto no configurado.' });
  try {
    const response = await fetch(`${cfg.url}/rest/v1/catalog_products?select=data,active&order=updated_at.desc`, { headers: { apikey: cfg.service, Authorization: `Bearer ${cfg.service}` } });
    if (!response.ok) return json(res, 502, { error: 'No se pudo leer el catálogo.' });
    const rows = await response.json();
    return json(res, 200, rows.map(row => ({ ...row.data, active: row.active })));
  } catch { return json(res, 502, { error: 'No se pudo leer el catálogo.' }); }
}
