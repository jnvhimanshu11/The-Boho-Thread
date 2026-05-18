// ============================================================
// auth.js — Session management, authentication, role-based access
// ============================================================

const Auth = (() => {
  const SESSION_KEY = 'splitmate_session';

  // Use localStorage so session survives redirects (sessionStorage is wiped on redirect in some browsers)
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY)) ||
             JSON.parse(sessionStorage.getItem(SESSION_KEY));
    }
    catch { return null; }
  }

  function setSession(user) {
    const safe = { ...user };
    delete safe.password;
    const json = JSON.stringify(safe);
    localStorage.setItem(SESSION_KEY, json);
    sessionStorage.setItem(SESSION_KEY, json);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  // Returns the cached session user directly (sync) — no Firestore re-fetch
  function currentUser() {
    return getSession();
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
    // Also sign out of Firebase so redirect result is cleared
    try { firebase.auth().signOut(); } catch(e) {}
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
  return (window.__urlParams || new URLSearchParams(window.location.search)).get(key);
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
  // Count pending in-app invitations for badge
  const currentUser = Auth.currentUser ? Auth.currentUser() : null;
  let pendingCount = 0;
  if (currentUser) {
    try {
      const invites = JSON.parse(localStorage.getItem('splitease_invites') || '{}');
      pendingCount = Object.values(invites).filter(
        i => i.invitedEmail === currentUser.email && i.status === 'pending'
      ).length;
    } catch(e) {}
  }
  const invBadge = pendingCount > 0
    ? `<span style="margin-left:auto;background:#7c6af7;color:#fff;border-radius:99px;padding:1px 7px;font-size:0.7rem;font-weight:700">${pendingCount}</span>`
    : '';

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
      <a href="invitations.html" class="nav-item ${activePage==='invitations'?'active':''}" style="display:flex;align-items:center">
        <span class="icon">✉️</span> Invitations
        ${invBadge}
      </a>
      <a href="notifications.html" class="nav-item ${activePage==='notifications'?'active':''}">
        <span class="icon">📣</span> Send Notification
      </a>
      <span class="nav-label">Account</span>
      <a href="notification-settings.html" class="nav-item ${activePage==='notification-settings'?'active':''}">
        <span class="icon">🔕</span> Notification Settings
      </a>
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

// ============================================================
// 🔔 PUSH NOTIFICATION PERMISSION — Auto-prompt on page load
// Asks every logged-in user to allow notifications.
// Saves FCM token to Firestore so others can send push to them.
// ============================================================
(function initPushPermission() {
  // Only run if user is logged in
  if (!Auth.isLoggedIn()) return;

  // Check support — on iOS PWA, Notification exists but serviceWorker may not
  const hasNotification = ('Notification' in window);
  const hasSW = ('serviceWorker' in navigator);

  // If already granted (desktop OR iOS PWA), always try to refresh/save the token
  if (hasNotification && Notification.permission === 'granted' && hasSW) {
    _refreshFcmToken(); // Silently refresh token on every page load
    return;
  }

  // If browser doesn't support notifications at all (iOS Safari not installed as PWA)
  if (!hasNotification || !hasSW) return;

  if (Notification.permission === 'denied') {
    window.addEventListener('load', function() {
      setTimeout(_showDeniedHint, 3000);
    });
    return;
  }

  // Default: show banner after page load
  window.addEventListener('load', function() {
    setTimeout(_showNotifBanner, 2000);
  });
})();

function _showNotifBanner() {
  // Don't show if already granted or on notification page (has its own UI)
  if (Notification.permission === 'granted') return;
  if (window.location.pathname.includes('notifications.html')) return;
  if (document.getElementById('__notif-banner')) return;

  const banner = document.createElement('div');
  banner.id = '__notif-banner';
  banner.innerHTML = `
    <div style="
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:#22222e; border:1px solid rgba(108,99,255,0.4);
      border-radius:14px; padding:16px 20px;
      box-shadow:0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(108,99,255,0.15);
      display:flex; align-items:center; gap:14px;
      max-width:420px; width:calc(100vw - 48px);
      z-index:9999; animation:slideUpBanner 0.35s cubic-bezier(0.34,1.56,0.64,1);
      font-family:'DM Sans',sans-serif;
    ">
      <div style="font-size:1.6rem;flex-shrink:0">🔔</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:0.88rem;color:#f0f0f8;margin-bottom:2px">
          Enable Push Notifications
        </div>
        <div style="font-size:0.75rem;color:#6060a0;line-height:1.4">
          Get notified when group members send you messages or add expenses
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
        <button onclick="_grantNotifPermission()" style="
          background:#6c63ff;color:white;border:none;border-radius:8px;
          padding:7px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;
          font-family:inherit;white-space:nowrap;transition:background 0.15s;
        " onmouseover="this.style.background='#8b85ff'" onmouseout="this.style.background='#6c63ff'">
          Allow
        </button>
        <button onclick="_dismissNotifBanner()" style="
          background:transparent;color:#6060a0;border:none;border-radius:8px;
          padding:5px 14px;font-size:0.75rem;cursor:pointer;font-family:inherit;
          white-space:nowrap;
        ">
          Not now
        </button>
      </div>
    </div>
    <style>
      @keyframes slideUpBanner {
        from { transform: translateX(-50%) translateY(20px); opacity:0; }
        to   { transform: translateX(-50%) translateY(0);   opacity:1; }
      }
    </style>
  `;
  document.body.appendChild(banner);
}

async function _grantNotifPermission() {
  _dismissNotifBanner();
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await _refreshFcmToken();
      // Show a welcome notification
      new Notification('🎉 Notifications Enabled!', {
        body: 'You\'ll now receive push notifications from SplitMate.',
        icon: '/icon-192.png',
        tag: 'welcome'
      });
      showToast && showToast('Notifications enabled! ✓', 'success');
    }
  } catch(e) {
    console.warn('Notification permission error:', e);
  }
}

