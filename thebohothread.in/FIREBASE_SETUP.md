# 🔥 FIREBASE & GOOGLE AUTH SETUP GUIDE
# SplitMate — Where to put your keys
# =====================================================

## STEP 1 — Create a Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add project" → name it (e.g. "splitmate")
3. Enable Google Analytics (optional)
4. Click "Continue" → project is created

## STEP 2 — Enable Authentication
1. In Firebase Console → left sidebar → "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable: ✅ Email/Password
5. Enable: ✅ Google  ← click Google, toggle ON, add your support email, Save

## STEP 3 — Get Your Firebase Config Keys
1. Firebase Console → Project Settings (gear icon ⚙️ top left)
2. Scroll down to "Your apps" → click "</>" (Web app)
3. Register app name (e.g. "splitmate-web")
4. Copy the firebaseConfig object — it looks like this:

   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890",
     measurementId: "G-XXXXXXXXXX"   ← only if analytics enabled
   };

## STEP 4 — Add Authorized Domain (for Google Sign-In)
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your domain (e.g. "yourdomain.com" or "yourname.github.io")
3. localhost is already added by default (for local testing)

=====================================================
## 📁 EXACTLY WHICH FILES TO EDIT & WHERE
=====================================================

### ── FILE 1: index.html ──────────────────────────
Location: /splitwise-web/index.html
What to change: The <head> section and googleLogin() function

FIND this block (around line 142-143):
  <script src="db.js"></script>
  <script src="auth.js"></script>

REPLACE with:
  <!-- Firebase SDKs -->
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
  <script>
    // ✅ PASTE YOUR FIREBASE CONFIG HERE ↓↓↓
    const firebaseConfig = {
  apiKey: "AIzaSyCLz4cXKGxILS5Use2KPe4XaUnLRhcrIyg",
  authDomain: "thebohothread-96e2c.firebaseapp.com",
  projectId: "thebohothread-96e2c",
  storageBucket: "thebohothread-96e2c.firebasestorage.app",
  messagingSenderId: "100688387088",
  appId: "1:100688387088:web:f8a6af7565d3c25952fe95",
  measurementId: "G-5VTK93354M"
    };
    firebase.initializeApp(firebaseConfig);
  </script>
  <script src="db.js"></script>
  <script src="auth.js"></script>

THEN find the googleLogin() function (around line 179):
  function googleLogin() {
    const email = prompt('Google Sign-In (Demo)\nEnter your Gmail:', 'you@gmail.com');
    ...
  }

REPLACE with:
  function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const firebaseUser = result.user;
        let user = DB.users.findByEmail(firebaseUser.email);
        if (!user) {
          user = DB.users.create(
            firebaseUser.email,
            firebaseUser.displayName || firebaseUser.email,
            '__google__',
            null  // avatar color auto-assigned
          );
        }
        Auth.setSession(user);
        redirect();
      })
      .catch((error) => {
        alert_('login-alert', 'Google sign-in failed: ' + error.message);
      });
  }


### ── FILE 2: auth.js ────────────────────────────
Location: /splitwise-web/auth.js
What to change: The googleSignIn() function (bottom of Auth module)

FIND (around line 75 in auth.js):
  function googleSignIn(callback) {
    // Simulate Google OAuth popup
    callback({ email: 'google_user@gmail.com', name: 'Google User' });
  }

REPLACE with:
  function googleSignIn(callback) {
    // ✅ REAL Google Sign-In via Firebase
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        callback({
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL
        });
      })
      .catch((err) => {
        console.error('Google sign-in error:', err);
        callback(null, err);
      });
  }


### ── FILE 3: invite.html ────────────────────────
Location: /splitwise-web/invite.html
What to change: The googleJoin() function

FIND:
  function googleJoin() {
    const email = prompt('Google Sign-In (Demo)\nEnter your Gmail:', 'you@gmail.com');
    ...
  }

REPLACE with:
  function googleJoin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        const fu = result.user;
        let u = DB.users.findByEmail(fu.email);
        if (!u) u = DB.users.create(fu.email, fu.displayName || fu.email, '__google__');
        Auth.setSession(u);
        acceptInvite();
      })
      .catch(err => setAlert('Google sign-in failed: ' + err.message));
  }

Also add Firebase scripts in <head> of invite.html (same as index.html above).


### ── FILE 4: profile.html ───────────────────────
Location: /splitwise-web/profile.html
No Google Auth changes needed here.
(Profile uses session data, not Firebase directly)


=====================================================
## 🗂️ OPTIONAL: Use Firestore Instead of localStorage
=====================================================

Currently the app uses localStorage (data stays only on one device).
To make data sync across devices (like a real app), use Firestore:

1. Firebase Console → "Firestore Database" → Create database
2. Start in test mode → choose region → Done
3. Add this script to ALL html files in <head>:
   <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>
4. In db.js, replace localStorage calls with:
   const db = firebase.firestore();
   // Instead of: localStorage.setItem(KEY, JSON.stringify(state))
   // Use:        db.collection('users').doc(userId).set(userData)
   // Instead of: JSON.parse(localStorage.getItem(KEY))
   // Use:        db.collection('users').doc(userId).get()

=====================================================
## 🌐 HOSTING ON FIREBASE (FREE)
=====================================================

1. Install Firebase CLI:
   npm install -g firebase-tools

2. Login:
   firebase login

3. In your project folder:
   firebase init hosting
   → Select your Firebase project
   → Public directory: . (just a dot)
   → Single-page app: No
   → Overwrite index.html: No

4. Deploy:
   firebase deploy

5. Your site will be live at:
   https://YOUR-PROJECT-ID.web.app

=====================================================
## ✅ QUICK SUMMARY — FILES TO EDIT
=====================================================

| File         | What to change                          | Priority |
|--------------|----------------------------------------|----------|
| index.html   | Add Firebase scripts + googleLogin()    | ⭐ MUST  |
| auth.js      | Replace googleSignIn() stub            | ⭐ MUST  |
| invite.html  | Add Firebase scripts + googleJoin()     | ⭐ MUST  |
| all .html    | Add Firebase <script> tags in <head>   | ⭐ MUST  |
| db.js        | Replace localStorage with Firestore    | Optional |
| profile.html | No changes needed                      | ✅ Done  |

=====================================================
## 🔑 YOUR KEYS GO IN EXACTLY THIS FORMAT
=====================================================

const firebaseConfig = {
  apiKey:            "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",   ← from Firebase Console
  authDomain:        "your-app.firebaseapp.com",                    ← from Firebase Console
  projectId:         "your-app",                                    ← from Firebase Console
  storageBucket:     "your-app.appspot.com",                       ← from Firebase Console
  messagingSenderId: "000000000000",                                ← from Firebase Console
  appId:             "1:000000000000:web:xxxxxxxxxxxxxxxx"         ← from Firebase Console
};

⚠️  IMPORTANT SECURITY NOTES:
- apiKey in Firebase is SAFE to expose in frontend code (it's not a secret)
- Protect your data using Firebase Security Rules in the console
- Never commit your config to a public GitHub repo if using Firestore
  (use environment variables or .env files instead)
