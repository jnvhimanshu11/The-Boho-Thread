// ============================================================
// LUXE STORE — store.js
// Shared data store: products, cart, wishlist, reviews
// Persisted to localStorage for cross-page consistency
// ============================================================

// ----- INITIAL PRODUCT DATA -----
const DEFAULT_PRODUCTS = [
  { id: 1,  name: "Crystal Silk Dress",     category: "Fashion",     price: 4999,  original: 7999,  stock: 12, emoji: "👗",  badge: "NEW",  desc: "Crafted from pure mulberry silk with hand-sewn crystal embellishments. A timeless piece for the discerning woman.", tags: ["luxury","dress","evening"] },
  { id: 2,  name: "18k Gold Hoop Earrings", category: "Jewelry",     price: 2499,  original: 3499,  stock: 30, emoji: "💍",  badge: "HOT",  desc: "18k gold-plated hoops with diamond-cut texture. Lightweight and elegant for everyday luxury.", tags: ["gold","jewelry","gift"] },
  { id: 3,  name: "Oriental Velvet Perfume",category: "Beauty",      price: 3299,  original: 4199,  stock: 25, emoji: "🌸",  badge: "",     desc: "A sophisticated oriental fragrance with notes of oud, rose, and vanilla. Long-lasting and unforgettable.", tags: ["fragrance","beauty","gift"] },
  { id: 4,  name: "Wireless Earbuds Pro",   category: "Electronics", price: 8999,  original: 12999, stock: 18, emoji: "🎧",  badge: "SALE", desc: "Premium active noise-cancelling earbuds with 36-hour battery life and studio-quality sound.", tags: ["audio","tech","earbuds"] },
  { id: 5,  name: "Marble Candle Set",      category: "Home",        price: 1999,  original: 2799,  stock: 40, emoji: "🕯️", badge: "",     desc: "Hand-poured soy wax candles in Italian marble vessels. Scented with jasmine and white cedar.", tags: ["home","candle","gift"] },
  { id: 6,  name: "Vitamin C Glow Serum",   category: "Beauty",      price: 2199,  original: 2999,  stock: 60, emoji: "✨",  badge: "",     desc: "Advanced Vitamin C & Hyaluronic acid serum for a radiant, youthful complexion. Dermatologist tested.", tags: ["skincare","beauty","glow"] },
  { id: 7,  name: "Grade A Cashmere Scarf", category: "Fashion",     price: 3599,  original: 5999,  stock: 15, emoji: "🧣",  badge: "",     desc: "Ultra-soft Grade A cashmere scarf. Hand-loomed in Scotland with a classic herringbone weave.", tags: ["cashmere","fashion","winter"] },
  { id: 8,  name: "Smart Watch Elite",      category: "Electronics", price: 18999, original: 24999, stock: 8,  emoji: "⌚",  badge: "HOT",  desc: "Premium smartwatch with AMOLED display, health monitoring, 7-day battery life and sapphire glass.", tags: ["watch","tech","luxury"] },
  { id: 9,  name: "Diamond Tennis Bracelet",category: "Jewelry",     price: 9999,  original: 14999, stock: 5,  emoji: "💎",  badge: "NEW",  desc: "Elegant tennis bracelet with 2ct total diamond weight set in sterling silver with rhodium plating.", tags: ["diamond","jewelry","luxury"] },
  { id: 10, name: "Rosewood Diffuser Set",  category: "Home",        price: 1599,  original: 2199,  stock: 35, emoji: "🌿",  badge: "",     desc: "Premium rosewood reed diffuser with 100ml long-lasting fragrance oil. Fills any room beautifully.", tags: ["home","fragrance","diffuser"] },
];

// ----- STORAGE KEYS -----
const KEYS = {
  products: 'luxe_products',
  cart:     'luxe_cart',
  wishlist: 'luxe_wishlist',
  reviews:  'luxe_reviews',
  nextPid:  'luxe_next_pid',
  nextRid:  'luxe_next_rid',
};

// ----- HELPERS -----
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

// ----- PRODUCTS -----
export function getProducts() {
  const stored = load(KEYS.products, null);
  if (!stored) { save(KEYS.products, DEFAULT_PRODUCTS); return DEFAULT_PRODUCTS; }
  return stored;
}
export function saveProducts(products) { save(KEYS.products, products); }

