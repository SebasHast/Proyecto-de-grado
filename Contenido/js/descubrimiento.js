const searchProducts = window.CLOTHES_PRODUCTS || [];
const stylePages = [
  { name: 'Streetwear', slug: 'streetwear', image: '../Imagenes/Samples/Streetwear_hombre.jpg' },
  { name: 'Old Money', slug: 'old-money', image: '../Imagenes/Samples/Casual_mujer.jpg' },
  { name: 'Y2K', slug: 'y2k', image: '../Imagenes/Samples/Summer_mujer.jpg' },
  { name: 'Minimalista', slug: 'minimalista', image: '../Imagenes/Samples/Basico_hombre.jpg' },
  { name: 'Vintage', slug: 'vintage', image: '../Imagenes/Samples/Casual_mujer.jpg' },
  { name: 'Casual', slug: 'casual', image: '../Imagenes/Samples/Casual_hombre.jpg' },
  { name: 'Formal', slug: 'formal', image: '../Imagenes/Samples/Basico_mujer.jpg' },
  { name: 'Techwear', slug: 'techwear', image: '../Imagenes/Marcas/Undergold/undergold_hoodie_1.jpg' }
];
const demoBrands = [
  { name: 'Savage', logo: '../Imagenes/Marcas/Savage/savage_logo.png', note: 'Marca colombiana incluida en el catálogo.', url: '' },
  { name: 'True', logo: '../Imagenes/Marcas/True/true_logo.png', note: 'Marca colombiana incluida en el catálogo.', url: '' },
  { name: 'Undergold', logo: '../Imagenes/Marcas/Undergold/undergold_logo.png', note: 'Marca colombiana incluida en el catálogo.', url: '' },
  { name: 'Weedgreen', logo: '../Imagenes/Marcas/Weedgreen/weedgreen_logo.png', note: 'Marca colombiana incluida en el catálogo.', url: '' },
  { name: 'Buds', logo: '', note: 'Marca colombiana de ropa urbana; consulta su catálogo oficial antes de comprar.', url: 'https://www.buds.com.co/' },
  { name: 'ZIPRE', logo: '', note: 'Marca de moda sostenible con base en Bogotá y prendas hechas en Colombia.', url: 'https://zipre.co/' },
  { name: 'Kame.col', logo: '', note: 'Marca de ropa urbana de Bogotá con confección colombiana.', url: 'https://www.kamecol.com/' }
];
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const brandHost = document.getElementById('brandGrid');
if (brandHost) {
  brandHost.innerHTML = demoBrands.map((brand, index) => {
    const products = searchProducts.filter(product => product.brand === brand.name);
    const preview = products[0];
    return `<article class="brand-directory-card"><a href="./buscar.html?q=${encodeURIComponent(brand.name)}" class="brand-image"><img src="${preview.image}" alt="Prenda de muestra asociada a ${brand.name}" loading="lazy"><span>0${index + 1} / MARCA COLOMBIANA</span></a><div class="brand-directory-info">${brand.logo ? `<img class="brand-directory-logo" src="${brand.logo}" alt="" loading="lazy">` : ''}<h2>${brand.name}</h2><p>${esc(brand.note)}</p><div class="brand-facts"><span>Categorías: ${[...new Set(products.map(product => product.category))].join(' · ')}</span><span>Estilos: ${[...new Set(products.flatMap(product => product.styles))].join(' · ')}</span><span>${products.length} ${products.length === 1 ? 'prenda' : 'prendas'}</span>${brand.url ? `<span>Canal oficial: <a href="${brand.url}" target="_blank" rel="noopener noreferrer">visitar marca</a></span>` : ''}</div><a class="text-link" href="./buscar.html?q=${encodeURIComponent(brand.name)}">Explorar prendas <i class="fa-solid fa-arrow-right ms-2" aria-hidden="true"></i></a></div></article>`;
  }).join('');
}

