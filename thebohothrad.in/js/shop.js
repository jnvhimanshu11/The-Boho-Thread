// ============================================================
// LUXE STORE — shop.js
// Main shop page: products, cart, wishlist, product modal
// ============================================================

import {
  getProducts, getCart, addToCart, removeFromCart, updateCartQty,
  getCartTotal, getCartCount, clearCart, getWishlist, toggleWishlist, isWishlisted,
  getProductReviews, addReview, getAverageRating,
  formatPrice, starsHTML, showToast
} from './store.js';
import { getCurrentUser } from './firebase-config.js';

// ---- STATE ----
let activeCategory = 'All';
let searchQuery    = '';
let currentProduct = null;
let selectedRating = 0;
let listView       = false;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initSearch();
  renderFilters();
  renderProducts();
  initCartPanel();
  initWishPanel();
  initModal();
  updateBadges();

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Listen for auth changes to refresh UI
  window.addEventListener('luxe:authChange', updateBadges);
});

// ---- NAVBAR ----
function initNavbar() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });

  document.getElementById('cartBtn')?.addEventListener('click', openCartPanel);
  document.getElementById('wishBtn')?.addEventListener('click', openWishPanel);
}

// ---- SEARCH ----
function initSearch() {
  const searchToggle  = document.getElementById('searchToggle');
  const searchBarWrap = document.getElementById('searchBarWrap');
  const searchInput   = document.getElementById('searchInput');
  const searchClose   = document.getElementById('searchClose');

  searchToggle?.addEventListener('click', () => {
    searchBarWrap?.classList.add('open');
    setTimeout(() => searchInput?.focus(), 100);
  });
  searchClose?.addEventListener('click', () => {
    searchBarWrap?.classList.remove('open');
    searchQuery = '';
    searchInput && (searchInput.value = '');
    renderProducts();
  });
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderProducts();
  });
}

// ---- FILTERS ----
function renderFilters() {
  const categories = ['All', ...new Set(getProducts().map(p => p.category))];
  const filterRow  = document.getElementById('filterRow');
  if (!filterRow) return;
  filterRow.innerHTML = categories.map(cat => `
    <button class="filter-chip ${activeCategory === cat ? 'active' : ''}"
            onclick="window.__setCategory('${cat}')">${cat}</button>
  `).join('');
}
window.__setCategory = (cat) => { activeCategory = cat; renderFilters(); renderProducts(); };

