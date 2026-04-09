// ============================================================
// TheBohoThread — Main App JS (app.js)
// Firebase Firestore: products, categories, badges, reviews
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, onSnapshot, query, orderBy,
  addDoc, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ─────────────────────────────────────────────────────────────
//  FIREBASE CONFIG  ← Same values as admin.js
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

let firebaseReady = false;
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  firebaseReady = (firebaseConfig.apiKey !== "YOUR_API_KEY");
} catch(e) {}

// ─────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────
let allProducts   = [];
let allCategories = [];
let activeCategory = "all";
let searchQuery    = "";
let sortMode       = "default";
let cart     = JSON.parse(localStorage.getItem("tbt_cart")     || "[]");
let wishlist = JSON.parse(localStorage.getItem("tbt_wishlist") || "[]");
let modalProduct = null;
let modalQty = 1;
let heroIndex = 0;
let heroTimer = null;
const HERO_COUNT = 3;

// Reviews state
let currentReviewProductId = null;
let selectedStarRating     = 0;
let reviewsUnsubscribe     = null;

// ─────────────────────────────────────────────────────────────
//  DOM REFS
// ─────────────────────────────────────────────────────────────
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
const cartTotalEl     = document.getElementById("cart-total");
const sidebarOverlay  = document.getElementById("sidebar-overlay");
const cartSidebar     = document.getElementById("cart-sidebar");
const wishlistSidebar = document.getElementById("wishlist-sidebar");
const wishlistBody    = document.getElementById("wishlist-body");
const productModal    = document.getElementById("product-modal");
const toastContainer  = document.getElementById("toast-container");

// ═════════════════════════════════════════════════════════════
//  FIREBASE LISTENERS
// ═════════════════════════════════════════════════════════════
function startListeners() {
  if (!firebaseReady) { loadDemoData(); return; }

  onSnapshot(query(collection(db,"products"), orderBy("createdAt","desc")), snap => {
    allProducts = snap.docs.map(d => ({id:d.id,...d.data()}));
    renderProducts(); renderScroller();
  }, () => loadDemoData());

  // Categories — real-time: adding a category in admin instantly updates the filter bar
  onSnapshot(collection(db,"categories"), snap => {
    allCategories = snap.docs.map(d => ({id:d.id,...d.data()}));
    renderCategories();
  });
}

