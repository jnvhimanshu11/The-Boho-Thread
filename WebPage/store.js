
// ============================================
// THE BOHO THREAD - STORE FRONTEND
// ============================================

// Global state
var products = [];
var cart = [];
var currentProduct = null;

// DOM Elements
var productsGrid = document.getElementById('productsGrid');
var cartBtn = document.getElementById('cartBtn');
var cartSidebar = document.getElementById('cartSidebar');
var cartOverlay = document.getElementById('cartOverlay');
var closeCart = document.getElementById('closeCart');
var cartItems = document.getElementById('cartItems');
var cartCount = document.getElementById('cartCount');
var cartTotal = document.getElementById('cartTotal');
var searchBtn = document.getElementById('searchBtn');
var searchBar = document.getElementById('searchBar');
var closeSearch = document.getElementById('closeSearch');
var searchInput = document.getElementById('searchInput');
var menuToggle = document.getElementById('menuToggle');
var productModal = document.getElementById('productModal');
var closeModal = document.getElementById('closeModal');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    loadCart();
    setupEventListeners();
});

// Fetch products from server
function loadProducts() {
    fetch('/api/products')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            products = data;
            renderProducts(products);
        })
        .catch(function(error) {
            console.error('Error loading products:', error);
            productsGrid.innerHTML = '<p class="empty-state">No products available. Check back later!</p>';
        });
}

// Render products to grid
function renderProducts(productsToRender) {
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = '<p class="empty-state">No products found.</p>';
        return;
    }

    productsGrid.innerHTML = productsToRender.map(function(product, index) {
        var stockClass = getStockClass(product.stock);
        var stockText = getStockText(product.stock);
        var disabled = product.stock === 0 ? 'disabled' : '';
        var btnText = product.stock === 0 ? 'Out of Stock' : 'Add to Cart';
        
        // Badge rendering
        var badges = '';
        if (product.isNew) {
            badges += '<span class="product-badge badge-new">NEW</span>';
        }
        if (product.isSale) {
            badges += '<span class="product-badge badge-sale">SALE</span>';
        }
        if (product.isNewLaunch) {
            badges += '<span class="product-badge badge-launch">NEW LAUNCH</span>';
        }
        
        // Original pr  ice and discount calculation
        // Price display logic
        var priceDisplay = '₹' + product.actualMRP;
        
        if (product.priceAfterDiscount && product.priceAfterDiscount > product.actualMRP) {
            var discount = Math.round(((product.priceAfterDiscount - product.actualMRP) / product.priceAfterDiscount) * 100);
            priceDisplay = '<span class="sale-price">₹' + product.actualMRP + '</span><span class="discount-badge">-' + discount + '%</span><span class="original-price">₹' + product.priceAfterDiscount + '</span>';
        }
        
        return '<div class="product-card" style="animation-delay: ' + (index * 0.1) + 's">' +
            '<div class="product-image">' +
this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3NSA3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc1IiBoZWlnaHQ9Ijc1IiBmaWxsPSIjNDE0MTQxIi8+Cjx0ZXh0IHg9IjM3LjUiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';this.style.objectFit='cover'
            badges +
            '<div class="product-actions">' +
            '<button class="product-action-btn" onclick="openProductModal(\'' + product.id + '\')" title="Quick View">' +
            '<i class="fas fa-eye"></i>' +
            '</button>' +
            '</div>' +
            '</div>' +
            '<div class="product-info">' +
            '<p class="product-category">' + product.category + '</p>' +
            '<h3 class="product-title">' + product.name + '</h3>' +
            '<p class="product-price">' + priceDisplay + '</p>' +
            '<p class="product-stock ' + stockClass + '">' + stockText + '</p>' +
            '<button class="add-to-cart" onclick="addToCart(\'' + product.id + '\')" ' + disabled + '>' + btnText + '</button>' +
            '</div>' +
            '</div>';
    }).join('');
}

// Get stock class
function getStockClass(stock) {
    if (stock === 0) return 'stock-out';
    if (stock <= 5) return 'stock-low';
    return 'stock-in';
}

// Get stock text
function getStockText(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Only ' + stock + ' left!';
    return 'In Stock';
}

