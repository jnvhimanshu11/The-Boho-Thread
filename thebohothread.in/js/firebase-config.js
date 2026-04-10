// ============================================================
// SHOPNOVA - Firebase Configuration
// Replace these values with your own Firebase project config
// Get it from: https://console.firebase.google.com
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";




  const firebaseConfig = {
  apiKey: "AIzaSyCLz4cXKGxILS5Use2KPe4XaUnLRhcrIyg",
  authDomain: "thebohothread-96e2c.firebaseapp.com",
  projectId: "thebohothread-96e2c",
  storageBucket: "thebohothread-96e2c.firebasestorage.app",
  messagingSenderId: "100688387088",
  appId: "1:100688387088:web:f8a6af7565d3c25952fe95",
  measurementId: "G-5VTK93354M"
};

// Initialize Firebasex


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);