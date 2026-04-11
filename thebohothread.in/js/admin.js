// ============================================================
// TheBohoThread — Admin JS  (Firebase Firestore edition)
// All CRUD operations go directly to Firebase Firestore
// No PHP/MySQL required — works 100% from the browser
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection, doc,
  getDocs, getDoc, addDoc, setDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Firebase init ────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyCLz4cXKGxILS5Use2KPe4XaUnLRhcrIyg",
  authDomain: "thebohothread-96e2c.firebaseapp.com",
  projectId: "thebohothread-96e2c",
  storageBucket: "thebohothread-96e2c.firebasestorage.app",
  messagingSenderId: "100688387088",
  appId: "1:100688387088:web:f8a6af7565d3c25952fe95"
};

const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);

// ── Firestore helpers ────────────────────────────────────────
const COL = {
  products:   'products',
  categories: 'categories',
  badges:     'badges',
  reviews:    'reviews',
  trending:   'trending',
};

async function fsGetAll(colName, orderField = 'createdAt', dir = 'desc') {
  // Never use orderBy() — it requires Firestore indexes that may not exist.
  // Always do a plain getDocs and sort in JS instead.
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
  } catch (e) {
    console.error(`fsGetAll(${colName}) error:`, e);
    return [];
  }
}

async function fsAdd(colName, data) {
  const docRef = await addDoc(collection(db, colName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
}

async function fsUpdate(colName, docId, data) {
  await updateDoc(doc(db, colName, docId), { ...data, updatedAt: serverTimestamp() });
  return { id: docId, ...data };
}

async function fsDelete(colName, docId) {
  await deleteDoc(doc(db, colName, docId));
}

async function fsSet(colName, docId, data) {
  await setDoc(doc(db, colName, docId), { ...data, updatedAt: serverTimestamp() });
}



// ── CREDENTIALS ──────────────────────────────────────────────
const ADMIN_USER = 'jnvhimanshu11@gmail.com';
const ADMIN_PASS = '9548@sonI';

// ── STATE ────────────────────────────────────────────────────
let products      = [];
let categories    = [];
let badges        = [];
let allReviews    = [];
let trendingList  = [];   // array of product IDs in order
let currentReviewFilter = 'pending';
let confirmCallback     = null;

// ── TOAST (defined early — used by loadAllData and all functions) ──
window.adminToast = function(msg, type='') {
  const el = document.createElement('div');
  el.className = 'a-toast ' + type;
  el.textContent = msg;
  document.getElementById('admin-toast').appendChild(el);
  setTimeout(() => el.remove(), 3500);
};

const _spinStyle = document.createElement('style');
_spinStyle.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(_spinStyle);
// Multi-image state: array of {url:'', base64:''}
let productImageSlots   = [];
let usingSizePricing    = false;
let sizeRows            = [];

// ═════════════════════════════════════════════════════════════
//  AUTH
// ═════════════════════════════════════════════════════════════
const loginPage = document.getElementById('login-page');
const adminApp  = document.getElementById('admin-app');

function checkAuth() { return sessionStorage.getItem('tbt_admin') === '1'; }

document.getElementById('login-btn').onclick = doLogin;
['login-pass','login-user'].forEach(id =>
  document.getElementById(id).addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); })
);

function togglePassword() {
  const input = document.getElementById('login-pass');
  const icon  = document.getElementById('eye-icon');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  icon.className = show ? 'ph ph-eye-slash' : 'ph ph-eye';
}
window.togglePassword = togglePassword;

function doLogin() {
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    sessionStorage.setItem('tbt_admin', '1');
    document.getElementById('login-error').style.display = 'none';
    loginPage.style.display = 'none';
    adminApp.style.display  = 'flex';
    loadAllData();
  } else {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('login-pass').value = '';
    document.getElementById('login-pass').focus();
  }
}

window.logout = function() { sessionStorage.removeItem('tbt_admin'); location.reload(); };

if (checkAuth()) { loginPage.style.display='none'; adminApp.style.display='flex'; loadAllData(); }

window.addEventListener('resize', () => {
  const t = document.getElementById('sidebar-toggle');
  if (t) t.style.display = window.innerWidth <= 860 ? 'block' : 'none';
});
window.dispatchEvent(new Event('resize'));

// ═════════════════════════════════════════════════════════════
//  NAVIGATION
// ═════════════════════════════════════════════════════════════
window.navigate = function(page, linkEl) {
  document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a[data-page]').forEach(a => a.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  if (linkEl) linkEl.classList.add('active');
  else { const n=document.querySelector("[data-page='"+page+"']"); if(n) n.classList.add('active'); }
  const titles = { dashboard:'Dashboard', products:'Products', categories:'Categories', badges:'Badges', reviews:'Reviews', trending:'Trending', 'store-settings':'Store Settings', 'data-policy':'Data Policy Page', 'faq':'FAQ Page', 'shipping':'Shipping & Delivery Policy', 'returns':'Return & Refund Policy' };
  document.getElementById('page-title').textContent = titles[page] || page;
  document.getElementById('admin-sidebar').classList.remove('open');
};

// ═════════════════════════════════════════════════════════════
//  LOAD ALL DATA  (from Firestore)
// ═════════════════════════════════════════════════════════════
async function loadAllData() {
  try {
    adminToast('Loading data from Firebase…', '');

    // fsGetAll now uses plain getDocs + JS sort — no Firestore indexes needed
    const [prods, cats, bdgs, revs] = await Promise.all([
      fsGetAll(COL.products,  'createdAt', 'desc'),
      fsGetAll(COL.categories,'name',      'asc'),
      fsGetAll(COL.badges,    'name',      'asc'),
      fsGetAll(COL.reviews,   'createdAt', 'desc'),
    ]);

    products    = prods;
    categories  = cats;
    badges      = bdgs;
    allReviews  = revs;

    // Load trending doc
    try {
      const tSnap = await getDoc(doc(db, COL.trending, 'list'));
      if (tSnap.exists()) {
        trendingList = tSnap.data().product_ids || [];
      } else {
        trendingList = [];
      }
    } catch(e) { trendingList = []; }

    renderProductsTable(); renderRecentTable(); renderCategoriesList();
    populateCategorySelect(); renderBadgesList(); populateBadgeSelect();
    populateTrendingSelect(); renderTrendingList();
    updateStats(); updateReviewStats(); renderReviewsList();
    adminToast('Data loaded ✓', 'success');
  } catch (e) {
    console.error('Firebase load error:', e);
    adminToast('Firebase error: ' + e.message, 'error');
  }
}

