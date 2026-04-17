// ============================================================
// TheBohoThread — User Auth  (Firebase: Google + Phone OTP)
// ============================================================

import { initializeApp }           from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup,
         RecaptchaVerifier, signInWithPhoneNumber,
         onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ── Firebase config (shared with firebase-config.js) ────────
const firebaseConfig = {
  apiKey: "AIzaSyCLz4cXKGxILS5Use2KPe4XaUnLRhcrIyg",
  authDomain: "thebohothread-96e2c.firebaseapp.com",
  projectId: "thebohothread-96e2c",
  storageBucket: "thebohothread-96e2c.firebasestorage.app",
  messagingSenderId: "100688387088",
  appId: "1:100688387088:web:f8a6af7565d3c25952fe95",
  measurementId: "G-5VTK93354M"
};

// Avoid double-initialise if firebase-config.js already ran
let app;
try { app = initializeApp(firebaseConfig, 'auth-instance'); }
catch(e) { app = initializeApp(firebaseConfig); }

const auth     = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

let confirmationResult = null;   // holds OTP session
let recaptchaVerifier  = null;

// ════════════════════════════════════════════════════════════
//  AUTH STATE — update navbar user button
// ════════════════════════════════════════════════════════════
onAuthStateChanged(auth, user => {
  updateNavUser(user);
});

function updateNavUser(user) {
  const btn    = document.getElementById('user-auth-btn');
  const dot    = document.getElementById('user-auth-dot');
  const mobBtn = document.getElementById('mob-user-btn');
  const mobDot = document.getElementById('mob-user-dot');
  if (!btn) return;
  if (user) {
    if (user.photoURL) {
      const avatarHtml = `<img src="${user.photoURL}" alt="avatar" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);">`;
      btn.innerHTML = avatarHtml;
      if (mobBtn) mobBtn.innerHTML = avatarHtml + '<span class="icon-label" id="mob-user-label">Account</span>';
    } else {
      const init = (user.displayName || user.phoneNumber || 'U')[0].toUpperCase();
      const initHtml = `<span style="width:26px;height:26px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.82rem;">${init}</span>`;
      btn.innerHTML = initHtml;
      if (mobBtn) mobBtn.innerHTML = initHtml + '<span class="icon-label" id="mob-user-label">Account</span>';
    }
    if (dot) dot.classList.add('show');
    if (mobDot) mobDot.classList.add('show');
  } else {
    btn.innerHTML = `<i class="ph ph-user"></i>`;
    if (mobBtn) mobBtn.innerHTML = `<i class="ph ph-user"></i><span class="icon-label" id="mob-user-label">Login</span>`;
    if (dot) dot.classList.remove('show');
    if (mobDot) mobDot.classList.remove('show');
  }
}

// ════════════════════════════════════════════════════════════
//  MODAL OPEN / CLOSE
// ════════════════════════════════════════════════════════════
window.openAuthModal = function() {
  const user = auth.currentUser;
  if (user) { openUserMenu(user); return; }
  resetAuthModal();
  document.getElementById('auth-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeAuthModal = function() {
  document.getElementById('auth-modal').classList.remove('open');
  document.body.style.overflow = '';
  clearRecaptcha();
};

function resetAuthModal() {
  showStep('step-choose');
  document.getElementById('auth-phone-input').value   = '';
  document.getElementById('auth-otp-input').value     = '';
  document.getElementById('auth-phone-error').textContent = '';
  document.getElementById('auth-otp-error').textContent   = '';
}

function showStep(id) {
  ['step-choose','step-phone','step-otp','step-profile'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = (s === id) ? 'block' : 'none';
  });
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('auth-modal')
    ?.addEventListener('click', e => { if (e.target.id === 'auth-modal') closeAuthModal(); });
});

// ════════════════════════════════════════════════════════════
//  GOOGLE SIGN-IN
// ════════════════════════════════════════════════════════════
window.signInWithGoogle = async function() {
  setAuthLoading('google', true);
  try {
    const result = await signInWithPopup(auth, provider);
    closeAuthModal();
    showAuthToast(`Welcome, ${result.user.displayName || 'User'}! 👋`);
  } catch(e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      document.getElementById('auth-phone-error').textContent = friendlyError(e.code);
    }
  } finally { setAuthLoading('google', false); }
};

// ════════════════════════════════════════════════════════════
//  PHONE — Step 1: Send OTP
// ════════════════════════════════════════════════════════════
window.showPhoneStep = function() { showStep('step-phone'); };
window.backToChoose  = function() { showStep('step-choose'); clearRecaptcha(); };

// Enforce max 10 digits on phone input
document.addEventListener('DOMContentLoaded', () => {
  const phoneInput = document.getElementById('auth-phone-input');
  if (phoneInput) {
    phoneInput.addEventListener('input', function() {
      // Strip non-digits
      let digits = this.value.replace(/\D/g, '');
      // Cap at 10 digits
      if (digits.length > 10) digits = digits.slice(0, 10);
      this.value = digits;
    });
    phoneInput.addEventListener('keydown', function(e) {
      const digits = this.value.replace(/\D/g, '');
      // Block more digit input after 10 digits (allow control keys)
      const controlKeys = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Enter'];
      if (digits.length >= 10 && !controlKeys.includes(e.key) && /^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });
  }
});

window.sendOTP = async function() {
  const raw   = document.getElementById('auth-phone-input').value.trim();
  const errEl = document.getElementById('auth-phone-error');
  errEl.textContent = '';

  // Basic validation — exactly 10 digits required
  const digits = raw.replace(/\D/g,'');
  if (digits.length < 10) {
    errEl.textContent = 'Enter a valid 10-digit phone number.'; return;
  }
  if (digits.length > 10) {
    errEl.textContent = 'Phone number must be exactly 10 digits.'; return;
  }

  // Build E.164 format
  const phone = '+91' + digits;

  setAuthLoading('phone', true);
  try {
    clearRecaptcha();
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      callback: () => {},
    });
    confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    showStep('step-otp');
    document.getElementById('auth-otp-sent-to').textContent = phone;
    document.getElementById('auth-otp-input').focus();
  } catch(e) {
    errEl.textContent = friendlyError(e.code);
    clearRecaptcha();
  } finally { setAuthLoading('phone', false); }
};

