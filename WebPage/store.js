// Complete working store.js - Single page app with smooth scrolling nav
// Uses event delegation and fetches from /api/products

let products = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';
let searchTerm = '';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Boho Thread store loaded');
  
  await loadProducts();
  renderProducts();
  updateCartCount();
  
  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.querySelector('.nav-menu');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }
  
  // Load login.js for customer auth globals (if needed)
  const link = document.createElement('script');
  link.src = 'login.js';
  document.head.appendChild(link);
});

// ====================
// MAIN CLICK HANDLER
// ====================
document.addEventListener('click', (e) => {
  // Admin login button
  if (e.target.matches('#loginBtn') || e.target.closest('#loginBtn')) {
    handleAdminLogin();
    return;
  }

// Close admin login modal & backdrop click
  if (e.target.matches('.close-login-modal, #closeLoginModal')) {
    document.getElementById('loginModal').classList.remove('active');
    return;
  }

  // Header nav (Home, Shop, About, Contact) - FIRST to ensure priority
  if (e.target.matches('.nav-link') && !e.target.classList.contains('admin-nav')) {
    e.preventDefault();
    console.log('✅ NAV clicked:', e.target.dataset.page);
    
    // Close mobile menu
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.remove('active');
    document.getElementById('menuToggle').classList.remove('active');
    
    // Scroll to section
    const page = e.target.dataset.page;
    const section = document.getElementById(page);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      // Update active nav
      document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
      e.target.classList.add('active');
    }
    return;
  }
  
  // Categories
  if (e.target.matches('.category-btn')) {
    e.preventDefault();
    console.log('✅ CATEGORY clicked:', e.target.dataset.category);
    
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    filterByCategory(e.target.dataset.category);
    return;
  }
  
  // Settings cog - Admin login modal
  if (e.target.closest('#settingsBtn')) {
    console.log('⚙️ Settings clicked - Admin access');
    if (localStorage.getItem('adminToken')) {
      window.location.href = 'admin.html';
    } else {
      document.getElementById('loginModal').classList.add('active');
    }
    return;
  }
  
  // Cart toggle
  if (e.target.closest('#cartBtn')) {
    toggleCart();
    return;
  }
  
  // Close cart & overlays
  if (e.target.matches('.close-cart, #closeCart, #cartOverlay, .cart-overlay')) {
    closeCart();
    return;
  }
  
  // Search
  if (e.target.matches('#searchBtn')) {
    document.getElementById('searchBar').classList.add('active');
    document.getElementById('searchInput').focus();
    return;
  }
  if (e.target.matches('#closeSearch, .search-bar')) {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');
    searchBar.classList.remove('active');
    if (searchInput) {
      searchInput.value = '';
      performSearch('');
    }
    return;
  }
  
  // Quick view
  if (e.target.matches('.quickview-btn') || e.target.closest('.quickview-btn')) {
    e.stopPropagation();
    const btn = e.target.matches('.quickview-btn') ? e.target : e.target.closest('.quickview-btn');
    const productId = parseInt(btn.dataset.productId);
    if (!isNaN(productId)) {
      openQuickView(productId);
    }
    return;
  }

  // Close modals
  if (e.target.matches('.close-modal')) {
    document.querySelector('.product-modal').classList.remove('active');
    return;
  }
});