// ═════════════════════════════════════════════════════════════
//  STATS
// ═════════════════════════════════════════════════════════════
function updateStats() {
  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-cats').textContent     = categories.length;
  document.getElementById('stat-badges').textContent   = badges.length;
  const r = products.filter(p=>p.rating).map(p=>p.rating);
  document.getElementById('stat-rating').textContent = r.length ? (r.reduce((a,b)=>a+b,0)/r.length).toFixed(1) : '—';
}

function updateReviewStats() {
  const pending  = allReviews.filter(r=>r.status==='pending').length;
  const approved = allReviews.filter(r=>r.status==='approved').length;
  const rejected = allReviews.filter(r=>r.status==='rejected').length;
  const el=document.getElementById('stat-pending-reviews'); if(el) el.textContent=pending;
  // Show pending count badge in nav (number instead of just a dot)
  const dot=document.getElementById('nav-review-dot');
  if(dot) {
    if(pending>0) {
      dot.style.display='inline-flex';
      dot.textContent=pending>99?'99+':String(pending);
    } else {
      dot.style.display='none';
      dot.textContent='';
    }
  }
  ['pending','approved','rejected'].forEach(k=>{ const e=document.getElementById('rtab-'+k); if(e) e.textContent={pending,approved,rejected}[k]; });
  const all=document.getElementById('rtab-all'); if(all) all.textContent=allReviews.length;
}

// ═════════════════════════════════════════════════════════════
//  PRODUCTS TABLE
// ═════════════════════════════════════════════════════════════
function getBadgeStyle(name) {
  const b=badges.find(x=>x.name===name);
  return b?'background:'+b.color+';color:'+(b.text_color||b.textColor)+';border:none;':'background:rgba(201,168,76,0.15);color:var(--gold);';
}

function productRowHTML(p) {
  const img=p.image?`<img class="table-img" src="${p.image}" alt="" onerror="this.src='https://via.placeholder.com/48/1a2a3a/c9a84c?text=?'">`:`<div class="table-img no-img">—</div>`;
  const badge=p.badge?`<span class="pill" style="${getBadgeStyle(p.badge)}">${p.badge}</span>`:`<span style="color:var(--text-muted);">—</span>`;
  return `<tr>
    <td>${img}</td>
    <td style="font-weight:500;">${p.name}</td>
    <td><span style="color:var(--gold);font-size:0.82rem;">${p.category||'—'}</span></td>
    <td style="white-space:nowrap;">₹${(p.price||0).toLocaleString()}</td>
    <td>${badge}</td>
    <td>${p.rating?"<span style='color:var(--gold);'>★</span> "+p.rating:'—'}</td>
    <td><div class="table-actions">
      <button class="btn btn-outline-gold btn-sm" onclick="openProductModal('${p.id}')"><i class="ph ph-pencil-simple"></i> Edit</button>
      <button class="btn btn-danger btn-sm" onclick="confirmDelete('product','${p.id}','${(p.name||'').replace(/'/g,"\\'")}')"><i class="ph ph-trash"></i></button>
    </div></td>
  </tr>`;
}

function renderProductsTable(filter='') {
  const tbody=document.getElementById('products-tbody'); if(!tbody) return;
  const list=filter?products.filter(p=>p.name.toLowerCase().includes(filter.toLowerCase())||(p.category||'').toLowerCase().includes(filter.toLowerCase())):products;
  tbody.innerHTML=list.length?list.map(productRowHTML).join(''):`<tr><td colspan="7" style="text-align:center;padding:48px;color:var(--text-muted);">No products yet. <a href="#" onclick="openProductModal()" style="color:var(--gold);">Add one →</a></td></tr>`;
}

function renderRecentTable() {
  const tbody=document.getElementById('recent-tbody'); if(!tbody) return;
  tbody.innerHTML=products.slice(0,6).map(p=>`<tr>
    <td>${p.image?`<img class="table-img" src="${p.image}" alt="" onerror="this.src='https://via.placeholder.com/48/1a2a3a/c9a84c?text=?'">`:`<div class="table-img no-img">—</div>`}</td>
    <td style="font-weight:500;">${p.name}</td>
    <td><span style="color:var(--gold);font-size:0.82rem;">${p.category||'—'}</span></td>
    <td>₹${(p.price||0).toLocaleString()}</td>
    <td>${p.badge?`<span class="pill" style="${getBadgeStyle(p.badge)}">${p.badge}</span>`:'—'}</td>
    <td><button class="btn btn-outline-gold btn-sm" onclick="openProductModal('${p.id}')"><i class="ph ph-pencil-simple"></i></button></td>
  </tr>`).join('')||`<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted);">No products yet.</td></tr>`;
}

window.filterProductTable = function(val) { renderProductsTable(val); };

