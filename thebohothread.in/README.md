# 🛍️ ShopNova — E-Commerce Website

A complete, responsive 3D-styled e-commerce website with admin panel, Firebase backend, wishlist, product scroller, and more.

---

## 📁 Project Structure

```
shopnova/
├── index.html              ← Main storefront
├── css/
│   ├── main.css            ← Storefront styles
│   └── admin.css           ← Admin panel styles
├── js/
│   ├── app.js              ← Storefront logic (Firebase)
│   └── admin.js            ← Admin logic (Firebase)
└── admin/
    └── index.html          ← Admin panel
```

---

## 🔥 Firebase Setup (Free Tier — Spark Plan)

### Step 1 — Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add Project** → Enter a project name → Continue
3. Disable Google Analytics (optional) → **Create Project**

### Step 2 — Enable Firestore Database

1. In the left menu → **Build → Firestore Database**
2. Click **Create database** → Choose **Start in test mode**
3. Choose your region → Click **Enable**

### Step 3 — Enable Firebase Storage (for image uploads)

1. In the left menu → **Build → Storage**
2. Click **Get Started** → **Start in test mode** → **Next** → **Done**

### Step 4 — Get your Firebase Config

1. Click the ⚙️ **gear icon** → **Project settings**
2. Scroll to **Your apps** → Click **</>** (Web)
3. Register app (any nickname) → Copy the `firebaseConfig` object

### Step 5 — Update Config in Code

Replace the `firebaseConfig` object in **both** files:
- `js/app.js`
- `js/admin.js`

```javascript
const firebaseConfig = {
  apiKey:            "AIza...",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123...:web:abc..."
};
```

### Step 6 — Firestore Security Rules (after testing)

Go to **Firestore → Rules** and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for products, categories, badges
    match /products/{doc} {
      allow read: if true;
      allow write: if false; // Admin writes via app — lock down properly in production
    }
    match /categories/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /badges/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

> **Note:** For production, implement Firebase Authentication for admin writes.

---

## 🔐 Admin Panel

**URL:** `http://localhost:PORT/admin/`

**Default Credentials:**
- Username: `admin`
- Password: `shopnova123`

> ⚠️ **Change the password** in `js/admin.js`:
> ```javascript
> const ADMIN_PASS = "your_secure_password_here";
> ```

### Admin Features:
- ✅ Dashboard with product/category/badge stats
- ✅ Add / Edit / Delete products
- ✅ Upload product images (drag & drop or file picker)
- ✅ Paste image URLs
- ✅ Manage categories (manual, not hardcoded)
- ✅ Manage badges (custom name + color)
- ✅ Real-time sync with Firebase

---

## 🌐 Running Locally (VS Code)

### Option 1 — Live Server (Recommended)

1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

### Option 2 — Python HTTP Server

```bash
cd shopnova
python -m http.server 8080
# Visit: http://localhost:8080
```

### Option 3 — Node.js

```bash
npm install -g serve
serve shopnova -p 8080
```

> ⚠️ **Important:** Must run on a server (not `file://`) because of ES Modules and Firebase SDK.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🛍️ Product Grid | Responsive grid, cards with image, price, badge, rating |
| 🏷️ Categories | Dynamic pills in navbar — auto-added from admin |
| 🎖️ Badges | Custom badges (New, Sale, Hot, etc.) with custom colors |
| 🔍 Search | Live search in navbar (desktop + mobile) |
| ↕️ Sort | Sort by price, name, or newest |
| ❤️ Wishlist | Sidebar wishlist with move-to-cart |
| 🛒 Cart | Sidebar cart with qty controls, subtotal |
| 🎠 Product Scroller | Auto left-to-right infinite scroll strip |
| 🎬 Hero Banner | Auto-sliding hero with 3 slides, touch swipe |
| 📱 Mobile Friendly | Hamburger menu, responsive grid, touch support |
| 🔔 Toast Notifications | Non-intrusive success/error toasts |
| 🖼️ Product Modal | Full-screen detail modal with qty picker |
| 💾 Persistence | Cart & wishlist saved to localStorage |
| 🔥 Firebase | Real-time Firestore + Firebase Storage |

---

## 🎨 Customization

### Change Brand Name
In `index.html` and `admin/index.html`, change `ShopNova` to your brand.

### Change Currency
In `js/app.js` and `js/admin.js`, replace `₹` with your currency symbol.

### Change Colors
In `css/main.css`, update the CSS variables:
```css
:root {
  --gold:  #c9a84c;  /* accent color */
  --navy:  #0d1b2a;  /* background */
}
```

---

## 🚀 Deployment Options (Free)

| Platform | Steps |
|---|---|
| **Firebase Hosting** | `npm i -g firebase-tools` → `firebase init hosting` → `firebase deploy` |
| **Netlify** | Drag & drop `shopnova/` folder to netlify.com |
| **Vercel** | `npm i -g vercel` → `vercel` in project folder |
| **GitHub Pages** | Push to repo → Settings → Pages → Deploy from branch |

---

## 📦 Dependencies (CDN — no npm needed)

- Firebase SDK 10.12.0
- Phosphor Icons 2.1.1
- Google Fonts (Cormorant Garamond + DM Sans)

All loaded from CDN — no build step required!
