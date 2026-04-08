// ============================================================
// LUXE STORE — firebase-config.js
// Firebase initialization & Google Auth setup
//
// HOW TO CONFIGURE:
// 1. Go to https://console.firebase.google.com
// 2. Create a project → Add Web App → Copy config below
// 3. Enable Authentication → Sign-in methods → Google
// 4. Enable Email/Password authentication (optional)
// 5. Add your domain to Authorized domains
// ============================================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, updateProfile }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// ⚠️  REPLACE WITH YOUR FIREBASE PROJECT CONFIG ⚠️
// Get this from Firebase Console → Project Settings → Your Apps
const firebaseConfig = {
  apiKey: "AIzaSyAVBiyOmq3EOhpKESXy1lW3rSfNqHh35Mk",
  authDomain: "e-commerce-745b7.firebaseapp.com",
  projectId: "e-commerce-745b7",
  storageBucket: "e-commerce-745b7.firebasestorage.app",
  messagingSenderId: "787107058065",
  appId: "1:787107058065:web:5fd82bbd55850793184a30",
  measurementId: "G-849YKJF3VK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Persist user info to localStorage for cross-page state
function persistUser(user) {
  if (user) {
    localStorage.setItem('luxe_user', JSON.stringify({
      uid:         user.uid,
      displayName: user.displayName || 'User',
      email:       user.email,
      photoURL:    user.photoURL || '',
      provider:    user.providerData[0]?.providerId || 'email',
      loginAt:     new Date().toISOString()
    }));
  } else {
    localStorage.removeItem('luxe_user');
  }
}

// Track registered users list (demo - in production use Firestore)
function trackUser(user) {
  const users = JSON.parse(localStorage.getItem('luxe_registered_users') || '[]');
  const exists = users.find(u => u.uid === user.uid);
  if (!exists) {
    users.push({
      uid:         user.uid,
      displayName: user.displayName || 'User',
      email:       user.email,
      photoURL:    user.photoURL || '',
      provider:    user.providerData[0]?.providerId || 'email',
      registeredAt: new Date().toISOString()
    });
    localStorage.setItem('luxe_registered_users', JSON.stringify(users));
  }
}

// Auth state listener
onAuthStateChanged(auth, (user) => {
  persistUser(user);
  if (user) trackUser(user);
  // Dispatch custom event for other modules
  window.dispatchEvent(new CustomEvent('luxe:authChange', { detail: { user } }));
});

// Helpers
export function getCurrentUser() {
  const stored = localStorage.getItem('luxe_user');
  return stored ? JSON.parse(stored) : null;
}

export function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem('luxe_registered_users') || '[]');
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (err) {
    return { user: null, error: err.message };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (err) {
    let msg = 'Sign in failed. Please try again.';
    if (err.code === 'auth/user-not-found')   msg = 'No account found with this email.';
    if (err.code === 'auth/wrong-password')   msg = 'Incorrect password.';
    if (err.code === 'auth/invalid-email')    msg = 'Invalid email address.';
    if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
    return { user: null, error: msg };
  }
}

export async function signUpWithEmail(email, password, name) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    return { user: result.user, error: null };
  } catch (err) {
    let msg = 'Sign up failed. Please try again.';
    if (err.code === 'auth/email-already-in-use') msg = 'An account already exists with this email.';
    if (err.code === 'auth/weak-password')        msg = 'Password must be at least 6 characters.';
    if (err.code === 'auth/invalid-email')        msg = 'Invalid email address.';
    return { user: null, error: msg };
  }
}

export async function logOut() {
  await signOut(auth);
}

export { auth, googleProvider };