// ═════════════════════════════════════════════════════════════
//  PRODUCT MODAL
// ═════════════════════════════════════════════════════════════
window.openProductModal = function(id) {
  document.getElementById('product-modal-backdrop').classList.add('open');
  const isEdit=!!id;
  document.getElementById('product-modal-title').textContent=isEdit?'Edit Product':'Add New Product';
  document.getElementById('edit-product-id').value=id||'';

  usingSizePricing=false; sizeRows=[];
  document.getElementById('p-use-sizes').checked=false;
  document.getElementById('p-no-size-pricing').style.display='block';
  document.getElementById('p-sizes-container').style.display='none';
  document.getElementById('p-sizes-list').innerHTML='';

  productImageSlots=[];
  renderImageSlots();

  if (isEdit) {
    const p=products.find(x=>String(x.id)===String(id)); if(!p) return;
    document.getElementById('p-name').value      = p.name        || '';
    document.getElementById('p-desc').value      = p.description || '';
    document.getElementById('p-rating').value    = p.rating      || '';
    setTimeout(()=>{
      document.getElementById('p-category').value=p.category||'';
      document.getElementById('p-badge').value=p.badge||'';
    },60);

    const hasSizes = p.sizes && Array.isArray(p.sizes) && p.sizes.length > 0;
    if (hasSizes) {
      usingSizePricing=true;
      document.getElementById('p-use-sizes').checked=true;
      document.getElementById('p-no-size-pricing').style.display='none';
      document.getElementById('p-sizes-container').style.display='block';
      sizeRows = p.sizes.map(s=>({size:s.size||'',price:s.price||'',orig:s.original_price||''}));
      renderSizeRows();
    } else {
      document.getElementById('p-price').value      = p.price || '';
      document.getElementById('p-orig-price').value = p.original_price||p.originalPrice||'';
    }

    const imgs = (p.images && Array.isArray(p.images) && p.images.length > 0)
      ? p.images
      : (p.image ? [p.image] : []);
    productImageSlots = imgs.map(url=>({url, base64:''}));
    renderImageSlots();
  } else {
    ['p-name','p-desc','p-price','p-orig-price','p-rating'].forEach(fid=>{ const el=document.getElementById(fid); if(el) el.value=''; });
    document.getElementById('p-category').value='';
    document.getElementById('p-badge').value='';
    productImageSlots=[{url:'',base64:''}];
    renderImageSlots();
  }
};

window.closeProductModal = function() { document.getElementById('product-modal-backdrop').classList.remove('open'); };

window.saveProduct = async function() {
  const id    = document.getElementById('edit-product-id').value;
  const name  = document.getElementById('p-name').value.trim();
  const cat   = document.getElementById('p-category').value;
  const desc  = document.getElementById('p-desc').value.trim();
  const rating= document.getElementById('p-rating').value!==''?parseFloat(document.getElementById('p-rating').value):null;
  const badge = document.getElementById('p-badge').value;

  if (!name) { adminToast('Product name is required.','error'); return; }
  if (!cat)  { adminToast('Please select a category.','error'); return; }

  // Build images array from slots
  const imagesArr = productImageSlots
    .map(s => s.base64 || s.url)
    .filter(v => v && v.trim());

  if (!imagesArr.length) { adminToast('Please add at least one product image.','error'); return; }

  const saveBtn=document.getElementById('save-product-btn');
  if (saveBtn) { saveBtn.disabled=true; saveBtn.innerHTML=`<i class="ph ph-circle-notch" style="animation:spin 1s linear infinite;display:inline-block;"></i> Saving…`; }

  try {
    // Store images directly in Firestore (base64 or URL) — no Storage needed
    const uploadedImages = imagesArr; // base64 strings stored directly in Firestore

    const primaryImage = uploadedImages[0];

    let price = null, orig = null, sizes = null;

    if (usingSizePricing) {
      const rows = document.querySelectorAll('.size-row');
      sizes = [];
      for (const row of rows) {
        const sz = row.querySelector('.size-name').value.trim();
        const sp = parseFloat(row.querySelector('.size-price').value);
        const so = row.querySelector('.size-orig').value !== '' ? parseFloat(row.querySelector('.size-orig').value) : null;
        if (!sz) { adminToast('Please enter a size label for all size rows.','error'); return; }
        if (!sp || isNaN(sp) || sp <= 0) { adminToast(`Valid price required for size "${sz}".`,'error'); return; }
        sizes.push({size:sz, price:sp, original_price:so});
      }
      if (!sizes.length) { adminToast('Add at least one size row or disable size-wise pricing.','error'); return; }
      price = sizes[0].price;
      orig  = sizes[0].original_price;
    } else {
      price = parseFloat(document.getElementById('p-price').value);
      const origVal = document.getElementById('p-orig-price').value;
      orig = origVal !== '' ? parseFloat(origVal) : null;
      if (!price || isNaN(price) || price <= 0) { adminToast('Valid price is required.','error'); return; }
    }

    const payload = {
      name, category:cat, description:desc, price, original_price: orig || null,
      rating: rating || null, badge: badge||'', image: primaryImage,
      images: uploadedImages,
      sizes: sizes || [],
    };

    let savedProduct;
    if (id) {
      // Update existing
      await fsUpdate(COL.products, id, payload);
      savedProduct = { id, ...payload };
      const i = products.findIndex(p => p.id === id);
      if (i > -1) products[i] = savedProduct;
    } else {
      // Create new
      savedProduct = await fsAdd(COL.products, payload);
      products.unshift(savedProduct);
    }

    renderProductsTable(); renderRecentTable(); updateStats();
    populateTrendingSelect();
    adminToast(id?`"${name}" updated ✓`:`"${name}" added! 🎉`,'success');
    closeProductModal();
  } catch(e) {
    console.error('Save product error:', e);
    adminToast('Save failed: ' + e.message, 'error');
  } finally {
    if (saveBtn) { saveBtn.disabled=false; saveBtn.innerHTML=`<i class="ph ph-floppy-disk"></i> Save Product`; }
  }
};

// ═════════════════════════════════════════════════════════════
//  MULTI-IMAGE HANDLING (up to 10 images)
// ═════════════════════════════════════════════════════════════
window.addImageSlot = function() {
  if (productImageSlots.length >= 10) { adminToast('Maximum 10 images allowed.','warning'); return; }
  productImageSlots.push({url:'', base64:''});
  renderImageSlots();
};

window.removeImageSlot = function(idx) {
  productImageSlots.splice(idx, 1);
  renderImageSlots();
};

