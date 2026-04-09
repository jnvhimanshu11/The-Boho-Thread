// ============================================================
// SHOPNOVA — Main App JS (app.js)
// Firebase Firestore for products & categories
// ============================================================
import { initializeApp }           from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy }
                                    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase config (replace with yours) ──────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── State ──────────────────────────────────────────────────
let allProducts   = [];
let allCategories = [];
let activeCategory = "all";
let searchQuery    = "";
let sortMode       = "default";
let cart           = JSON.parse(localStorage.getItem("sn_cart")    || "[]");
let wishlist       = JSON.parse(localStorage.getItem("sn_wishlist") || "[]");
let modalProduct   = null;
let modalQty       = 1;
let heroIndex      = 0;
let heroTimer      = null;
const HERO_COUNT   = 3;

// ── DOM ────────────────────────────────────────────────────
const productsGrid    = document.getElementById("products-grid");
const scrollerTrack   = document.getElementById("scroller-track");
const navCats         = document.getElementById("nav-categories");
const mobileCats      = document.getElementById("mobile-cat-pills");
const searchInput     = document.getElementById("search-input");
const searchMobile    = document.getElementById("search-input-mobile");
const sortSelect      = document.getElementById("sort-select");
const cartCountEl     = document.getElementById("cart-count");
const wishCountEl     = document.getElementById("wish-count");
const cartBody        = document.getElementById("cart-body");
const cartTotal       = document.getElementById("cart-total");
const sidebarOverlay  = document.getElementById("sidebar-overlay");
const cartSidebar     = document.getElementById("cart-sidebar");
const wishlistSidebar = document.getElementById("wishlist-sidebar");
const wishlistBody    = document.getElementById("wishlist-body");
const productModal    = document.getElementById("product-modal");
const toastContainer  = document.getElementById("toast-container");

// ═══════════════════════════════════════════════════════════
// FIREBASE LISTENERS
// ═══════════════════════════════════════════════════════════
function startListeners() {
  // Products
  const pQuery = query(collection(db, "products"), orderBy("createdAt", "desc"));
  onSnapshot(pQuery, snap => {
    allProducts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProducts();
    renderScroller();
  }, err => {
    console.warn("Firestore error:", err);
    // Fallback demo data for first-run / before Firebase setup
    loadDemoData();
  });

  // Categories
  onSnapshot(collection(db, "categories"), snap => {
    allCategories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCategories();
  }, () => {});
}