export function addProduct(data) {
  const products = getProducts();
  const nextId   = load(KEYS.nextPid, 200);
  const product  = { ...data, id: nextId, reviews: [] };
  products.push(product);
  save(KEYS.products, products);
  save(KEYS.nextPid, nextId + 1);
  return product;
}

export function updateProduct(id, data) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  products[idx] = { ...products[idx], ...data };
  save(KEYS.products, products);
  return true;
}

export function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id);
  save(KEYS.products, products);
  // Also delete associated reviews
  const reviews = getReviews().filter(r => r.productId !== id);
  save(KEYS.reviews, reviews);
}

export function getProductById(id) {
  return getProducts().find(p => p.id === id) || null;
}

// ----- CART -----
export function getCart() { return load(KEYS.cart, {}); }
export function saveCart(cart) { save(KEYS.cart, cart); }

export function addToCart(productId, qty = 1) {
  const cart    = getCart();
  const product = getProductById(productId);
  if (!product || product.stock <= 0) return { success: false, msg: 'Out of stock' };
  const current = cart[productId]?.qty || 0;
  if (current + qty > product.stock) return { success: false, msg: 'Max stock reached' };
  cart[productId] = { ...product, qty: current + qty };
  saveCart(cart);
  return { success: true };
}

export function removeFromCart(productId) {
  const cart = getCart();
  delete cart[productId];
  saveCart(cart);
}

export function updateCartQty(productId, qty) {
  const cart    = getCart();
  const product = getProductById(productId);
  if (!cart[productId]) return;
  if (qty <= 0) { removeFromCart(productId); return; }
  if (product && qty > product.stock) qty = product.stock;
  cart[productId].qty = qty;
  saveCart(cart);
}

export function getCartTotal() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getCartCount() {
  const cart = getCart();
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

export function clearCart() { save(KEYS.cart, {}); }

// ----- WISHLIST -----
export function getWishlist() { return new Set(load(KEYS.wishlist, [])); }
export function saveWishlist(set) { save(KEYS.wishlist, [...set]); }

export function toggleWishlist(productId) {
  const wl = getWishlist();
  const added = !wl.has(productId);
  if (added) wl.add(productId); else wl.delete(productId);
  saveWishlist(wl);
  return added;
}

export function isWishlisted(productId) { return getWishlist().has(productId); }

// ----- REVIEWS -----
export function getReviews() { return load(KEYS.reviews, []); }
export function saveReviews(reviews) { save(KEYS.reviews, reviews); }

export function addReview(productId, { name, rating, text, userEmail = '', userPhoto = '' }) {
  const reviews = getReviews();
  const id      = load(KEYS.nextRid, 1);
  reviews.push({
    id, productId, name, rating, text,
    userEmail, userPhoto,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
  save(KEYS.reviews, reviews);
  save(KEYS.nextRid, id + 1);
  return id;
}

export function getProductReviews(productId, statusFilter = 'approved') {
  return getReviews().filter(r => r.productId === productId &&
    (statusFilter === 'all' || r.status === statusFilter));
}

export function approveReview(id) {
  const reviews = getReviews();
  const r = reviews.find(r => r.id === id);
  if (r) { r.status = 'approved'; save(KEYS.reviews, reviews); }
}

export function rejectReview(id) {
  const reviews = getReviews();
  const r = reviews.find(r => r.id === id);
  if (r) { r.status = 'rejected'; save(KEYS.reviews, reviews); }
}

export function deleteReview(id) {
  save(KEYS.reviews, getReviews().filter(r => r.id !== id));
}

export function getAverageRating(productId) {
  const approved = getProductReviews(productId, 'approved');
  if (!approved.length) return { avg: 0, count: 0 };
  const avg = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
  return { avg: Math.round(avg * 10) / 10, count: approved.length };
}

// ----- FORMAT HELPERS -----
export function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

export function starsHTML(rating) {
  const full  = Math.round(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

// ----- TOAST (shared utility - works anywhere) -----
export function showToast(message, type = 'info', duration = 3200) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const toast  = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="t-icon">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 320);
  }, duration);
}
