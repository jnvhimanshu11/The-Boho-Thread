// ============================================================
// LUXE STORE — orders.js
// Order history page
// ============================================================

import { getCart, getCartCount, removeFromCart, updateCartQty, getCartTotal, formatPrice, showToast } from './store.js';
import { getCurrentUser } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  updateCartBadge();
  renderOrders();
  document.getElementById('cartBtn')?.addEventListener('click', openCartPanel);
  document.getElementById('cartClose')?.addEventListener('click', closePanels);
  document.getElementById('panelOverlay')?.addEventListener('click', closePanels);
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

function renderOrders() {
  const user = getCurrentUser();
  const guestNotice = document.getElementById('guestNotice');
  const ordersList  = document.getElementById('ordersList');
  const subtitle    = document.getElementById('orderSubtitle');

  // Show guest notice only for truly non-logged-in visitors
  // (Orders are stored in localStorage so guests can still see them)
  const orders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');

  if (!orders.length) {
    ordersList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <p>You haven't placed any orders yet</p>
        <a href="../index.html" class="btn-gold" style="display:inline-flex;margin-top:20px">Start Shopping →</a>
      </div>`;
    if (subtitle) subtitle.textContent = '';
    return;
  }

  if (subtitle) subtitle.textContent = `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`;

  ordersList.innerHTML = orders.map(order => `
    <div class="order-card">
      <div class="order-card-header">
        <div class="order-meta">
          <div class="order-id">Order ${order.id}</div>
          <div class="order-date">${new Date(order.date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
        </div>
        <div class="order-right">
          <span class="order-status status-${(order.status || 'Processing').toLowerCase().replace(' ', '-')}">${order.status || 'Processing'}</span>
          <div class="order-total">${formatPrice(order.total)}</div>
        </div>
      </div>
      <div class="order-items">
        ${order.items.map(item => `
          <div class="order-item">
            <span class="oi-emoji">${item.emoji}</span>
            <div class="oi-info">
              <div class="oi-name">${item.name}</div>
              <div class="oi-qty">Qty: ${item.qty} × ${formatPrice(item.price)}</div>
            </div>
            <div class="oi-total">${formatPrice(item.price * item.qty)}</div>
          </div>
        `).join('')}
      </div>
      <div class="order-card-footer">
        <div class="order-track">
          <div class="track-step done"><span>✓</span><label>Ordered</label></div>
          <div class="track-line ${order.status !== 'Processing' ? 'done' : ''}"></div>
          <div class="track-step ${order.status !== 'Processing' ? 'done' : 'active'}"><span>${order.status !== 'Processing' ? '✓' : '⋯'}</span><label>Processing</label></div>
          <div class="track-line ${order.status === 'Shipped' || order.status === 'Delivered' ? 'done' : ''}"></div>
          <div class="track-step ${order.status === 'Shipped' || order.status === 'Delivered' ? 'done active' : ''}"><span>${order.status === 'Shipped' || order.status === 'Delivered' ? '✓' : '○'}</span><label>Shipped</label></div>
          <div class="track-line ${order.status === 'Delivered' ? 'done' : ''}"></div>
          <div class="track-step ${order.status === 'Delivered' ? 'done' : ''}"><span>${order.status === 'Delivered' ? '✓' : '○'}</span><label>Delivered</label></div>
        </div>
        <button class="btn-ghost btn-sm" onclick="window.open('../index.html')">🔄 Reorder</button>
      </div>
    </div>
  `).join('');
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = getCartCount();
}

function openCartPanel() {
  renderCartPanel();
  document.getElementById('cartPanel')?.classList.add('open');
  document.getElementById('panelOverlay')?.classList.add('open');
}

function closePanels() {
  document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
  document.getElementById('panelOverlay')?.classList.remove('open');
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
          <button class="qty-btn" onclick="chQty(${item.id},${item.qty-1})">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="chQty(${item.id},${item.qty+1})">+</button>
        </div>
      </div>
      <button class="cart-remove" onclick="chRem(${item.id})">🗑</button>
    </div>`).join('');
  const total = getCartTotal();
  foot.innerHTML = `
    <div class="cart-total-row"><span class="cart-total-label">Total</span><span class="cart-total-val">${formatPrice(total)}</span></div>
    <a href="checkout.html" class="btn-gold full-btn" style="justify-content:center;display:flex">Checkout →</a>`;
}
window.chQty = (id, q) => { updateCartQty(id, q); updateCartBadge(); renderCartPanel(); };
window.chRem = (id) => { removeFromCart(id); updateCartBadge(); renderCartPanel(); };
