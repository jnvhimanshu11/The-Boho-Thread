/**
 * ui.js — UI Utilities
 * Toast notifications, modal helpers, avatar rendering, currency formatting.
 */

const UI = (() => {

  // ── Toast ─────────────────────────────────────────────────────────────────

  let toastContainer;

  function ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function toast(message, type = 'info', duration = 3500) {
    const container = ensureToastContainer();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    el.innerHTML = `<span style="font-weight:700;font-size:1rem">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(120%)';
      el.style.transition = 'all 0.4s';
      setTimeout(() => el.remove(), 400);
    }, duration);
  }

  // ── Modal ─────────────────────────────────────────────────────────────────

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  function createModal({ id, title, body, footer = '' }) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = id;
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close" onclick="UI.closeModal('${id}')">&times;</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer" style="margin-top:24px;display:flex;gap:10px;justify-content:flex-end">${footer}</div>` : ''}
      </div>
    `;
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(id);
    });
    document.body.appendChild(modal);
    return modal;
  }

  // ── Avatar ────────────────────────────────────────────────────────────────

  function avatar(user, size = '') {
    if (!user) return `<div class="avatar ${size}">?</div>`;
    if (user.photoURL) {
      return `<div class="avatar ${size}"><img src="${user.photoURL}" alt="${user.name}" onerror="this.parentElement.textContent='${initials(user.name)}'"></div>`;
    }
    return `<div class="avatar ${size}" style="background:${colorFromEmail(user.email)}">${initials(user.name)}</div>`;
  }

  function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  function colorFromEmail(email = '') {
    // Deterministic color from email
    const colors = ['#7c6af7','#06b6d4','#f59e0b','#10b981','#ef4444','#8b5cf6','#ec4899'];
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  // ── Currency ──────────────────────────────────────────────────────────────

  const CURRENCIES = {
    INR: { symbol: '₹', locale: 'en-IN' },
    USD: { symbol: '$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'de-DE' },
    GBP: { symbol: '£', locale: 'en-GB' },
    JPY: { symbol: '¥', locale: 'ja-JP' },
    AUD: { symbol: 'A$', locale: 'en-AU' },
  };

  function formatAmount(amount, currency = 'INR') {
    const cfg = CURRENCIES[currency] || CURRENCIES.INR;
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // ── Date ──────────────────────────────────────────────────────────────────

  function formatDate(isoStr) {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  function timeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7)   return `${days}d ago`;
    return formatDate(new Date(ts).toISOString());
  }

  // ── Category icons ────────────────────────────────────────────────────────

  const CATEGORY_ICONS = {
    food:          '🍽️',
    transport:     '🚗',
    accommodation: '🏨',
    shopping:      '🛍️',
    entertainment: '🎬',
    healthcare:    '💊',
    utilities:     '⚡',
    other:         '📦',
  };

  function categoryIcon(cat) {
    return CATEGORY_ICONS[cat] || '📦';
  }

  // ── Sidebar active state ──────────────────────────────────────────────────

  function setActiveNav(href) {
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.href === href);
    });
  }

  // ── Confirm dialog ────────────────────────────────────────────────────────

  function confirm(message, onConfirm) {
    const id = 'confirm-modal';
    createModal({
      id,
      title: 'Confirm',
      body: `<p style="color:var(--text-muted)">${message}</p>`,
      footer: `
        <button class="btn-ghost" onclick="UI.closeModal('${id}')">Cancel</button>
        <button class="btn-danger" id="confirm-yes-btn">Confirm</button>
      `,
    });
    openModal(id);
    setTimeout(() => {
      document.getElementById('confirm-yes-btn').onclick = () => {
        closeModal(id);
        onConfirm();
      };
    }, 50);
  }

  // ── Loading spinner ───────────────────────────────────────────────────────

  function loading(container, show) {
    if (show) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-dim)">
          <div style="font-size:2rem;animation:spin 1s linear infinite;display:inline-block">⟳</div>
          <p style="margin-top:10px;font-size:0.85rem">Loading...</p>
        </div>`;
    }
  }

  // ── Render user lookup ────────────────────────────────────────────────────

  function getUserDisplay(email) {
    const users = Auth.getUsers();
    const user  = users[email];
    return user
      ? { name: user.name, email, photoURL: user.photoURL }
      : { name: email.split('@')[0], email, photoURL: null };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    toast,
    openModal, closeModal, createModal,
    avatar, initials, colorFromEmail,
    formatAmount, CURRENCIES,
    formatDate, timeAgo,
    categoryIcon, CATEGORY_ICONS,
    setActiveNav,
    confirm,
    loading,
    getUserDisplay,
  };
})();

window.UI = UI;