function loadDemoData() {
  allProducts = [
    {id:"d1",name:"Ivory Ceramic Vase",category:"Decor",price:1299,originalPrice:1799,description:"Handcrafted ceramic vase with matte ivory finish. Perfect for minimalist interiors.",image:"https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?w=600&q=80",badge:"New",rating:4.5,createdAt:{toMillis:()=>Date.now()-1000}},
    {id:"d2",name:"Linen Throw Blanket",category:"Textiles",price:2499,description:"Premium linen blend throw — soft, breathable, and elegant.",image:"https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80",badge:"Bestseller",rating:5,createdAt:{toMillis:()=>Date.now()-2000}},
    {id:"d3",name:"Oak Side Table",category:"Furniture",price:5999,originalPrice:7499,description:"Solid oak construction with clean geometric lines.",image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",badge:"Sale",rating:4,createdAt:{toMillis:()=>Date.now()-3000}},
    {id:"d4",name:"Artisan Coffee Mug",category:"Kitchen",price:649,description:"Hand-thrown stoneware mug, microwave and dishwasher safe.",image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",badge:"Hot",rating:4.5,createdAt:{toMillis:()=>Date.now()-4000}},
    {id:"d5",name:"Brass Desk Lamp",category:"Lighting",price:3299,originalPrice:3999,description:"Adjustable brass-finished desk lamp with warm LED included.",image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",badge:"Trending",rating:4,createdAt:{toMillis:()=>Date.now()-5000}},
    {id:"d6",name:"Velvet Accent Chair",category:"Furniture",price:8999,description:"Deep navy velvet upholstery on solid beech wood frame.",image:"https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80",badge:"Limited",rating:5,createdAt:{toMillis:()=>Date.now()-6000}},
    {id:"d7",name:"Scented Soy Candle",category:"Decor",price:849,description:"Hand-poured soy wax candle with sandalwood & amber notes.",image:"https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&q=80",badge:"New",rating:5,createdAt:{toMillis:()=>Date.now()-7000}},
    {id:"d8",name:"Marble Cheese Board",category:"Kitchen",price:1899,description:"Genuine marble serving board with walnut handles.",image:"https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=600&q=80",badge:"",rating:4,createdAt:{toMillis:()=>Date.now()-8000}},
  ];
  allCategories = [{id:"c1",name:"Decor",icon:"🏺"},{id:"c2",name:"Textiles",icon:"🧶"},{id:"c3",name:"Furniture",icon:"🪑"},{id:"c4",name:"Kitchen",icon:"🍳"},{id:"c5",name:"Lighting",icon:"💡"}];
  renderProducts(); renderScroller(); renderCategories();
}

// ═════════════════════════════════════════════════════════════
//  CATEGORIES  (from Firebase — dynamic)
// ═════════════════════════════════════════════════════════════
function renderCategories() {
  // Merge DB categories + any from products (fallback)
  const fromProducts = [...new Set(allProducts.map(p=>p.category).filter(Boolean))];
  const fromDB       = allCategories.map(c=>c.name);
  const combined     = [...new Set([...fromDB,...fromProducts])];

  const allPill = `<button class="cat-pill ${activeCategory==="all"?"active":""}" data-cat="all" onclick="filterByCategory('all')">All</button>`;
  const pills   = combined.map(c => {
    const cat = allCategories.find(x=>x.name===c);
    const icon = cat?.icon ? cat.icon+" " : "";
    return `<button class="cat-pill ${activeCategory===c?"active":""}" data-cat="${c}" onclick="filterByCategory('${c}')">${icon}${c}</button>`;
  }).join("");

  if (navCats)   navCats.innerHTML   = allPill + pills;
  if (mobileCats) mobileCats.innerHTML = allPill + pills;
}

window.filterByCategory = function(cat) {
  activeCategory = cat;
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.toggle("active", p.dataset.cat===cat));
  renderProducts();
  document.getElementById("mobile-drawer")?.classList.remove("open");
};

// ═════════════════════════════════════════════════════════════
//  PRODUCTS RENDERING
// ═════════════════════════════════════════════════════════════
function getFiltered() {
  let list = [...allProducts];
  if (activeCategory !== "all") list = list.filter(p=>p.category===activeCategory);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p=>p.name.toLowerCase().includes(q)||(p.description||"").toLowerCase().includes(q));
  }
  switch(sortMode) {
    case "price-asc":  list.sort((a,b)=>a.price-b.price); break;
    case "price-desc": list.sort((a,b)=>b.price-a.price); break;
    case "name-asc":   list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case "newest":     list.sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0)); break;
  }
  return list;
}

function renderProducts() {
  const list = getFiltered();
  renderCategories();
  if (!list.length) {
    productsGrid.innerHTML=`<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256"><path d="M223.15,68.72,175.08,28.74A16,16,0,0,0,164.69,25H91.31a16,16,0,0,0-10.39,3.74L32.85,68.72A16,16,0,0,0,28,80.46V208a16,16,0,0,0,16,16H212a16,16,0,0,0,16-16V80.46A16,16,0,0,0,223.15,68.72Z"/></svg><p>No products found</p></div>`;
    return;
  }
  productsGrid.innerHTML = list.map(productCardHTML).join("");
}

function productCardHTML(p) {
  const wishlisted = wishlist.includes(p.id);
  const stars = starsHTML(p.rating||0);
  const badge = p.badge ? `<span class="product-badge badge-${p.badge.toLowerCase().replace(/\s/g,"-")}">${p.badge}</span>` : "";
  const origPrice = p.originalPrice ? `<span class="original">₹${p.originalPrice.toLocaleString()}</span>` : "";
  return `<article class="product-card" onclick="openProductModal('${p.id}')">
    <div class="product-card-img-wrap">
      <img src="${p.image||"https://via.placeholder.com/400x300/1a2a3a/c9a84c?text=No+Image"}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/1a2a3a/c9a84c?text=No+Image'"/>
      <div class="product-badges">${badge}</div>
      <button class="wish-btn ${wishlisted?"wishlisted":""}" onclick="event.stopPropagation();toggleWishlist('${p.id}')" aria-label="Wishlist">
        <i class="ph ph-heart${wishlisted?"-fill":""}"></i>
      </button>
    </div>
    <div class="product-card-body">
      <div class="product-cat-tag">${p.category||""}</div>
      <h3>${p.name}</h3>
      <div class="star-rating">${stars}</div>
      <p class="product-desc">${p.description||""}</p>
      <div class="product-footer">
        <div class="product-price">₹${p.price.toLocaleString()}${origPrice}</div>
        <button class="add-cart-btn" onclick="event.stopPropagation();addToCart('${p.id}')">Add</button>
      </div>
    </div>
  </article>`;
}

