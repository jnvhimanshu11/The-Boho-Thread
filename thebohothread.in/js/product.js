// ============================================================
// LUXE STORE — product.js
// Individual product detail page
// ============================================================

import {
  getProducts, getProductById, addToCart, getCart, removeFromCart, updateCartQty,
  getCartTotal, getCartCount, toggleWishlist, isWishlisted,
  getProductReviews, addReview, getAverageRating,
  formatPrice, starsHTML, showToast
} from './store.js';
import { getCurrentUser } from './firebase-config.js';

let currentProductId = null;
let selectedRating   = 0;
let selectedQty      = 1;

document.addEventListener('DOMContentLoaded', () => {
  // Get product ID from URL
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  if (!id) { showNotFound(); return; }
  loadProduct(id);

  initNavbar();
  updateBadges();
  initCartPanel();

  document.getElementById('cartBtn')?.addEventListener('click', openCartPanel);
  document.getElementById('wishBtn')?.addEventListener('click', () => window.location.href = 'wishlist.html');
});

function initNavbar() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu?.classList.toggle('open');
  });
  window.addEventListener('scroll', () => {
    document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 40);
  });
}

function loadProduct(id) {
  const product = getProductById(id);
  if (!product) { showNotFound(); return; }

  currentProductId = id;

  // Breadcrumb
  document.getElementById('bcProductName').textContent = product.name;
  document.title = `${product.name} — LUXE`;

  // Image zone
  document.getElementById('pdImgMain').innerHTML = `<span>${product.emoji}</span>`;
  document.getElementById('pdThumbs').innerHTML = [product.emoji, product.emoji, product.emoji].map((e, i) => `
    <div class="thumb ${i === 0 ? 'active' : ''}" onclick="selectThumb(this)">${e}</div>`).join('');

  // Category & badge
  document.getElementById('pdCategory').textContent = product.category;
  const badgeEl = document.getElementById('pdBadge');
  if (product.badge) { badgeEl.textContent = product.badge; badgeEl.style.display = ''; }

  // Title
  document.getElementById('pdTitle').textContent = product.name;

  // Rating
  const { avg, count } = getAverageRating(id);
  document.getElementById('pdRatingRow').innerHTML = avg
    ? `<span class="pd-stars">${starsHTML(avg)}</span><span class="pd-rating-text">${avg} · ${count} review${count !== 1 ? 's' : ''}</span>`
    : `<span class="pd-rating-text" style="color:var(--text-muted)">No reviews yet</span>`;

  // Price
  const discount = product.original ? Math.round((1 - product.price / product.original) * 100) : 0;
  document.getElementById('pdPrice').textContent    = formatPrice(product.price);
  document.getElementById('pdOriginal').textContent = product.original ? formatPrice(product.original) : '';
  document.getElementById('pdDiscount').textContent = discount >= 5 ? `${discount}% off` : '';

  // Desc
  document.getElementById('pdDesc').textContent = product.desc || '';

  // Tags
  const tags = product.tags || [];
  document.getElementById('pdTags').innerHTML = tags.map(t => `<span class="pd-tag">${t}</span>`).join('');

  // Stock
  const stockEl = document.getElementById('pdStock');
  if (product.stock <= 0) {
    stockEl.innerHTML = `<span style="color:var(--danger)">● Out of Stock</span>`;
  } else if (product.stock <= 5) {
    stockEl.innerHTML = `<span style="color:var(--accent)">● Only ${product.stock} left!</span>`;
  } else {
    stockEl.innerHTML = `<span style="color:var(--success)">● In Stock (${product.stock} available)</span>`;
  }

  // Qty controls
  document.getElementById('pdQtyMinus')?.addEventListener('click', () => {
    if (selectedQty > 1) { selectedQty--; document.getElementById('pdQtyVal').textContent = selectedQty; }
  });
  document.getElementById('pdQtyPlus')?.addEventListener('click', () => {
    if (selectedQty < product.stock) { selectedQty++; document.getElementById('pdQtyVal').textContent = selectedQty; }
  });

  // Add to cart
  document.getElementById('pdAddCart')?.addEventListener('click', () => {
    const result = addToCart(id, selectedQty);
    if (result.success) {
      showToast(`${product.emoji} Added ${selectedQty} to cart!`, 'success');
      updateBadges();
    } else {
      showToast(result.msg, 'error');
    }
  });

  // Wishlist
  const wishBtn = document.getElementById('pdWishBtn');
  updateWishBtn(wishBtn, id);
  wishBtn?.addEventListener('click', () => {
    const added = toggleWishlist(id);
    updateWishBtn(wishBtn, id);
    showToast(added ? `${product.emoji} Added to wishlist!` : 'Removed from wishlist', added ? 'success' : 'info');
  });

  // Show sections
  document.getElementById('productDetail').style.display = '';
  document.getElementById('reviewsSection').style.display = '';
  document.getElementById('relatedSection').style.display = '';

  renderReviews(id);
  renderRelated(id, product.category);
  initReviewForm(id);
}

function updateWishBtn(btn, id) {
  if (!btn) return;
  const wished = isWishlisted(id);
  btn.textContent = wished ? '❤️' : '🤍';
  btn.classList.toggle('wished', wished);
}

window.selectThumb = (el) => {
  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
};

