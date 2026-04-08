// ============================================================
// LUXE STORE — login.js
// Handles Google Sign-In + Email/Password auth
// ============================================================

import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../js/firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
  const googleBtn    = document.getElementById('googleSignInBtn');
  const emailSignIn  = document.getElementById('emailSignInBtn');
  const signupBtn    = document.getElementById('signupBtn');
  const switchSignup = document.getElementById('switchToSignup');
  const switchLogin  = document.getElementById('switchToLogin');
  const togglePass   = document.getElementById('togglePass');
  const authError    = document.getElementById('authError');
  const emailForm    = document.getElementById('emailForm');
  const signupForm   = document.getElementById('signupForm');

  // Password toggle
  togglePass?.addEventListener('click', () => {
    const passInput = document.getElementById('passwordInput');
    if (!passInput) return;
    passInput.type = passInput.type === 'password' ? 'text' : 'password';
    togglePass.textContent = passInput.type === 'password' ? '👁' : '🙈';
  });

  // Switch forms
  switchSignup?.addEventListener('click', () => {
    emailForm.style.display   = 'none';
    signupForm.style.display  = '';
    document.getElementById('switchToSignup').closest('.signup-row').style.display = 'none';
    clearError();
  });
  switchLogin?.addEventListener('click', () => {
    signupForm.style.display  = 'none';
    emailForm.style.display   = '';
    document.getElementById('switchToSignup').closest('.signup-row').style.display = '';
    clearError();
  });

  // Google Sign-In
  googleBtn?.addEventListener('click', async () => {
    setLoading(googleBtn, true);
    clearError();
    const { user, error } = await signInWithGoogle();
    if (error) { showError(error); setLoading(googleBtn, false); return; }
    handleSuccess(user);
  });

  // Email Sign-In
  emailSignIn?.addEventListener('click', async () => {
    const email    = document.getElementById('emailInput')?.value.trim();
    const password = document.getElementById('passwordInput')?.value;
    if (!email || !password) { showError('Please enter both email and password.'); return; }
    setLoading(emailSignIn, true);
    clearError();
    const { user, error } = await signInWithEmail(email, password);
    if (error) { showError(error); setLoading(emailSignIn, false); return; }
    handleSuccess(user);
  });

  // Enter key on password field
  document.getElementById('passwordInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') emailSignIn?.click();
  });

  // Sign Up
  signupBtn?.addEventListener('click', async () => {
    const name     = document.getElementById('signupName')?.value.trim();
    const email    = document.getElementById('signupEmail')?.value.trim();
    const password = document.getElementById('signupPassword')?.value;
    if (!name || !email || !password) { showError('Please fill in all fields.'); return; }
    if (password.length < 6) { showError('Password must be at least 6 characters.'); return; }
    setLoading(signupBtn, true);
    clearError();
    const { user, error } = await signUpWithEmail(email, password, name);
    if (error) { showError(error); setLoading(signupBtn, false); return; }
    handleSuccess(user);
  });

  // Auth state changed — if already logged in, redirect
  window.addEventListener('luxe:authChange', (e) => {
    if (e.detail.user) {
      handleSuccess(e.detail.user);
    }
  });

  // Helpers
  function handleSuccess(user) {
    // Redirect to home or intended page
    const redirect = new URLSearchParams(window.location.search).get('redirect') || '../index.html';
    window.location.href = redirect;
  }

  function showError(msg) {
    if (!authError) return;
    authError.textContent = msg;
    authError.style.display = '';
  }

  function clearError() {
    if (!authError) return;
    authError.textContent = '';
    authError.style.display = 'none';
  }

  function setLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.7' : '1';
    if (btn === googleBtn) btn.classList.toggle('loading', loading);
  }
});