function starsHTML(rating) {
  return Array.from({length:5},(_,i)=>`<span class="star ${i<Math.round(rating)?"filled":""}">★</span>`).join("");
}

// ═════════════════════════════════════════════════════════════
//  SCROLLER
// ═════════════════════════════════════════════════════════════
function renderScroller() {
  const items = allProducts.slice(0,12);
  if (!items.length) return;
  const html = items.map(p=>`<div class="scroll-card" onclick="openProductModal('${p.id}')">
    <img src="${p.image||"https://via.placeholder.com/200x140/1a2a3a/c9a84c?text=No+Image"}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x140/1a2a3a/c9a84c?text=N/A'"/>
    <div class="scroll-card-info"><h4>${p.name}</h4><p>₹${p.price.toLocaleString()}</p></div>
  </div>`).join("");
  scrollerTrack.innerHTML = html + html;
}

// ═════════════════════════════════════════════════════════════
//  PRODUCT MODAL
// ═════════════════════════════════════════════════════════════
window.openProductModal = function(id) {
  const p = allProducts.find(x=>x.id===id);
  if (!p) return;
  modalProduct = p; modalQty = 1;
  currentReviewProductId = id;

  document.getElementById("modal-img").src  = p.image||"https://via.placeholder.com/400x600/1a2a3a/c9a84c?text=No+Image";
  document.getElementById("modal-img").alt  = p.name;
  document.getElementById("modal-cat").textContent  = p.category||"";
  document.getElementById("modal-name").textContent = p.name;
  document.getElementById("modal-desc").textContent = p.description||"";
  document.getElementById("modal-qty-val").textContent = 1;
  document.getElementById("modal-stars").innerHTML = starsHTML(p.rating||0);

  const origStr = p.originalPrice ? ` <span style="font-size:0.9rem;text-decoration:line-through;color:var(--text-muted);">₹${p.originalPrice.toLocaleString()}</span>` : "";
  document.getElementById("modal-price").innerHTML = `₹${p.price.toLocaleString()}${origStr}`;

  const wishlisted = wishlist.includes(id);
  const wBtn = document.getElementById("modal-wish-btn");
  wBtn.className = "modal-wish-btn "+(wishlisted?"wishlisted":"");
  wBtn.innerHTML = `<i class="ph ph-heart${wishlisted?"-fill":""}"></i>`;
  wBtn.onclick = () => toggleWishlist(id);

  document.getElementById("modal-add-cart").onclick = () => { addToCartQty(id,modalQty); closeModal(); };

  productModal.classList.add("open");
  document.body.style.overflow = "hidden";

  resetReviewForm();
  loadProductReviews(id);
};

window.closeModal = function() {
  productModal.classList.remove("open");
  document.body.style.overflow = "";
  if (reviewsUnsubscribe) { reviewsUnsubscribe(); reviewsUnsubscribe = null; }
};

window.changeModalQty = function(delta) {
  modalQty = Math.max(1, modalQty+delta);
  document.getElementById("modal-qty-val").textContent = modalQty;
};

document.getElementById("modal-close").onclick = closeModal;
productModal.onclick = e => { if (e.target===productModal) closeModal(); };

// ═════════════════════════════════════════════════════════════
//  REVIEWS — USER SIDE
// ═════════════════════════════════════════════════════════════
function resetReviewForm() {
  selectedStarRating = 0;
  const n=document.getElementById("review-name"); if(n) n.value="";
  const t=document.getElementById("review-text"); if(t) t.value="";
  highlightStars(0);
}

