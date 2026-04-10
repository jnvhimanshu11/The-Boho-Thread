// ============================================================
// TheBohoThread — Admin JS  (MySQL backend edition)
// All CRUD operations go to /api/*.php → MySQL database
// ============================================================

const API = {
  products:   '/api/products.php',
  categories: '/api/categories.php',
  badges:     '/api/badges.php',
  reviews:    '/api/reviews.php',
  trending:   '/api/trending.php',
};

async function apiFetch(url, opts = {}) {
  try {
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opts });
    const text = await res.text();
    if (!text || text.trim() === '') {
      console.error('API returned empty response for', url);
      return { success: false, error: 'Server returned an empty response. Check PHP error logs.' };
    }
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error('API JSON parse error for', url, '— raw response:', text);
      return { success: false, error: 'Server response was not valid JSON. Check PHP error logs.' };
    }
  } catch (e) { console.error('API fetch error:', e); return { success: false, error: e.message }; }
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
  const titles = { dashboard:'Dashboard', products:'Products', categories:'Categories', badges:'Badges', reviews:'Reviews', trending:'Trending', 'store-settings':'Store Settings' };
  document.getElementById('page-title').textContent = titles[page] || page;
  document.getElementById('admin-sidebar').classList.remove('open');
};

// ═════════════════════════════════════════════════════════════
//  LOAD ALL DATA
// ═════════════════════════════════════════════════════════════
async function loadAllData() {
  const [pRes, cRes, bRes, rRes, tRes] = await Promise.all([
    apiFetch(API.products),
    apiFetch(API.categories),
    apiFetch(API.badges),
    apiFetch(API.reviews),
    apiFetch(API.trending),
  ]);

  if (pRes.success) products   = pRes.data; else loadLocalDemo();
  if (cRes.success) categories = cRes.data;
  if (bRes.success) badges     = bRes.data;
  if (rRes.success) allReviews = rRes.data;
  if (tRes.success) trendingList = tRes.data.map(t => t.id);

  renderProductsTable(); renderRecentTable(); renderCategoriesList();
  populateCategorySelect(); renderBadgesList(); populateBadgeSelect();
  populateTrendingSelect(); renderTrendingList();
  updateStats(); updateReviewStats(); renderReviewsList();
}

function loadLocalDemo() {
  products = [
    {id:1,name:'Ivory Ceramic Vase',category:'Decor',price:1299,original_price:1799,badge:'New',rating:4.5,description:'Handcrafted ceramic vase.',image:'https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?w=200'},
    {id:2,name:'Linen Throw Blanket',category:'Textiles',price:2499,badge:'Bestseller',rating:5,description:'Premium linen throw.',image:'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=200'},
  ];
  categories=[{id:1,name:'Decor',icon:'🏺'},{id:2,name:'Textiles',icon:'🧶'},{id:3,name:'Furniture',icon:'🪑'},{id:4,name:'Kitchen',icon:'🍳'}];
  badges=[{id:1,name:'New',color:'#4caf7d',text_color:'#fff'},{id:2,name:'Sale',color:'#e05c5c',text_color:'#fff'},{id:3,name:'Bestseller',color:'#c9a84c',text_color:'#0d1b2a'},{id:4,name:'Hot',color:'#f5692a',text_color:'#fff'}];
  adminToast('Could not connect to MySQL API — showing demo data. Check api/db.php config.', 'error');
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
  const dot=document.getElementById('nav-review-dot'); if(dot) dot.style.display=pending>0?'inline-block':'none';
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

  // Reset size mode
  usingSizePricing=false; sizeRows=[];
  document.getElementById('p-use-sizes').checked=false;
  document.getElementById('p-no-size-pricing').style.display='block';
  document.getElementById('p-sizes-container').style.display='none';
  document.getElementById('p-sizes-list').innerHTML='';

  // Reset images
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

    // Load sizes
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

    // Load images — build slots from images array + fallback to single image
    const imgs = (p.images && Array.isArray(p.images) && p.images.length > 0)
      ? p.images
      : (p.image ? [p.image] : []);
    productImageSlots = imgs.map(url=>({url, base64:''}));
    renderImageSlots();
  } else {
    ['p-name','p-desc','p-price','p-orig-price','p-rating'].forEach(fid=>{ const el=document.getElementById(fid); if(el) el.value=''; });
    document.getElementById('p-category').value='';
    document.getElementById('p-badge').value='';
    // Start with one empty image slot
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

  // Primary image = first slot
  const primaryImage = imagesArr[0];

  let price = null, orig = null, sizes = null;

  if (usingSizePricing) {
    // Read size rows from DOM
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
    // Use first size price as the base price for display/sort
    price = sizes[0].price;
    orig  = sizes[0].original_price;
  } else {
    price = parseFloat(document.getElementById('p-price').value);
    const origVal = document.getElementById('p-orig-price').value;
    orig = origVal !== '' ? parseFloat(origVal) : null;
    if (!price || isNaN(price) || price <= 0) { adminToast('Valid price is required.','error'); return; }
  }

  const saveBtn=document.getElementById('save-product-btn');
  if (saveBtn) { saveBtn.disabled=true; saveBtn.innerHTML=`<i class="ph ph-circle-notch" style="animation:spin 1s linear infinite;display:inline-block;"></i> Saving…`; }

  const payload = {
    name, category:cat, description:desc, price, original_price:orig,
    rating, badge:badge||'', image:primaryImage,
    images: imagesArr,
    sizes: sizes || [],
  };

  const res = id
    ? await apiFetch(`${API.products}?id=${id}`, { method:'PUT',  body:JSON.stringify(payload) })
    : await apiFetch(API.products,                { method:'POST', body:JSON.stringify(payload) });

  if (res.success) {
    if (id) { const i=products.findIndex(p=>String(p.id)===String(id)); if(i>-1) products[i]=res.data; }
    else    { products.unshift(res.data); }
    renderProductsTable(); renderRecentTable(); updateStats();
    populateTrendingSelect();
    adminToast(id?`"${name}" updated ✓`:`"${name}" added! 🎉`,'success');
    closeProductModal();
  } else {
    adminToast(res.error||'Save failed — check your API/database config.','error');
  }

  if (saveBtn) { saveBtn.disabled=false; saveBtn.innerHTML=`<i class="ph ph-floppy-disk"></i> Save Product`; }
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
  // Trigger re-render to show thumbnail
  if (productImageSlots[idx] && productImageSlots[idx].url) renderImageSlots();
};

