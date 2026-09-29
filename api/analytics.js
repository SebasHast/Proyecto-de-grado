import { authenticatedUser, json, settings } from './_supabase.js';

export default async function handler(req, res) {
  const cfg = settings();
  if (!cfg) return json(res, 503, { error: 'Estadísticas disponibles cuando se configure Supabase.' });
  if (req.method === 'POST') {
    const { visitorId, productId, kind } = req.body || {};
    if (!/^[0-9a-f-]{36}$/i.test(visitorId || '') || !['heartbeat', 'try-on'].includes(kind)) return json(res, 400, { error: 'Evento inválido.' });
    const headers = { apikey: cfg.service, Authorization: `Bearer ${cfg.service}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' };
    const presence = await fetch(`${cfg.url}/rest/v1/visitor_presence?on_conflict=visitor_id`, { method: 'POST', headers, body: JSON.stringify({ visitor_id: visitorId, last_seen_at: new Date().toISOString() }) });
    if (!presence.ok) return json(res, 502, { error: 'No se pudo registrar la actividad.' });
    if (kind === 'try-on') {
      if (typeof productId !== 'string' || productId.length > 120) return json(res, 400, { error: 'Prenda inválida.' });
      const event = await fetch(`${cfg.url}/rest/v1/try_on_events`, { method: 'POST', headers, body: JSON.stringify({ visitor_id: visitorId, product_id: productId }) });
      if (!event.ok) return json(res, 502, { error: 'No se pudo registrar la prueba.' });
    }
    return json(res, 202, { recorded: true });
  }
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido.' });
  const user = await authenticatedUser(req);
  if (!user) return json(res, 401, { error: 'Inicia sesión para ver las estadísticas.' });
  if (user.role !== 'admin') return json(res, 403, { error: 'Solo administradores pueden ver estadísticas.' });
  const h = { apikey: cfg.service, Authorization: `Bearer ${cfg.service}` };
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const [online, top] = await Promise.all([
    fetch(`${cfg.url}/rest/v1/visitor_presence?select=visitor_id&last_seen_at=gte.${encodeURIComponent(since)}`, { headers: h }),
    fetch(`${cfg.url}/rest/v1/rpc/try_on_summary`, { method: 'POST', headers: { ...h, 'Content-Type': 'application/json' }, body: '{}' })
  ]);
  if (![online, top].every(r => r.ok)) return json(res, 502, { error: 'No se pudieron consultar las estadísticas.' });
  const counts = await top.json();
  const total = counts.reduce((sum, item) => sum + Number(item.tries), 0);
  return json(res, 200, { activeSessions: (await online.json()).length, tryOnTotal: total, tryOnByProduct: counts.map(item => ({ productId: item.product_id, tries: Number(item.tries) })).sort((a, b) => b.tries - a.tries), measuredAt: new Date().toISOString() });
}