function _dismissNotifBanner() {
  const el = document.getElementById('__notif-banner');
  if (el) el.remove();
}

function _showDeniedHint() {
  // Don't show if already on the settings page
  if (window.location.pathname.includes('notification-settings.html')) return;
  if (document.getElementById('__notif-denied-hint')) return;

  const hint = document.createElement('div');
  hint.id = '__notif-denied-hint';
  hint.innerHTML = `
    <a href="notification-settings.html" style="
      position:fixed; bottom:20px; right:20px;
      background:#22222e; border:1px solid rgba(239,68,68,0.35);
      border-radius:12px; padding:10px 14px;
      box-shadow:0 4px 20px rgba(0,0,0,0.4);
      display:flex; align-items:center; gap:10px;
      z-index:9999; text-decoration:none;
      font-family:'DM Sans',sans-serif;
      animation:slideUpBanner 0.3s ease;
      max-width:260px;
    ">
      <span style="font-size:1.2rem">🔕</span>
      <div>
        <div style="font-size:0.78rem;font-weight:700;color:#f0f0f8;margin-bottom:1px">Notifications blocked</div>
        <div style="font-size:0.7rem;color:#6c63ff;">Tap to fix in settings →</div>
      </div>
      <button onclick="event.preventDefault();event.stopPropagation();this.closest('#__notif-denied-hint').remove()" style="
        background:none;border:none;color:#6060a0;cursor:pointer;font-size:0.9rem;
        padding:0;margin-left:4px;flex-shrink:0;line-height:1;
      ">✕</button>
    </a>`;
  document.body.appendChild(hint);
}

async function _refreshFcmToken() {
  try {
    if (typeof firebase === 'undefined') return;
    if (typeof firebase.messaging !== 'function') return;
    if (!('serviceWorker' in navigator)) return;

    const msg = firebase.messaging();
    const VAPID_KEY = 'BBktwVbBvH0xtvIMJHhGnYTY7UmXi6OgMKem2eEyLETLumEUqgFtDiL9KKxopdIlo4WOPL65sov8PWX5a0m2VUQ';

    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await msg.getToken({ vapidKey: VAPID_KEY });
    if (!token) return;

    const user = Auth.currentUser ? Auth.currentUser() : null;
    if (!user) return;

    await firebase.firestore().collection('users').doc(user.id).set({
      fcmToken: token,
      fcmUpdatedAt: Date.now(),
      email: user.email
    }, { merge: true });

    // Sync to any other doc with same email (dual-auth fallback)
    if (user.email) {
      try {
        const snap = await firebase.firestore().collection('users')
          .where('email', '==', user.email).get();
        for (const doc of snap.docs) {
          if (doc.id !== user.id) {
            await doc.ref.set({ fcmToken: token, fcmUpdatedAt: Date.now() }, { merge: true });
          }
        }
      } catch(e2) {
        console.warn('Cross-system token sync error:', e2);
      }
    }

    msg.onMessage(function(payload) {
      _showForegroundNotif(payload);
    });
  } catch(e) {
    console.warn('FCM token refresh error:', e);
  }
}

// Show in-app popup when a push arrives while user is on the site
function _showForegroundNotif(payload) {
  const title = payload.notification?.title || payload.data?.title || 'SplitMate';
  const body  = payload.notification?.body  || payload.data?.body  || '';
  const url   = payload.data?.url || 'dashboard.html';

  const el = document.createElement('div');
  el.innerHTML = `
    <div id="__fg-notif" style="
      position:fixed; top:24px; right:24px;
      background:#22222e; border:1px solid rgba(108,99,255,0.45);
      border-radius:14px; padding:14px 16px;
      box-shadow:0 8px 32px rgba(0,0,0,0.55);
      display:flex; align-items:flex-start; gap:12px;
      max-width:340px; width:calc(100vw - 48px);
      z-index:9999; animation:slideInRight 0.3s cubic-bezier(0.34,1.56,0.64,1);
      font-family:'DM Sans',sans-serif; cursor:pointer;
    " onclick="window.location.href='${url}'">
      <div style="
        width:38px;height:38px;border-radius:10px;
        background:linear-gradient(135deg,#6c63ff,#8b85ff);
        display:flex;align-items:center;justify-content:center;
        font-size:1.1rem;flex-shrink:0
      ">💸</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:0.85rem;color:#f0f0f8;margin-bottom:2px">${title}</div>
        <div style="font-size:0.78rem;color:#a0a0c0;line-height:1.4;word-break:break-word">${body}</div>
      </div>
      <button onclick="event.stopPropagation();this.closest('#__fg-notif').remove()" style="
        background:none;border:none;color:#6060a0;cursor:pointer;font-size:1rem;
        padding:0;line-height:1;flex-shrink:0;margin-top:-2px
      ">✕</button>
    </div>
    <style>
      @keyframes slideInRight {
        from { transform: translateX(20px); opacity:0; }
        to   { transform: translateX(0);    opacity:1; }
      }
    </style>
  `;
  document.body.appendChild(el);
  // Auto-dismiss after 8 seconds
  setTimeout(() => { document.getElementById('__fg-notif')?.remove(); }, 8000);
}