// Demo data (shown before Firebase is configured)
function loadDemoData() {
  allProducts = [
    { id:"d1", name:"Ivory Ceramic Vase", category:"Decor", price:1299, originalPrice:1799, description:"Handcrafted ceramic vase with a matte ivory finish. Perfect for minimalist interiors.", image:"https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?w=600&q=80", badge:"New", rating:4.5, createdAt:{ toMillis:()=>Date.now()-1000 } },
    { id:"d2", name:"Linen Throw Blanket", category:"Textiles", price:2499, description:"Premium linen blend throw — soft, breathable, and elegant.", image:"https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80", badge:"Bestseller", rating:5, createdAt:{ toMillis:()=>Date.now()-2000 } },
    { id:"d3", name:"Oak Side Table", category:"Furniture", price:5999, originalPrice:7499, description:"Solid oak construction with clean geometric lines.", image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80", badge:"Sale", rating:4, createdAt:{ toMillis:()=>Date.now()-3000 } },
    { id:"d4", name:"Artisan Coffee Mug", category:"Kitchen", price:649, description:"Hand-thrown stoneware mug, microwave and dishwasher safe.", image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80", badge:"Hot", rating:4.5, createdAt:{ toMillis:()=>Date.now()-4000 } },
    { id:"d5", name:"Brass Desk Lamp", category:"Lighting", price:3299, originalPrice:3999, description:"Adjustable brass-finished desk lamp with warm LED included.", image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80", badge:"Trending", rating:4, createdAt:{ toMillis:()=>Date.now()-5000 } },
    { id:"d6", name:"Velvet Accent Chair", category:"Furniture", price:8999, description:"Deep navy velvet upholstery on solid beech wood frame.", image:"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80", badge:"Limited", rating:5, createdAt:{ toMillis:()=>Date.now()-6000 } },
    { id:"d7", name:"Scented Soy Candle", category:"Decor", price:849, description:"Hand-poured soy wax candle with sandalwood & amber notes.", image:"https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&q=80", badge:"New", rating:5, createdAt:{ toMillis:()=>Date.now()-7000 } },
    { id:"d8", name:"Marble Cheese Board", category:"Kitchen", price:1899, description:"Genuine marble serving board with walnut handles.", image:"https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=600&q=80", badge:"", rating:4, createdAt:{ toMillis:()=>Date.now()-8000 } },
  ];
  renderProducts();
  renderScroller();
}

// ═══════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════
function renderCategories() {
  // Collect categories from products too (in case cats collection is empty)
  const fromProducts = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
  const fromDB       = allCategories.map(c => c.name);
  const combined     = [...new Set([...fromDB, ...fromProducts])];

  const allPill = `<button class="cat-pill ${activeCategory==='all'?'active':''}" data-cat="all" onclick="filterByCategory('all')">All</button>`;
  const pills   = combined.map(c =>
    `<button class="cat-pill ${activeCategory===c?'active':''}" data-cat="${c}" onclick="filterByCategory('${c}')">${c}</button>`
  ).join("");

  navCats.innerHTML    = allPill + pills;
  mobileCats.innerHTML = allPill + pills;
}

window.filterByCategory = function(cat) {
  activeCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(p => {
    p.classList.toggle("active", p.dataset.cat === cat);
  });
  renderProducts();
  document.getElementById("mobile-drawer")?.classList.remove("open");
};

// ═══════════════════════════════════════════════════════════
// PRODUCTS RENDERING
// ═══════════════════════════════════════════════════════════
function getFilteredProducts() {
  let list = [...allProducts];
  if (activeCategory !== "all") list = list.filter(p => p.category === activeCategory);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q));
  }
  switch(sortMode) {
    case "price-asc":  list.sort((a,b) => a.price - b.price); break;
    case "price-desc": list.sort((a,b) => b.price - a.price); break;
    case "name-asc":   list.sort((a,b) => a.name.localeCompare(b.name)); break;
    case "newest":
      list.sort((a,b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      break;
  }
  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  renderCategories();

  if (!list.length) {
    productsGrid.innerHTML = `<div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256"><path d="M223.15,68.72,175.08,28.74A16,16,0,0,0,164.69,25H91.31a16,16,0,0,0-10.39,3.74L32.85,68.72A16,16,0,0,0,28,80.46V208a16,16,0,0,0,16,16H212a16,16,0,0,0,16-16V80.46A16,16,0,0,0,223.15,68.72Z"/></svg>
      <p>No products found</p>
    </div>`;
    return;
  }

  productsGrid.innerHTML = list.map(p => productCardHTML(p)).join("");
}

function productCardHTML(p) {
  const wishlisted = wishlist.includes(p.id);
  const stars = starsHTML(p.rating || 0);
  const badge = p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase().replace(/\s/g,'-')}">${p.badge}</span>` : "";
  const origPrice = p.originalPrice ? `<span class="original">₹${p.originalPrice.toLocaleString()}</span>` : "";
  return `
  <article class="product-card" onclick="openProductModal('${p.id}')">
    <div class="product-card-img-wrap">
      <img src="${p.image || 'https://via.placeholder.com/400x300/1a2a3a/c9a84c?text=No+Image'}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/1a2a3a/c9a84c?text=No+Image'" />
      <div class="product-badges">${badge}</div>
      <button class="wish-btn ${wishlisted?'wishlisted':''}" onclick="event.stopPropagation();toggleWishlist('${p.id}')" title="${wishlisted?'Remove from':'Add to'} wishlist" aria-label="Wishlist">
        <i class="ph ph-heart${wishlisted?'-fill':''}"></i>
      </button>
    </div>
    <div class="product-card-body">
      <div class="product-cat-tag">${p.category || ""}</div>
      <h3>${p.name}</h3>
      <div class="star-rating">${stars}</div>
      <p class="product-desc">${p.description || ""}</p>
      <div class="product-footer">
        <div class="product-price">₹${p.price.toLocaleString()}${origPrice}</div>
        <button class="add-cart-btn" onclick="event.stopPropagation();addToCart('${p.id}')">Add</button>
      </div>
    </div>
  </article>`;
}

function starsHTML(rating) {
  return Array.from({length:5}, (_,i) =>
    `<span class="star ${i < Math.round(rating) ? 'filled' : ''}">★</span>`
  ).join("");
}

// ═══════════════════════════════════════════════════════════
// SCROLLER (auto left-to-right)
// ═══════════════════════════════════════════════════════════
function renderScroller() {
  const items = allProducts.slice(0, 12);
  if (!items.length) return;
  const html = items.map(p => `
    <div class="scroll-card" onclick="openProductModal('${p.id}')">
      <img src="${p.image || 'https://via.placeholder.com/200x140/1a2a3a/c9a84c?text=No+Image'}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x140/1a2a3a/c9a84c?text=N/A'"/>
      <div class="scroll-card-info">
        <h4>${p.name}</h4>
        <p>₹${p.price.toLocaleString()}</p>
      </div>
    </div>`).join("");
  // Duplicate for seamless loop
  scrollerTrack.innerHTML = html + html;
}

// ═══════════════════════════════════════════════════════════
// PRODUCT MODAL
// ═══════════════════════════════════════════════════════════
window.openProductModal = function(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  modalProduct = p;
  modalQty = 1;

  document.getElementById("modal-img").src   = p.image || "https://via.placeholder.com/400x600/1a2a3a/c9a84c?text=No+Image";
  document.getElementById("modal-img").alt   = p.name;
  document.getElementById("modal-cat").textContent  = p.category || "";
  document.getElementById("modal-name").textContent = p.name;
  document.getElementById("modal-desc").textContent = p.description || "";
  document.getElementById("modal-qty-val").textContent = 1;
  document.getElementById("modal-stars").innerHTML = starsHTML(p.rating || 0);

  const origStr = p.originalPrice ? ` <span style="font-size:0.9rem;text-decoration:line-through;color:var(--text-muted);font-weight:400;">₹${p.originalPrice.toLocaleString()}</span>` : "";
  document.getElementById("modal-price").innerHTML = `₹${p.price.toLocaleString()}${origStr}`;

  const wishlisted = wishlist.includes(id);
  const wBtn = document.getElementById("modal-wish-btn");
  wBtn.className = `modal-wish-btn ${wishlisted?'wishlisted':''}`;
  wBtn.innerHTML = `<i class="ph ph-heart${wishlisted?'-fill':''}"></i>`;
  wBtn.onclick = () => toggleWishlist(id);

  document.getElementById("modal-add-cart").onclick = () => { addToCartQty(id, modalQty); closeModal(); };

  productModal.classList.add("open");
  document.body.style.overflow = "hidden";
};

window.closeModal = function() {
  productModal.classList.remove("open");
  document.body.style.overflow = "";
};

window.changeModalQty = function(delta) {
  modalQty = Math.max(1, modalQty + delta);
  document.getElementById("modal-qty-val").textContent = modalQty;
};

document.getElementById("modal-close").onclick = closeModal;
productModal.onclick = (e) => { if (e.target === productModal) closeModal(); };

// ═══════════════════════════════════════════════════════════
// CART
// ═══════════════════════════════════════════════════════════
function saveCart() { localStorage.setItem("sn_cart", JSON.stringify(cart)); }

window.addToCart = function(id) {
  addToCartQty(id, 1);
};

function addToCartQty(id, qty) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ id, qty });
  saveCart();
  updateCartUI();
  toast(`${p.name} added to cart 🛒`);
}

