# 💎 LUXE — 3D Premium E-Commerce Store

A fully responsive, aesthetic luxury e-commerce website built with **vanilla HTML, CSS, and JavaScript** (ES Modules). No build tools required — just open in VS Code with Live Server!

---

## 📁 Project Structure

```
luxe-store/
│
├── index.html                  ← Main shop page (homepage)
│
├── pages/
│   ├── login.html              ← Customer login (Google + Email/Password)
│   ├── product.html            ← Individual product detail page
│   ├── wishlist.html           ← Full wishlist page
│   ├── checkout.html           ← 3-step checkout flow
│   ├── orders.html             ← Order history & tracking
│   └── admin.html              ← Admin dashboard (hardcoded login)
│
├── css/
│   ├── main.css                ← Global reset, tokens, navbar, shared components
│   ├── shop.css                ← Hero, product cards (3D), filters
│   ├── login.css               ← Login / signup page
│   ├── product.css             ← Product detail page
│   ├── checkout.css            ← Checkout flow & order summary
│   ├── orders.css              ← Order cards & tracking timeline
│   └── admin.css               ← Admin dashboard & sidebar
│
├── js/
│   ├── firebase-config.js      ← Firebase init, Google Auth, Email Auth helpers
│   ├── store.js                ← Shared data layer (products, cart, wishlist, reviews)
│   ├── auth.js                 ← Navbar auth state management
│   ├── shop.js                 ← Shop page logic (products, cart panel, modal, reviews)
│   ├── login.js                ← Login page logic
│   ├── product.js              ← Product detail page logic
│   ├── wishlist-page.js        ← Wishlist page logic
│   ├── checkout.js             ← 3-step checkout flow
│   ├── orders.js               ← Order history rendering
│   └── admin.js                ← Full admin dashboard logic
│
└── README.md
```

---

## 🚀 Quick Start in VS Code

### Step 1 — Open project
```
File → Open Folder → select "luxe-store"
```

### Step 2 — Install Live Server (if not already)
- Extensions panel (`Ctrl+Shift+X`) → search **"Live Server"** by Ritwick Dey → Install

### Step 3 — Launch
- Right-click `index.html` → **Open with Live Server**
- Opens at `http://127.0.0.1:5500/`

> ⚠️ **Must use Live Server** — ES Modules don't work with `file://` protocol

---

## 🔥 Firebase Setup (for Google Authentication)

