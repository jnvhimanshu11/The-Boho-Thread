/**
 * sidebar.js — Renders the sidebar + top bar for all app pages.
 * Call Sidebar.init() after DOM loads.
 */

const Sidebar = (() => {

  function render(activePage = '') {
    const user = Auth.requireAuth('../index.html');
    if (!user) return;

    const pending = DB.getPendingInvitesForUser(user.email);
    const inviteBadge = pending.length > 0
      ? `<span style="background:var(--accent);color:#fff;border-radius:99px;padding:1px 7px;font-size:0.72rem;font-weight:700;margin-left:auto">${pending.length}</span>`
      : '';

    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    sidebar.innerHTML = `
      <div class="sidebar-logo">
        <span class="logo-icon">✦</span> SplitMate
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-section-title">Overview</div>

        <button class="nav-item ${activePage === 'dashboard' ? 'active' : ''}"
          onclick="window.location.href='dashboard.html'" data-href="dashboard">
          <span class="nav-icon">🏠</span> Dashboard
        </button>

        <button class="nav-item ${activePage === 'groups' ? 'active' : ''}"
          onclick="window.location.href='groups.html'" data-href="groups">
          <span class="nav-icon">👥</span> My Groups
        </button>

        <button class="nav-item ${activePage === 'invitations' ? 'active' : ''}"
          onclick="window.location.href='invitations.html'" data-href="invitations">
          <span class="nav-icon">✉️</span> Invitations
          ${inviteBadge}
        </button>

        <div class="sidebar-section-title" style="margin-top:8px">Finance</div>

        <button class="nav-item ${activePage === 'balances' ? 'active' : ''}"
          onclick="window.location.href='balances.html'" data-href="balances">
          <span class="nav-icon">⚖️</span> Balances
        </button>

        <button class="nav-item ${activePage === 'activity' ? 'active' : ''}"
          onclick="window.location.href='activity.html'" data-href="activity">
          <span class="nav-icon">📋</span> All Activity
        </button>

        <div class="sidebar-section-title" style="margin-top:8px">Account</div>

        <button class="nav-item ${activePage === 'profile' ? 'active' : ''}"
          onclick="window.location.href='profile.html'" data-href="profile">
          <span class="nav-icon">👤</span> Profile
        </button>

        <button class="nav-item" onclick="confirmSignOut()" style="color:var(--red)">
          <span class="nav-icon">🚪</span> Sign Out
        </button>
      </nav>

      <div class="sidebar-user">
        ${UI.avatar(user)}
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${user.name}</div>
          <div class="sidebar-user-email">${user.email}</div>
        </div>
      </div>
    `;
  }

  function confirmSignOut() {
    UI.confirm('Sign out of SplitEase?', () => Auth.signOut());
  }

  // Mobile hamburger
  function initMobileToggle() {
    const btn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    if (btn && sidebar) {
      btn.addEventListener('click', () => sidebar.classList.toggle('open'));
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== btn) {
          sidebar.classList.remove('open');
        }
      });
    }
  }

  function init(activePage = '') {
    render(activePage);
    initMobileToggle();
  }

  return { init };
})();

window.Sidebar = Sidebar;
window.confirmSignOut = () => UI.confirm('Sign out of SplitEase?', () => Auth.signOut());
