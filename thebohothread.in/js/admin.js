// ============================================================
// SHOPNOVA — Admin JS (admin.js)
// ============================================================
import { initializeApp }     from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, doc,
  addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage, ref as storageRef, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ── Firebase (replace with yours) ─────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
const fireApp = initializeApp(firebaseConfig);
const db      = getFirestore(fireApp);
const storage = getStorage(fireApp);

// ── Auth (hardcoded) ───────────────────────────────────────
const ADMIN_USER = "admin";
const ADMIN_PASS = "shopnova123";   // ← Change this!

// ── State ──────────────────────────────────────────────────
let products   = [];
let categories = [];
let badges     = [];
let currentImageBase64 = "";
let confirmCallback    = null;

// ═══════════════════════════════════════════════════════════
// LOGIN
// ═══════════════════════════════════════════════════════════
const loginPage = document.getElementById("login-page");
const adminApp  = document.getElementById("admin-app");

function checkAuth() {
  return sessionStorage.getItem("sn_admin_auth") === "1";
}

document.getElementById("login-btn").onclick = doLogin;
document.getElementById("login-pass").addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });

function doLogin() {
  const u = document.getElementById("login-user").value.trim();
  const p = document.getElementById("login-pass").value;
  const errEl = document.getElementById("login-error");
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    sessionStorage.setItem("sn_admin_auth","1");
    errEl.classList.remove("show");
    loginPage.style.display = "none";
    adminApp.style.display  = "flex";
    startAdminListeners();
  } else {
    errEl.classList.add("show");
    document.getElementById("login-pass").value = "";
  }
}

window.logout = function() {
  sessionStorage.removeItem("sn_admin_auth");
  location.reload();
};

if (checkAuth()) {
  loginPage.style.display = "none";
  adminApp.style.display  = "flex";
  startAdminListeners();
}

// ── Mobile sidebar toggle visibility ──
window.addEventListener("resize", () => {
  const toggle = document.getElementById("sidebar-toggle");
  if (toggle) toggle.style.display = window.innerWidth <= 860 ? "block" : "none";
});
window.dispatchEvent(new Event("resize"));

