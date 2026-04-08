// ============================================================
// LUXE STORE — admin.js
// Admin dashboard: products CRUD, review approvals, orders, users
// ============================================================

import {
  getProducts, addProduct, updateProduct, deleteProduct,
  getReviews, approveReview, rejectReview, deleteReview,
  getWishlist, formatPrice, starsHTML, showToast
} from './store.js';
import { getRegisteredUsers } from './firebase-config.js';

// ---- ADMIN CREDENTIALS (hardcoded) ----
const ADMIN_CREDS = { username: 'admin', password: 'admin123' };
const ADMIN_KEY   = 'luxe_admin_session';

let currentReviewFilter = 'pending';
let orderStatusFilter   = 'all';
let adminProductSearch  = '';

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem(ADMIN_KEY) === 'true') {
    showAdminApp();
  } else {
    document.getElementById('adminLoginScreen').style.display = '';
    document.getElementById('adminApp').style.display = 'none';
  }

  document.getElementById('adminLoginBtn')?.addEventListener('click', doAdminLogin);
  document.getElementById('adminPass')?.addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
  document.getElementById('adminLogoutBtn')?.addEventListener('click', adminLogout);

  document.querySelectorAll('.sb-item[data-panel]').forEach(item => {
    item.addEventListener('click', () => showPanel(item.dataset.panel));
  });

  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    document.getElementById('adminSidebar')?.classList.toggle('open');
  });

  document.getElementById('saveProductBtn')?.addEventListener('click', saveProduct);
  document.getElementById('resetProductBtn')?.addEventListener('click', resetProductForm);

  document.getElementById('editModalClose')?.addEventListener('click', closeEditModal);
  document.getElementById('cancelEditBtn')?.addEventListener('click', closeEditModal);
  document.getElementById('saveEditBtn')?.addEventListener('click', saveEdit);
  document.getElementById('editModalOverlay')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeEditModal();
  });

  document.getElementById('adminProductSearch')?.addEventListener('input', e => {
    adminProductSearch = e.target.value.toLowerCase();
    renderProductsTable();
  });

  // Review tabs
  document.querySelectorAll('.review-filter-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.review-filter-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentReviewFilter = btn.dataset.filter;
      renderReviews();
    });
  });

  // Order tabs (delegated)
  document.addEventListener('click', e => {
    const btn = e.target.closest('#orderFilterTabs .tab-btn');
    if (!btn) return;
    document.querySelectorAll('#orderFilterTabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    orderStatusFilter = btn.dataset.status;
    renderOrders();
  });
});

// ============================================================
// AUTH
// ============================================================
function doAdminLogin() {
  const u     = document.getElementById('adminUser')?.value.trim();
  const p     = document.getElementById('adminPass')?.value;
  const errEl = document.getElementById('adminAuthError');

  if (u === ADMIN_CREDS.username && p === ADMIN_CREDS.password) {
    sessionStorage.setItem(ADMIN_KEY, 'true');
    if (errEl) errEl.style.display = 'none';
    showAdminApp();
  } else {
    if (errEl) { errEl.textContent = 'Invalid username or password.'; errEl.style.display = ''; }
    const passEl = document.getElementById('adminPass');
    if (passEl) passEl.value = '';
  }
}

function adminLogout() {
  sessionStorage.removeItem(ADMIN_KEY);
  window.location.href = '../index.html';
}

function showAdminApp() {
  document.getElementById('adminLoginScreen').style.display = 'none';
  document.getElementById('adminApp').style.display         = 'flex';
  document.body.style.overflow = '';
  showPanel('dashboard');
}

