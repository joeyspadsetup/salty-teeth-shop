import { firebaseConfig, isConfigured } from './firebase-config.js';

const CATEGORY_ICONS = {
  necklace: `<svg viewBox="0 0 100 100" class="placeholder-icon" fill="none" stroke="#1d3557" stroke-width="2.5"><path d="M20 20 Q50 70 80 20" stroke-linecap="round"/><circle cx="50" cy="66" r="4" fill="#1d3557" stroke="none"/><path d="M50 70 L58 86 L42 86 Z" fill="#7c9c96" stroke="none"/></svg>`,
  bracelet: `<svg viewBox="0 0 100 100" class="placeholder-icon" fill="none" stroke="#1d3557" stroke-width="2.5"><ellipse cx="50" cy="50" rx="34" ry="20"/><circle cx="20" cy="50" r="3" fill="#4fb3bf" stroke="none"/><circle cx="35" cy="32" r="3" fill="#7c9c96" stroke="none"/><circle cx="65" cy="32" r="3" fill="#8fd3d6" stroke="none"/><circle cx="80" cy="50" r="3" fill="#2e8b94" stroke="none"/></svg>`,
  earrings: `<svg viewBox="0 0 100 100" class="placeholder-icon" fill="none" stroke="#1d3557" stroke-width="2.5"><circle cx="35" cy="22" r="5"/><path d="M35 27 L35 55 L27 72 L43 72 Z" fill="#7c9c96" stroke="none"/><circle cx="65" cy="22" r="5"/><path d="M65 27 L65 55 L57 72 L73 72 Z" fill="#7c9c96" stroke="none"/></svg>`,
  keychain: `<svg viewBox="0 0 100 100" class="placeholder-icon" fill="none" stroke="#1d3557" stroke-width="2.5"><circle cx="50" cy="24" r="12"/><path d="M50 36 L50 55 L38 78 L62 78 Z" fill="#2e8b94" stroke="none"/></svg>`,
};

const SAMPLE_PRODUCTS = [
  { id: 's1', name: 'Single Tooth Necklace', category: 'necklace', price: 28, description: 'A single hand-collected shark tooth, wire-wrapped onto an adjustable cord.', status: 'available', isSample: true },
  { id: 's2', name: 'Turquoise Drop Earrings', category: 'earrings', price: 22, description: 'Wire-wrapped shark tooth earrings with turquoise accent beads.', status: 'available', isSample: true },
  { id: 's3', name: 'Sea Glass & Stone Bracelet', category: 'bracelet', price: 24, description: 'Adjustable cord bracelet with mixed gemstone beads and a shell charm.', status: 'available', isSample: true },
  { id: 's4', name: 'Triple Tooth Keychain', category: 'keychain', price: 18, description: 'Three wire-wrapped shark teeth with turquoise beads on a swivel clip.', status: 'available', isSample: true },
  { id: 's5', name: 'Scallop Shell Pendant Necklace', category: 'necklace', price: 32, description: 'A hand-collected scallop shell pendant on a beaded cord.', status: 'sold', isSample: true },
  { id: 's6', name: 'Layered Bead Necklace', category: 'necklace', price: 30, description: 'Multi-strand sage green beaded necklace with a shell pendant.', status: 'available', isSample: true },
];

const grid = document.getElementById('product-grid');
const emptyNote = document.getElementById('shop-empty-note');
const devBanner = document.getElementById('dev-banner');
const filterBar = document.getElementById('filters');

let currentProducts = [];
let currentFilter = 'all';

function money(n) {
  return `$${Number(n).toFixed(2).replace(/\.00$/, '')}`;
}

function renderProducts() {
  const filtered = currentFilter === 'all'
    ? currentProducts
    : currentProducts.filter(p => p.category === currentFilter);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyNote.hidden = false;
    return;
  }
  emptyNote.hidden = true;

  grid.innerHTML = filtered.map(p => {
    const photo = p.photoURL
      ? `<img src="${p.photoURL}" alt="${escapeHtml(p.name)}" loading="lazy">`
      : (CATEGORY_ICONS[p.category] || CATEGORY_ICONS.necklace);
    const sold = p.status === 'sold';
    const badge = p.isSample
      ? `<span class="badge sample">Sample</span>`
      : (sold ? `<span class="badge sold">Sold</span>` : '');
    const buyBtn = p.isSample
      ? `<span class="btn btn-disabled">Preview Only</span>`
      : (sold
          ? `<span class="btn btn-disabled">Sold</span>`
          : `<a class="btn btn-buy" href="${escapeHtml(p.stripeLink || '#')}" target="_blank" rel="noopener">Buy Now</a>`);
    return `
      <article class="product-card" data-category="${p.category}">
        <div class="product-photo">${photo}${badge}</div>
        <div class="product-info">
          <h3>${escapeHtml(p.name)}</h3>
          <p class="price">${money(p.price)}</p>
          <p class="desc">${escapeHtml(p.description || '')}</p>
          ${buyBtn}
        </div>
      </article>`;
  }).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

filterBar.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-filter]');
  if (!btn) return;
  filterBar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter = btn.dataset.filter;
  renderProducts();
});

async function initLive() {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js');
  const { getFirestore, collection, query, orderBy, onSnapshot } = await import('https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

  onSnapshot(q, (snapshot) => {
    currentProducts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProducts();
  }, (err) => {
    console.error('Firestore error, falling back to samples:', err);
    currentProducts = SAMPLE_PRODUCTS;
    renderProducts();
  });
}

if (isConfigured) {
  devBanner.hidden = true;
  initLive();
} else {
  devBanner.hidden = false;
  currentProducts = SAMPLE_PRODUCTS;
  renderProducts();
}

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => mainNav.classList.toggle('open'));
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mainNav.classList.remove('open')));