// ═══════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════
window.navigate = function(page, linkEl) {
  document.querySelectorAll(".admin-page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".sidebar-nav a").forEach(a => a.classList.remove("active"));
  document.getElementById(`page-${page}`).classList.add("active");
  if (linkEl) linkEl.classList.add("active");
  document.getElementById("page-title").textContent =
    page.charAt(0).toUpperCase() + page.slice(1);
  document.getElementById("admin-sidebar").classList.remove("open");
};

// ═══════════════════════════════════════════════════════════
// FIREBASE LISTENERS
// ═══════════════════════════════════════════════════════════
function startAdminListeners() {
  // Products
  onSnapshot(query(collection(db,"products"), orderBy("createdAt","desc")), snap => {
    products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderProductsTable();
    renderRecentTable();
    updateStats();
  }, () => {
    adminToast("Firebase not configured — using local demo data.", "error");
    loadLocalDemo();
  });

  // Categories
  onSnapshot(collection(db,"categories"), snap => {
    categories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderCategoriesList();
    populateCategorySelect();
    updateStats();
  });

  // Badges
  onSnapshot(collection(db,"badges"), snap => {
    badges = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderBadgesList();
    populateBadgeSelect();
    updateStats();
  });
}

function loadLocalDemo() {
  products = [
    { id:"d1", name:"Ivory Ceramic Vase", category:"Decor", price:1299, badge:"New", rating:4.5, image:"https://images.unsplash.com/photo-1578500351865-d6c3706f46bc?w=200&q=60" },
    { id:"d2", name:"Linen Throw Blanket", category:"Textiles", price:2499, badge:"Bestseller", rating:5, image:"https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=200&q=60" },
  ];
  categories = [{ id:"c1", name:"Decor" },{ id:"c2", name:"Textiles" }];
  badges     = [{ id:"b1", name:"New", color:"#4caf7d", textColor:"#fff" },{ id:"b2", name:"Sale", color:"#e05c5c", textColor:"#fff" }];
  renderProductsTable(); renderRecentTable(); renderCategoriesList();
  populateCategorySelect(); renderBadgesList(); populateBadgeSelect(); updateStats();
}

// ═══════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════
function updateStats() {
  document.getElementById("stat-products").textContent = products.length;
  document.getElementById("stat-cats").textContent     = categories.length;
  document.getElementById("stat-badges").textContent   = badges.length;
  const ratings = products.filter(p=>p.rating).map(p=>p.rating);
  document.getElementById("stat-rating").textContent =
    ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : "—";
}

// ═══════════════════════════════════════════════════════════
// PRODUCTS TABLE
// ═══════════════════════════════════════════════════════════
function productRowHTML(p) {
  const badge = p.badge
    ? `<span class="pill pill-gold" style="${getBadgeStyle(p.badge)}">${p.badge}</span>`
    : `<span style="color:var(--text-muted);font-size:0.8rem;">—</span>`;
  const img = p.image
    ? `<img class="table-img" src="${p.image}" alt="" onerror="this.style.opacity='0.3'" />`
    : `<div class="table-img" style="background:var(--navy-mid);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.7rem;">No img</div>`;
  return `<tr>
    <td>${img}</td>
    <td style="font-weight:500;">${p.name}</td>
    <td><span style="color:var(--gold);font-size:0.82rem;">${p.category||"—"}</span></td>
    <td>₹${(p.price||0).toLocaleString()}</td>
    <td>${badge}</td>
    <td>${p.rating||"—"}</td>
    <td>
      <div class="table-actions">
        <button class="btn btn-outline-gold btn-sm" onclick="openProductModal('${p.id}')">
          <i class="ph ph-pencil"></i> Edit
        </button>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('product','${p.id}','${p.name.replace(/'/g,"\\'")}')">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    </td>
  </tr>`;
}

function renderProductsTable(filter="") {
  const tbody = document.getElementById("products-tbody");
  if (!tbody) return;
  const list = filter
    ? products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : products;
  tbody.innerHTML = list.length
    ? list.map(productRowHTML).join("")
    : `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No products yet.</td></tr>`;
}

function renderRecentTable() {
  const tbody = document.getElementById("recent-tbody");
  if (!tbody) return;
  const list = products.slice(0,5);
  tbody.innerHTML = list.length
    ? list.map(p => `<tr>
        <td>${p.image ? `<img class="table-img" src="${p.image}" alt="" onerror="this.style.opacity='0.3'"/>` : `<div class="table-img" style="background:var(--navy-mid);"></div>`}</td>
        <td style="font-weight:500;">${p.name}</td>
        <td><span style="color:var(--gold);font-size:0.82rem;">${p.category||"—"}</span></td>
        <td>₹${(p.price||0).toLocaleString()}</td>
        <td>${p.badge ? `<span class="pill pill-gold">${p.badge}</span>` : "—"}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline-gold btn-sm" onclick="openProductModal('${p.id}')"><i class="ph ph-pencil"></i></button>
          </div>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No products yet. <a href="#" onclick="openProductModal()" style="color:var(--gold);">Add one?</a></td></tr>`;
}

window.filterProductTable = function(val) { renderProductsTable(val); };

// ═══════════════════════════════════════════════════════════
// PRODUCT MODAL
// ═══════════════════════════════════════════════════════════
window.openProductModal = function(id) {
  const modal = document.getElementById("product-modal-backdrop");
  const titleEl = document.getElementById("product-modal-title");

  clearImage();
  document.getElementById("edit-product-id").value = id || "";

  if (id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    titleEl.textContent = "Edit Product";
    document.getElementById("p-name").value       = p.name || "";
    document.getElementById("p-category").value   = p.category || "";
    document.getElementById("p-desc").value        = p.description || "";
    document.getElementById("p-price").value       = p.price || "";
    document.getElementById("p-orig-price").value  = p.originalPrice || "";
    document.getElementById("p-rating").value      = p.rating || "";
    document.getElementById("p-badge").value       = p.badge || "";
    document.getElementById("p-image-url").value   = p.image || "";
    if (p.image) previewFromURL(p.image);
  } else {
    titleEl.textContent = "Add Product";
    document.getElementById("p-name").value       = "";
    document.getElementById("p-category").value   = "";
    document.getElementById("p-desc").value        = "";
    document.getElementById("p-price").value       = "";
    document.getElementById("p-orig-price").value  = "";
    document.getElementById("p-rating").value      = "";
    document.getElementById("p-badge").value       = "";
    document.getElementById("p-image-url").value   = "";
  }

  modal.classList.add("open");
};

window.closeProductModal = function() {
  document.getElementById("product-modal-backdrop").classList.remove("open");
};

window.saveProduct = async function() {
  const id    = document.getElementById("edit-product-id").value;
  const name  = document.getElementById("p-name").value.trim();
  const cat   = document.getElementById("p-category").value;
  const desc  = document.getElementById("p-desc").value.trim();
  const price = parseFloat(document.getElementById("p-price").value);
  const orig  = parseFloat(document.getElementById("p-orig-price").value) || null;
  const rating= parseFloat(document.getElementById("p-rating").value) || null;
  const badge = document.getElementById("p-badge").value;
  let   image = document.getElementById("p-image-url").value.trim();

  if (!name) { adminToast("Product name is required.", "error"); return; }
  if (!price || isNaN(price)) { adminToast("Valid price is required.", "error"); return; }

  // If a file was uploaded (base64), upload to Firebase Storage
  if (currentImageBase64) {
    try {
      image = await uploadBase64ToStorage(currentImageBase64, name);
    } catch(e) {
      adminToast("Image upload failed, using URL instead.", "error");
    }
  }

  const data = {
    name, category: cat, description: desc, price,
    ...(orig ? { originalPrice: orig } : {}),
    ...(rating ? { rating } : {}),
    ...(badge ? { badge } : { badge:"" }),
    ...(image ? { image } : {}),
  };

  try {
    if (id) {
      await updateDoc(doc(db,"products",id), data);
      adminToast(`"${name}" updated successfully.`, "success");
    } else {
      data.createdAt = serverTimestamp();
      await addDoc(collection(db,"products"), data);
      adminToast(`"${name}" added successfully! 🎉`, "success");
    }
    closeProductModal();
  } catch(e) {
    console.error(e);
    adminToast("Firebase error — check config.", "error");
    // Fallback: update local state for demo
    if (!id) {
      products.unshift({ id:`local-${Date.now()}`, ...data, createdAt:{ toMillis:()=>Date.now() } });
    } else {
      const idx = products.findIndex(p=>p.id===id);
      if (idx>-1) products[idx] = { ...products[idx], ...data };
    }
    renderProductsTable(); renderRecentTable(); updateStats();
    closeProductModal();
  }
};

// ═══════════════════════════════════════════════════════════
// IMAGE HANDLING
// ═══════════════════════════════════════════════════════════
window.handleImageFile = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { adminToast("Image too large (max 5 MB).", "error"); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    currentImageBase64 = ev.target.result;
    showImagePreview(ev.target.result);
    document.getElementById("p-image-url").value = "";
  };
  reader.readAsDataURL(file);
};

window.previewFromURL = function(url) {
  if (!url) { document.getElementById("img-preview-wrap").style.display="none"; return; }
  currentImageBase64 = "";
  showImagePreview(url);
};

function showImagePreview(src) {
  const wrap = document.getElementById("img-preview-wrap");
  const img  = document.getElementById("img-preview");
  img.src = src;
  wrap.style.display = "flex";
}

window.clearImage = function() {
  currentImageBase64 = "";
  document.getElementById("p-image-url").value = "";
  document.getElementById("img-preview-wrap").style.display = "none";
  document.getElementById("img-preview").src = "";
  document.getElementById("img-file-input").value = "";
};

async function uploadBase64ToStorage(base64, name) {
  const blob     = await fetch(base64).then(r=>r.blob());
  const filename = `products/${Date.now()}_${name.replace(/\s+/g,"-")}.jpg`;
  const sRef     = storageRef(storage, filename);
  await uploadBytes(sRef, blob);
  return getDownloadURL(sRef);
}

// Drag & drop
const dropZone = document.getElementById("img-drop-zone");
dropZone?.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("drag-over"); });
dropZone?.addEventListener("dragleave", () => dropZone.classList.remove("drag-over"));
dropZone?.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = ev => {
      currentImageBase64 = ev.target.result;
      showImagePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  }
});