function highlightStars(val) {
  document.querySelectorAll(".star-pick").forEach((s,i) => s.classList.toggle("active", i<val));
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("star-pick")) {
    selectedStarRating = parseInt(e.target.dataset.val);
    highlightStars(selectedStarRating);
  }
});
document.addEventListener("mouseover", e => { if (e.target.classList.contains("star-pick")) highlightStars(parseInt(e.target.dataset.val)); });
document.addEventListener("mouseout",  e => { if (e.target.classList.contains("star-pick")) highlightStars(selectedStarRating); });

function loadProductReviews(productId) {
  const listEl    = document.getElementById("approved-reviews-list");
  const summaryEl = document.getElementById("reviews-summary");
  if (!listEl) return;

  listEl.innerHTML = `<div style="padding:12px 0;color:var(--text-muted);font-size:0.84rem;font-style:italic;">Loading reviews…</div>`;
  if (reviewsUnsubscribe) reviewsUnsubscribe();

  if (!firebaseReady) {
    listEl.innerHTML = `<div class="no-reviews-msg">Connect Firebase to enable reviews.</div>`;
    return;
  }

  try {
    const q = query(collection(db,"reviews"), where("productId","==",productId), where("status","==","approved"), orderBy("createdAt","desc"));
    reviewsUnsubscribe = onSnapshot(q, snap => {
      const reviews = snap.docs.map(d=>({id:d.id,...d.data()}));
      renderApprovedReviews(reviews, listEl, summaryEl);
    }, () => {
      listEl.innerHTML = `<div class="no-reviews-msg">Reviews require Firebase setup.</div>`;
    });
  } catch(e) { listEl.innerHTML = ""; }
}

function renderApprovedReviews(reviews, listEl, summaryEl) {
  if (!reviews.length) {
    listEl.innerHTML = `<div class="no-reviews-msg">No reviews yet — be the first to share your experience!</div>`;
    if (summaryEl) summaryEl.innerHTML = "";
    return;
  }
  const avg = reviews.reduce((s,r)=>s+(r.rating||0),0)/reviews.length;
  const rounded = Math.round(avg*10)/10;
  if (summaryEl) {
    summaryEl.innerHTML = `<span class="avg-rating-num">${rounded}</span>${Array.from({length:5},(_,i)=>`<span style="color:${i<Math.round(avg)?"#c9a84c":"rgba(201,168,76,0.25)"};">★</span>`).join("")}<span class="review-count-txt">${reviews.length} review${reviews.length>1?"s":""}</span>`;
  }
  listEl.innerHTML = reviews.map(r => {
    const stars = Array.from({length:5},(_,i)=>`<span style="color:${i<r.rating?"#c9a84c":"rgba(201,168,76,0.25)"};">★</span>`).join("");
    const date  = r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "";
    return `<div class="review-item">
      <div class="review-item-top">
        <span class="review-item-author">${r.author||"Anonymous"}</span>
        <div>${stars}</div>
        <span class="review-item-date">${date}</span>
      </div>
      ${r.text?`<p class="review-item-text">${r.text}</p>`:""}
    </div>`;
  }).join("");
}

window.submitReview = async function() {
  const name = (document.getElementById("review-name")?.value||"").trim();
  const text = (document.getElementById("review-text")?.value||"").trim();
  const btn  = document.getElementById("submit-review-btn");
  if (!selectedStarRating) { toast("Please select a star rating.","error"); return; }
  if (!name)               { toast("Please enter your name.","error"); return; }
  if (!currentReviewProductId) return;
  if (!firebaseReady) { toast("Firebase not configured — reviews disabled.","error"); return; }

  const p = allProducts.find(x=>x.id===currentReviewProductId);
  if (btn) { btn.disabled=true; btn.innerHTML=`<i class="ph ph-circle-notch" style="animation:spin 1s linear infinite;display:inline-block;"></i> Submitting…`; }

  try {
    await addDoc(collection(db,"reviews"), {
      productId:   currentReviewProductId,
      productName: p?.name||"Unknown",
      author: name, rating: selectedStarRating, text,
      status: "pending",
      createdAt: serverTimestamp(),
    });
    toast("Thank you! Your review is pending approval 🙏","success");
    resetReviewForm();
  } catch(e) {
    toast("Could not submit review — Firebase error.","error");
  } finally {
    if (btn) { btn.disabled=false; btn.innerHTML=`<i class="ph ph-paper-plane-tilt"></i> Submit Review`; }
  }
};

