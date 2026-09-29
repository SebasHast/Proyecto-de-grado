const form = document.getElementById('accessForm');
const message = document.getElementById('accessMessage');
let config;
fetch('/api/public-config').then(response => response.json()).then(value => { config = value; if (!value.configured) message.textContent = 'El inicio de sesión requiere configurar Supabase en el servidor. Puedes seguir explorando como invitado.'; }).catch(() => { message.textContent = 'El servidor de cuentas no está conectado. Puedes explorar como invitado.'; });
fetch('../../header.html').then(r => r.text()).then(html => { document.getElementById('header').innerHTML = html; }).catch(() => {});
async function account(action) {
  if (!config?.configured) throw new Error('Configura Supabase antes de crear cuentas o iniciar sesión.');
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const url = action === 'login' ? `${config.url}/auth/v1/token?grant_type=password` : `${config.url}/auth/v1/signup`;
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: config.anonKey }, body: JSON.stringify({ email, password }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.msg || data.message || data.error_description || 'No se pudo completar el acceso.');
  if (data.access_token) {
    sessionStorage.setItem('novum.accessToken', data.access_token);
    sessionStorage.setItem('novum.userEmail', data.user?.email || email);
    try { const roleResponse = await fetch('/api/admin', { headers: { Authorization: `Bearer ${data.access_token}` } }); if (roleResponse.ok) { location.href = './admin.html'; return; } } catch {}
    message.textContent = 'Sesión iniciada como cliente. Puedes continuar explorando.';
    location.href = '../../index.html';
  } else message.textContent = 'Cuenta creada. Revisa tu correo para confirmar la dirección y luego inicia sesión.';
}
form.addEventListener('submit', async event => { event.preventDefault(); message.textContent = 'Conectando…'; try { await account('login'); } catch (error) { message.textContent = error.message; } });
document.getElementById('signupButton').addEventListener('click', async () => { if (!form.reportValidity()) return; message.textContent = 'Creando cuenta…'; try { await account('signup'); } catch (error) { message.textContent = error.message; } });