const searchInput = document.getElementById('globalSearch');
const resultsHost = document.getElementById('searchResults');
if (searchInput && resultsHost) {
  const params = new URLSearchParams(window.location.search);
  searchInput.value = params.get('q') || '';
  const styles = stylePages;
  const productPage = product => product.audience === 'mujer' ? 'ropa_mujer.html' : product.audience === 'hombre' ? 'ropa_hombre.html' : 'unisex.html';
  const formatPrice = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  function renderSearch() {
    const query = searchInput.value.trim().toLocaleLowerCase('es');
    const words = query.split(/\s+/).filter(Boolean);
    const matches = value => words.every(word => value.toLocaleLowerCase('es').includes(word));
    const products = searchProducts.filter(product => matches(`${product.name} ${product.brand} ${product.category} ${product.styles.join(' ')}`));
    const brands = demoBrands.filter(brand => matches(`${brand.name} marca`));
    const matchedStyles = styles.filter(style => matches(style.name));
    const categories = [...new Set(searchProducts.map(product => product.category))].filter(category => matches(category));
    document.getElementById('searchSummary').textContent = query ? `${products.length + brands.length + matchedStyles.length + categories.length} resultados para “${searchInput.value.trim()}”.` : 'Busca prendas, marcas, estilos o categorías.';
    if (!query) {
      resultsHost.innerHTML = `<section class="search-group"><h2>Marcas para descubrir</h2><div class="search-brand-list">${demoBrands.map(brand => `<a href="./buscar.html?q=${encodeURIComponent(brand.name)}">${brand.logo ? `<img src="${brand.logo}" alt="" loading="lazy">` : ''}<span>${brand.name}</span><i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`).join('')}</div></section><section class="search-group"><h2>Explora estilos</h2><div class="search-style-list">${styles.map(style => `<a href="./estilo_${style.slug}.html">${style.name}<i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`).join('')}</div></section>`;
      return;
    }
    const brandResults = brands.map(brand => `<a class="search-brand-result" href="./buscar.html?q=${encodeURIComponent(brand.name)}">${brand.logo ? `<img src="${brand.logo}" alt="" loading="lazy">` : ''}<span>Marca · ${brand.name}</span><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`).join('');
    const styleResults = matchedStyles.map(style => `<a class="search-style-result" href="./estilo_${style.slug}.html"><span>Estilo</span><strong>${style.name}</strong><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`).join('');
    const categoryResults = categories.map(category => `<a class="search-style-result" href="./ropa_hombre.html?q=${encodeURIComponent(category)}"><span>Categoría</span><strong>${category}</strong><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></a>`).join('');
    const productResults = products.map(product => `<article class="search-product"><a href="./${productPage(product)}?q=${encodeURIComponent(product.name)}" class="search-product-image"><img src="${product.image}" alt="${esc(product.name)} de ${esc(product.brand)}" loading="lazy"></a><div>${product.logo ? `<img class="search-product-logo" src="${product.logo}" alt="" loading="lazy">` : ''}<h3>${esc(product.name)}</h3><p>${esc(product.brand)} · ${esc(product.category)}</p><span>${formatPrice(product.price)} <small>${product.source === 'muestra' ? 'precio referencial' : 'precio consultado; puede cambiar'}</small></span>${product.officialUrl ? `<a class="text-link" href="${product.officialUrl}" target="_blank" rel="noopener noreferrer">Ver en tienda oficial</a>` : ''}</div></article>`).join('');
    resultsHost.innerHTML = `${brandResults || styleResults || categoryResults ? `<section class="search-group"><h2>Marcas, estilos y categorías</h2><div class="search-quick-results">${brandResults}${styleResults}${categoryResults}</div></section>` : ''}${productResults ? `<section class="search-group"><h2>Prendas <span>${products.length}</span></h2><div class="search-product-grid">${productResults}</div></section>` : ''}${!brandResults && !styleResults && !categoryResults && !productResults ? '<p class="catalog-empty">No encontramos resultados. Prueba con otra palabra.</p>' : ''}`;
  }
  searchInput.addEventListener('input', renderSearch);
  renderSearch();
}