// ============================================================
// PANEL ROUTING
// ============================================================
window.showPanel = function(name) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sb-item[data-panel]').forEach(s => s.classList.remove('active'));
  document.getElementById(`panel-${name}`)?.classList.add('active');
  document.querySelector(`.sb-item[data-panel="${name}"]`)?.classList.add('active');
  document.getElementById('adminSidebar')?.classList.remove('open');

  switch (name) {
    case 'dashboard':  renderDashboard();      break;
    case 'products':   renderProductsTable();  break;
    case 'reviews':    renderReviews();        break;
    case 'orders':     renderOrders();         break;
    case 'users':      renderUsers();          break;
    case 'addProduct': resetProductForm();     break;
  }
};

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard() {
  const products = getProducts();
  const reviews  = getReviews();
  const pending  = reviews.filter(r => r.status === 'pending').length;
  const users    = getRegisteredUsers();
  const orders   = JSON.parse(localStorage.getItem('luxe_orders') || '[]');

  document.getElementById('statsGrid').innerHTML = [
    { icon: '📦', label: 'Products',        value: products.length                 },
    { icon: '📋', label: 'Total Orders',    value: orders.length                   },
    { icon: '⭐', label: 'Reviews',         value: reviews.length                  },
    { icon: '⏳', label: 'Pending Reviews', value: pending,  accent: true          },
    { icon: '👥', label: 'Users',           value: users.length                    },
    { icon: '❤️', label: 'Wishlisted',      value: getWishlist().size              },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-value" ${s.accent ? 'style="color:var(--accent)"' : ''}>${s.value}</div>
    </div>
  `).join('');

  updatePendingBadge();

  // Recent pending reviews
  const recentPending = reviews.filter(r => r.status === 'pending').slice(0, 3);
  const container     = document.getElementById('recentPendingReviews');
  if (!container) return;
  container.innerHTML = recentPending.length
    ? recentPending.map(r => reviewCardHTML(r, products.find(x => x.id === r.productId))).join('')
    : `<p style="color:var(--text-muted);font-size:0.88rem">No pending reviews 🎉</p>`;
}

// ============================================================
// PRODUCTS
// ============================================================
function renderProductsTable() {
  const products = getProducts().filter(p =>
    !adminProductSearch ||
    p.name.toLowerCase().includes(adminProductSearch) ||
    p.category.toLowerCase().includes(adminProductSearch)
  );
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  tbody.innerHTML = products.length ? products.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:1.5rem">${p.emoji}</span>
          <div>
            <div style="font-weight:600">${p.name}</div>
            ${p.badge ? `<span class="badge badge-category">${p.badge}</span>` : ''}
          </div>
        </div>
      </td>
      <td><span class="badge badge-category">${p.category}</span></td>
      <td style="font-weight:600;color:var(--accent)">${formatPrice(p.price)}</td>
      <td>
        <span style="color:${p.stock<=5?'var(--danger)':p.stock<=15?'var(--accent)':'var(--success)'};font-weight:600">
          ${p.stock}${p.stock<=5?' ⚠️':''}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn-success" onclick="window.openEditModal(${p.id})">✏️ Edit</button>
          <button class="btn-danger"  onclick="window.confirmDelete(${p.id})">🗑️ Delete</button>
        </div>
      </td>
    </tr>
  `).join('')
  : `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:30px">No products found</td></tr>`;
}

window.filterAdminProducts = () => renderProductsTable();

// ============================================================
// ADD PRODUCT
// ============================================================
function saveProduct() {
  const name     = document.getElementById('pName')?.value.trim();
  const category = document.getElementById('pCategory')?.value;
  const price    = parseInt(document.getElementById('pPrice')?.value);
  const original = parseInt(document.getElementById('pOriginal')?.value) || 0;
  const stock    = parseInt(document.getElementById('pStock')?.value)    || 0;
  const emoji    = document.getElementById('pEmoji')?.value.trim()       || '📦';
  const badge    = document.getElementById('pBadge')?.value.trim()       || '';
  const tagsRaw  = document.getElementById('pTags')?.value.trim()        || '';
  const desc     = document.getElementById('pDesc')?.value.trim()        || '';

  if (!name)  { showToast('Product name is required', 'error'); return; }
  if (!price) { showToast('Price is required', 'error'); return; }

  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const product = addProduct({ name, category, price, original, stock, emoji, badge, desc, tags });
  showToast(`${emoji} "${name}" added successfully!`, 'success');
  resetProductForm();
  showPanel('products');
}