function renderImageSlots() {
  const container = document.getElementById('p-images-list'); if(!container) return;
  const addBtn = document.getElementById('add-image-slot-btn');
  if (addBtn) addBtn.style.display = productImageSlots.length >= 10 ? 'none' : '';

  container.innerHTML = productImageSlots.map((slot, idx) => {
    const thumb = slot.base64 || slot.url;
    const label = idx===0 ? ' <span style="color:var(--gold);font-size:0.75rem;">(Thumbnail)</span>' : '';
    return `<div class="img-slot" data-idx="${idx}" style="border:1px solid rgba(201,168,76,0.2);border-radius:8px;padding:10px;background:rgba(255,255,255,0.02);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="font-size:0.8rem;color:var(--text-muted);min-width:60px;">Image ${idx+1}${label}</span>
        <button type="button" class="btn btn-danger btn-sm" style="margin-left:auto;" onclick="removeImageSlot(${idx})">
          <i class="ph ph-trash"></i>
        </button>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap;">
        ${thumb ? `<img src="${thumb}" style="width:72px;height:72px;object-fit:cover;border-radius:6px;border:1px solid rgba(201,168,76,0.3);" onerror="this.style.display='none'">` : ''}
        <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:6px;">
          <input class="form-control" style="font-size:0.82rem;height:34px;" placeholder="Paste image URL…"
            value="${slot.url.replace(/"/g,'&quot;')}"
            oninput="setImageSlotURL(${idx}, this.value)"
            onblur="previewSlotURL(${idx})" />
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.8rem;color:var(--gold);">
            <i class="ph ph-upload-simple"></i> Upload file
            <input type="file" accept="image/*" style="display:none;" onchange="handleImageSlotFile(${idx}, event)" />
          </label>
        </div>
      </div>
    </div>`;
  }).join('');
}

window.setImageSlotURL = function(idx, val) {
  if (productImageSlots[idx]) { productImageSlots[idx].url = val; productImageSlots[idx].base64 = ''; }
};

window.previewSlotURL = function(idx) {
  if (productImageSlots[idx] && productImageSlots[idx].url) renderImageSlots();
};

