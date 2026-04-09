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
  apiKey:            "AIzaSyAVBiyOmq3EOhpKESXy1lW3rSfNqHh35Mk",
  authDomain:        "e-commerce-745b7.firebaseapp.com",
  projectId:         "e-commerce-745b7",
  storageBucket:     "e-commerce-745b7.firebasestorage.app",
  messagingSenderId: "787107058065",
  appId:             "1:787107058065:web:5fd82bbd55850793184a30",
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
  const btn = document.getElementById('user-auth-btn');
  const dot = document.getElementById('user-auth-dot');
  if (!btn) return;
  if (user) {
    // Show avatar initial or photo
    if (user.photoURL) {
      btn.innerHTML = `<img src="${user.photoURL}" alt="avatar" style="width:26px;height:26px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);">`;
    } else {
      const init = (user.displayName || user.phoneNumber || 'U')[0].toUpperCase();
      btn.innerHTML = `<span style="width:26px;height:26px;border-radius:50%;background:var(--gold);color:var(--navy);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.82rem;">${init}</span>`;
    }
    if (dot) dot.classList.add('show');
  } else {
    btn.innerHTML = `<i class="ph ph-user"></i>`;
    if (dot) dot.classList.remove('show');
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

window.sendOTP = async function() {
  const raw   = document.getElementById('auth-phone-input').value.trim();
  const errEl = document.getElementById('auth-phone-error');
  errEl.textContent = '';

  // Basic validation — accept with or without leading +
  const phone = raw.startsWith('+') ? raw : '+91' + raw.replace(/\D/g,'');
  if (phone.replace(/\D/g,'').length < 10) {
    errEl.textContent = 'Enter a valid phone number.'; return;
  }

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
  document.getElementById('user-menu-popup').classList.remove('open');
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
    'auth/invalid-phone-number':     'Invalid phone number. Use format: +91XXXXXXXXXX',
    'auth/too-many-requests':        'Too many attempts. Please try again later.',
    'auth/invalid-verification-code':'Incorrect OTP. Please check and try again.',
    'auth/code-expired':             'OTP has expired. Please request a new one.',
    'auth/popup-blocked':            'Popup was blocked. Allow popups for this site.',
    'auth/network-request-failed':   'Network error. Check your connection.',
    'auth/quota-exceeded':           'SMS quota exceeded. Try again later.',
  };
  return map[code] || 'Something went wrong. Please try again.';
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
