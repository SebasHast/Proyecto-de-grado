import { authenticatedUser, json, settings } from './_supabase.js';

export default async function handler(req, res) {
  if (!settings()) return json(res, 503, { error: 'Falta configurar Supabase en el servidor.' });
  const user = await authenticatedUser(req);
  if (!user) return json(res, 401, { error: 'Inicia sesión para continuar.' });
  if (user.role !== 'admin') return json(res, 403, { error: 'Esta cuenta no tiene permisos de administrador.' });
  if (req.method === 'GET') {
    const response = await fetch(`${user.cfg.url}/rest/v1/catalog_products?select=data,active&order=updated_at.desc`, { headers: { apikey: user.cfg.service, Authorization: `Bearer ${user.cfg.service}` } });
    if (!response.ok) return json(res, 502, { error: 'No se pudo cargar el inventario.' });
    return json(res, 200, (await response.json()).map(row => ({ ...row.data, active: row.active })));
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido.' });
  let products;
  try { products = req.body?.products; } catch { products = null; }
  if (!Array.isArray(products) || products.length > 1000 || products.some(p => !p?.id || !p?.name || !p?.brand || !p?.category || !p?.color || [p.id, p.name, p.brand, p.category, p.color].some(value => typeof value !== 'string' || value.length > 180 || /[<>]/.test(value)) || (p.officialUrl && !/^https:\/\//i.test(p.officialUrl)) || (p.image && !(/^https:\/\//i.test(p.image) || /^\.\.\/Imagenes\/[\w./-]+$/i.test(p.image))) || !Number.isFinite(Number(p.price)) || Number(p.price) < 0)) return json(res, 400, { error: 'Revisa los datos; usa texto simple, imagen permitida y enlaces HTTPS.' });
  const rows = products.map(data => ({ id: String(data.id), data, active: data.active !== false, updated_at: new Date().toISOString(), updated_by: user.id }));
  const response = await fetch(`${user.cfg.url}/rest/v1/catalog_products?on_conflict=id`, { method: 'POST', headers: { apikey: user.cfg.service, Authorization: `Bearer ${user.cfg.service}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
  if (!response.ok) return json(res, 502, { error: 'No se pudieron guardar los cambios.' });
  return json(res, 200, { saved: rows.length });
}
