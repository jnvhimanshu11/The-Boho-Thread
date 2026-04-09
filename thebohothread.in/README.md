# TheBohoThread — Setup Guide

## 🚀 Quick Start

### 1. Set Up Firebase (Free — Spark Plan)

**Step 1 — Create a Firebase project**
1. Go to https://console.firebase.google.com
2. Click **"Add project"** → name it `thebohothread` → Continue
3. Disable Google Analytics (optional) → **Create project**

**Step 2 — Enable Firestore Database**
1. In the left sidebar click **Build → Firestore Database**
2. Click **Create database**
3. Choose **"Start in test mode"** (you can secure it later) → Next
4. Select a region close to you (e.g. `asia-south1` for India) → **Enable**

**Step 3 — Enable Firebase Storage**
1. In the left sidebar click **Build → Storage**
2. Click **Get started** → Start in test mode → **Done**

**Step 4 — Get your config keys**
1. Click the ⚙️ gear icon → **Project settings**
2. Scroll down to **"Your apps"** → click the **</>** (web) icon
3. Register your app (any nickname) → click **Register app**
4. Copy the `firebaseConfig` object shown

**Step 5 — Paste config into your files**

Open both files below and replace the placeholder values:
- `js/admin.js` (lines 11–18)
- `js/app.js` (lines 10–17)

Replace this block in both files:
```js
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",           // ← replace
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",        // ← replace
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",         // ← replace
  appId:             "YOUR_APP_ID"             // ← replace
};
```

---

### 2. Admin Login

Default credentials (change in `js/admin.js`, lines 25–26):

| Field    | Value              |
|----------|--------------------|
| Username | `admin`            |
| Password | `bohothread@2025`  |

Access admin panel: `admin/index.html`

---

### 3. Firestore Collections (auto-created)

| Collection   | Created by        | Purpose                          |
|--------------|-------------------|----------------------------------|
| `products`   | Admin panel       | All product details              |
| `categories` | Admin panel       | Dynamic filter categories        |
| `badges`     | Admin panel       | Product badges (New, Sale, etc.) |
| `reviews`    | User submissions  | Customer reviews (with approval) |

---

## 📋 Features Overview

### Admin Panel (`admin/index.html`)
- 🔐 **Hardcoded login** — username + password in `admin.js`
- 📦 **Products** — Add / Edit / Delete with:
  - Photo upload (drag & drop or file picker, stored in Firebase Storage)
  - OR paste an image URL
  - Category (from your dynamic list)
  - Badge (from your dynamic list)
  - Price, original price, description, rating
- 🏷️ **Categories** — Create categories → instantly visible on user page filter bar
- 🎖️ **Badges** — Create custom badges with any color
- 💬 **Reviews** — Approve / Reject / Delete user reviews
  - Pending badge dot in sidebar
  - Auto-recalculates product rating on approval
- 📊 **Dashboard** — Stats overview + recent products

### User Store (`index.html`)
- 🔍 **Live filter bar** — Categories update in real-time from Firebase
- ⭐ **Reviews** — Approved reviews visible in product modal
- ✍️ **Submit review** — Users submit → goes to admin for approval
- 🛒 **Cart + Wishlist** — Saved to localStorage

---

## 🔒 Securing Firebase (after launch)

In **Firestore Rules**, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read products, categories, badges, approved reviews
    match /products/{id}   { allow read: if true; allow write: if false; }
    match /categories/{id} { allow read: if true; allow write: if false; }
    match /badges/{id}     { allow read: if true; allow write: if false; }

    // Anyone can submit a review; only backend (Firebase Admin SDK) can approve
    match /reviews/{id} {
      allow read:   if true;
      allow create: if request.resource.data.status == "pending";
      allow update, delete: if false;
    }
  }
}
```

For production, replace the hardcoded admin login with **Firebase Authentication**.

---

## 📁 File Structure

```
thebohothread/
├── index.html          ← User-facing store
├── admin/
│   └── index.html      ← Admin panel
├── js/
│   ├── app.js          ← Store logic + Firebase
│   ├── admin.js        ← Admin logic + Firebase
│   └── firebase-config.js  ← (optional shared config)
└── css/
    ├── main.css        ← Store styles
    └── admin.css       ← Admin styles
```