window.handleImageSlotFile = function(idx, e) {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 5*1024*1024) { adminToast('Image too large (max 5 MB).','error'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    if (productImageSlots[idx]) {
      productImageSlots[idx].base64 = ev.target.result;
      productImageSlots[idx].url    = '';
    }
    renderImageSlots();
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
  const res=await apiFetch(API.categories,{method:'POST',body:JSON.stringify({name,icon})});
  if (res.success) {
    categories.push(res.data);
    renderCategoriesList(); populateCategorySelect(); updateStats();
    adminToast(`"${name}" category created — now live on store! ✓`,'success');
    document.getElementById('new-cat-name').value=''; document.getElementById('new-cat-icon').value='';
  } else { adminToast(res.error||'Failed to add category.','error'); }
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
  const res=await apiFetch(API.badges,{method:'POST',body:JSON.stringify({name,color,text_color:text})});
  if (res.success) {
    badges.push(res.data);
    renderBadgesList(); populateBadgeSelect(); updateStats();
    adminToast(`Badge "${name}" created ✓`,'success');
    document.getElementById('new-badge-name').value=''; document.getElementById('new-badge-color').value=''; document.getElementById('new-badge-text').value='#ffffff';
  } else { adminToast(res.error||'Failed to add badge.','error'); }
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
    const date=r.created_at?new Date(r.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
    const sb={pending:`<span class="review-status pending">⏳ Pending</span>`,approved:`<span class="review-status approved">✓ Approved</span>`,rejected:`<span class="review-status rejected">✕ Rejected</span>`}[r.status]||'';
    const acts=r.status==='pending'
      ?`<button class="btn btn-success btn-sm" onclick="approveReview(${r.id},${r.product_id})"><i class="ph ph-check-circle"></i> Approve</button><button class="btn btn-danger btn-sm" onclick="rejectReview(${r.id})"><i class="ph ph-x-circle"></i> Reject</button>`
      :r.status==='approved'
      ?`<button class="btn btn-danger btn-sm" onclick="rejectReview(${r.id})"><i class="ph ph-x-circle"></i> Revoke</button>`
      :`<button class="btn btn-success btn-sm" onclick="approveReview(${r.id},${r.product_id})"><i class="ph ph-check-circle"></i> Approve</button>`;
    return `<div class="review-admin-row">
      <div class="review-row-top">
        <div class="review-row-meta"><span class="review-author">${r.author||'Anonymous'}</span><span>${stars}</span><span class="review-date">${date}</span></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;"><span class="review-product-tag">${r.product_name||'Unknown'}</span>${sb}</div>
      </div>
      <p class="review-text-content">${r.review_text||'<em style="color:var(--text-muted);">No comment</em>'}</p>
      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">${acts}
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('review',${r.id},'review by ${(r.author||'Anonymous').replace(/'/g,"\\'")}')"><i class="ph ph-trash"></i> Delete</button>
      </div></div>`;
  }).join('');
}