function renderReviews(productId) {
  const reviews = getProductReviews(productId, 'approved');
  const { avg, count } = getAverageRating(productId);
  const bars = [5,4,3,2,1].map(star => {
    const cnt = reviews.filter(r => r.rating === star).length;
    const pct = count ? Math.round((cnt / count) * 100) : 0;
    return `<div class="rating-bar-row">
      <span class="rb-label">${star}★</span>
      <div class="rating-bar"><div class="rating-bar-fill" style="width:${pct}%"></div></div>
      <span class="rb-count">${cnt}</span>
    </div>`;
  }).join('');

  document.getElementById('reviewsSummary').innerHTML = count ? `
    <div class="rs-avg"><span class="rs-num">${avg}</span><div class="rs-stars">${starsHTML(avg)}</div><div class="rs-count">${count} review${count !== 1 ? 's' : ''}</div></div>
    <div class="rs-bars">${bars}</div>
  ` : `<p style="color:var(--text-muted);font-size:0.88rem">No reviews yet</p>`;

  const list = document.getElementById('reviewsListFull');
  if (!reviews.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">⭐</div><p>No reviews yet. Be the first!</p></div>`;
    return;
  }
  list.innerHTML = reviews.map(r => `
    <div class="review-card-full">
      <div class="rcf-header">
        <div class="rcf-avatar">${r.name[0].toUpperCase()}</div>
        <div class="rcf-meta">
          <div class="rcf-name">${r.name}</div>
          <div class="rcf-stars">${starsHTML(r.rating)}</div>
        </div>
        <div class="rcf-date">${new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
      </div>
      <p class="rcf-text">${r.text}</p>
    </div>
  `).join('');
}

function initReviewForm(productId) {
  const user = getCurrentUser();
  document.getElementById('writeReviewForm').style.display = user ? '' : 'none';
  document.getElementById('loginToReview').style.display   = user ? 'none' : '';
  if (user) document.getElementById('rName').value = user.displayName || '';

  document.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.val);
      document.querySelectorAll('.star-btn').forEach((b, i) => b.classList.toggle('active', i < selectedRating));
    });
  });

  document.getElementById('submitReviewBtn')?.addEventListener('click', () => {
    const name = document.getElementById('rName')?.value.trim();
    const text = document.getElementById('rText')?.value.trim();
    if (!name)   { showToast('Please enter your name', 'error'); return; }
    if (!selectedRating) { showToast('Please select a rating', 'error'); return; }
    if (!text)   { showToast('Please write a review', 'error'); return; }
    const u = getCurrentUser();
    addReview(productId, { name, rating: selectedRating, text, userEmail: u?.email || '', userPhoto: u?.photoURL || '' });
    showToast('Review submitted! Pending admin approval ⏳', 'info', 4500);
    document.getElementById('rText').value = '';
    selectedRating = 0;
    document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('active'));
  });
}

function renderRelated(currentId, category) {
  const related = getProducts().filter(p => p.id !== currentId && p.category === category).slice(0, 4);
  const grid = document.getElementById('relatedGrid');
  if (!related.length) { document.getElementById('relatedSection').style.display = 'none'; return; }
  grid.innerHTML = related.map(p => {
    const { avg, count } = getAverageRating(p.id);
    return `
    <div class="product-card" onclick="window.location.href='product.html?id=${p.id}'">
      <div class="card-inner-wrap">
        <div class="card-img-zone">
          ${p.badge ? `<div class="card-product-badge">${p.badge}</div>` : ''}
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
            <span class="card-price">${formatPrice(p.price)}</span>
            <button class="card-add-btn" onclick="event.stopPropagation();window.__relAddCart(${p.id})">+ Cart</button>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');
}
window.__relAddCart = (id) => {
  const r = addToCart(id);
  const p = getProductById(id);
  if (r.success) { showToast(`${p.emoji} Added to cart!`, 'success'); updateBadges(); }
  else showToast(r.msg, 'error');
};

function showNotFound() {
  document.getElementById('notFound').style.display = '';
  document.getElementById('productDetail').style.display = 'none';
  document.getElementById('reviewsSection').style.display = 'none';
  document.getElementById('relatedSection').style.display = 'none';
}

function updateBadges() {
  const cartBadge = document.getElementById('cartBadge');
  const wishBadge = document.getElementById('wishBadge');
  if (cartBadge) cartBadge.textContent = getCartCount();
  if (wishBadge) {
    const { getWishlist } = window.__store || {};
    // fallback approach
    const wl = JSON.parse(localStorage.getItem('luxe_wishlist') || '[]');
    wishBadge.textContent = wl.length;
    wishBadge.style.display = wl.length ? '' : 'none';
  }
}

function openCartPanel() { renderCartPanel(); document.getElementById('cartPanel')?.classList.add('open'); document.getElementById('panelOverlay')?.classList.add('open'); }
function closePanels() { document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open')); document.getElementById('panelOverlay')?.classList.remove('open'); }
function initCartPanel() {
  document.getElementById('cartClose')?.addEventListener('click', closePanels);
  document.getElementById('panelOverlay')?.addEventListener('click', closePanels);
}
function renderCartPanel() {
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  const items = Object.values(getCart()).filter(i => i.qty > 0);
  if (!items.length) { body.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><p>Cart is empty</p></div>`; foot.innerHTML = ''; return; }
  body.innerHTML = items.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
        <div class="qty-row">
          <button class="qty-btn" onclick="window.__pdQty(${item.id},${item.qty-1})">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="window.__pdQty(${item.id},${item.qty+1})">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="window.__pdRem(${item.id})">🗑</button>
    </div>`).join('');
  foot.innerHTML = `
    <div class="cart-total-row"><span class="cart-total-label">Total</span><span class="cart-total-val">${formatPrice(getCartTotal())}</span></div>
    <a href="checkout.html" class="btn-gold full-btn" style="display:flex;justify-content:center">Checkout →</a>`;
}
window.__pdQty = (id, q) => { updateCartQty(id, q); updateBadges(); renderCartPanel(); };
window.__pdRem = (id) => { removeFromCart(id); updateBadges(); renderCartPanel(); };
window.showToastGlobal = showToast;