function resetProductForm() {
  ['pName','pPrice','pOriginal','pStock','pEmoji','pBadge','pTags','pDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const cat = document.getElementById('pCategory');
  if (cat) cat.value = 'Fashion';
  const heading = document.getElementById('productFormHeading');
  if (heading) heading.textContent = 'Add New Product';
}

// ============================================================
// EDIT PRODUCT
// ============================================================
window.openEditModal = (id) => {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  document.getElementById('emId').value       = p.id;
  document.getElementById('emName').value     = p.name;
  document.getElementById('emCategory').value = p.category;
  document.getElementById('emPrice').value    = p.price;
  document.getElementById('emOriginal').value = p.original || '';
  document.getElementById('emStock').value    = p.stock;
  document.getElementById('emEmoji').value    = p.emoji;
  document.getElementById('emBadge').value    = p.badge  || '';
  document.getElementById('emDesc').value     = p.desc   || '';
  document.getElementById('editModalOverlay')?.classList.add('open');
};

function saveEdit() {
  const id   = parseInt(document.getElementById('emId')?.value);
  const data = {
    name:     document.getElementById('emName')?.value.trim(),
    category: document.getElementById('emCategory')?.value,
    price:    parseInt(document.getElementById('emPrice')?.value),
    original: parseInt(document.getElementById('emOriginal')?.value) || 0,
    stock:    parseInt(document.getElementById('emStock')?.value)    || 0,
    emoji:    document.getElementById('emEmoji')?.value.trim(),
    badge:    document.getElementById('emBadge')?.value.trim(),
    desc:     document.getElementById('emDesc')?.value.trim(),
  };
  if (!data.name || !data.price) { showToast('Name and price are required', 'error'); return; }
  updateProduct(id, data);
  showToast(`${data.emoji} "${data.name}" updated!`, 'success');
  closeEditModal();
  renderProductsTable();
}

function closeEditModal() {
  document.getElementById('editModalOverlay')?.classList.remove('open');
}

window.confirmDelete = (id) => {
  const p = getProducts().find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
  deleteProduct(id);
  showToast(`${p.emoji} "${p.name}" deleted`, 'info');
  renderProductsTable();
  renderDashboard();
};

// ============================================================
// REVIEWS
// ============================================================
function renderReviews() {
  const reviews  = getReviews();
  const products = getProducts();
  const filtered = currentReviewFilter === 'all'
    ? reviews
    : reviews.filter(r => r.status === currentReviewFilter);

  const container = document.getElementById('reviewsList');
  if (!container) return;

  if (!filtered.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">⭐</div><p>No ${currentReviewFilter === 'all' ? '' : currentReviewFilter} reviews</p></div>`;
    return;
  }

  const sorted = [...filtered].sort((a, b) => {
    const order = { pending: 0, approved: 1, rejected: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  container.innerHTML = sorted.map(r => reviewCardHTML(r, products.find(x => x.id === r.productId))).join('');
  updatePendingBadge();
}

function reviewCardHTML(review, product) {
  const date = new Date(review.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  return `
  <div class="admin-review-card" id="review-${review.id}">
    <div class="arc-header">
      <div>
        <div class="arc-product">${product ? `${product.emoji} ${product.name}` : 'Deleted Product'}</div>
        <div class="arc-author">
          ${review.name}
          ${review.userEmail ? `<span style="font-size:0.76rem;color:var(--text-muted);margin-left:6px">(${review.userEmail})</span>` : ''}
        </div>
        <div class="arc-stars">${starsHTML(review.rating)} &nbsp; ${review.rating}/5</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0">
        <span class="badge badge-${review.status}">${review.status}</span>
        <span style="font-size:0.74rem;color:var(--text-muted)">${date}</span>
      </div>
    </div>
    <div class="arc-text">"${review.text}"</div>
    <div class="arc-actions">
      ${review.status !== 'approved' ? `<button class="btn-success" onclick="window.approveRev(${review.id})">✓ Approve</button>` : ''}
      ${review.status !== 'rejected' ? `<button class="btn-danger"  onclick="window.rejectRev(${review.id})">✗ Reject</button>`  : ''}
      <button class="btn-danger" style="opacity:0.7" onclick="window.deleteRev(${review.id})">🗑 Delete</button>
    </div>
  </div>`;
}

window.approveRev = (id) => { approveReview(id); showToast('Review approved ✓', 'success'); renderReviews(); renderDashboard(); };
window.rejectRev  = (id) => { rejectReview(id);  showToast('Review rejected', 'info');      renderReviews(); renderDashboard(); };
window.deleteRev  = (id) => {
  if (!confirm('Permanently delete this review?')) return;
  deleteReview(id);
  showToast('Review deleted', 'info');
  renderReviews();
  renderDashboard();
};

// ============================================================
// ORDERS
// ============================================================
function renderOrders() {
  const allOrders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
  const orders    = orderStatusFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === orderStatusFilter);

  const container = document.getElementById('adminOrdersList');
  if (!container) return;

  if (!orders.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>No ${orderStatusFilter === 'all' ? '' : orderStatusFilter} orders yet</p></div>`;
    return;
  }

  const statusClass = { Processing:'badge-pending', Shipped:'badge-category', Delivered:'badge-approved', Cancelled:'badge-rejected' };

  container.innerHTML = orders.map(order => `
    <div class="admin-review-card" style="margin-bottom:14px">
      <div class="arc-header">
        <div>
          <div style="font-weight:700;font-family:var(--font-serif);font-size:1.05rem;margin-bottom:4px">${order.id}</div>
          <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:4px">
            📅 ${new Date(order.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
            &nbsp;·&nbsp;
            🕐 ${new Date(order.date).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
          </div>
          ${order.shipping ? `
            <div style="font-size:0.8rem;color:var(--text-muted)">
              👤 ${order.shipping.name} &nbsp;·&nbsp;
              📍 ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pin}
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px">
              📞 ${order.shipping.phone || '—'} &nbsp;·&nbsp; ${payLabel(order.payment)}
            </div>
          ` : ''}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <span class="badge ${statusClass[order.status] || 'badge-pending'}">${order.status || 'Processing'}</span>
          <div style="font-size:1.15rem;font-weight:700;color:var(--accent);margin-top:8px">${formatPrice(order.total)}</div>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0">
        ${(order.items || []).map(i =>
          `<span style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:5px 12px;font-size:0.82rem;">
            ${i.emoji} ${i.name} ×${i.qty} — ${formatPrice(i.price * i.qty)}
          </span>`
        ).join('')}
      </div>

      <div class="arc-actions" style="align-items:center;gap:12px">
        <span style="font-size:0.8rem;color:var(--text-dim);font-weight:500">Update status:</span>
        <select onchange="window.updateOrderStatus('${order.id}', this.value)"
          style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;
                 padding:8px 14px;font-size:0.83rem;color:var(--text);cursor:pointer;
                 font-family:var(--font-sans);outline:none">
          <option ${order.status==='Processing'?'selected':''}>Processing</option>
          <option ${order.status==='Shipped'   ?'selected':''}>Shipped</option>
          <option ${order.status==='Delivered' ?'selected':''}>Delivered</option>
          <option ${order.status==='Cancelled' ?'selected':''}>Cancelled</option>
        </select>
      </div>
    </div>
  `).join('');
}

function payLabel(method) {
  const map = { card:'💳 Card', upi:'📱 UPI', netbanking:'🏦 Net Banking', cod:'💵 COD' };
  return map[method] || method || '—';
}

window.updateOrderStatus = (orderId, newStatus) => {
  const orders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
  const order  = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    localStorage.setItem('luxe_orders', JSON.stringify(orders));
    showToast(`Order "${orderId}" marked as "${newStatus}"`, 'success');
    renderOrders();
    renderDashboard();
  }
};

// ============================================================
// USERS
// ============================================================
function renderUsers() {
  const users     = getRegisteredUsers();
  const container = document.getElementById('usersList');
  if (!container) return;

  if (!users.length) {
    container.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><p>No registered users yet</p></div>`;
    return;
  }

  container.innerHTML = users.map(u => `
    <div class="user-card">
      <div class="user-ava">
        ${u.photoURL
          ? `<img src="${u.photoURL}" alt="${u.displayName || 'User'}" onerror="this.style.display='none';this.parentElement.textContent='${(u.displayName||'U')[0].toUpperCase()}'">`
          : (u.displayName?.[0]?.toUpperCase() || '?')}
      </div>
      <div class="user-info">
        <div class="user-name">${u.displayName || 'Unknown'}</div>
        <div class="user-email">${u.email}</div>
        <div class="user-since">
          Joined ${new Date(u.registeredAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
        </div>
      </div>
      <span class="badge ${u.provider === 'google.com' ? 'badge-approved' : 'badge-category'}">
        ${u.provider === 'google.com' ? '🔵 Google' : '📧 Email'}
      </span>
    </div>
  `).join('');
}

// ============================================================
// HELPERS
// ============================================================
function updatePendingBadge() {
  const pending = getReviews().filter(r => r.status === 'pending').length;
  const badge   = document.getElementById('pendingBadge');
  if (badge) badge.textContent = pending || '';
}
