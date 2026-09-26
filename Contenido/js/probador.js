(() => {
  const products = window.CLOTHES_PRODUCTS || [];
  const form = document.getElementById('avatarForm');
  const list = document.getElementById('tryOnItems');
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const profile = () => read('clothes.profile', {gender:'neutro',height:165,weight:60,hair:'short',skin:'#dba77f'});
  const queue = () => read('clothes.tryOnQueue', []);
  const wornIds = () => { const value=read('clothes.worn',[]); return Array.isArray(value)?value:value?[value]:[]; };
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const colorLabel = color => color==='Diseño de muestra'?'Multicolor':color;
  function emitAvatar() {
    const p=profile(), garments=wornIds().map(id=>products.find(product=>product.id===id)).filter(Boolean).map(product=>({id:product.id,category:product.category,color:product.color}));
    document.getElementById('avatarMeasures').textContent=`${p.height} cm · ${p.weight} kg`;
    window.dispatchEvent(new CustomEvent('clothes:avatar-updated',{detail:{profile:p,garments}}));
  }
  function renderCloset() {
    const items=queue().map(id=>products.find(product=>product.id===id)).filter(Boolean);
    if(!items.length){list.innerHTML='<div class="tryon-empty">No has guardado prendas. En el catálogo, pulsa «Probar» para añadir una prenda a este armario.</div>';emitAvatar();return;}
    const wearing=wornIds();
    list.innerHTML=items.map(item=>`<article class="tryon-card"><img src="${item.image}" alt="Prenda genérica ${esc(item.category)} color ${esc(item.color)}" loading="lazy"><div><p class="eyebrow">PRENDA GENÉRICA</p><h3>${esc(item.category)}</h3><p>Color: ${esc(colorLabel(item.color))}</p><div class="tryon-actions"><button type="button" data-wear="${item.id}">${wearing.includes(item.id)?'Quitar del avatar':'Poner en avatar'}</button><button type="button" data-remove-try="${item.id}">Quitar de la lista</button></div></div></article>`).join('');
    list.querySelectorAll('[data-wear]').forEach(button=>button.addEventListener('click',()=>{
      const item=products.find(product=>product.id===button.dataset.wear);let selected=wornIds();
      if(selected.includes(item.id)) selected=selected.filter(id=>id!==item.id);
      else { const top=['Camisetas','Hoodies','Chaquetas','Tops','Camisas'].includes(item.category);const bottom=['Pantalones','Jeans','Shorts','Faldas'].includes(item.category);
        if(top) selected=selected.filter(id=>!['Camisetas','Hoodies','Chaquetas','Tops','Camisas'].includes(products.find(p=>p.id===id)?.category));
        if(bottom) selected=selected.filter(id=>!['Pantalones','Jeans','Shorts','Faldas'].includes(products.find(p=>p.id===id)?.category));
        selected.push(item.id);
      }
      localStorage.setItem('clothes.worn',JSON.stringify(selected));renderCloset();
    }));
    list.querySelectorAll('[data-remove-try]').forEach(button=>button.addEventListener('click',()=>{
      localStorage.setItem('clothes.tryOnQueue',JSON.stringify(queue().filter(id=>id!==button.dataset.removeTry)));
      const remaining=wornIds().filter(id=>id!==button.dataset.removeTry);if(remaining.length)localStorage.setItem('clothes.worn',JSON.stringify(remaining));else localStorage.removeItem('clothes.worn');renderCloset();
    }));
    emitAvatar();
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();const next={gender:document.getElementById('avatarGender').value,height:Number(document.getElementById('avatarHeight').value),weight:Number(document.getElementById('avatarWeight').value),hair:document.getElementById('avatarHair').value,skin:document.getElementById('avatarSkin').value};
    if(next.height<120||next.height>220||next.weight<30||next.weight>250)return;localStorage.setItem('clothes.profile',JSON.stringify(next));emitAvatar();
  });
  document.getElementById('avatarReset').addEventListener('click',()=>{
    localStorage.removeItem('clothes.profile');const defaults={gender:'neutro',height:165,weight:60,hair:'short',skin:'#dba77f'};
    Object.entries(defaults).forEach(([key,value])=>{const input=form.elements[key];if(input)input.value=value;});emitAvatar();
  });
  const saved=profile();Object.entries(saved).forEach(([key,value])=>{const input=form.elements[key];if(input)input.value=value;});
  fetch('../header.html').then(r=>r.text()).then(html=>{
    document.getElementById('header').innerHTML=html;const root=document.documentElement;root.setAttribute('data-theme',localStorage.getItem('theme')||'light');
    const toggle=document.querySelector('[data-action="toggle-theme"]');if(toggle)toggle.addEventListener('click',()=>{const next=root.getAttribute('data-theme')==='dark'?'light':'dark';root.setAttribute('data-theme',next);localStorage.setItem('theme',next);});
    const badge=document.querySelector('[data-cart-count]');if(badge){try{const cart=JSON.parse(localStorage.getItem('clothes.cart')||'[]');badge.textContent=cart.reduce((sum,item)=>sum+(Number(item.quantity)||0),0);badge.hidden=Number(badge.textContent)===0;}catch{badge.hidden=true;}}
  }).catch(console.error);
  renderCloset();
})();