window.removeFromCart = function(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
};

window.changeQty = function(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  if (item.qty < 1) { removeFromCart(id); return; }
  saveCart();
  updateCartUI();
};

function updateCartUI() {
  const total = cart.reduce((s,c) => s + c.qty, 0);
  cartCountEl.textContent = total;
  cartCountEl.classList.toggle("show", total > 0);
  renderCart();
}

function renderCart() {
  if (!cart.length) {
    cartBody.innerHTML = `<div style="text-align:center;padding:60px 0;color:var(--text-muted);">
      <i class="ph ph-shopping-cart" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:12px;"></i>
      <p>Your cart is empty</p>
    </div>`;
    cartTotal.textContent = "₹0.00";
    return;
  }
  let sum = 0;
  cartBody.innerHTML = cart.map(item => {
    const p = allProducts.find(x => x.id === item.id);
    if (!p) return "";
    sum += p.price * item.qty;
    return `<div class="cart-item">
      <img src="${p.image || 'https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'"/>
      <div class="cart-item-info">
        <h4>${p.name}</h4>
        <p>₹${p.price.toLocaleString()}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart('${item.id}')" title="Remove"><i class="ph ph-trash"></i></button>
    </div>`;
  }).join("");
  cartTotal.textContent = `₹${sum.toLocaleString(undefined,{minimumFractionDigits:2})}`;
}

window.checkout = function() {
  if (!cart.length) { toast("Your cart is empty!", "error"); return; }
  toast("Thank you! Proceeding to checkout… 🎉", "success");
  // Integrate your payment gateway here
};

// ═══════════════════════════════════════════════════════════
// WISHLIST
// ═══════════════════════════════════════════════════════════
function saveWishlist() { localStorage.setItem("sn_wishlist", JSON.stringify(wishlist)); }

window.toggleWishlist = function(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  const idx = wishlist.indexOf(id);
  if (idx === -1) {
    wishlist.push(id);
    toast(`${p.name} added to wishlist ♡`, "success");
  } else {
    wishlist.splice(idx, 1);
    toast(`${p.name} removed from wishlist`);
  }
  saveWishlist();
  updateWishlistUI();
  renderProducts();
};

