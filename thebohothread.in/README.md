# ✦ LiquidStore — Complete Setup Guide

A full-featured e-commerce website with 3D liquid parallax effects, Firebase backend, and admin dashboard.

---

## 🚀 Quick Start

```bash
# 1. Open this folder in VS Code
cd liquidstore

# 2. Install dependencies
npm install

# 3. Configure Firebase (see below first!)
# Edit src/firebase.js with your credentials

# 4. Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔥 Firebase Setup (Free Spark Plan)

### Step 1 — Create Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Give it a name (e.g. `liquidstore`)
3. Disable Google Analytics (optional) → Click **"Create project"**

### Step 2 — Add Web App
1. In your project dashboard, click the **`</>`** (Web) icon
2. Register app name: `LiquidStore`
3. Copy the `firebaseConfig` object shown

### Step 3 — Update `src/firebase.js`
Replace the placeholder values:
```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

### Step 4 — Enable Authentication
1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** tab:
   - Enable **Google** → Add your support email → Save
   - Enable **Phone** → Save

### Step 5 — Enable Firestore
1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** → Select your region → Done

### Step 6 — Firestore Security Rules
Go to **Firestore → Rules** tab and paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /categories/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /badges/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /reviews/{doc} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    match /coupons/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /campaigns/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
Click **Publish**.

### Step 7 — Authorize Your Domain (for Google Login)
1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add `localhost` (already there by default)
3. After deployment, add your production domain too

---

## 🔐 Admin Access

| URL | `/admin` |
|-----|----------|
| Username | `admin` |
| Password | `Admin@2024` |

**To change credentials**, edit `src/context/AuthContext.js`:
```js
const ADMIN_USERNAME = "admin";       // ← change this
const ADMIN_PASSWORD = "Admin@2024";  // ← change this
```

---

## 📋 Admin Dashboard Features

### Products Tab
- Add new products with name, price, description
- Upload images via **URL** or paste multiple URLs
- Assign **category** and **badge** from your created lists
- Set **sale percentage** (auto-calculates discounted price)
- Set **stock quantity**

### Categories Tab
- Create categories freely — they appear **instantly** on the homepage and shop page
- Delete unused categories

### Badges Tab
- Create custom badge names (e.g. "Hot", "New", "Featured", "Limited")
- These appear as colored chips on product cards

### Reviews Tab
- See all **pending reviews** submitted by users
- **Approve** → review becomes visible on product page
- **Reject** → review is permanently deleted

### Coupons Tab
- Create coupon codes with:
  - Custom code (e.g. `SAVE20`)
  - Discount percentage
  - Minimum order value
  - Maximum uses
- Toggle active/inactive status

### Campaigns Tab
- Create promotional campaigns visible on homepage and `/campaigns` page
- Link a coupon code to a campaign
- Toggle active/inactive

---

## 🏗️ Project File Structure

```
liquidstore/
├── public/
│   └── index.html
├── src/
│   ├── firebase.js              ← 🔑 Your Firebase config goes here
│   ├── App.js                   ← Routes and providers
│   ├── index.js                 ← Entry point
│   ├── index.css                ← Global styles + CSS variables
│   │
│   ├── context/
│   │   ├── AuthContext.js       ← Google auth, Phone OTP, Admin login
│   │   └── StoreContext.js      ← Cart, wishlist, coupon state
│   │
│   ├── components/
│   │   ├── LiquidBackground.js  ← WebCanvas liquid parallax animation
│   │   ├── Navbar.js            ← Responsive top navigation
│   │   ├── ProductCard.js       ← Reusable product card
│   │   └── Footer.js            ← Site footer
│   │
│   └── pages/
│       ├── Home.js              ← Landing page + hero + scrolling banner
│       ├── Login.js             ← Google + Phone OTP auth
│       ├── Shop.js              ← Product grid with search/filter/sort
│       ├── ProductDetail.js     ← Product page + image gallery + reviews
│       ├── Cart.js              ← Cart + coupon + order summary
│       ├── Wishlist.js          ← Saved items
│       ├── Profile.js           ← User profile page
│       ├── Admin.js             ← Full admin dashboard
│       └── Campaigns.js        ← Active deals page
│
├── firestore.rules              ← Copy this to Firebase Console
├── package.json
└── README.md                    ← This file
```

---

## ✅ Features Checklist

| Feature | Location |
|---------|----------|
| 3D liquid parallax (scroll + cursor) | `LiquidBackground.js` |
| Google login | `Login.js` + `AuthContext.js` |
| Phone OTP login | `Login.js` + `AuthContext.js` |
| Admin hardcoded login | `AuthContext.js` |
| Add/Edit/Delete products | `Admin.js` → Products tab |
| Photo URL upload (single + multiple) | `Admin.js` → Products tab |
| Manual categories (auto-visible) | `Admin.js` → Categories tab |
| Manual badges | `Admin.js` → Badges tab |
| Wishlist | `Wishlist.js` + `StoreContext.js` |
| Cart with qty control | `Cart.js` + `StoreContext.js` |
| Coupon / voucher system | `Admin.js` + `Cart.js` |
| Campaigns management | `Admin.js` + `Campaigns.js` |
| Sale / discount on products | `Admin.js` Products → salePercent |
| Horizontal auto-scroll product banner | `Home.js` (CSS animation) |
| Review & rating submit | `ProductDetail.js` |
| Admin review approval | `Admin.js` → Reviews tab |
| Approved reviews on product page | `ProductDetail.js` |
| Search + filter + sort | `Shop.js` |
| Mobile responsive | All pages (CSS media queries) |
| Firebase Firestore backend | All pages |
| Persistent cart (localStorage) | `StoreContext.js` |
| User profile page | `Profile.js` |
| Toast notifications | `react-hot-toast` |
| Image gallery (multi-photo) | `ProductDetail.js` |
| Share product link | `ProductDetail.js` |

---

## 🎨 Customization

### Change Brand Colors
Edit `src/index.css` — look for the `:root` block:
```css
:root {
  --accent: #7c3aed;      /* Primary purple */
  --accent2: #06b6d4;     /* Cyan */
  --accent3: #f59e0b;     /* Amber */
  --c1: #0a0a1a;          /* Background dark */
}
```

### Change Brand Name
Search and replace `LiquidStore` across all files.

### Change Currency Symbol
Search and replace `₹` with your preferred symbol (e.g. `$`, `€`, `£`).

### Change Admin Password
In `src/context/AuthContext.js`, lines 12-13.

---

## 🌐 Deployment (Free)

### Deploy to Vercel
```bash
npm install -g vercel
npm run build
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Drag the `build/` folder to netlify.com/drop
```

After deployment, add your domain to Firebase Console:
**Authentication → Settings → Authorized domains**

---

## 🐛 Common Issues

**"Firebase: Error (auth/unauthorized-domain)"**
→ Add your domain in Firebase Console → Authentication → Authorized domains

**Phone OTP not working**
→ Make sure Phone auth is enabled in Firebase Console and your phone number includes country code (+91 for India)

**Products not showing**
→ Check Firestore rules are published; check collection name is exactly `products`

**Google login popup blocked**
→ Allow popups for localhost in your browser settings

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react-router-dom` | Page routing |
| `firebase` | Auth + Firestore database |
| `framer-motion` | Animations |
| `react-hot-toast` | Toast notifications |
| `react-icons` | Icon library |

---

Built with ❤️ — LiquidStore © 2024