// Open product modal
function openProductModal(productId) {
    var product = products.find(function(p) { return p.id === productId; });
    if (!product) return;

    currentProduct = product;

    document.getElementById('modalProductImage').src = product.image;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductPrice').textContent = '₹' + product.actualMRP;
    document.getElementById('modalProductDescription').textContent = product.description || 'No description available.';
    document.getElementById('modalProductStock').textContent = getStockText(product.stock);
    document.getElementById('productQty').value = 1;
    document.getElementById('productQty').max = product.stock;

    var addToCartBtn = document.getElementById('addToCartBtn');
    if (product.stock === 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Out of Stock';
    } else {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
    }

    productModal.classList.add('active');
}

// Close modal
function closeProductModal() {
    productModal.classList.remove('active');
    currentProduct = null;
}

// Add to cart
function addToCart(productId) {
    var product = products.find(function(p) { return p.id === productId; });
    if (!product || product.stock === 0) return;

    var existingItem = cart.find(function(item) { return item.id === productId; });

    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('Maximum stock reached!');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.actualMRP,
            image: product.image,
            quantity: 1,
            maxStock: product.stock
        });
    }

    saveCart();
    updateCartUI();
    openCart();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(function(item) { return item.id !== productId; });
    saveCart();
    updateCartUI();
}

// Update cart item quantity
function updateCartQuantity(productId, change) {
    var item = cart.find(function(item) { return item.id === productId; });
    if (!item) return;

    var newQty = item.quantity + change;

    if (newQty <= 0) {
        removeFromCart(productId);
    } else if (newQty <= item.maxStock) {
        item.quantity = newQty;
        saveCart();
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('bohoCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    var savedCart = localStorage.getItem('bohoCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Update cart UI
function updateCartUI() {
    var totalItems = cart.reduce(function(sum, item) { return sum + item.quantity; }, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(function(item) {
            return '<div class="cart-item">' +
this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzUiIGhlaWdodD0iNzUiIHZpZXdCb3g9IjAgMCA3NSA3NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc1IiBoZWlnaHQ9Ijc1IiBmaWxsPSIjNDE0MTQxIi8+Cjx0ZXh0IHg9IjM3LjUiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';this.style.objectFit='cover'
                '<div class="cart-item-details">' +
                '<h4 class="cart-item-title">' + item.name + '</h4>' +
                '<p class="cart-item-price">₹' + item.price + '</p>' +
                '<div class="cart-item-qty">' +
                '<button onclick="updateCartQuantity(\'' + item.id + '\', -1)"><i class="fas fa-minus"></i></button>' +
                '<span>' + item.quantity + '</span>' +
                '<button onclick="updateCartQuantity(\'' + item.id + '\', 1)"><i class="fas fa-plus"></i></button>' +
                '</div>' +
                '</div>' +
                '<button class="cart-item-remove" onclick="removeFromCart(\'' + item.id + '\')">' +
                '<i class="fas fa-trash"></i>' +
                '</button>' +
                '</div>';
        }).join('');
    }

    var total = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
    cartTotal.textContent = '₹' + total;
}

// Open cart sidebar
function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
}

// Close cart sidebar
function closeCartSidebar() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
}

// Setup event listeners
function setupEventListeners() {
    cartBtn.addEventListener('click', openCart);
    closeCart.addEventListener('click', closeCartSidebar);
    cartOverlay.addEventListener('click', closeCartSidebar);

    searchBtn.addEventListener('click', function() {
        searchBar.classList.add('active');
        searchInput.focus();
    });
    
    closeSearch.addEventListener('click', function() {
        searchBar.classList.remove('active');
        searchInput.value = '';
        renderProducts(products);
    });

    searchInput.addEventListener('input', function(e) {
        var searchTerm = e.target.value.toLowerCase();
        var filtered = products.filter(function(p) {
            return p.name.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm) ||
                (p.description && p.description.toLowerCase().includes(searchTerm));
        });
        renderProducts(filtered);
    });

    menuToggle.addEventListener('click', function() {
        document.querySelector('.nav-menu').classList.toggle('active');
        menuToggle.classList.toggle('active');
    });

    closeModal.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', function(e) {
        if (e.target === productModal) closeProductModal();
    });

    document.getElementById('decreaseQty').addEventListener('click', function() {
        var input = document.getElementById('productQty');
        if (input.value > 1) input.value--;
    });

    document.getElementById('increaseQty').addEventListener('click', function() {
        var input = document.getElementById('productQty');
        if (parseInt(input.value) < currentProduct.stock) input.value++;
    });

    document.getElementById('addToCartBtn').addEventListener('click', function() {
        if (!currentProduct) return;
        var qty = parseInt(document.getElementById('productQty').value);
        
        for (var i = 0; i < qty; i++) {
            addToCart(currentProduct.id);
        }
        
        closeProductModal();
    });

    var categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');

            var category = btn.dataset.category;
            if (category === 'all') {
                renderProducts(products);
            } else {
                var filtered = products.filter(function(p) { return p.category === category; });
                renderProducts(filtered);
            }
        });
    });

    var navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            var page = link.dataset.page;
            if (page) {
                e.preventDefault();
                var section = document.getElementById(page);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    document.getElementById('checkoutBtn').addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        var message = 'Hello! I would like to order:%0A%0A';
        cart.forEach(function(item) {
            message += '• ' + item.name + ' x' + item.quantity + ' - ₹' + (item.price * item.quantity) + '%0A';
        });
        message += '%0ATotal: ₹' + cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);

        var whatsappUrl = 'https://wa.me/919548190094?text=' + message;
        window.open(whatsappUrl, '_blank');
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
            closeCartSidebar();
        }
    });
}

