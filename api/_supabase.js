export const config = { runtime: 'nodejs' };

export function settings() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && anon && service ? { url, anon, service } : null;
}

export async function authenticatedUser(req) {
  const cfg = settings();
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!cfg || !token) return null;
  const response = await fetch(`${cfg.url}/auth/v1/user`, { headers: { apikey: cfg.anon, Authorization: `Bearer ${token}` } });
  if (!response.ok) return null;
  const user = await response.json();
  const roleResponse = await fetch(`${cfg.url}/rest/v1/user_roles?select=role&user_id=eq.${encodeURIComponent(user.id)}`, { headers: { apikey: cfg.service, Authorization: `Bearer ${cfg.service}` } });
  if (!roleResponse.ok) return null;
  const [record] = await roleResponse.json();
  return { ...user, role: record?.role || 'customer', cfg };
}

export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').end(JSON.stringify(body));
}
