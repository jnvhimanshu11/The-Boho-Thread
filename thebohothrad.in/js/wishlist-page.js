// ============================================================
// LUXE STORE — wishlist-page.js
// Dedicated wishlist page
// ============================================================

import {
  getProducts, getWishlist, toggleWishlist,
  addToCart, getCart, getCartTotal, getCartCount, removeFromCart, updateCartQty,
  formatPrice, starsHTML, getAverageRating, showToast
} from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  renderWishlist();
  initCartPanel();
  updateCartBadge();
  document.getElementById('cartBtn')?.addEventListener('click', openCartPanel);
});

function renderWishlist() {
  const wl       = getWishlist();
  const products = getProducts();
  const grid     = document.getElementById('wishlistGrid');
  const subtitle = document.getElementById('wishSubtitle');

  if (!wl.size) {
    if (subtitle) subtitle.textContent = '';
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🤍</div>
        <p>Your wishlist is empty</p>
        <a href="../index.html" class="btn-gold" style="display:inline-flex;margin-top:20px">Browse Products →</a>
      </div>`;
    return;
  }

  if (subtitle) subtitle.textContent = `${wl.size} item${wl.size !== 1 ? 's' : ''} saved`;

  const wishedProducts = [...wl].map(id => products.find(p => p.id === id)).filter(Boolean);
  grid.innerHTML = wishedProducts.map(p => {
    const { avg, count } = getAverageRating(p.id);
    const cartQty = getCart()[p.id]?.qty || 0;
    const discount = p.original ? Math.round((1 - p.price / p.original) * 100) : 0;
    return `
    <div class="product-card">
      <div class="card-inner-wrap">
        <div class="card-img-zone">
          ${p.badge ? `<div class="card-product-badge">${p.badge}</div>` : ''}
          <button class="card-wishlist-btn wished"
            onclick="removeFromWishlist(${p.id})" title="Remove from wishlist">❤️</button>
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
              onclick="addToCartWL(${p.id})">
              ${cartQty ? `✓ ${cartQty}` : '+ Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}

window.removeFromWishlist = (id) => {
  toggleWishlist(id);
  showToast('Removed from wishlist', 'info');
  renderWishlist();
};

window.addToCartWL = (id) => {
  const result = addToCart(id);
  const p = getProducts().find(x => x.id === id);
  if (result.success) {
    showToast(`${p.emoji} ${p.name} added to cart!`, 'success');
    updateCartBadge();
    renderWishlist();
  } else {
    showToast(result.msg, 'error');
  }
};

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = getCartCount();
}

function openCartPanel() { renderCartPanel(); document.getElementById('cartPanel')?.classList.add('open'); document.getElementById('panelOverlay')?.classList.add('open'); }
function closePanels() {
  document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
  document.getElementById('panelOverlay')?.classList.remove('open');
}

function initCartPanel() {
  document.getElementById('cartClose')?.addEventListener('click', closePanels);
  document.getElementById('panelOverlay')?.addEventListener('click', closePanels);
}

function renderCartPanel() {
  const body  = document.getElementById('cartBody');
  const foot  = document.getElementById('cartFoot');
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
          <button class="qty-btn" onclick="wlQty(${item.id}, ${item.qty - 1})">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="wlQty(${item.id}, ${item.qty + 1})">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="wlRem(${item.id})">🗑</button>
    </div>
  `).join('');
  foot.innerHTML = `
    <div class="cart-total-row">
      <span class="cart-total-label">Total</span>
      <span class="cart-total-val">${formatPrice(getCartTotal())}</span>
    </div>
    <a href="../index.html" class="btn-ghost full-btn" style="text-align:center;display:flex;justify-content:center;margin-bottom:10px">← Continue Shopping</a>
    <button class="btn-gold full-btn">Checkout →</button>
  `;
}
window.wlQty = (id, q) => { updateCartQty(id, q); updateCartBadge(); renderCartPanel(); renderWishlist(); };
window.wlRem = (id) => { removeFromCart(id); updateCartBadge(); renderCartPanel(); renderWishlist(); };
