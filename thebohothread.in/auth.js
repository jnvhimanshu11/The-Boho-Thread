// ============================================================
// auth.js — Session management, authentication, role-based access
// ============================================================

const Auth = (() => {
  const SESSION_KEY = 'splitmate_session';

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  }

  function setSession(user) {
    // Never store password in session
    const safe = { ...user };
    delete safe.password;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function currentUser() {
    const s = getSession();
    if (!s) return null;
    // Re-fetch from DB for freshness
    return DB.users.findById(s.id);
  }

  function isLoggedIn() {
    return !!getSession();
  }

  // Call on every protected page to guard access
  function requireAuth(redirectTo = 'index.html') {
    if (!isLoggedIn()) {
      window.location.href = redirectTo;
      return null;
    }
    return currentUser();
  }

  // If logged in, redirect away from auth pages
  function redirectIfAuthed(redirectTo = 'dashboard.html') {
    if (isLoggedIn()) {
      window.location.href = redirectTo;
    }
  }

  function login(email, password) {
    const user = DB.users.authenticate(email, password);
    if (!user) return { success: false, error: 'Invalid email or password.' };
    setSession(user);
    return { success: true, user };
  }

  function register(email, name, password) {
    if (!email || !name || !password) return { success: false, error: 'All fields are required.' };
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
    const existing = DB.users.findByEmail(email);
    if (existing) return { success: false, error: 'An account with this email already exists.' };
    const user = DB.users.create(email, name, password);
    if (!user) return { success: false, error: 'Failed to create account.' };
    setSession(user);
    return { success: true, user };
  }

  function logout() {
    clearSession();
    window.location.href = 'index.html';
  }

  // Check if user has access to a group
  function canAccessGroup(groupId) {
    const user = currentUser();
    if (!user) return false;
    const group = DB.groups.findById(groupId);
    if (!group) return false;
    return group.members.includes(user.id);
  }

  // Check if user is admin (creator) of a group
  function isGroupAdmin(groupId) {
    const user = currentUser();
    if (!user) return false;
    const group = DB.groups.findById(groupId);
    if (!group) return false;
    return group.createdBy === user.id;
  }

  // ============================================================
  // 🔥 FIREBASE SETUP — auth.js
  // This is a stub. After adding Firebase scripts, replace the
  // prompt() inside googleSignIn() with the Firebase block shown
  // in FIREBASE_SETUP.md → FILE 2 section.
  // ============================================================
  function googleSignIn(callback) {
    // Uses redirect flow — no popup needed
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider)
      .catch((err) => callback(null, err));
    // Result is handled via getRedirectResult() on page load in index.html
  }

  return {
    getSession, setSession, clearSession, currentUser, isLoggedIn,
    requireAuth, redirectIfAuthed, login, register, logout,
    canAccessGroup, isGroupAdmin, googleSignIn
  };
})();

// ============================================================
// app.js — Shared utilities, toast, avatar, formatting
// ============================================================

// ---- TOAST NOTIFICATIONS ----
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${message}`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ---- FORMATTING ----
function formatCurrency(amount, currency = '₹') {
  return `${currency}${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateShort(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateShort(timestamp);
}

// ---- AVATAR ----
function avatarHTML(user, size = '') {
  if (!user) return `<div class="avatar ${size}" style="background:#333">?</div>`;
  const initial = (user.name || user.email || '?')[0].toUpperCase();
  const color = user.avatarColor || '#6c63ff';
  return `<div class="avatar ${size}" style="background:${color}">${initial}</div>`;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

// ---- URL PARAMS ----
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function setParam(key, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url);
}

// ---- MODAL ----
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// ---- SIDEBAR INIT ----
function initSidebar() {
  const user = Auth.currentUser();
  if (!user) return;

  const nameEl = document.getElementById('sidebar-name');
  const emailEl = document.getElementById('sidebar-email');
  const avatarEl = document.getElementById('sidebar-avatar');
  const topbarAvatarEl = document.getElementById('topbar-avatar');

  if (nameEl) nameEl.textContent = user.name || user.email;
  if (emailEl) emailEl.textContent = user.email;

  // Show Google profile photo if available, otherwise initials
  if (avatarEl) {
    if (user.photoURL) {
      avatarEl.innerHTML = `<img src="${user.photoURL}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      avatarEl.style.background = 'transparent';
    } else {
      avatarEl.textContent = initials(user.name || user.email);
      avatarEl.style.background = user.avatarColor || '#6c63ff';
    }
  }
  if (topbarAvatarEl) {
    if (user.photoURL) {
      topbarAvatarEl.innerHTML = `<img src="${user.photoURL}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      topbarAvatarEl.style.background = 'transparent';
    } else {
      topbarAvatarEl.textContent = initials(user.name || user.email);
      topbarAvatarEl.style.background = user.avatarColor || '#6c63ff';
    }
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.onclick = () => Auth.logout();

  // Mobile toggle
  const menuBtn = document.getElementById('menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.onclick = () => sidebar.classList.toggle('open');
    document.addEventListener('click', e => {
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Highlight active nav
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('href') === path) item.classList.add('active');
  });
}

// ---- CONFIRM DIALOG ----
function confirmAction(message, onConfirm) {
  if (confirm(message)) onConfirm();
}

// ---- CATEGORY HELPERS ----
function categoryIcon(cat) {
  return (CATEGORIES[cat] || CATEGORIES.general).icon;
}
function categoryColor(cat) {
  return (CATEGORIES[cat] || CATEGORIES.general).color;
}
function categoryLabel(cat) {
  return (CATEGORIES[cat] || CATEGORIES.general).label;
}

// ---- RENDER SIDEBAR (shared HTML) ----
function renderSidebar(activePage) {
  return `
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
      <div class="logo-text">Split<span>Mate</span></div>
    </div>
    <nav class="sidebar-nav">
      <span class="nav-label">Menu</span>
      <a href="dashboard.html" class="nav-item ${activePage==='dashboard'?'active':''}">
        <span class="icon">🏠</span> Dashboard
      </a>
      <a href="dashboard.html#groups" class="nav-item ${activePage==='groups'?'active':''}">
        <span class="icon">👥</span> My Groups
      </a>
      <a href="expenses.html" class="nav-item ${activePage==='expenses'?'active':''}">
        <span class="icon">💸</span> All Expenses
      </a>
      <span class="nav-label">Account</span>
      <a href="profile.html" class="nav-item ${activePage==='profile'?'active':''}">
        <span class="icon">👤</span> Profile
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="avatar" id="sidebar-avatar"></div>
        <div class="user-info">
          <div class="name" id="sidebar-name"></div>
          <div class="email" id="sidebar-email"></div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm btn-full mt-2" id="logout-btn" style="justify-content:flex-start;gap:8px">
        <span>🚪</span> Sign Out
      </button>
    </div>
  </aside>
  <div class="topbar">
    <button class="btn btn-ghost btn-sm" id="menu-toggle">☰</button>
    <span class="font-display font-bold">SplitMate</span>
    <a href="profile.html"><div class="avatar" id="topbar-avatar" style="background:#6c63ff">?</div></a>
  </div>`;
}