window.handleImageSlotFile = function(idx, e) {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 10*1024*1024) { adminToast('Image too large (max 10 MB).','error'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    // Compress image via canvas to keep Firestore doc size small (max ~700KB base64)
    const img = new Image();
    img.onload = () => {
      const MAX = 900; // max dimension px
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else       { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.82);
      if (productImageSlots[idx]) {
        productImageSlots[idx].base64 = compressed;
        productImageSlots[idx].url    = '';
      }
      renderImageSlots();
      const kb = Math.round(compressed.length * 0.75 / 1024);
      adminToast(`Image ready (${kb} KB) ✓`, 'success');
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
};

// ═════════════════════════════════════════════════════════════
//  SIZE-WISE PRICING
// ═════════════════════════════════════════════════════════════
window.toggleSizeMode = function(enabled) {
  usingSizePricing = enabled;
  document.getElementById('p-no-size-pricing').style.display = enabled ? 'none' : 'block';
  document.getElementById('p-sizes-container').style.display = enabled ? 'block' : 'none';
  if (enabled && sizeRows.length === 0) { sizeRows=[{size:'',price:'',orig:''}]; renderSizeRows(); }
};

window.addSizeRow = function() {
  sizeRows.push({size:'',price:'',orig:''});
  renderSizeRows();
};

window.removeSizeRow = function(idx) {
  sizeRows.splice(idx,1);
  renderSizeRows();
};

function renderSizeRows() {
  const el = document.getElementById('p-sizes-list'); if(!el) return;
  el.innerHTML = sizeRows.map((r,i) => `
    <div class="size-row" style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;align-items:end;">
      <div class="form-group" style="margin:0;">
        ${i===0?'<label style="font-size:0.78rem;">Size</label>':''}
        <input class="form-control size-name" style="height:34px;" placeholder="e.g. S, M, L" value="${r.size}"
          oninput="sizeRows[${i}].size=this.value" />
      </div>
      <div class="form-group" style="margin:0;">
        ${i===0?'<label style="font-size:0.78rem;">Price (₹) *</label>':''}
        <input class="form-control size-price" style="height:34px;" type="number" min="0" placeholder="0.00" value="${r.price}"
          oninput="sizeRows[${i}].price=this.value" />
      </div>
      <div class="form-group" style="margin:0;">
        ${i===0?'<label style="font-size:0.78rem;">Original Price (optional)</label>':''}
        <input class="form-control size-orig" style="height:34px;" type="number" min="0" placeholder="0.00" value="${r.orig||''}"
          oninput="sizeRows[${i}].orig=this.value" />
      </div>
      <button type="button" class="btn btn-danger btn-sm" style="${i===0?'margin-top:22px;':''}" onclick="removeSizeRow(${i})">
        <i class="ph ph-trash"></i>
      </button>
    </div>`).join('');
}

// ═════════════════════════════════════════════════════════════
//  CATEGORIES
// ═════════════════════════════════════════════════════════════
function renderCategoriesList() {
  const el=document.getElementById('categories-list'); if(!el) return;
  if (!categories.length) { el.innerHTML=`<p style="color:var(--text-muted);font-size:0.88rem;padding:8px 0;">No categories yet.</p>`; return; }
  el.innerHTML=categories.map(c=>`
    <div class="list-item-row">
      <span class="list-icon">${c.icon||'🏷️'}</span>
      <span class="list-name">${c.name}</span>
      <span class="list-live-badge">● Live on store</span>
      <button class="btn btn-danger btn-sm" onclick="confirmDelete('category','${c.id}','${(c.name||'').replace(/'/g,"\\'")}')">
        <i class="ph ph-trash"></i>
      </button>
    </div>`).join('');
}

function populateCategorySelect() {
  const sel=document.getElementById('p-category'); if(!sel) return;
  const cur=sel.value;
  sel.innerHTML=`<option value="">Select category…</option>`+categories.map(c=>`<option value="${c.name}">${c.icon?' '+c.icon+' ':''}${c.name}</option>`).join('');
  if(cur) sel.value=cur;
}

window.addCategory = async function() {
  const name=document.getElementById('new-cat-name').value.trim();
  const icon=document.getElementById('new-cat-icon').value.trim()||'🏷️';
  if (!name) { adminToast('Category name is required.','error'); return; }

  // Check duplicate locally
  if (categories.find(c=>c.name.toLowerCase()===name.toLowerCase())) {
    adminToast('Category already exists.','error'); return;
  }

  try {
    const saved = await fsAdd(COL.categories, { name, icon });
    categories.push(saved);
    categories.sort((a,b)=>a.name.localeCompare(b.name));
    renderCategoriesList(); populateCategorySelect(); updateStats();
    adminToast(`"${name}" category created — now live on store! ✓`,'success');
    document.getElementById('new-cat-name').value=''; document.getElementById('new-cat-icon').value='';
  } catch(e) {
    adminToast('Failed to add category: ' + e.message, 'error');
  }
};

// ═════════════════════════════════════════════════════════════
//  BADGES
// ═════════════════════════════════════════════════════════════
function renderBadgesList() {
  const el=document.getElementById('badges-list'); if(!el) return;
  if (!badges.length) { el.innerHTML=`<p style="color:var(--text-muted);font-size:0.88rem;padding:8px 0;">No badges yet.</p>`; return; }
  el.innerHTML=badges.map(b=>`
    <div class="list-item-row">
      <span class="pill" style="background:${b.color||'var(--gold)'};color:${b.text_color||b.textColor||'#fff'};min-width:90px;text-align:center;">${b.name}</span>
      <span style="font-size:0.76rem;color:var(--text-muted);">bg:${b.color||'—'} text:${b.text_color||b.textColor||'—'}</span>
      <button class="btn btn-danger btn-sm" onclick="confirmDelete('badge','${b.id}','${(b.name||'').replace(/'/g,"\\'")}')">
        <i class="ph ph-trash"></i>
      </button>
    </div>`).join('');
}

function populateBadgeSelect() {
  const sel=document.getElementById('p-badge'); if(!sel) return;
  const cur=sel.value;
  sel.innerHTML=`<option value="">No Badge</option>`+badges.map(b=>`<option value="${b.name}">${b.name}</option>`).join('');
  if(cur) sel.value=cur;
}

window.addBadge = async function() {
  const name  = document.getElementById('new-badge-name').value.trim();
  const color = document.getElementById('new-badge-color').value.trim()||'#c9a84c';
  const text  = document.getElementById('new-badge-text').value.trim()||'#ffffff';
  if (!name) { adminToast('Badge name is required.','error'); return; }

  if (badges.find(b=>b.name.toLowerCase()===name.toLowerCase())) {
    adminToast('Badge already exists.','error'); return;
  }

  try {
    const saved = await fsAdd(COL.badges, { name, color, text_color: text });
    badges.push(saved);
    badges.sort((a,b)=>a.name.localeCompare(b.name));
    renderBadgesList(); populateBadgeSelect(); updateStats();
    adminToast(`Badge "${name}" created ✓`,'success');
    document.getElementById('new-badge-name').value='';
    document.getElementById('new-badge-color').value='';
    document.getElementById('new-badge-text').value='#ffffff';
  } catch(e) {
    adminToast('Failed to add badge: ' + e.message, 'error');
  }
};

// ═════════════════════════════════════════════════════════════
//  REVIEWS
// ═════════════════════════════════════════════════════════════
window.filterReviews = function(filter,tabEl) {
  currentReviewFilter=filter;
  document.querySelectorAll('.review-tab').forEach(t=>t.classList.remove('active'));
  if(tabEl) tabEl.classList.add('active');
  const titles={pending:'Pending Reviews',approved:'Approved Reviews',rejected:'Rejected Reviews',all:'All Reviews'};
  const el=document.getElementById('reviews-panel-title'); if(el) el.textContent=titles[filter]||'Reviews';
  renderReviewsList();
};

function renderReviewsList() {
  const el=document.getElementById('reviews-list'); if(!el) return;
  const list=currentReviewFilter==='all'?allReviews:allReviews.filter(r=>r.status===currentReviewFilter);
  if (!list.length) {
    el.innerHTML=`<div style="padding:48px;text-align:center;color:var(--text-muted);"><i class="ph ph-chat-circle-text" style="font-size:2.5rem;opacity:0.25;display:block;margin-bottom:12px;"></i><p>No ${currentReviewFilter==='all'?'':currentReviewFilter+' '}reviews yet.</p></div>`;
    return;
  }
  el.innerHTML=list.map(r=>{
    const stars=Array.from({length:5},(_,i)=>`<span style="color:${i<r.rating?'#c9a84c':'rgba(154,172,189,0.3)'};">★</span>`).join('');
    const date=r.created_at?new Date(r.created_at.toDate?r.created_at.toDate():r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
    const sb={pending:`<span class="review-status pending">⏳ Pending</span>`,approved:`<span class="review-status approved">✓ Approved</span>`,rejected:`<span class="review-status rejected">✕ Rejected</span>`}[r.status]||'';
    const acts=r.status==='pending'
      ?`<button class="btn btn-success btn-sm" onclick="approveReview('${r.id}','${r.product_id}')"><i class="ph ph-check-circle"></i> Approve</button><button class="btn btn-danger btn-sm" onclick="rejectReview('${r.id}')"><i class="ph ph-x-circle"></i> Reject</button>`
      :r.status==='approved'
      ?`<button class="btn btn-danger btn-sm" onclick="rejectReview('${r.id}')"><i class="ph ph-x-circle"></i> Revoke</button>`
      :`<button class="btn btn-success btn-sm" onclick="approveReview('${r.id}','${r.product_id}')"><i class="ph ph-check-circle"></i> Approve</button>`;
    return `<div class="review-admin-row">
      <div class="review-row-top">
        <div class="review-row-meta"><span class="review-author">${r.author||'Anonymous'}</span><span>${stars}</span><span class="review-date">${date}</span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;"><span class="review-product-tag">${r.product_name||'Unknown'}</span>${sb}</div>
      </div>
      <p class="review-text-content">${r.review_text||'<em style="color:var(--text-muted);">No comment</em>'}</p>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">${acts}
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('review','${r.id}','review by ${(r.author||'Anonymous').replace(/'/g,"\\'")}')"><i class="ph ph-trash"></i> Delete</button>
      </div></div>`;
  }).join('');
}

window.approveReview = async function(reviewId, productId) {
  try {
    await fsUpdate(COL.reviews, reviewId, { status: 'approved', approved_at: serverTimestamp() });
    const r = allReviews.find(x=>x.id===reviewId); if(r) r.status='approved';

    // Recalculate product rating
    const approved = allReviews.filter(x=>x.product_id===productId && x.status==='approved');
    if (approved.length && productId) {
      const avg = approved.reduce((s,x)=>s+(x.rating||0),0) / approved.length;
      await fsUpdate(COL.products, productId, { rating: Math.round(avg*10)/10 });
      const p = products.find(x=>x.id===productId); if(p) p.rating = Math.round(avg*10)/10;
    }

    updateReviewStats(); renderReviewsList(); renderProductsTable(); renderRecentTable();
    adminToast('Review approved and published! ✓','success');
  } catch(e) { adminToast('Failed to approve review: '+e.message,'error'); }
};

window.rejectReview = async function(reviewId) {
  try {
    await fsUpdate(COL.reviews, reviewId, { status: 'rejected' });
    const r = allReviews.find(x=>x.id===reviewId); if(r) r.status='rejected';
    updateReviewStats(); renderReviewsList();
    adminToast('Review rejected.','');
  } catch(e) { adminToast('Failed to reject review: '+e.message,'error'); }
};

// ═════════════════════════════════════════════════════════════
//  DELETE
// ═════════════════════════════════════════════════════════════
window.confirmDelete = function(type,id,name) {
  document.getElementById('confirm-msg').textContent=`Delete "${name}"? This cannot be undone.`;
  document.getElementById('confirm-modal').classList.add('open');
  confirmCallback = async () => {
    try {
      const colMap = { product:COL.products, category:COL.categories, badge:COL.badges, review:COL.reviews };
      const colName = colMap[type];
      if (!colName) { closeConfirm(); return; }
      await fsDelete(colName, String(id));

      if(type==='product')  products=products.filter(x=>String(x.id)!==String(id));
      if(type==='category') categories=categories.filter(x=>String(x.id)!==String(id));
      if(type==='badge')    badges=badges.filter(x=>String(x.id)!==String(id));
      if(type==='review')   allReviews=allReviews.filter(x=>String(x.id)!==String(id));

      renderProductsTable(); renderRecentTable(); renderCategoriesList();
      populateCategorySelect(); renderBadgesList(); populateBadgeSelect();
      updateStats(); updateReviewStats(); renderReviewsList();
      adminToast(`"${name}" deleted.`,'success');
    } catch(e) {
      adminToast('Delete failed: '+e.message,'error');
    }
    closeConfirm();
  };
  document.getElementById('confirm-ok-btn').onclick=confirmCallback;
};

window.closeConfirm = function() { document.getElementById('confirm-modal').classList.remove('open'); confirmCallback=null; };

document.getElementById('product-modal-backdrop').onclick=e=>{if(e.target===document.getElementById('product-modal-backdrop'))closeProductModal();};
document.getElementById('excel-import-modal-backdrop').onclick=e=>{if(e.target===document.getElementById('excel-import-modal-backdrop'))closeExcelImportModal();};
document.getElementById('confirm-modal').onclick=e=>{if(e.target===document.getElementById('confirm-modal'))closeConfirm();};

// ═════════════════════════════════════════════════════════════
//  TRENDING PRODUCTS MANAGEMENT
// ═════════════════════════════════════════════════════════════
function populateTrendingSelect() {
  const sel = document.getElementById('trending-product-select'); if (!sel) return;
  const cur = sel.value;
  sel.innerHTML = `<option value="">— Select a product —</option>` +
    products.map(p => `<option value="${p.id}">${p.name} — ₹${(p.price||0).toLocaleString()}</option>`).join('');
  if (cur) sel.value = cur;
}

function renderTrendingList() {
  const el = document.getElementById('trending-list'); if (!el) return;
  const countEl = document.getElementById('trending-count');
  if (countEl) countEl.textContent = trendingList.length + ' product' + (trendingList.length!==1?'s':'');

  if (!trendingList.length) {
    el.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;padding:8px 0;">No trending products set. Add some above!</p>`;
    return;
  }
  el.innerHTML = trendingList.map((pid, i) => {
    const p = products.find(x => String(x.id) === String(pid));
    if (!p) return '';
    const imgSrc = p.image || 'https://via.placeholder.com/40/1a2a3a/c9a84c?text=?';
    return `<div class="list-item-row" style="padding:8px 12px;gap:10px;" data-pid="${pid}">
      <div style="display:flex;align-items:center;gap:6px;color:var(--text-muted);font-size:0.78rem;min-width:28px;">
        <i class="ph ph-dots-six-vertical" style="cursor:grab;"></i> ${i+1}
      </div>
      <img src="${imgSrc}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid rgba(201,168,76,0.3);" onerror="this.src='https://via.placeholder.com/40/1a2a3a/c9a84c?text=?'" />
      <span class="list-name" style="flex:1;">${p.name}</span>
      <span style="color:var(--gold);font-size:0.82rem;white-space:nowrap;">₹${(p.price||0).toLocaleString()}</span>
      <div style="display:flex;gap:4px;">
        <button class="btn btn-outline-gold btn-sm" title="Move Up" onclick="moveTrending(${i},-1)" ${i===0?'disabled':''}>↑</button>
        <button class="btn btn-outline-gold btn-sm" title="Move Down" onclick="moveTrending(${i},1)" ${i===trendingList.length-1?'disabled':''}>↓</button>
        <button class="btn btn-danger btn-sm" onclick="removeTrending(${i})"><i class="ph ph-x"></i></button>
      </div>
    </div>`;
  }).join('');
}

window.addToTrending = function() {
  const sel = document.getElementById('trending-product-select');
  const pid = sel ? sel.value : '';
  if (!pid) { adminToast('Please select a product.','error'); return; }
  if (trendingList.includes(pid)) { adminToast('This product is already in Trending.','error'); return; }
  if (trendingList.length >= 20) { adminToast('Maximum 20 trending products allowed.','error'); return; }
  trendingList.push(pid);
  renderTrendingList();
  sel.value = '';
  adminToast('Added to trending! Click "Save Order" to apply.', 'success');
};

window.removeTrending = function(idx) {
  trendingList.splice(idx, 1);
  renderTrendingList();
};

window.moveTrending = function(idx, delta) {
  const newIdx = idx + delta;
  if (newIdx < 0 || newIdx >= trendingList.length) return;
  [trendingList[idx], trendingList[newIdx]] = [trendingList[newIdx], trendingList[idx]];
  renderTrendingList();
};

window.saveTrending = async function() {
  const btn = document.getElementById('save-trending-btn');
  if (btn) { btn.disabled=true; btn.innerHTML=`<i class="ph ph-circle-notch" style="animation:spin 1s linear infinite;display:inline-block;"></i> Saving…`; }
  try {
    await fsSet(COL.trending, 'list', { product_ids: trendingList });
    adminToast(`Trending list saved! (${trendingList.length} products) — visible on store now ✓`, 'success');
  } catch(e) {
    adminToast('Failed to save trending: ' + e.message, 'error');
  } finally {
    if (btn) { btn.disabled=false; btn.innerHTML=`<i class="ph ph-floppy-disk"></i> Save Order`; }
  }
};

window.clearTrending = function() {
  if (!trendingList.length) { adminToast('Trending list is already empty.',''); return; }
  trendingList = [];
  renderTrendingList();
  adminToast('Trending list cleared. Click "Save Order" to apply.','');
};

// ═════════════════════════════════════════════════════════════
// EXCEL BULK IMPORT
// ═════════════════════════════════════════════════════════════

let excelImportRows = []; // parsed & validated rows ready to import

// ── Template download ─────────────────────────────────────────
window.downloadExcelTemplate = function() {
  const XLSX = window.XLSX;
  if (!XLSX) { adminToast('SheetJS not loaded yet, please try again.', 'error'); return; }

  const header = ['name','category','description','price','original_price','badge','rating','image_url','extra_images','sizes'];
  const sample = [
    'Floral Boho Kurti',
    'Kurtis',
    'Beautiful floral print kurti for everyday wear',
    '999',
    '1299',
    'new',
    '4.5',
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg|https://example.com/image3.jpg',
    'S:899|M:999|L:1099|XL:1199'
  ];
  const notes = [
    '* Required',
    '* Required — must match an existing category name',
    'Optional',
    '* Required if no sizes; base/fallback price',
    'Optional — crossed-out original price',
    'Optional — new / sale / hot / trending / limited / bestseller',
    'Optional — 0 to 5',
    '* Required — direct image URL',
    'Optional — extra image URLs separated by |',
    'Optional — size:price pairs separated by | e.g. S:499|M:599'
  ];

  const ws = XLSX.utils.aoa_to_sheet([header, sample, notes]);

  // Column widths
  ws['!cols'] = header.map((_, i) => ({ wch: [22,20,32,10,16,12,8,40,50,35][i] }));

  // Style header row (best-effort — SheetJS CE does not do rich styling, just note color)
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.writeFile(wb, 'thebohothread_product_import_template.xlsx');
  adminToast('Template downloaded!', 'success');
};

// ── Modal open / close ────────────────────────────────────────
window.openExcelImportModal = function() {
  excelImportRows = [];
  document.getElementById('excel-import-modal-backdrop').classList.add('open');
  document.getElementById('excel-preview-wrap').style.display = 'none';
  document.getElementById('excel-import-progress').style.display = 'none';
  document.getElementById('excel-file-name').style.display = 'none';
  document.getElementById('excel-file-input').value = '';
  document.getElementById('excel-import-btn').disabled = true;
  document.getElementById('excel-import-btn').style.opacity = '0.5';
  resetDropZone();
};

window.closeExcelImportModal = function() {
  document.getElementById('excel-import-modal-backdrop').classList.remove('open');
  excelImportRows = [];
};

function resetDropZone() {
  const dz = document.getElementById('excel-drop-zone');
  dz.style.borderColor = 'rgba(201,168,76,0.4)';
  dz.style.background = 'transparent';
}

window.excelDragOver = function(e) {
  e.preventDefault();
  const dz = document.getElementById('excel-drop-zone');
  dz.style.borderColor = 'var(--gold)';
  dz.style.background = 'rgba(201,168,76,0.06)';
};

window.excelDragLeave = function(e) { resetDropZone(); };

window.excelDrop = function(e) {
  e.preventDefault();
  resetDropZone();
  const file = e.dataTransfer.files[0];
  if (file) handleExcelFile(file);
};

// ── Parse uploaded file ───────────────────────────────────────
window.handleExcelFile = function(file) {
  if (!file) return;
  const XLSX = window.XLSX;
  if (!XLSX) { adminToast('SheetJS library not ready. Refresh and try again.', 'error'); return; }

  const allowed = ['xlsx','xls','csv'];
  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowed.includes(ext)) { adminToast('Please upload a .xlsx, .xls, or .csv file.', 'error'); return; }

  const fnEl = document.getElementById('excel-file-name');
  fnEl.textContent = `📄 ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
  fnEl.style.display = 'block';

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      parseAndPreview(rows);
    } catch(err) {
      adminToast('Failed to read file: ' + err.message, 'error');
    }
  };
  reader.readAsArrayBuffer(file);
};

function parseAndPreview(rawRows) {
  excelImportRows = [];
  const tbody = document.getElementById('excel-preview-tbody');
  tbody.innerHTML = '';

  let errorCount = 0;
  const validRows = [];

  rawRows.forEach((row, i) => {
    // Normalise keys to lowercase
    const r = {};
    Object.keys(row).forEach(k => { r[k.toLowerCase().trim().replace(/\s+/g,'_')] = String(row[k]).trim(); });

    const name     = r.name || '';
    const category = r.category || '';
    const price    = parseFloat(r.price) || 0;
    const origPrice= parseFloat(r.original_price) || null;
    const desc     = r.description || '';
    const badge    = r.badge || '';
    const rating   = parseFloat(r.rating) || null;
    const imageUrl = r.image_url || '';
    const extraImgs= r.extra_images ? r.extra_images.split('|').map(u=>u.trim()).filter(Boolean) : [];
    const sizesRaw = r.sizes || '';

    const errors = [];
    if (!name) errors.push('Name missing');
    if (!category) errors.push('Category missing');
    if (!imageUrl) errors.push('Image URL missing');
    if (!price && !sizesRaw) errors.push('Price missing');

    // Parse sizes
    let sizes = [];
    if (sizesRaw) {
      sizesRaw.split('|').forEach(pair => {
        const [sz, sp] = pair.split(':');
        if (sz && sp) sizes.push({ size: sz.trim(), price: parseFloat(sp), original_price: origPrice });
      });
    }

    const allImages = imageUrl ? [imageUrl, ...extraImgs] : extraImgs;
    const effectivePrice = sizes.length ? sizes[0].price : price;

    const statusHtml = errors.length
      ? `<span style="color:#e05c5c;font-size:0.78rem;">❌ ${errors.join(', ')}</span>`
      : `<span style="color:#4caf7d;font-size:0.78rem;">✓ Ready</span>`;

    if (errors.length) errorCount++;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--text-muted)">${i+1}</td>
      <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${name}">${name || '<em style="color:var(--text-muted)">—</em>'}</td>
      <td>${category || '<em style="color:var(--text-muted)">—</em>'}</td>
      <td>₹${effectivePrice || '—'}</td>
      <td>${badge || '—'}</td>
      <td style="font-size:0.78rem;color:var(--text-muted);">${allImages.length} image${allImages.length!==1?'s':''}</td>
      <td>${statusHtml}</td>
    `;
    tbody.appendChild(tr);

    if (!errors.length) {
      validRows.push({ name, category, description:desc, price:effectivePrice, original_price:origPrice, badge, rating, image:imageUrl, images:allImages, sizes });
    }
  });

  excelImportRows = validRows;
  document.getElementById('excel-preview-wrap').style.display = 'block';
  document.getElementById('excel-preview-count').textContent = rawRows.length;

  const errEl = document.getElementById('excel-preview-errors');
  errEl.textContent = errorCount ? `⚠ ${errorCount} row(s) have errors and will be skipped` : '';

  const importBtn = document.getElementById('excel-import-btn');
  if (validRows.length > 0) {
    importBtn.disabled = false;
    importBtn.style.opacity = '1';
    importBtn.innerHTML = `<i class="ph ph-upload-simple"></i> Import ${validRows.length} Product${validRows.length!==1?'s':''}`;
  } else {
    importBtn.disabled = true;
    importBtn.style.opacity = '0.5';
    importBtn.innerHTML = `<i class="ph ph-upload-simple"></i> Import Products`;
  }

  if (rawRows.length === 0) {
    adminToast('No data rows found in the file.', 'error');
  } else {
    adminToast(`Parsed ${rawRows.length} row(s) — ${validRows.length} valid, ${errorCount} skipped.`, validRows.length ? 'success' : 'error');
  }
}