// ---- PRODUCTS ----
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = getProducts().filter(p => {
    const matchCat  = activeCategory === 'All' || p.category === activeCategory;
    const matchQ    = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery) ||
      (p.tags || []).some(t => t.includes(searchQuery));
    return matchCat && matchQ;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🔍</div><p>No products found matching "${searchQuery || activeCategory}"</p></div>`;
    return;
  }

  grid.className = `products-grid${listView ? ' list-view' : ''}`;
  grid.innerHTML = filtered.map(p => productCardHTML(p)).join('');
}

function productCardHTML(p) {
  const { avg, count } = getAverageRating(p.id);
  const wished = isWishlisted(p.id);
  const cartQty = getCart()[p.id]?.qty || 0;
  const discount = p.original ? Math.round((1 - p.price / p.original) * 100) : 0;

  return `
  <div class="product-card" onclick="window.__openModal(${p.id})">
    <div class="card-inner-wrap">
      <div class="card-img-zone">
        ${p.badge ? `<div class="card-product-badge">${p.badge}</div>` : ''}
        <button class="card-wishlist-btn ${wished ? 'wished' : ''}"
          onclick="event.stopPropagation(); window.__toggleWish(${p.id}, this)"
          title="Wishlist" aria-label="${wished ? 'Remove from wishlist' : 'Add to wishlist'}">
          ${wished ? '❤️' : '🤍'}
        </button>
        <span class="card-img-emoji">${p.emoji}</span>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-rating">
          <span class="card-stars">${avg ? starsHTML(avg) : '☆☆☆☆☆'}</span>
          <span class="card-review-count">${count ? `${avg} (${count})` : 'No reviews'}</span>
        </div>
        <div class="card-footer">
          <div>
            <span class="card-price">${formatPrice(p.price)}</span>
            ${p.original ? `<span class="card-original">${formatPrice(p.original)}</span>` : ''}
            ${discount >= 5 ? `<span style="font-size:0.72rem;color:var(--success);font-weight:700;display:block">${discount}% off</span>` : ''}
          </div>
          <button class="card-add-btn ${cartQty ? 'in-cart' : ''}"
            onclick="event.stopPropagation(); window.__addCart(${p.id})" aria-label="Add to cart">
            ${cartQty ? `✓ ${cartQty} in cart` : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

// Global actions for inline onclick
window.__toggleWish = (id, btn) => {
  const added = toggleWishlist(id);
  btn.classList.toggle('wished', added);
  btn.innerHTML = added ? '❤️' : '🤍';
  const p = getProducts().find(x => x.id === id);
  showToast(added ? `${p.emoji} Added to wishlist` : `Removed from wishlist`, added ? 'success' : 'info');
  updateBadges();
};

window.__addCart = (id) => {
  const result = addToCart(id);
  const p = getProducts().find(x => x.id === id);
  if (result.success) {
    showToast(`${p.emoji} ${p.name} added to cart!`, 'success');
    updateBadges();
    renderProducts();
  } else {
    showToast(result.msg, 'error');
  }
};

// ---- BADGES ----
function updateBadges() {
  const cartBadge = document.getElementById('cartBadge');
  const wishBadge = document.getElementById('wishBadge');
  if (cartBadge) cartBadge.textContent = getCartCount();
  if (wishBadge) {
    const wl = getWishlist();
    wishBadge.textContent = wl.size;
    wishBadge.style.display = wl.size ? '' : 'none';
  }
}

// ---- VIEW TOGGLE ----
document.getElementById('gridViewBtn')?.addEventListener('click', () => {
  listView = false;
  document.getElementById('gridViewBtn')?.classList.add('active');
  document.getElementById('listViewBtn')?.classList.remove('active');
  renderProducts();
});
document.getElementById('listViewBtn')?.addEventListener('click', () => {
  listView = true;
  document.getElementById('listViewBtn')?.classList.add('active');
  document.getElementById('gridViewBtn')?.classList.remove('active');
  renderProducts();
});

// ---- CART PANEL ----
function initCartPanel() {
  document.getElementById('cartClose')?.addEventListener('click', closePanels);
  document.getElementById('panelOverlay')?.addEventListener('click', closePanels);
}

function openCartPanel() { renderCartPanel(); openPanel('cartPanel'); }
function openWishPanel() { renderWishPanel(); openPanel('wishPanel'); }
function openPanel(id) {
  document.getElementById(id)?.classList.add('open');
  document.getElementById('panelOverlay')?.classList.add('open');
}
function closePanels() {
  document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
  document.getElementById('panelOverlay')?.classList.remove('open');
}

function renderCartPanel() {
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  const items = Object.values(getCart()).filter(i => i.qty > 0);

  if (!items.length) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><p>Your cart is empty</p></div>`;
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
        <div class="qty-row">
          <button class="qty-btn" onclick="window.__cartQty(${item.id}, ${item.qty - 1})">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="window.__cartQty(${item.id}, ${item.qty + 1})">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="window.__cartRemove(${item.id})" title="Remove">🗑</button>
    </div>
  `).join('');

  const total = getCartTotal();
  const count = items.reduce((s, i) => s + i.qty, 0);
  foot.innerHTML = `
    <div class="cart-total-row">
      <span class="cart-total-label">Total (${count} item${count !== 1 ? 's' : ''})</span>
      <span class="cart-total-val">${formatPrice(total)}</span>
    </div>
    <a href="pages/checkout.html" class="btn-gold full-btn" style="display:flex;justify-content:center;text-align:center">Proceed to Checkout →</a>
  `;
}

window.__cartQty = (id, qty) => { updateCartQty(id, qty); updateBadges(); renderCartPanel(); renderProducts(); };
window.__cartRemove = (id) => { removeFromCart(id); updateBadges(); renderCartPanel(); renderProducts(); showToast('Item removed from cart', 'info'); };
window.__checkout = () => {
  // Save order to history before clearing
  const items = Object.values(getCart()).filter(i => i.qty > 0);
  if (!items.length) return;
  const orders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
  orders.unshift({
    id: 'ORD-' + Date.now(),
    items: items.map(i => ({ id: i.id, name: i.name, emoji: i.emoji, price: i.price, qty: i.qty })),
    total: getCartTotal(),
    date: new Date().toISOString(),
    status: 'Processing'
  });
  localStorage.setItem('luxe_orders', JSON.stringify(orders.slice(0, 50)));
  clearCart();
  updateBadges();
  renderCartPanel();
  closePanels();
  showToast('🎉 Order placed! Thank you for shopping with LUXE.', 'success', 5000);
};

// ---- WISHLIST PANEL ----
function initWishPanel() {
  document.getElementById('wishClose')?.addEventListener('click', closePanels);
}

function renderWishPanel() {
  const body = document.getElementById('wishBody');
  const wl   = getWishlist();
  if (!wl.size) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">🤍</div><p>Your wishlist is empty</p></div>`;
    return;
  }
  const products = getProducts();
  body.innerHTML = [...wl].map(id => {
    const p = products.find(x => x.id === id);
    if (!p) return '';
    return `
    <div class="cart-item">
      <div class="cart-item-img">${p.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-price">${formatPrice(p.price)}</div>
        <div class="qty-row" style="margin-top:10px;">
          <button class="btn-gold btn-sm" onclick="window.__addCart(${p.id}); renderWishPanel && renderWishPanel()">🛒 Add to Cart</button>
          <button class="btn-danger" onclick="window.__toggleWish(${p.id}); window.__renderWishPanel()">Remove</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
window.__renderWishPanel = () => { updateBadges(); renderWishPanel(); };

// ---- PRODUCT MODAL ----
function initModal() {
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('productModalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('modalAddCart')?.addEventListener('click', () => {
    if (!currentProduct) return;
    window.__addCart(currentProduct.id);
    renderProducts();
  });
  document.getElementById('modalWish')?.addEventListener('click', () => {
    if (!currentProduct) return;
    const btn = document.getElementById('modalWish');
    const added = toggleWishlist(currentProduct.id);
    btn.textContent = added ? '❤️' : '🤍';
    const p = currentProduct;
    showToast(added ? `${p.emoji} Added to wishlist` : 'Removed from wishlist', added ? 'success' : 'info');
    updateBadges();
    renderProducts();
  });
  document.getElementById('submitReviewBtn')?.addEventListener('click', submitReview);

  // Star picker
  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.val);
      document.querySelectorAll('.star-btn').forEach((b, i) => {
        b.classList.toggle('active', i < selectedRating);
      });
    });
  });
}

window.__openModal = (id) => {
  const products = getProducts();
  currentProduct = products.find(p => p.id === id);
  if (!currentProduct) return;

  const { avg, count } = getAverageRating(id);
  const wished = isWishlisted(id);
  const discount = currentProduct.original
    ? Math.round((1 - currentProduct.price / currentProduct.original) * 100) : 0;

  document.getElementById('modalImg').innerHTML   = `<span style="font-size:5.5rem">${currentProduct.emoji}</span>`;
  document.getElementById('modalCat').textContent = currentProduct.category;
  document.getElementById('modalName').textContent= currentProduct.name;
  document.getElementById('modalDesc').textContent= currentProduct.desc || '';
  document.getElementById('modalPrice').textContent   = formatPrice(currentProduct.price);
  document.getElementById('modalOriginal').textContent= currentProduct.original ? formatPrice(currentProduct.original) : '';
  document.getElementById('modalDiscount').textContent= discount >= 5 ? `${discount}% off` : '';
  document.getElementById('modalRatingRow').innerHTML = avg
    ? `<span class="modal-stars">${starsHTML(avg)}</span><span class="modal-rating-count">${avg} · ${count} review${count !== 1 ? 's' : ''}</span>`
    : `<span class="modal-rating-count" style="color:var(--text-muted)">No reviews yet</span>`;
  document.getElementById('modalWish').textContent = wished ? '❤️' : '🤍';
  document.getElementById('modalWish').classList.toggle('wished', wished);

  // Full details link
  const viewFull = document.getElementById('modalViewFull');
  if (viewFull) viewFull.href = `pages/product.html?id=${id}`;

  renderModalReviews(id);
  resetReviewForm();

  // Show/hide review form based on login
  const user = getCurrentUser();
  document.getElementById('writeReviewForm').style.display = user ? '' : 'none';
  document.getElementById('loginToReview').style.display   = user ? 'none' : '';
  if (user) document.getElementById('rName').value = user.displayName || '';

  document.getElementById('productModalOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
};

function closeModal() {
  document.getElementById('productModalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
  currentProduct = null;
  selectedRating = 0;
}

function renderModalReviews(productId) {
  const reviews = getProductReviews(productId, 'approved');
  const el = document.getElementById('modalReviews');
  if (!reviews.length) {
    el.innerHTML = `<p style="font-size:0.87rem;color:var(--text-muted);padding:8px 0">No approved reviews yet. Be the first!</p>`;
    return;
  }
  el.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-card-head">
        <span class="review-author">${r.name}</span>
        <span class="review-stars">${starsHTML(r.rating)}</span>
      </div>
      <div class="review-text">${r.text}</div>
    </div>
  `).join('');
}

function submitReview() {
  if (!currentProduct) return;
  const name = document.getElementById('rName')?.value.trim();
  const text = document.getElementById('rText')?.value.trim();
  if (!name) { showToast('Please enter your name', 'error'); return; }
  if (!selectedRating) { showToast('Please select a star rating', 'error'); return; }
  if (!text) { showToast('Please write a review', 'error'); return; }

  const user = getCurrentUser();
  addReview(currentProduct.id, {
    name, rating: selectedRating, text,
    userEmail: user?.email || '',
    userPhoto: user?.photoURL || ''
  });
  showToast('Review submitted! Pending admin approval ⏳', 'info', 4000);
  resetReviewForm();
}

function resetReviewForm() {
  const rText = document.getElementById('rText');
  if (rText) rText.value = '';
  selectedRating = 0;
  document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
}
