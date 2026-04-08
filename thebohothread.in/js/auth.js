// LUXE STORE — auth.js — Auth state for all pages
import { getCurrentUser, logOut } from './firebase-config.js';

function initNavAuth() {
  const user = getCurrentUser();
  const els = {
    loginBtn:       document.getElementById('loginNavBtn'),
    avatarWrap:     document.getElementById('userAvatarWrap'),
    avatar:         document.getElementById('userAvatar'),
    dropName:       document.getElementById('dropdownName'),
    dropEmail:      document.getElementById('dropdownEmail'),
    heroBtn:        document.getElementById('heroAuthBtn'),
    mobileLogin:    document.getElementById('mobileLoginLink'),
  };

  if (user) {
    if (els.loginBtn)   els.loginBtn.style.display = 'none';
    if (els.avatarWrap) els.avatarWrap.style.display = 'block';
    if (els.avatar) {
      els.avatar.src = user.photoURL ||
        'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'U') + '&background=c9a96e&color=000&bold=true';
      els.avatar.alt = user.displayName || 'User';
    }
    if (els.dropName)  els.dropName.textContent  = user.displayName || 'User';
    if (els.dropEmail) els.dropEmail.textContent = user.email || '';
    if (els.heroBtn) {
      els.heroBtn.textContent = 'My Account';
      els.heroBtn.href = 'pages/orders.html';
    }
    if (els.mobileLogin) {
      const firstName = (user.displayName || 'Account').split(' ')[0];
      els.mobileLogin.textContent = '👤 ' + firstName;
      els.mobileLogin.href = 'pages/orders.html';
    }
  } else {
    if (els.loginBtn)   els.loginBtn.style.display = '';
    if (els.avatarWrap) els.avatarWrap.style.display = 'none';
    if (els.heroBtn) {
      els.heroBtn.textContent = 'Sign In with Google';
    }
  }

  // Logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logOut();
      window.location.reload();
    });
  }
}

window.addEventListener('luxe:authChange', initNavAuth);
document.addEventListener('DOMContentLoaded', initNavAuth);