// Make functions available globally
window.openProductModal = openProductModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;

// ============================================
// ADMIN LOGIN FUNCTIONALITY
// ============================================

// DOM Elements for Admin Login
var loginModal = document.getElementById('loginModal');
var adminBtn = document.getElementById('adminBtn');
var closeLoginModal = document.getElementById('closeLoginModal');
var loginForm = document.getElementById('loginForm');
var loginError = document.getElementById('loginError');
var loginUsername = document.getElementById('loginUsername');
var loginPassword = document.getElementById('loginPassword');

// Check if already logged in
function checkAdminLogin() {
    var adminToken = localStorage.getItem('adminToken');
    return adminToken !== null;
}

// Open login modal
function openLoginModal() {
    if (loginModal) {
        loginModal.classList.add('active');
        loginError.textContent = '';
        loginUsername.value = '';
        loginPassword.value = '';
        loginUsername.focus();
    }
}

// Close login modal
function closeLoginModalFunc() {
    if (loginModal) {
        loginModal.classList.remove('active');
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    var username = loginUsername.value.trim();
    var password = loginPassword.value;
    
    if (!username || !password) {
        loginError.textContent = 'Please enter both username and password';
        return;
    }
    
    // Disable button during request
    var submitBtn = loginForm.querySelector('.login-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        var response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        });
        
        var data = await response.json();
        
        if (response.ok && data.success) {
            // Store token
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminUsername', data.username);
            
            // Close modal and redirect to admin
            closeLoginModalFunc();
            window.location.href = 'admin.html';
        } else {
            loginError.textContent = data.error || 'Invalid credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Connection error. Please try again.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

// Setup admin login event listeners
function setupAdminLogin() {
    if (adminBtn) {
        adminBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if already logged in
            if (checkAdminLogin()) {
                window.location.href = 'admin.html';
            } else {
                openLoginModal();
            }
        });
    }
    
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', closeLoginModalFunc);
    }
    
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModalFunc();
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && loginModal && loginModal.classList.contains('active')) {
            closeLoginModalFunc();
        }
    });
}

// Initialize admin login
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAdminLogin);
} else {
    setupAdminLogin();
}

// Handle admin button click (for onclick attribute)
function handleAdminClick() {
    // Check if already logged in
    if (checkAdminLogin()) {
        window.location.href = 'admin.html';
    } else {
        openLoginModal();
    }
}

// Make handleAdminClick available globally
window.handleAdminClick = handleAdminClick;