// ═════════════════════════════════════════════════════════════
//  CART
// ═════════════════════════════════════════════════════════════
function saveCart() { localStorage.setItem("tbt_cart", JSON.stringify(cart)); }

window.addToCart = function(id) { addToCartQty(id,1); };

function addToCartQty(id,qty) {
  const p = allProducts.find(x=>x.id===id);
  if (!p) return;
  const ex = cart.find(c=>c.id===id);
  if (ex) ex.qty+=qty; else cart.push({id,qty});
  saveCart(); updateCartUI();
  toast(`${p.name} added to cart 🛒`);
}

window.removeFromCart = function(id) { cart=cart.filter(c=>c.id!==id); saveCart(); updateCartUI(); };

window.changeQty = function(id,delta) {
  const item=cart.find(c=>c.id===id); if(!item) return;
  item.qty=Math.max(1,item.qty+delta);
  if (item.qty<1) { removeFromCart(id); return; }
  saveCart(); updateCartUI();
};

function updateCartUI() {
  const total=cart.reduce((s,c)=>s+c.qty,0);
  cartCountEl.textContent=total;
  cartCountEl.classList.toggle("show",total>0);
  renderCart();
}

function renderCart() {
  if (!cart.length) {
    cartBody.innerHTML=`<div style="text-align:center;padding:60px 0;color:var(--text-muted);"><i class="ph ph-shopping-cart" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:12px;"></i><p>Your cart is empty</p></div>`;
    cartTotalEl.textContent="₹0.00"; return;
  }
  let sum=0;
  cartBody.innerHTML=cart.map(item=>{
    const p=allProducts.find(x=>x.id===item.id); if(!p) return "";
    sum+=p.price*item.qty;
    return `<div class="cart-item">
      <img src="${p.image||"https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?"}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'"/>
      <div class="cart-item-info">
        <h4>${p.name}</h4><p>₹${p.price.toLocaleString()}</p>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button>
        </div>
      </div>
      <button class="remove-item" onclick="removeFromCart('${item.id}')"><i class="ph ph-trash"></i></button>
    </div>`;
  }).join("");
  cartTotalEl.textContent=`₹${sum.toLocaleString(undefined,{minimumFractionDigits:2})}`;
}

window.checkout = function() {
  if (!cart.length) { toast("Your cart is empty!","error"); return; }
  toast("Thank you! Proceeding to checkout… 🎉","success");
};

// ═════════════════════════════════════════════════════════════
//  WISHLIST
// ═════════════════════════════════════════════════════════════
function saveWishlist() { localStorage.setItem("tbt_wishlist", JSON.stringify(wishlist)); }

window.toggleWishlist = function(id) {
  const p=allProducts.find(x=>x.id===id); if(!p) return;
  const idx=wishlist.indexOf(id);
  if (idx===-1) { wishlist.push(id); toast(`${p.name} added to wishlist ♡`,"success"); }
  else          { wishlist.splice(idx,1); toast(`${p.name} removed from wishlist`); }
  saveWishlist(); updateWishlistUI(); renderProducts();
};

function updateWishlistUI() {
  wishCountEl.textContent=wishlist.length;
  wishCountEl.classList.toggle("show",wishlist.length>0);
  renderWishlist();
}

function renderWishlist() {
  if (!wishlist.length) {
    wishlistBody.innerHTML=`<div style="text-align:center;padding:60px 0;color:var(--text-muted);"><i class="ph ph-heart" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:12px;"></i><p>Your wishlist is empty</p></div>`;
    return;
  }
  wishlistBody.innerHTML=wishlist.map(id=>{
    const p=allProducts.find(x=>x.id===id); if(!p) return "";
    return `<div class="cart-item">
      <img src="${p.image||"https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?"}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'"/>
      <div class="cart-item-info">
        <h4>${p.name}</h4><p>₹${p.price.toLocaleString()}</p>
        <button class="btn-primary" style="margin-top:8px;font-size:0.8rem;padding:6px 14px;" onclick="addToCart('${id}');closeSidebars()">Move to Cart</button>
      </div>
      <button class="remove-item" onclick="toggleWishlist('${id}')"><i class="ph ph-trash"></i></button>
    </div>`;
  }).join("");
}