1. Go to **[Firebase Console](https://console.firebase.google.com)**
2. **Add Project** → Name it (e.g. "luxe-store") → Continue
3. **Build → Authentication → Get Started**
4. Enable **Google** sign-in provider
5. Enable **Email/Password** sign-in provider
6. Go to **Project Settings** (⚙️ icon) → **Your Apps** → click `</>` (Web)
7. Register app → copy the `firebaseConfig` object
8. Open `js/firebase-config.js` and replace:

```javascript
const firebaseConfig = {
  apiKey:            "AIzaSyXXXXXXXXXXXXXXXXX",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId:             "1:123456789012:web:abcdef123456"
};
```

9. **Authentication → Settings → Authorized domains** → Add `127.0.0.1` and `localhost`

---

## 🔑 Login Credentials

| Role      | Access             | Credentials                  |
|-----------|--------------------|------------------------------|
| **Admin** | `/pages/admin.html`| Username: `admin` / Password: `admin123` |
| **Customer** | `/pages/login.html` | Google Sign-In or Email/Password |

---

## ✨ Full Feature List

### 🛍️ Shop (Customer Side)
| Feature | Description |
|---------|-------------|
| **3D Product Cards** | CSS perspective + hover tilt effect with depth shadows |
| **Hero Section** | Animated 3D floating card with badges |
| **Category Filters** | One-click filter by Fashion, Jewelry, Beauty, etc. |
| **Live Search** | Real-time search by name, category, or tags |
| **Grid / List View** | Toggle between grid and list layout |
| **Product Modal** | Quick-view with full info, ratings, reviews |
| **Product Detail Page** | Full page with image gallery, tags, stock indicator, quantity picker |
| **Related Products** | Auto-shows products in same category |
| **Add to Cart** | With qty controls, max-stock validation |
| **Cart Side Panel** | Slide-in cart with qty controls, remove, subtotal |
| **Wishlist** | Heart button on every card + dedicated wishlist page |
| **3-Step Checkout** | Shipping → Payment (Card/UPI/NetBanking/COD) → Review & Confirm |
| **Order History** | All past orders with live tracking status timeline |
| **Ratings & Reviews** | Star picker + text review, submitted for admin approval |
| **Responsive Design** | Fully mobile-friendly (320px to 4K) |

### 🔐 Authentication
| Feature | Description |
|---------|-------------|
| **Google Sign-In** | Firebase popup-based Google OAuth |
| **Email/Password** | Sign up and sign in with email |
| **Persistent Session** | Auth state saved in localStorage |
| **User Dropdown** | Avatar + name + dropdown in navbar |
| **Login Gate for Reviews** | Must be logged in to write a review |

### ⚙️ Admin Dashboard
| Panel | Description |
|-------|-------------|
| **Dashboard** | Live stats: products, orders, reviews, users, wishlist count |
| **Products** | Table view with search, edit, delete |
| **Add Product** | Full form: name, category, price, original price, stock, emoji, badge, tags, description |
| **Edit Product** | Modal-based inline editing |
| **Review Approvals** | Approve / Reject / Delete with filter tabs (Pending / Approved / Rejected / All) |
| **Orders** | View all customer orders, update status (Processing → Shipped → Delivered → Cancelled) |
| **Users** | See all registered customers (Google vs Email, join date) |

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| **Background** | Deep navy/black `#080810` |
| **Accent** | Warm gold `#c9a96e` |
| **Display Font** | Cormorant Garamond (serif) |
| **Body Font** | Jost (sans-serif) |
| **3D Effect** | CSS `perspective` + `rotateX/Y` on card hover |
| **Glassmorphism** | Side panels, modals with `backdrop-filter: blur` |
| **Ambient Orbs** | Floating radial gradients in background |

---

## 💾 Data Storage

All data is stored in **localStorage** — no backend needed:

| Key | Contents |
|-----|----------|
| `luxe_products` | Product catalog |
| `luxe_cart` | Cart items |
| `luxe_wishlist` | Wishlisted product IDs |
| `luxe_reviews` | All submitted reviews (with status) |
| `luxe_orders` | Order history |
| `luxe_registered_users` | Firebase user profiles |
| `luxe_user` | Currently logged-in user |
| `luxe_admin_session` | Admin login session (sessionStorage) |

> **Reset all data:** Open browser console → `localStorage.clear()` → refresh

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `> 1100px` | Full desktop layout |
| `768px–1100px` | Tablet — hamburger menu, 2-col checkout |
| `< 768px` | Mobile — single column, full-screen panels |
| `< 480px` | Compact — 2-col product grid, smaller hero |

---

## 🛠️ Extending the Project

### Add more products
Go to Admin → Add Product, or edit `DEFAULT_PRODUCTS` in `js/store.js`

### Change admin credentials
Edit `ADMIN_CREDS` in `js/admin.js`:
```javascript
const ADMIN_CREDS = { username: 'your_name', password: 'your_password' };
```

### Add more categories
Update the `<select>` options in `admin.html` and `shop.js` filter logic

### Use Firestore instead of localStorage
Replace the `load()`/`save()` functions in `store.js` with Firestore reads/writes

---

## 📦 No Dependencies

- ✅ Zero npm packages
- ✅ Zero build tools (no webpack, vite, etc.)
- ✅ Google Fonts via CDN
- ✅ Firebase via CDN (ES module import)
- ✅ Pure HTML + CSS + JavaScript

Just **download → open in VS Code → Live Server → done!**
