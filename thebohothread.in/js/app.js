// ============================================================
// TheBohoThread — Main App JS  (Firebase Firestore edition)
// ============================================================
// NOTE: This file uses ES module imports — the <script> tag
// in shop.html / index.html must have type="module"
// ============================================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc, getDocs, addDoc,
  query, orderBy, where, serverTimestamp, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLz4cXKGxILS5Use2KPe4XaUnLRhcrIyg",
  authDomain: "thebohothread-96e2c.firebaseapp.com",
  projectId: "thebohothread-96e2c",
  storageBucket: "thebohothread-96e2c.firebasestorage.app",
  messagingSenderId: "100688387088",
  appId: "1:100688387088:web:f8a6af7565d3c25952fe95"
};

const _app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db   = getFirestore(_app);

// ── Firestore helpers ─────────────────────────────────────────
async function fsGetAll(colName, orderField = 'createdAt', dir = 'desc') {
  // Never use orderBy() — requires Firestore indexes. Sort in JS instead.
  try {
    const snap = await getDocs(collection(db, colName));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    docs.sort((a, b) => {
      let va = a[orderField], vb = b[orderField];
      if (va?.toMillis) va = va.toMillis();
      if (vb?.toMillis) vb = vb.toMillis();
      if (typeof va === 'string' && typeof vb === 'string') {
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      va = va ?? 0; vb = vb ?? 0;
      return dir === 'asc' ? (va > vb ? 1 : -1) : (vb > va ? 1 : -1);
    });
    return docs;
  } catch(e) {
    console.error(`fsGetAll(${colName}) error:`, e);
    return [];
  }
}

let allProducts    = [];
let allCategories  = [];
let allBadges      = [];
let activeCategory = 'all';
let searchQuery    = '';
let sortMode       = 'default';
let cart     = JSON.parse(localStorage.getItem('tbt_cart')     || '[]');
let wishlist = JSON.parse(localStorage.getItem('tbt_wishlist') || '[]');
let modalProduct = null;
let modalQty     = 1;
let heroIndex    = 0;
let heroTimer    = null;
const HERO_COUNT = 3;
let currentReviewProductId = null;
let selectedStarRating     = 0;

const productsGrid    = document.getElementById('products-grid');
const scrollerTrack   = document.getElementById('scroller-track');
const navCats         = document.getElementById('collection-categories');
const mobileCats      = document.getElementById('mobile-cat-pills');
const searchInput     = document.getElementById('search-input');
const searchMobile    = document.getElementById('search-input-mobile');
const sortSelect      = document.getElementById('sort-select');
const cartCountEl     = document.getElementById('cart-count');
const wishCountEl     = document.getElementById('wish-count');
const cartBody        = document.getElementById('cart-body');
const cartTotalEl     = document.getElementById('cart-total');
const sidebarOverlay  = document.getElementById('sidebar-overlay');
const cartSidebar     = document.getElementById('cart-sidebar');
const wishlistSidebar = document.getElementById('wishlist-sidebar');
const wishlistBody    = document.getElementById('wishlist-body');
const productModal    = document.getElementById('product-modal');
const toastContainer  = document.getElementById('toast-container');

// ── LOAD DATA (Firebase) ─────────────────────────────────────
async function loadData() {
  productsGrid.innerHTML = '<div class="loader-wrap"><div class="spinner"></div></div>';
  try {
    // fsGetAll now uses plain getDocs + JS sort — no Firestore indexes needed
    const [prods, cats, bdgs] = await Promise.all([
      fsGetAll('products',   'createdAt', 'desc'),
      fsGetAll('categories', 'name',      'asc'),
      fsGetAll('badges',     'name',      'asc'),
    ]);
    allProducts   = prods.map(normaliseProduct);
    allCategories = cats;
    allBadges     = bdgs;

    // Load trending list from Firestore
    let trendingIds = null;
    try {
      const tSnap = await getDoc(doc(db, 'trending', 'list'));
      if (tSnap.exists() && tSnap.data().product_ids?.length) {
        trendingIds = tSnap.data().product_ids;
      }
    } catch(e) { /* no trending set yet */ }

    renderProducts(); renderScroller(trendingIds); renderCategories();
  } catch(e) {
    console.error('Firebase load error:', e);
    loadDemoData();
  }
}

function normaliseProduct(r) {
  // Support Firestore Timestamps and plain dates
  const createdAt = r.createdAt?.toMillis
    ? r.createdAt
    : { toMillis: () => r.created_at ? new Date(r.created_at).getTime() : 0 };
  return {
    id:            r.id,
    name:          r.name,
    category:      r.category,
    description:   r.description,
    price:         r.price,
    originalPrice: r.original_price ?? r.originalPrice ?? null,
    rating:        r.rating ?? null,
    badge:         r.badge || '',
    image:         r.image || '',
    images:        Array.isArray(r.images) ? r.images : (r.image ? [r.image] : []),
    sizes:         Array.isArray(r.sizes)  ? r.sizes  : [],
    createdAt,
  };
}

function loadDemoData() {
  allProducts = [
    {id:1,name:'Ivory Ceramic Vase',category:'Decor',price:1299,originalPrice:1799,description:'Handcrafted ceramic vase with matte ivory finish.',image:'https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?w=600&q=80',badge:'New',rating:4.5,createdAt:{toMillis:()=>Date.now()-1000}},
    {id:2,name:'Linen Throw Blanket',category:'Textiles',price:2499,description:'Premium linen blend throw.',image:'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80',badge:'Bestseller',rating:5,createdAt:{toMillis:()=>Date.now()-2000}},
    {id:3,name:'Oak Side Table',category:'Furniture',price:5999,originalPrice:7499,description:'Solid oak with clean geometric lines.',image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',badge:'Sale',rating:4,createdAt:{toMillis:()=>Date.now()-3000}},
    {id:4,name:'Artisan Coffee Mug',category:'Kitchen',price:649,description:'Hand-thrown stoneware mug.',image:'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80',badge:'Hot',rating:4.5,createdAt:{toMillis:()=>Date.now()-4000}},
  ];
  allCategories = [{id:1,name:'Decor',icon:'🏺'},{id:2,name:'Textiles',icon:'🧶'},{id:3,name:'Furniture',icon:'🪑'},{id:4,name:'Kitchen',icon:'🍳'}];
  renderProducts(); renderScroller(); renderCategories();
}

// ── CATEGORIES ───────────────────────────────────────────────
function renderCategories() {
  const fromProducts = [...new Set(allProducts.map(p=>p.category).filter(Boolean))];
  const fromDB       = allCategories.map(c=>c.name);
  const combined     = [...new Set([...fromDB,...fromProducts])];
  const allPill = `<button class="cat-pill ${activeCategory==='all'?'active':''}" data-cat="all" onclick="filterByCategory('all')">All</button>`;
  const pills   = combined.map(c => {
    const cat = allCategories.find(x=>x.name===c);
    const icon = cat?.icon ? cat.icon+' ' : '';
    return `<button class="cat-pill ${activeCategory===c?'active':''}" data-cat="${c}" onclick="filterByCategory('${c}')">${icon}${c}</button>`;
  }).join('');
  if (navCats)    navCats.innerHTML    = allPill + pills;
  if (mobileCats) mobileCats.innerHTML = allPill + pills;
}

window.filterByCategory = function(cat) {
  activeCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(p=>p.classList.toggle('active',p.dataset.cat===cat));
  renderProducts();
  document.getElementById('mobile-drawer')?.classList.remove('open');
};

// ── PRODUCTS ─────────────────────────────────────────────────
function getFiltered() {
  let list = [...allProducts];
  if (activeCategory !== 'all') list = list.filter(p=>p.category===activeCategory);
  if (searchQuery) { const q=searchQuery.toLowerCase(); list=list.filter(p=>p.name.toLowerCase().includes(q)||(p.description||'').toLowerCase().includes(q)); }
  switch(sortMode) {
    case 'price-asc':  list.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
    case 'name-asc':   list.sort((a,b)=>a.name.localeCompare(b.name)); break;
    case 'newest':     list.sort((a,b)=>(b.createdAt?.toMillis?.()??0)-(a.createdAt?.toMillis?.()??0)); break;
  }
  return list;
}

function renderProducts() {
  const list = getFiltered(); renderCategories();
  if (!list.length) { productsGrid.innerHTML=`<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256"><path d="M223.15,68.72,175.08,28.74A16,16,0,0,0,164.69,25H91.31a16,16,0,0,0-10.39,3.74L32.85,68.72A16,16,0,0,0,28,80.46V208a16,16,0,0,0,16,16H212a16,16,0,0,0,16-16V80.46A16,16,0,0,0,223.15,68.72Z"/></svg><p>No products found</p></div>`; return; }
  productsGrid.innerHTML = list.map(productCardHTML).join('');
}

// ── BADGE HELPER (Bug fix #1) ────────────────────────────────
// Use colors from the badges collection fetched from Firestore.
// Falls back to hardcoded defaults if the badge isn't in the DB yet.
const BADGE_DEFAULTS = {
  'new':        { bg: '#4caf7d', text: '#fff' },
  'sale':       { bg: '#e05c5c', text: '#fff' },
  'hot':        { bg: '#f5a623', text: '#fff' },
  'trending':   { bg: '#9c6ade', text: '#fff' },
  'limited':    { bg: '#e07b5c', text: '#fff' },
  'bestseller': { bg: '#c9a84c', text: '#0d1b2a' },
};
function getBadgeStyle(name) {
  const b = allBadges.find(x => x.name?.toLowerCase() === name?.toLowerCase());
  if (b && b.color) {
    return `background:${b.color};color:${b.text_color||'#fff'};`;
  }
  const d = BADGE_DEFAULTS[name?.toLowerCase()];
  return d ? `background:${d.bg};color:${d.text};` : `background:var(--gold);color:var(--navy);`;
}

function productCardHTML(p) {
  // Bug fix #2: normalise both sides to string for wishlist check
  const wishlisted = wishlist.map(String).includes(String(p.id));
  const stars = starsHTML(p.rating||0);
  const badge = p.badge ? `<span class="product-badge" style="${getBadgeStyle(p.badge)}">${p.badge}</span>` : '';
  const origPrice = p.originalPrice?`<span class="original">₹${p.originalPrice.toLocaleString()}</span>`:'';
  return `<article class="product-card" onclick="openProductModal('${p.id}')">
    <div class="product-card-img-wrap">
      <img src="${(p.images&&p.images.length>0)?p.images[0]:(p.image||'https://via.placeholder.com/400x300/1a2a3a/c9a84c?text=No+Image')}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300/1a2a3a/c9a84c?text=No+Image'"/>
      <div class="product-badges">${badge}</div>
      <button class="wish-btn ${wishlisted?'wishlisted':''}" onclick="event.stopPropagation();toggleWishlist('${p.id}')" aria-label="Wishlist">
        <svg viewBox="0 0 24 24" fill="${wishlisted?'#e00b20':'none'}" stroke="${wishlisted?'#e00b20':'#666'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    </div>
    <div class="product-card-body">
      <div class="product-cat-tag">${p.category||''}</div>
      <h3>${p.name}</h3>
      <div class="star-rating">${stars}</div>

      <div class="product-footer">
        <div class="product-price">₹${p.price.toLocaleString()}${origPrice}</div>
        <button class="add-cart-btn" onclick="event.stopPropagation();addToCart('${p.id}')">Add</button>
      </div>
    </div>
  </article>`;
}

function starsHTML(rating) { return Array.from({length:5},(_,i)=>`<span class="star ${i<Math.round(rating)?'filled':''}">★</span>`).join(''); }

// ── SCROLLER ─────────────────────────────────────────────────
function renderScroller(trendingIds) {
  const scrollerSection = document.querySelector('.scroller-section');
  if (!trendingIds || trendingIds.length === 0) {
    if (scrollerSection) scrollerSection.style.display = 'none';
    return;
  }
  if (scrollerSection) scrollerSection.style.display = '';
  const items = trendingIds.map(id => allProducts.find(p => String(p.id) === String(id))).filter(Boolean);
  if (!items.length) { if (scrollerSection) scrollerSection.style.display = 'none'; return; }

  const playIcon = `<svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>`;
  const fallback = 'https://via.placeholder.com/220x360/1a2a3a/c9a84c?text=No+Image';

  const makeCard = p => {
    const src = (p.images && p.images.length > 0) ? p.images[0] : (p.image || '');
    const isVideo = src && /\.(mp4|webm|mov)(\?|$)/i.test(src);
    const media = isVideo
      ? `<video src="${src}" muted playsinline preload="none"></video>
         <div class="play-overlay"><div class="play-btn">${playIcon}</div></div>`
      : `<img src="${src || fallback}" alt="${p.name}" loading="lazy" onerror="this.src='${fallback}'"/>`;
    return `<div class="scroll-card" onclick="openProductModal('${p.id}')">
      ${media}
      <div class="scroll-card-label"><h4>${p.name}</h4><p>&#8377;${p.price.toLocaleString()}</p></div>
    </div>`;
  };

  const html = items.map(makeCard).join('');
  // Only duplicate for infinite loop if enough cards to fill the screen
  scrollerTrack.innerHTML = items.length >= 4 ? html + html : html;
  // Disable auto-scroll animation if not enough cards
  if (items.length < 4) {
    scrollerTrack.style.animation = 'none';
    wrapper && (wrapper.style.overflowX = 'auto');
  }

  // ── Scrollbar & arrow controls ──────────────────────────────
  const wrapper   = scrollerTrack.parentElement;
  const thumb     = document.getElementById('scroller-thumb');
  const scrollbar = document.getElementById('scroller-scrollbar');
  const prevBtn   = document.getElementById('scroller-prev');
  const nextBtn   = document.getElementById('scroller-next');
  const CARD_W    = 234;
  let manualMode  = false;

  function enterManual() {
    if (!manualMode) {
      manualMode = true;
      scrollerTrack.classList.add('paused');
      scrollerTrack.style.animation = 'none';
      scrollerTrack.style.transform = 'translateX(0)';
      wrapper.style.overflowX = 'auto';
      wrapper.style.scrollBehavior = 'smooth';
    }
  }

  function updateThumb() {
    if (!manualMode || !thumb) return;
    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    const pct = maxScroll > 0 ? (wrapper.scrollLeft / maxScroll) * 70 : 0;
    thumb.style.left = pct + '%';
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { enterManual(); wrapper.scrollLeft -= CARD_W; });
  if (nextBtn) nextBtn.addEventListener('click', () => { enterManual(); wrapper.scrollLeft += CARD_W; });

  if (scrollbar) {
    scrollbar.addEventListener('click', e => {
      enterManual();
      const rect = scrollbar.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      wrapper.scrollLeft = pct * (wrapper.scrollWidth - wrapper.clientWidth);
    });
  }

  wrapper.addEventListener('scroll', updateThumb);
  scrollerTrack.addEventListener('pointerdown', () => enterManual());
}

// ── MODAL ────────────────────────────────────────────────────
window.openProductModal = function(id) {
  // Bug fix #3: Firestore IDs are strings. Always compare with String() to match regardless of how id was passed.
  const p = allProducts.find(x => String(x.id) === String(id)); if (!p) return;
  modalProduct=p; modalQty=1; currentReviewProductId=id;
  // Image carousel
  const allImgs = (p.images && p.images.length > 0) ? p.images : (p.image ? [p.image] : ['https://via.placeholder.com/400x600/1a2a3a/c9a84c?text=No+Image']);
  renderModalImageCarousel(allImgs);

  document.getElementById('modal-cat').textContent=p.category||'';
  document.getElementById('modal-name').textContent=p.name;
  document.getElementById('modal-desc').textContent=p.description||'';
  document.getElementById('modal-qty-val').textContent=1;
  document.getElementById('modal-stars').innerHTML=starsHTML(p.rating||0);

  // Size-wise pricing or flat price
  const priceCont = document.getElementById('modal-price');
  const sizeSelCont = document.getElementById('modal-size-selector');
  if (p.sizes && p.sizes.length > 0) {
    renderModalSizes(p.sizes);
    if (sizeSelCont) sizeSelCont.style.display = 'block';
  } else {
    if (sizeSelCont) sizeSelCont.style.display = 'none';
    const origStr = p.originalPrice ? ` <span style="font-size:0.9rem;text-decoration:line-through;color:var(--text-muted);">₹${p.originalPrice.toLocaleString()}</span>` : '';
    if (priceCont) priceCont.innerHTML = `₹${p.price.toLocaleString()}${origStr}`;
  }
  const wishlisted=wishlist.map(String).includes(String(id));
  const wBtn=document.getElementById('modal-wish-btn');
  wBtn.className='modal-wish-btn '+(wishlisted?'wishlisted':'');
  wBtn.innerHTML=`<svg viewBox="0 0 24 24" fill="${wishlisted?'#e00b20':'none'}" stroke="${wishlisted?'#e00b20':'#888'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  wBtn.onclick=()=>toggleWishlist(id);
  document.getElementById('modal-add-cart').onclick=()=>{addToCartQty(id,modalQty);closeModal();};
  productModal.classList.add('open'); document.body.style.overflow='hidden';
  resetReviewForm(); loadProductReviews(id);
};
window.closeModal = function() { productModal.classList.remove('open'); document.body.style.overflow=''; };
window.changeModalQty = function(delta) { modalQty=Math.max(1,modalQty+delta); document.getElementById('modal-qty-val').textContent=modalQty; };
document.getElementById('modal-close').onclick=closeModal;
productModal.onclick=e=>{if(e.target===productModal)closeModal();};

// ── REVIEWS ──────────────────────────────────────────────────
function resetReviewForm() {
  selectedStarRating=0;
  const n=document.getElementById('review-name'); if(n) n.value='';
  const t=document.getElementById('review-text'); if(t) t.value='';
  highlightStars(0);
}
function highlightStars(val) { document.querySelectorAll('.star-pick').forEach((s,i)=>s.classList.toggle('active',i<val)); }
document.addEventListener('click',e=>{ if(e.target.classList.contains('star-pick')){ selectedStarRating=parseInt(e.target.dataset.val); highlightStars(selectedStarRating); } });
document.addEventListener('mouseover',e=>{ if(e.target.classList.contains('star-pick')) highlightStars(parseInt(e.target.dataset.val)); });
document.addEventListener('mouseout', e=>{ if(e.target.classList.contains('star-pick')) highlightStars(selectedStarRating); });

async function loadProductReviews(productId) {
  const listEl=document.getElementById('approved-reviews-list');
  const summaryEl=document.getElementById('reviews-summary');
  if (!listEl) return;
  listEl.innerHTML=`<div style="padding:12px 0;color:var(--text-muted);font-size:0.84rem;font-style:italic;">Loading reviews…</div>`;
  try {
    // Use plain getDocs + JS filter/sort to avoid Firestore composite index requirement
    const snap = await getDocs(collection(db, 'reviews'));
    let reviews = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    reviews = reviews.filter(r => String(r.product_id) === String(productId) && r.status === 'approved');
    reviews.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() ?? 0;
      const tb = b.createdAt?.toMillis?.() ?? 0;
      return tb - ta;
    });
    renderApprovedReviews(reviews, listEl, summaryEl);
  } catch(e) {
    console.error('Load reviews error:', e);
    listEl.innerHTML=`<div class="no-reviews-msg">Could not load reviews.</div>`;
  }
}

function renderApprovedReviews(reviews,listEl,summaryEl) {
  if (!reviews.length) { listEl.innerHTML=`<div class="no-reviews-msg">No reviews yet — be the first!</div>`; if(summaryEl) summaryEl.innerHTML=''; return; }
  const avg=reviews.reduce((s,r)=>s+(r.rating||0),0)/reviews.length;
  const rounded=Math.round(avg*10)/10;
  if (summaryEl) summaryEl.innerHTML=`<span class="avg-rating-num">${rounded}</span>${Array.from({length:5},(_,i)=>`<span style="color:${i<Math.round(avg)?'#c9a84c':'rgba(201,168,76,0.25)'};">★</span>`).join('')}<span class="review-count-txt">${reviews.length} review${reviews.length>1?'s':''}</span>`;
  listEl.innerHTML=reviews.map(r=>{
    const stars=Array.from({length:5},(_,i)=>`<span style="color:${i<r.rating?'#c9a84c':'rgba(201,168,76,0.25)'};">★</span>`).join('');
    const _rdate = r.createdAt?.toDate ? r.createdAt.toDate() : (r.created_at ? new Date(r.created_at) : null);
    const date = _rdate ? _rdate.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';
    return `<div class="review-item"><div class="review-item-top"><span class="review-item-author">${r.author||'Anonymous'}</span><div>${stars}</div><span class="review-item-date">${date}</span></div>${r.review_text?`<p class="review-item-text">${r.review_text}</p>`:''}</div>`;
  }).join('');
}

window.submitReview = async function() {
  const name=(document.getElementById('review-name')?.value||'').trim();
  const text=(document.getElementById('review-text')?.value||'').trim();
  const btn=document.getElementById('submit-review-btn');
  if (!selectedStarRating) { toast('Please select a star rating.','error'); return; }
  if (!name)               { toast('Please enter your name.','error'); return; }
  if (!currentReviewProductId) return;
  const p=allProducts.find(x=>x.id===currentReviewProductId);
  if (btn) { btn.disabled=true; btn.innerHTML=`<i class="ph ph-circle-notch" style="animation:spin 1s linear infinite;display:inline-block;"></i> Submitting…`; }
  try {
    await addDoc(collection(db, 'reviews'), {
      product_id:   currentReviewProductId,
      product_name: p?.name || 'Unknown',
      author:       name,
      rating:       selectedStarRating,
      review_text:  text,
      status:       'pending',
      createdAt:    serverTimestamp(),
    });
    toast('Thank you! Your review is submitted 🙏','success');
    resetReviewForm();
  } catch(e) {
    toast('Could not submit review: ' + e.message,'error');
  }
  if (btn) { btn.disabled=false; btn.innerHTML=`<i class="ph ph-paper-plane-tilt"></i> Submit Review`; }
};

// ── CART ─────────────────────────────────────────────────────
function saveCart() { localStorage.setItem('tbt_cart',JSON.stringify(cart)); }
window.addToCart = function(id) { addToCartQty(String(id),1); };
function addToCartQty(id,qty) {
  const sid=String(id);
  const p=allProducts.find(x=>String(x.id)===sid); if(!p) return;
  const ex=cart.find(c=>String(c.id)===sid);
  if (ex) ex.qty+=qty; else cart.push({id:sid,qty});
  saveCart(); updateCartUI(); toast(`${p.name} added to cart 🛒`);
}
window.removeFromCart = function(id) { const sid=String(id); cart=cart.filter(c=>String(c.id)!==sid); saveCart(); updateCartUI(); };
window.changeQty = function(id,delta) {
  const sid=String(id);
  const item=cart.find(c=>String(c.id)===sid); if(!item) return;
  item.qty=Math.max(1,item.qty+delta); if(item.qty<1){removeFromCart(sid);return;}
  saveCart(); updateCartUI();
};
function updateCartUI() {
  const total=cart.reduce((s,c)=>s+c.qty,0);
  cartCountEl.textContent=total; cartCountEl.classList.toggle('show',total>0); renderCart();
}
function renderCart() {
  if (!cart.length) { cartBody.innerHTML=`<div style="text-align:center;padding:60px 0;color:var(--text-muted);"><i class="ph ph-shopping-cart" style="font-size:3rem;opacity:0.3;display:block;margin-bottom:12px;"></i><p>Your cart is empty</p></div>`; cartTotalEl.textContent='₹0.00'; return; }
  let sum=0;
  cartBody.innerHTML=cart.map(item=>{
    const p=allProducts.find(x=>String(x.id)===String(item.id)); if(!p) return '';
    sum+=p.price*item.qty;
    return `<div class="cart-item"><img src="${p.image||'https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'"/><div class="cart-item-info"><h4>${p.name}</h4><p>₹${p.price.toLocaleString()}</p><div class="cart-item-qty"><button class="qty-btn" onclick="changeQty('${item.id}',-1)">−</button><span class="qty-val">${item.qty}</span><button class="qty-btn" onclick="changeQty('${item.id}',1)">+</button></div></div><button class="remove-item" onclick="removeFromCart('${item.id}')"><i class="ph ph-trash"></i></button></div>`;
  }).join('');
  cartTotalEl.textContent=`₹${sum.toLocaleString(undefined,{minimumFractionDigits:2})}`;
}
window.checkout = function() { if(!cart.length){toast('Your cart is empty!','error');return;} toast('Thank you! Proceeding to checkout… 🎉','success'); };

// ── WISHLIST ─────────────────────────────────────────────────
function saveWishlist() { localStorage.setItem('tbt_wishlist',JSON.stringify(wishlist)); }
window.toggleWishlist = function(id) {
  // Bug fix #2: Normalise id to string so includes() works regardless of how id arrives
  const sid = String(id);
  const p=allProducts.find(x=>String(x.id)===sid); if(!p) return;
  const idx=wishlist.indexOf(sid);
  if(idx===-1){wishlist.push(sid);toast(`${p.name} added to wishlist ♡`,'success');}
  else{wishlist.splice(idx,1);toast(`${p.name} removed from wishlist`);}
  saveWishlist(); updateWishlistUI(); renderProducts();
  // Instantly update modal heart if this product's modal is open
  const wBtn = document.getElementById('modal-wish-btn');
  if (wBtn) {
    const nowWishlisted = wishlist.includes(sid);
    wBtn.className = 'modal-wish-btn ' + (nowWishlisted ? 'wishlisted' : '');
    wBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="${nowWishlisted?'#e00b20':'none'}" stroke="${nowWishlisted?'#e00b20':'#888'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
  }
};
function updateWishlistUI() { wishCountEl.textContent=wishlist.length; wishCountEl.classList.toggle('show',wishlist.length>0); renderWishlist(); }
function renderWishlist() {
  if (!wishlist.length) { wishlistBody.innerHTML=`<div style="text-align:center;padding:60px 0;color:var(--text-muted);"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px;opacity:0.3;display:block;margin:0 auto 12px;"><path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.08C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z" stroke="#aaa" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><p>Your wishlist is empty</p></div>`; return; }
  wishlistBody.innerHTML=wishlist.map(id=>{
    const p=allProducts.find(x=>String(x.id)===String(id)); if(!p) return '';
    return `<div class="cart-item"><img src="${p.image||'https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80x80/1a2a3a/c9a84c?text=?'"/><div class="cart-item-info"><h4>${p.name}</h4><p>₹${p.price.toLocaleString()}</p><button class="btn-primary" style="margin-top:8px;font-size:0.8rem;padding:6px 14px;" onclick="addToCart('${id}');closeSidebars()">Move to Cart</button></div><button class="remove-item" onclick="toggleWishlist('${id}')"><i class="ph ph-trash"></i></button></div>`;
  }).join('');
}

// ── SIDEBARS ─────────────────────────────────────────────────
function openSidebar(el) { sidebarOverlay.classList.add('open'); el.classList.add('open'); document.body.style.overflow='hidden'; }
window.closeSidebars = function() { sidebarOverlay.classList.remove('open'); cartSidebar.classList.remove('open'); wishlistSidebar.classList.remove('open'); document.body.style.overflow=''; };
document.getElementById('cart-open-btn').onclick=()=>{renderCart();openSidebar(cartSidebar);};
document.getElementById('cart-close-btn').onclick=closeSidebars;
document.getElementById('wish-open-btn').onclick=()=>{renderWishlist();openSidebar(wishlistSidebar);};
document.getElementById('wish-close-btn').onclick=closeSidebars;
sidebarOverlay.onclick=closeSidebars;

// ── HERO ─────────────────────────────────────────────────────
function buildHeroDots() { document.getElementById('hero-dots').innerHTML=Array.from({length:HERO_COUNT},(_,i)=>`<div class="hero-dot ${i===0?'active':''}" onclick="goHeroSlide(${i})"></div>`).join(''); }
function goHeroSlide(idx) {
  heroIndex=(idx+HERO_COUNT)%HERO_COUNT;
  document.getElementById('hero-slides').style.transform=`translateX(-${heroIndex*100}%)`;
  document.querySelectorAll('.hero-dot').forEach((d,i)=>d.classList.toggle('active',i===heroIndex));
  clearInterval(heroTimer); heroTimer=setInterval(()=>goHeroSlide(heroIndex+1),5000);
}
window.goHeroSlide=goHeroSlide;
document.getElementById('hero-prev').onclick=()=>goHeroSlide(heroIndex-1);
document.getElementById('hero-next').onclick=()=>goHeroSlide(heroIndex+1);
let hTouchX=0;
document.getElementById('hero').addEventListener('touchstart',e=>hTouchX=e.touches[0].clientX,{passive:true});
document.getElementById('hero').addEventListener('touchend',e=>{ const diff=hTouchX-e.changedTouches[0].clientX; if(Math.abs(diff)>40) goHeroSlide(diff>0?heroIndex+1:heroIndex-1); },{passive:true});

// ── SEARCH & SORT ────────────────────────────────────────────
function onSearch(val) { searchQuery=val.trim(); renderProducts(); }
searchInput?.addEventListener('input',e=>onSearch(e.target.value));
searchMobile?.addEventListener('input',e=>{onSearch(e.target.value);if(searchInput)searchInput.value=e.target.value;});
sortSelect?.addEventListener('change',e=>{sortMode=e.target.value;renderProducts();});

// ── HAMBURGER ────────────────────────────────────────────────
const hamburger=document.getElementById('hamburger');
const mobileDrawer=document.getElementById('mobile-drawer');
hamburger?.addEventListener('click',()=>mobileDrawer.classList.toggle('open'));
document.addEventListener('click',e=>{if(!mobileDrawer?.contains(e.target)&&!hamburger?.contains(e.target))mobileDrawer?.classList.remove('open');});

// ── TOAST ────────────────────────────────────────────────────
window.toast = function(msg,type='') { const el=document.createElement('div'); el.className=`toast ${type}`; el.textContent=msg; toastContainer.appendChild(el); setTimeout(()=>el.remove(),3200); };

// ── INIT ─────────────────────────────────────────────────────
buildHeroDots();
heroTimer=setInterval(()=>goHeroSlide(heroIndex+1),5000);
updateCartUI(); updateWishlistUI();
loadData();
const s=document.createElement('style'); s.textContent='@keyframes spin{to{transform:rotate(360deg)}}'; document.head.appendChild(s);

// ── MODAL IMAGE CAROUSEL ─────────────────────────────────────
let _carouselIdx = 0;
function renderModalImageCarousel(imgs) {
  _carouselIdx = 0;
  const imgEl    = document.getElementById('modal-img');
  const dotsEl   = document.getElementById('modal-img-dots');
  const prevBtn  = document.getElementById('modal-img-prev');
  const nextBtn  = document.getElementById('modal-img-next');

  function showSlide(i) {
    _carouselIdx = Math.max(0, Math.min(i, imgs.length-1));
    if (imgEl) { imgEl.src = imgs[_carouselIdx]; imgEl.onerror = () => imgEl.src='https://via.placeholder.com/400x600/1a2a3a/c9a84c?text=No+Image'; }
    if (dotsEl) dotsEl.innerHTML = imgs.length > 1
      ? imgs.map((_,j) => `<span onclick="event.stopPropagation()" style="width:8px;height:8px;border-radius:50%;background:${j===_carouselIdx?'var(--gold)':'rgba(201,168,76,0.3)'};cursor:pointer;display:inline-block;" data-i="${j}"></span>`).join('')
      : '';
    if (dotsEl) dotsEl.querySelectorAll('span').forEach(s => s.onclick = e => { e.stopPropagation(); showSlide(+s.dataset.i); });
    if (prevBtn) prevBtn.style.display = imgs.length > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = imgs.length > 1 ? 'flex' : 'none';
  }
  if (prevBtn) prevBtn.onclick = e => { e.stopPropagation(); showSlide(_carouselIdx - 1); };
  if (nextBtn) nextBtn.onclick = e => { e.stopPropagation(); showSlide(_carouselIdx + 1); };
  showSlide(0);
}

// ── MODAL SIZE SELECTOR ──────────────────────────────────────
function renderModalSizes(sizes) {
  const cont    = document.getElementById('modal-size-options');
  const priceCont = document.getElementById('modal-price');
  if (!cont) return;

  let selectedIdx = 0;
  function selectSize(idx) {
    selectedIdx = idx;
    const s = sizes[idx];
    cont.querySelectorAll('.size-btn').forEach((b,i) => b.classList.toggle('active', i===idx));
    if (priceCont) {
      const origStr = s.original_price ? ` <span style="font-size:0.9rem;text-decoration:line-through;color:var(--text-muted);">₹${(+s.original_price).toLocaleString()}</span>` : '';
      priceCont.innerHTML = `₹${(+s.price).toLocaleString()}${origStr}`;
    }
  }

  cont.innerHTML = sizes.map((s,i) => `<button class="size-btn${i===0?' active':''}" onclick="void(0)" data-idx="${i}" style="padding:6px 14px;border:1px solid rgba(201,168,76,${i===0?'0.9':'0.35'});border-radius:6px;background:${i===0?'rgba(201,168,76,0.15)':'transparent'};color:var(--text);font-size:0.83rem;cursor:pointer;transition:all 0.2s;">${s.size}</button>`).join('');
  cont.querySelectorAll('.size-btn').forEach((b,i) => {
    b.addEventListener('click', e => { e.stopPropagation(); selectSize(i); });
  });
  selectSize(0);
}