// ====================
// PRODUCT FUNCTIONS
// ====================
async function loadProducts() {
  try {
    const response = await fetch('/api/products?_=' + Date.now());
    products = await response.json();
    filteredProducts = [...products];
    console.log('📦 Loaded', products.length, 'products');
  } catch (error) {
    console.error('Failed to load products:', error);
    // Fallback data
    products = filteredProducts = [
{ id: 1, name: 'Boho Necklace', image: './product-images/1773305762145-964409636.png', price: 999, category: 'jewelry', stock: 10, isNew: true, isSale: false },
{ id: 2, name: 'Maxi Dress', image: './product-images/1773305762150-71463976.png', price: 2499, category: 'clothing', stock: 8, isSale: true, isNewLaunch: false },
{ id: 3, name: 'Wall Hanging', image: './product-images/1773306014188-545467905.jpeg', price: 1499, category: 'home', stock: 15 },
{ id: 4, name: 'Leather Bag', image: './product-images/1773306014190-988240885.jpeg', price: 1899, category: 'accessories', stock: 6 }
    ];
  }
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  
  filteredProducts.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image || './no-image-available.png'}" alt="${product.name || 'No Image Available'}">

        <div class="product-badges">${typeof renderProductBadges === 'function' ? renderProductBadges(product) : ''}</div>
        <div class="product-actions">
          <button class="product-action-btn quickview-btn" data-product-id="${product.id}" title="Quick View">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
      <div class="product-info">

        <div class="product-category">${product.category?.toUpperCase()}</div>
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">
${product.priceAfterDiscount ? `<span class="original-price">₹${product.actualMRP}</span>` : `₹${product.price || 0}`}
          ${product.actualMRP ? `<span class="sale-price">₹${product.priceAfterDiscount}</span>` : ''}
        </div>
        <span class="product-stock ${product.stock <= 5 ? 'stock-low' : 'stock-in'}">
          Stock: ${product.stock || 0}
        </span>
        <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterByCategory(category) {
  currentFilter = category;
  const searchInput = document.getElementById('searchInput');
  if (searchInput.value) {
    searchInput.value = '';
    performSearch('');
  }
  filterProducts();
  renderProducts();
  console.log(`🔍 Filtered to ${category}: ${filteredProducts.length} products`);
}

// ====================
// CART FUNCTIONS
// ====================
function addToCart(productId) {
  console.log('🛒 Add to cart:', productId);
  updateCartCount();
}

function toggleCart() {
  document.getElementById('cartSidebar').classList.toggle('active');
  document.getElementById('cartOverlay').classList.toggle('active');
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('active');
  document.getElementById('cartOverlay').classList.remove('active');
}

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    countEl.textContent = total;
  }
}

// Quick view modal
function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return console.error('Product not found:', productId);

document.getElementById('modalProductImage').src = product.image || './no-image-available.png';
  document.getElementById('modalProductImage').alt = product.name;
  document.getElementById('modalProductName').textContent = product.name;
  document.getElementById('modalProductPrice').innerHTML = product.priceAfterDiscount ? `<span class="original-price">₹${product.priceAfterDiscount}</span> <span class="sale-price">₹${product.priceAfterDiscount || product.price || 0}</span>` : `₹${product.price || 0}`;
  document.getElementById('modalProductDescription').textContent = product.description || `${product.name} - Handcrafted with love!`;
  document.getElementById('modalProductStock').textContent = product.stock > 0 ? 'In Stock' : 'Out of Stock';
  document.getElementById('productQty').value = 1;
  document.querySelector('.product-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ====================
// ADMIN LOGIN HANDLER
// ====================
async function handleAdminLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  if (!username || !password) {
    showAdminError('Please enter username and password');
    return;
  }
  
  errorEl.textContent = 'Logging in...';
  
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUsername', data.username);
      document.getElementById('loginModal').classList.remove('active');
      window.location.href = 'admin.html';
    } else {
      showAdminError(data.error || 'Invalid credentials');
    }
  } catch (error) {
    showAdminError('Server error - run run.bat?');
  }
}

function showAdminError(msg) {
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = msg;
}

// ====================
// SEARCH FUNCTIONS
// ====================
function performSearch(term) {
  searchTerm = term.toLowerCase().trim();
  filterProducts();
  renderProducts();
  console.log(`🔍 Search "${searchTerm}": ${filteredProducts.length} results`);
}

function filterProducts() {
  filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) &&
    (currentFilter === 'all' || product.category === currentFilter)
  );
}

// Add search input listener after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => performSearch(e.target.value));
    console.log('✅ Search input listener attached');
  }
});

// ====================
// GLOBALS
// ====================
window.loadProducts = loadProducts;
window.renderProducts = renderProducts;
window.filterByCategory = filterByCategory;
window.performSearch = performSearch;
window.addToCart = addToCart;
window.openQuickView = openQuickView;
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.handleAdminLogin = handleAdminLogin;

console.log('✅ Search functionality ready - type in search bar!');

