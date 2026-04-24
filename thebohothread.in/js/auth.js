/**
 * auth.js — Authentication Module
 * Simulates Google OAuth sign-in using browser localStorage.
 * In production, replace with Firebase Auth or a real OAuth provider.
 */

const Auth = (() => {
  const CURRENT_USER_KEY = 'splitease_current_user';
  const USERS_KEY = 'splitease_users';

  // ── helpers ──────────────────────────────────────────────────────────────

  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY)
      || localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function saveCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  // ── Google OAuth simulation ───────────────────────────────────────────────

  /**
   * Opens a simulated Google sign-in popup.
   * Replace this function body with real Firebase signInWithPopup() call.
   */
  function signInWithGoogle() {
    return new Promise((resolve) => {
      // Simulate Google accounts (demo purposes)
      const modal = document.createElement('div');
      modal.className = 'modal-overlay active';
      modal.innerHTML = `
        <div class="modal" style="max-width:380px">
          <div class="modal-header">
            <div class="modal-title" style="font-size:1.1rem">Sign in with Google</div>
          </div>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:20px">
            Enter your name and email to create/access your account.
          </p>
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-input" id="demo-name" placeholder="Your Name" />
          </div>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-input" id="demo-email" placeholder="you@gmail.com" />
          </div>
          <button class="btn-primary w-full" id="demo-login-btn" style="width:100%">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18"> Continue
          </button>
          <p style="font-size:0.75rem;color:var(--text-dim);margin-top:14px;text-align:center">
            Demo mode — replace with real Firebase Auth in production
          </p>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('demo-login-btn').onclick = () => {
        const name = document.getElementById('demo-name').value.trim();
        const email = document.getElementById('demo-email').value.trim();
        if (!name || !email) {
          alert('Please fill in both fields.');
          return;
        }
        if (!email.includes('@')) {
          alert('Please enter a valid email.');
          return;
        }

        const users = getUsers();
        let user = users[email];
        if (!user) {
          user = {
            uid: 'u_' + Date.now(),
            name,
            email,
            photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c6af7&color=fff`,
            createdAt: Date.now(),
            role: 'user'
          };
          users[email] = user;
          saveUsers(users);
        } else {
          // Update name if changed
          if (user.name !== name) {
            user.name = name;
            user.photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7c6af7&color=fff`;
            users[email] = user;
            saveUsers(users);
          }
        }

        saveCurrentUser(user);
        document.body.removeChild(modal);
        resolve(user);
      };
    });
  }

  function signOut() {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = '/index.html';
  }

  // ── Route guard ───────────────────────────────────────────────────────────

  function requireAuth(redirectTo = '/index.html') {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = redirectTo;
      return null;
    }
    return user;
  }

  // ── Public API ────────────────────────────────────────────────────────────
  return {
    signInWithGoogle,
    signOut,
    getCurrentUser,
    requireAuth,
    getUsers,
  };
})();

// Make available globally
window.Auth = Auth;