function updateWishlistUI() {
  wishCountEl.textContent = wishlist.length;
  wishCountEl.classList.toggle("show", wishlist.length > 0);
  renderWishlist();
}

function renderWishlist() {
  if (!wishlist.length) {
    wishlistBody.innerHTML = `<div style="text-align:center;padding:60px 0;color:var(--text-muted);">
      <i class="ph ph-heart" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:12px;"></i>
      <p>Your wishlist is empty</p>
    </div>`;
    return;
  }
  wishlistBody.innerHTML = wishlist.map(id => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return "";
    return `<div class="cart-item">
      <img src="${p.image || 'https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'"/>
      <div class="cart-item-info">
        <h4>${p.name}</h4>
        <p>₹${p.price.toLocaleString()}</p>
        <button class="btn-primary" style="margin-top:8px;font-size:0.8rem;padding:6px 14px;" onclick="addToCart('${id}');toggleWishlistSidebar()">Move to Cart</button>
      </div>
      <button class="remove-item" onclick="toggleWishlist('${id}')" title="Remove"><i class="ph ph-trash"></i></button>
    </div>`;
  }).join("");
}

// ═══════════════════════════════════════════════════════════
// SIDEBAR OPEN/CLOSE
// ═══════════════════════════════════════════════════════════
function openSidebar(el) {
  sidebarOverlay.classList.add("open");
  el.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeSidebars() {
  sidebarOverlay.classList.remove("open");
  cartSidebar.classList.remove("open");
  wishlistSidebar.classList.remove("open");
  document.body.style.overflow = "";
}
window.toggleWishlistSidebar = function() { closeSidebars(); };

document.getElementById("cart-open-btn").onclick  = () => { renderCart(); openSidebar(cartSidebar); };
document.getElementById("cart-close-btn").onclick = closeSidebars;
document.getElementById("wish-open-btn").onclick  = () => { renderWishlist(); openSidebar(wishlistSidebar); };
document.getElementById("wish-close-btn").onclick = closeSidebars;
sidebarOverlay.onclick = closeSidebars;

// ═══════════════════════════════════════════════════════════
// HERO SLIDER
// ═══════════════════════════════════════════════════════════
function buildHeroDots() {
  const dotsEl = document.getElementById("hero-dots");
  dotsEl.innerHTML = Array.from({length:HERO_COUNT}, (_,i) =>
    `<div class="hero-dot ${i===0?'active':''}" onclick="goHeroSlide(${i})"></div>`
  ).join("");
}

function goHeroSlide(idx) {
  heroIndex = (idx + HERO_COUNT) % HERO_COUNT;
  document.getElementById("hero-slides").style.transform = `translateX(-${heroIndex * 100}%)`;
  document.querySelectorAll(".hero-dot").forEach((d,i) => d.classList.toggle("active", i === heroIndex));
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goHeroSlide(heroIndex + 1), 5000);
}
window.goHeroSlide = goHeroSlide;

document.getElementById("hero-prev").onclick = () => goHeroSlide(heroIndex - 1);
document.getElementById("hero-next").onclick = () => goHeroSlide(heroIndex + 1);

// Touch swipe on hero
let hTouchX = 0;
document.getElementById("hero").addEventListener("touchstart", e => hTouchX = e.touches[0].clientX, {passive:true});
document.getElementById("hero").addEventListener("touchend", e => {
  const diff = hTouchX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) goHeroSlide(diff > 0 ? heroIndex+1 : heroIndex-1);
}, {passive:true});

// ═══════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════
function onSearch(val) {
  searchQuery = val.trim();
  renderProducts();
}
searchInput?.addEventListener("input", e => onSearch(e.target.value));
searchMobile?.addEventListener("input", e => {
  onSearch(e.target.value);
  if (searchInput) searchInput.value = e.target.value;
});

// ═══════════════════════════════════════════════════════════
// SORT
// ═══════════════════════════════════════════════════════════
sortSelect?.addEventListener("change", e => { sortMode = e.target.value; renderProducts(); });

// ═══════════════════════════════════════════════════════════
// HAMBURGER / MOBILE DRAWER
// ═══════════════════════════════════════════════════════════
const hamburger    = document.getElementById("hamburger");
const mobileDrawer = document.getElementById("mobile-drawer");
hamburger?.addEventListener("click", () => mobileDrawer.classList.toggle("open"));
document.addEventListener("click", e => {
  if (!mobileDrawer.contains(e.target) && !hamburger.contains(e.target)) {
    mobileDrawer.classList.remove("open");
  }
});

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════
window.toast = function(msg, type="") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3200);
};

// ═══════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════
buildHeroDots();
heroTimer = setInterval(() => goHeroSlide(heroIndex + 1), 5000);
updateCartUI();
updateWishlistUI();
startListeners();