// ═══════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════
function renderCategoriesList() {
  const el = document.getElementById("categories-list");
  if (!el) return;
  el.innerHTML = categories.length
    ? categories.map(c => `
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--navy);border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.06);">
          <span>${c.icon||""} ${c.name}</span>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('category','${c.id}','${c.name}')">
            <i class="ph ph-trash"></i>
          </button>
        </div>`).join("")
    : `<p style="color:var(--text-muted);font-size:0.88rem;">No categories yet.</p>`;
}

function populateCategorySelect() {
  const sel = document.getElementById("p-category");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = `<option value="">Select category…</option>` +
    categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
  sel.value = current;
}

window.addCategory = async function() {
  const name = document.getElementById("new-cat-name").value.trim();
  const icon = document.getElementById("new-cat-icon").value.trim();
  if (!name) { adminToast("Category name required.", "error"); return; }
  if (categories.find(c=>c.name.toLowerCase()===name.toLowerCase())) {
    adminToast("Category already exists.", "error"); return;
  }
  try {
    await addDoc(collection(db,"categories"), { name, icon, createdAt: serverTimestamp() });
    adminToast(`Category "${name}" added!`, "success");
  } catch(e) {
    categories.push({ id:`c-${Date.now()}`, name, icon });
    renderCategoriesList(); populateCategorySelect(); updateStats();
    adminToast(`Category "${name}" added (local).`, "success");
  }
  document.getElementById("new-cat-name").value = "";
  document.getElementById("new-cat-icon").value = "";
};