// ═════════════════════════════════════════════════════════════
//  SIDEBARS
// ═════════════════════════════════════════════════════════════
function openSidebar(el) { sidebarOverlay.classList.add("open"); el.classList.add("open"); document.body.style.overflow="hidden"; }
window.closeSidebars = function() {
  sidebarOverlay.classList.remove("open");
  cartSidebar.classList.remove("open");
  wishlistSidebar.classList.remove("open");
  document.body.style.overflow="";
};

document.getElementById("cart-open-btn").onclick  = ()=>{ renderCart(); openSidebar(cartSidebar); };
document.getElementById("cart-close-btn").onclick = closeSidebars;
document.getElementById("wish-open-btn").onclick  = ()=>{ renderWishlist(); openSidebar(wishlistSidebar); };
document.getElementById("wish-close-btn").onclick = closeSidebars;
sidebarOverlay.onclick = closeSidebars;

// ═════════════════════════════════════════════════════════════
//  HERO SLIDER
// ═════════════════════════════════════════════════════════════
function buildHeroDots() {
  document.getElementById("hero-dots").innerHTML =
    Array.from({length:HERO_COUNT},(_,i)=>`<div class="hero-dot ${i===0?"active":""}" onclick="goHeroSlide(${i})"></div>`).join("");
}

function goHeroSlide(idx) {
  heroIndex=(idx+HERO_COUNT)%HERO_COUNT;
  document.getElementById("hero-slides").style.transform=`translateX(-${heroIndex*100}%)`;
  document.querySelectorAll(".hero-dot").forEach((d,i)=>d.classList.toggle("active",i===heroIndex));
  clearInterval(heroTimer);
  heroTimer=setInterval(()=>goHeroSlide(heroIndex+1),5000);
}
window.goHeroSlide=goHeroSlide;

document.getElementById("hero-prev").onclick=()=>goHeroSlide(heroIndex-1);
document.getElementById("hero-next").onclick=()=>goHeroSlide(heroIndex+1);

let hTouchX=0;
document.getElementById("hero").addEventListener("touchstart",e=>hTouchX=e.touches[0].clientX,{passive:true});
document.getElementById("hero").addEventListener("touchend",e=>{
  const diff=hTouchX-e.changedTouches[0].clientX;
  if (Math.abs(diff)>40) goHeroSlide(diff>0?heroIndex+1:heroIndex-1);
},{passive:true});

// ═════════════════════════════════════════════════════════════
//  SEARCH & SORT
// ═════════════════════════════════════════════════════════════
function onSearch(val) { searchQuery=val.trim(); renderProducts(); }
searchInput?.addEventListener("input",e=>onSearch(e.target.value));
searchMobile?.addEventListener("input",e=>{ onSearch(e.target.value); if(searchInput) searchInput.value=e.target.value; });
sortSelect?.addEventListener("change",e=>{ sortMode=e.target.value; renderProducts(); });

// ═════════════════════════════════════════════════════════════
//  HAMBURGER
// ═════════════════════════════════════════════════════════════
const hamburger    = document.getElementById("hamburger");
const mobileDrawer = document.getElementById("mobile-drawer");
hamburger?.addEventListener("click",()=>mobileDrawer.classList.toggle("open"));
document.addEventListener("click",e=>{ if(!mobileDrawer?.contains(e.target)&&!hamburger?.contains(e.target)) mobileDrawer?.classList.remove("open"); });

// ═════════════════════════════════════════════════════════════
//  TOAST
// ═════════════════════════════════════════════════════════════
window.toast = function(msg, type="") {
  const el=document.createElement("div");
  el.className=`toast ${type}`;
  el.textContent=msg;
  toastContainer.appendChild(el);
  setTimeout(()=>el.remove(),3200);
};

// ═════════════════════════════════════════════════════════════
//  INIT
// ═════════════════════════════════════════════════════════════
buildHeroDots();
heroTimer=setInterval(()=>goHeroSlide(heroIndex+1),5000);
updateCartUI();
updateWishlistUI();
startListeners();

// Inject spin keyframe
const s=document.createElement("style");
s.textContent="@keyframes spin{to{transform:rotate(360deg)}}";
document.head.appendChild(s);
