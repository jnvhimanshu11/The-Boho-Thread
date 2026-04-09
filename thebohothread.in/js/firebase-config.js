// ============================================================
// SHOPNOVA - Firebase Configuration
// Replace these values with your own Firebase project config
// Get it from: https://console.firebase.google.com
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";


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
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);