// ═══════════════════════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════════════════════
function renderBadgesList() {
  const el = document.getElementById("badges-list");
  if (!el) return;
  el.innerHTML = badges.length
    ? badges.map(b => `
        <div style="display:flex;align-items:center;justify-content:space-between;background:var(--navy);border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.06);">
          <span class="pill" style="background:${b.color||'var(--gold)'};color:${b.textColor||'#fff'}">${b.name}</span>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete('badge','${b.id}','${b.name}')">
            <i class="ph ph-trash"></i>
          </button>
        </div>`).join("")
    : `<p style="color:var(--text-muted);font-size:0.88rem;">No badges yet.</p>`;
}

function populateBadgeSelect() {
  const sel = document.getElementById("p-badge");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = `<option value="">No Badge</option>` +
    badges.map(b => `<option value="${b.name}">${b.name}</option>`).join("");
  sel.value = current;
}

function getBadgeStyle(name) {
  const b = badges.find(x=>x.name===name);
  return b ? `background:${b.color};color:${b.textColor};border:none;` : "";
}

window.addBadge = async function() {
  const name  = document.getElementById("new-badge-name").value.trim();
  const color = document.getElementById("new-badge-color").value.trim() || "#c9a84c";
  const text  = document.getElementById("new-badge-text").value.trim() || "#ffffff";
  if (!name) { adminToast("Badge name required.", "error"); return; }
  if (badges.find(b=>b.name.toLowerCase()===name.toLowerCase())) {
    adminToast("Badge already exists.", "error"); return;
  }
  try {
    await addDoc(collection(db,"badges"), { name, color, textColor: text, createdAt: serverTimestamp() });
    adminToast(`Badge "${name}" added!`, "success");
  } catch(e) {
    badges.push({ id:`b-${Date.now()}`, name, color, textColor: text });
    renderBadgesList(); populateBadgeSelect(); updateStats();
    adminToast(`Badge "${name}" added (local).`, "success");
  }
  document.getElementById("new-badge-name").value  = "";
  document.getElementById("new-badge-color").value = "";
};

// ═══════════════════════════════════════════════════════════
// DELETE CONFIRMATION
// ═══════════════════════════════════════════════════════════
window.confirmDelete = function(type, id, name) {
  document.getElementById("confirm-msg").textContent = `Delete "${name}"? This cannot be undone.`;
  document.getElementById("confirm-modal").classList.add("open");
  confirmCallback = async () => {
    try {
      if (type === "product")  await deleteDoc(doc(db,"products",id));
      if (type === "category") await deleteDoc(doc(db,"categories",id));
      if (type === "badge")    await deleteDoc(doc(db,"badges",id));
      adminToast(`"${name}" deleted.`, "success");
    } catch(e) {
      // Local fallback
      if (type==="product")  products   = products.filter(x=>x.id!==id);
      if (type==="category") categories = categories.filter(x=>x.id!==id);
      if (type==="badge")    badges     = badges.filter(x=>x.id!==id);
      renderProductsTable(); renderRecentTable();
      renderCategoriesList(); populateCategorySelect();
      renderBadgesList(); populateBadgeSelect(); updateStats();
      adminToast(`"${name}" deleted (local).`);
    }
    closeConfirm();
  };
  document.getElementById("confirm-ok-btn").onclick = confirmCallback;
};

window.closeConfirm = function() {
  document.getElementById("confirm-modal").classList.remove("open");
  confirmCallback = null;
};

// Close modals on backdrop click
document.getElementById("product-modal-backdrop").onclick = e => {
  if (e.target === document.getElementById("product-modal-backdrop")) closeProductModal();
};
document.getElementById("confirm-modal").onclick = e => {
  if (e.target === document.getElementById("confirm-modal")) closeConfirm();
};

// ═══════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════
window.adminToast = function(msg, type="") {
  const el = document.createElement("div");
  el.className = `a-toast ${type}`;
  el.textContent = msg;
  document.getElementById("admin-toast").appendChild(el);
  setTimeout(() => el.remove(), 3200);
};