window.approveReview = async function(reviewId, productId) {
  const res=await apiFetch(`${API.reviews}?id=${reviewId}`,{method:'PUT',body:JSON.stringify({status:'approved'})});
  if (res.success) {
    const r=allReviews.find(x=>x.id===reviewId); if(r) r.status='approved';
    updateReviewStats(); renderReviewsList();
    // Refresh product rating in table
    const pRes=await apiFetch(API.products);
    if(pRes.success){ products=pRes.data; renderProductsTable(); renderRecentTable(); updateStats(); }
    adminToast('Review approved and published! ✓','success');
  } else { adminToast('Failed to approve review.','error'); }
};

window.rejectReview = async function(reviewId) {
  const res=await apiFetch(`${API.reviews}?id=${reviewId}`,{method:'PUT',body:JSON.stringify({status:'rejected'})});
  if (res.success) {
    const r=allReviews.find(x=>x.id===reviewId); if(r) r.status='rejected';
    updateReviewStats(); renderReviewsList(); adminToast('Review rejected.','');
  } else { adminToast('Failed to reject review.','error'); }
};

// ═════════════════════════════════════════════════════════════
//  DELETE
// ═════════════════════════════════════════════════════════════
window.confirmDelete = function(type,id,name) {
  document.getElementById('confirm-msg').textContent=`Delete "${name}"? This cannot be undone.`;
  document.getElementById('confirm-modal').classList.add('open');
  confirmCallback = async () => {
    const endpoints={product:API.products,category:API.categories,badge:API.badges,review:API.reviews};
    const url=endpoints[type];
    if (!url) { closeConfirm(); return; }
    const res=await apiFetch(`${url}?id=${id}`,{method:'DELETE'});
    if (res.success) {
      if(type==='product')  products=products.filter(x=>String(x.id)!==String(id));
      if(type==='category') categories=categories.filter(x=>String(x.id)!==String(id));
      if(type==='badge')    badges=badges.filter(x=>String(x.id)!==String(id));
      if(type==='review')   allReviews=allReviews.filter(x=>String(x.id)!==String(id));
      renderProductsTable(); renderRecentTable(); renderCategoriesList();
      populateCategorySelect(); renderBadgesList(); populateBadgeSelect();
      updateStats(); updateReviewStats(); renderReviewsList();
      adminToast(`"${name}" deleted.`,'success');
    } else { adminToast('Delete failed.','error'); }
    closeConfirm();
  };
  document.getElementById('confirm-ok-btn').onclick=confirmCallback;
};

window.closeConfirm = function() { document.getElementById('confirm-modal').classList.remove('open'); confirmCallback=null; };

document.getElementById('product-modal-backdrop').onclick=e=>{if(e.target===document.getElementById('product-modal-backdrop'))closeProductModal();};
document.getElementById('confirm-modal').onclick=e=>{if(e.target===document.getElementById('confirm-modal'))closeConfirm();};

// ═════════════════════════════════════════════════════════════
//  TOAST
// ═════════════════════════════════════════════════════════════
window.adminToast = function(msg,type='') {
  const el=document.createElement('div'); el.className='a-toast '+type; el.textContent=msg;
  document.getElementById('admin-toast').appendChild(el); setTimeout(()=>el.remove(),3500);
};

const s=document.createElement('style'); s.textContent='@keyframes spin{to{transform:rotate(360deg)}}'; document.head.appendChild(s);

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
  const pid = sel ? parseInt(sel.value) : 0;
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
  const res = await apiFetch(API.trending, { method:'POST', body:JSON.stringify({ product_ids: trendingList }) });
  if (res.success) {
    adminToast(`Trending list saved! (${trendingList.length} products) — visible on store now ✓`, 'success');
  } else {
    adminToast(res.error || 'Failed to save trending list.', 'error');
  }
  if (btn) { btn.disabled=false; btn.innerHTML=`<i class="ph ph-floppy-disk"></i> Save Order`; }
};

window.clearTrending = function() {
  if (!trendingList.length) { adminToast('Trending list is already empty.',''); return; }
  trendingList = [];
  renderTrendingList();
  adminToast('Trending list cleared. Click "Save Order" to apply.','');
};