// ════════════════════════════════════════════════════════════
//  PHONE — Step 2: Verify OTP
// ════════════════════════════════════════════════════════════
window.verifyOTP = async function() {
  const otp   = document.getElementById('auth-otp-input').value.trim();
  const errEl = document.getElementById('auth-otp-error');
  errEl.textContent = '';

  if (otp.length < 6) { errEl.textContent = 'Enter the 6-digit OTP.'; return; }

  setAuthLoading('otp', true);
  try {
    const result = await confirmationResult.confirm(otp);
    closeAuthModal();
    const name = result.user.displayName || result.user.phoneNumber;
    showAuthToast(`Welcome! You're signed in 👋`);
  } catch(e) {
    errEl.textContent = friendlyError(e.code);
  } finally { setAuthLoading('otp', false); }
};

// Resend OTP
window.resendOTP = function() { showStep('step-phone'); clearRecaptcha(); };

// Enter key on OTP input
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('auth-otp-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') verifyOTP(); });
  document.getElementById('auth-phone-input')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') sendOTP(); });
});

// ════════════════════════════════════════════════════════════
//  USER MENU (shown when already signed in)
// ════════════════════════════════════════════════════════════
function openUserMenu(user) {
  const el = document.getElementById('user-menu-popup');
  if (!el) return;
  document.getElementById('user-menu-name').textContent  = user.displayName || user.phoneNumber || 'User';
  document.getElementById('user-menu-email').textContent = user.email || user.phoneNumber || '';
  el.classList.toggle('open');

  // Close when clicking outside
  setTimeout(() => {
    document.addEventListener('click', closeMenuOutside, { once: true });
  }, 10);
}

function closeMenuOutside(e) {
  const popup = document.getElementById('user-menu-popup');
  const btn   = document.getElementById('user-auth-btn');
  if (popup && !popup.contains(e.target) && e.target !== btn) {
    popup.classList.remove('open');
  }
}

window.signOutUser = async function() {
  await signOut(auth);
  document.getElementById('user-menu-popup')?.classList.remove('open');
  document.getElementById('mob-user-menu-popup')?.classList.remove('open');
  showAuthToast('You\'ve been signed out.');
};

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════
function clearRecaptcha() {
  if (recaptchaVerifier) {
    try { recaptchaVerifier.clear(); } catch(e) {}
    recaptchaVerifier = null;
  }
  const rc = document.getElementById('recaptcha-container');
  if (rc) rc.innerHTML = '';
}

function setAuthLoading(type, loading) {
  const map = {
    google: 'btn-google-signin',
    phone:  'btn-send-otp',
    otp:    'btn-verify-otp',
  };
  const btn = document.getElementById(map[type]);
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn.dataset.origText = btn.innerHTML;
    btn.innerHTML = `<span class="auth-spinner"></span> Please wait…`;
  } else {
    btn.innerHTML = btn.dataset.origText || btn.innerHTML;
  }
}

function friendlyError(code) {
  const map = {
    'auth/invalid-phone-number':     'Invalid phone number. Enter a valid 10-digit Indian mobile number.',
    'auth/too-many-requests':        'Too many OTP requests. Please wait a few minutes before trying again.',
    'auth/invalid-verification-code':'Incorrect OTP. Please check the code and try again.',
    'auth/code-expired':             'OTP has expired. Please go back and request a new one.',
    'auth/popup-blocked':            'Popup was blocked. Please allow popups for this site.',
    'auth/network-request-failed':   'Network error. Please check your internet connection.',
    'auth/quota-exceeded':           'SMS quota exceeded. Please try again later.',
    'auth/missing-phone-number':     'Phone number is required.',
    'auth/captcha-check-failed':     'Captcha failed. Please refresh and try again.',
    'auth/missing-verification-code':'Please enter the OTP sent to your phone.',
  };
  return map[code] || `Error: ${code}. Please refresh and try again.`;
}

function showAuthToast(msg) {
  // Reuse the existing toast system in app.js if available
  if (typeof showToast === 'function') { showToast(msg, 'success'); return; }
  const t = document.createElement('div');
  t.className = 'toast toast-success';
  t.textContent = msg;
  document.getElementById('toast-container')?.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ── Mobile user button handler ───────────────────────────────
window.handleMobUserBtn = function() {
  const user = auth.currentUser;
  if (user) {
    const popup = document.getElementById('mob-user-menu-popup');
    if (!popup) return;
    document.getElementById('mob-user-menu-name').textContent  = user.displayName || user.phoneNumber || 'User';
    document.getElementById('mob-user-menu-email').textContent = user.email || user.phoneNumber || '';
    popup.classList.toggle('open');
  } else {
    if (typeof closeDrawer === 'function') closeDrawer();
    openAuthModal();
  }
};