// ── Run the actual import ─────────────────────────────────────
window.runExcelImport = async function() {
  if (!excelImportRows.length) return;

  const btn = document.getElementById('excel-import-btn');
  const progressWrap = document.getElementById('excel-import-progress');
  const progressBar  = document.getElementById('excel-progress-bar');
  const progressLabel= document.getElementById('excel-progress-label');

  btn.disabled = true;
  btn.style.opacity = '0.5';
  progressWrap.style.display = 'block';

  let done = 0;
  const total = excelImportRows.length;
  const imported = [];
  const failed = [];

  for (const row of excelImportRows) {
    progressLabel.textContent = `Importing ${done + 1} of ${total}: "${row.name}"…`;
    progressBar.style.width = `${Math.round((done / total) * 100)}%`;

    try {
      const payload = {
        name:           row.name,
        category:       row.category,
        description:    row.description || '',
        price:          row.price,
        original_price: row.original_price || null,
        badge:          row.badge || '',
        rating:         row.rating || null,
        image:          row.image,
        images:         row.images || [],
        sizes:          row.sizes  || [],
      };

      const saved = await fsAdd(COL.products, payload);
      products.unshift(saved);
      imported.push(row.name);
    } catch(e) {
      console.error('Import row failed:', row.name, e);
      failed.push(row.name);
    }

    done++;
  }

  progressBar.style.width = '100%';
  progressLabel.textContent = `Done! ${imported.length} imported${failed.length ? `, ${failed.length} failed` : ''}.`;

  renderProductsTable();
  renderRecentTable();
  updateStats();
  populateTrendingSelect();

  if (failed.length) {
    adminToast(`Imported ${imported.length} products. ${failed.length} failed — check console.`, 'error');
  } else {
    adminToast(`🎉 ${imported.length} product${imported.length!==1?'s':''} imported successfully!`, 'success');
    setTimeout(() => closeExcelImportModal(), 1800);
  }

  btn.disabled = false;
  btn.style.opacity = '1';
  excelImportRows = [];
};
