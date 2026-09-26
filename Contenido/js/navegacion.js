fetch('../header.html').then(response => { if (!response.ok) throw new Error('No se pudo cargar la navegación'); return response.text(); }).then(html => {
  document.getElementById('header').innerHTML = html;
  const badge = document.querySelector('[data-cart-count]');
  if (badge) { try { const cart = JSON.parse(localStorage.getItem('clothes.cart') || '[]'); badge.textContent = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0); badge.hidden = Number(badge.textContent) === 0; } catch { badge.hidden = true; } }
  const root = document.documentElement;
  const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.setAttribute('data-theme', theme);
  const toggle = document.querySelector('[data-action="toggle-theme"]');
  const icon = toggle && toggle.querySelector('i');
  const syncIcon = () => { if (icon) { icon.classList.toggle('fa-moon', root.getAttribute('data-theme') !== 'dark'); icon.classList.toggle('fa-sun', root.getAttribute('data-theme') === 'dark'); } };
  syncIcon();
  if (toggle) toggle.addEventListener('click', () => { const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; root.setAttribute('data-theme', next); localStorage.setItem('theme', next); syncIcon(); });
}).catch(error => console.error(error));
