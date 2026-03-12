// ============================================
// THE BOHO THREAD - ADMIN PANEL
// ============================================

// Global state
let products = [];
let categories = [];
let editingProductId = null;
let badges = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', async function() {
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
        // Not logged in, redirect to home
        alert('Please login to access the admin panel');
        window.location.href = 'index.html';
        return;
    }
    
    // Verify token with server
    try {
        const response = await fetch('/api/admin/verify', {
            headers: {
                'Authorization': 'Bearer ' + adminToken
            }
        });
        
        if (!response.ok) {
            // Token invalid, redirect to home
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUsername');
            alert('Session expired. Please login again.');
            window.location.href = 'index.html';
            return;
        }
    } catch (error) {
        console.error('Auth verification error:', error);
        // Allow access if server is unreachable (for offline development)
    }
    
    // Token valid, load admin panel
    loadBadges(); // Load badges from badges-config.js
    loadCategories();
    loadProducts();
    setupEventListeners();
});

// Logout function
function logoutAdmin() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    window.location.href = 'index.html';
}


// Session timeout - logout after 10 minutes of inactivity
var sessionTimeout = 10 * 60 * 1000; // 10 minutes
var sessionTimer;

function resetSessionTimer() {
    clearTimeout(sessionTimer);
    if (localStorage.getItem('adminToken')) {
        sessionTimer = setTimeout(function() {
            logoutAdmin();
            alert('Session expired. Please login again.');
        }, sessionTimeout);
    }
}

// Reset timer on user activity
document.addEventListener('click', resetSessionTimer);
document.addEventListener('keypress', resetSessionTimer);
document.addEventListener('scroll', resetSessionTimer);
document.addEventListener('mousemove', resetSessionTimer);

// Start timer
resetSessionTimer();
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const closeModal = document.getElementById('closeModal');
const productForm = document.getElementById('productForm');
const productsTableBody = document.getElementById('productsTableBody');
const cancelBtn = document.getElementById('cancelBtn');
const productImageInput = document.getElementById('productImage');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
const categoryModal = document.getElementById('categoryModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
const newCategoryName = document.getElementById('newCategoryName');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesList = document.getElementById('categoriesList');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBadges(); // Load badges from badges-config.js
    loadCategories();
    loadProducts();
    setupEventListeners();
});

// Load badges from badges-config.js
function loadBadges() {
    // Get badges from the global badges-config.js
    if (typeof getBadges === 'function') {
        badges = getBadges();
    }
    renderBadgeCheckboxes();
    console.log('Badges loaded:', badges);
}

// Render badge checkboxes in the product form
function renderBadgeCheckboxes(product = null) {
    const badgeCheckboxesContainer = document.getElementById('badgeCheckboxes');
    if (!badgeCheckboxesContainer) return;
    
    if (badges.length === 0) {
        badgeCheckboxesContainer.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No badges configured. Add badges in badges-config.js</p>';
        return;
    }
    
    badgeCheckboxesContainer.innerHTML = badges.map(badge => {
        const isChecked = product && product[badge.name] ? 'checked' : '';
        return `
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin: 0;">
                <input type="checkbox" 
                       id="product_${badge.name}" 
                       name="${badge.name}" 
                       style="width: 20px; height: 20px; accent-color: ${badge.color};"
                       ${isChecked}>
                <span style="color: ${badge.textColor}; font-weight: 500;">${badge.label}</span>
            </label>
        `;
    }).join('');
}

// Get badge values from form
function getBadgeValues() {
    const badgeValues = {};
    badges.forEach(badge => {
        const checkbox = document.getElementById(`product_${badge.name}`);
        if (checkbox) {
            badgeValues[badge.name] = checkbox.checked;
        }
    });
    return badgeValues;
}

// Fetch categories from server
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        categories = await response.json();
        renderCategoryDropdown();
        renderCategoriesList();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render category dropdown in product form
function renderCategoryDropdown() {
    const productCategory = document.getElementById('productCategory');
    if (!productCategory) return;
    
    // Keep the first option
    let optionsHtml = '<option value="">Select category</option>';
    
    categories.forEach(category => {
        const displayName = category.name.charAt(0).toUpperCase() + category.name.slice(1);
        optionsHtml += `<option value="${category.name}">${displayName}</option>`;
    });
    
    productCategory.innerHTML = optionsHtml;
}

// Render categories list in category management modal
function renderCategoriesList() {
    if (!categoriesList) return;
    
    if (categories.length === 0) {
        categoriesList.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No categories yet. Add one above!</p>';
        return;
    }
    
    categoriesList.innerHTML = categories.map(category => {
        const displayName = category.name.charAt(0).toUpperCase() + category.name.slice(1);
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 10px 15px; border-radius: 8px; min-width: 150px;">
                <span>${displayName}</span>
                <button class="action-btn delete-btn" onclick="deleteCategory('${category.name}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
}

// Open category management modal
function openCategoryModal() {
    categoryModal.classList.add('active');
    loadCategories();
}

// Close category management modal
function closeCategoryModalFunc() {
    categoryModal.classList.remove('active');
}

// Add new category
async function addNewCategory() {
    const categoryName = newCategoryName.value.trim();
    
    if (!categoryName) {
        alert('Please enter a category name');
        return;
    }
    
    try {
        console.log('Sending category request:', { name: categoryName });
        
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: categoryName })
        });
        
        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', data);
        
        if (response.ok) {
            categories.push(data);
            renderCategoryDropdown();
            renderCategoriesList();
            newCategoryName.value = '';
            alert('Category added successfully!');
            
            // Notify store.js about category update
            localStorage.setItem('categoriesUpdated', Date.now());
        } else {
            alert(data.error || 'Failed to add category');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Error adding category: ' + error.message);
    }
}

// Delete category
async function deleteCategory(categoryName) {
    if (!confirm(`Are you sure you want to delete the "${categoryName}" category?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/categories/' + categoryName, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            categories = categories.filter(c => c.name !== categoryName);
            renderCategoryDropdown();
            renderCategoriesList();
            alert('Category deleted successfully!');
            
            // Notify store.js about category update
            localStorage.setItem('categoriesUpdated', Date.now());
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category');
    }
}

// Fetch products from server
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProductsTable();
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render products table
function renderProductsTable() {
    if (products.length === 0) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <p>No products yet. Click "Add Product" to get started!</p>
                </td>
            </tr>
        `;
        return;
    }

    productsTableBody.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-thumb" onerror="this.src='https://via.placeholder.com/60?text=No+Image'">
            </td>
            <td>${product.name}</td>
            <td>${capitalizeFirst(product.category)}</td>
            <td>₹${product.actualMRP}</td>
            <td>${product.stock}</td>
            <td>
                <span class="stock-badge ${getStockClass(product.stock)}">
                    ${getStockStatus(product.stock)}
                </span>
            </td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" onclick="editProduct('${product.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteProduct('${product.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get stock class
function getStockClass(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 5) return 'low-stock';
    return 'in-stock';
}

// Get stock status text
function getStockStatus(stock) {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    return 'In Stock';
}

// Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Update stats
function updateStats() {
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('inStockProducts').textContent = products.filter(p => p.stock > 5).length;
    document.getElementById('lowStockProducts').textContent = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    document.getElementById('totalOrders').textContent = '0';
}

// Open add product modal
function openAddModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    productForm.reset();
    imagePreview.classList.remove('active');
    previewImg.src = '';
    productModal.classList.add('active');
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    editingProductId = productId;
    document.getElementById('modalTitle').textContent = 'Edit Product';
    
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productPrice').value = product.actualMRP;
    document.getElementById('productOriginalPrice').value = product.priceAfterDiscount || '';
    document.getElementById('productStock').value = product.stock;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image;
    
    // Load badge checkboxes dynamically
    renderBadgeCheckboxes(product);
    
    previewImg.src = product.image;
    imagePreview.classList.add('active');
    
    productModal.classList.add('active');
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch('/api/products/' + productId, {
            method: 'DELETE'
        });

        if (response.ok) {
            products = products.filter(p => p.id !== productId);
            renderProductsTable();
            updateStats();
            alert('Product deleted successfully!');
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

// Save product (add or update)
async function saveProduct(productData) {
    try {
        let url = '/api/products';
        let method = 'POST';
        
        if (editingProductId) {
            url = '/api/products/' + editingProductId;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (response.ok) {
            const savedProduct = await response.json();
            
            if (editingProductId) {
                const index = products.findIndex(p => p.id === editingProductId);
                if (index !== -1) {
                    products[index] = savedProduct;
                }
            } else {
                products.push(savedProduct);
            }
            
            renderProductsTable();
            updateStats();
            closeProductModal();
            alert(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
        } else {
            alert('Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product');
    }
}

// Close modal
function closeProductModal() {
    productModal.classList.remove('active');
    editingProductId = null;
    productForm.reset();
    imagePreview.classList.remove('active');
}

// Setup event listeners
function setupEventListeners() {
    // Product management
    addProductBtn.addEventListener('click', openAddModal);
    
    closeModal.addEventListener('click', closeProductModal);
    cancelBtn.addEventListener('click', closeProductModal);
    
    productModal.addEventListener('click', function(e) {
        if (e.target === productModal) closeProductModal();
    });
    
    productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        var imageUrl = document.getElementById('productImage').value;
        var imageFile = document.getElementById('productImageFile').files[0];
        
        // If file is selected, upload it first
        if (imageFile) {
            try {
                var formData = new FormData();
                formData.append('image', imageFile);
                
                var uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadResponse.ok) {
                    var uploadError = await uploadResponse.json();
                    alert('Error uploading image: ' + uploadError.error);
                    return;
                }
                
                var uploadData = await uploadResponse.json();
                imageUrl = uploadData.imageUrl;
            } catch (uploadErr) {
                console.error('Upload error:', uploadErr);
                alert('Error uploading image. Please try again or use a URL.');
                return;
            }
        }
        
        // Get badge values dynamically from the form
        var badgeValues = getBadgeValues();
        
        var productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            actualMRP: parseFloat(document.getElementById('productPrice').value),
            priceAfterDiscount: document.getElementById('productOriginalPrice').value ? parseFloat(document.getElementById('productOriginalPrice').value) : null,
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value,
            image: imageUrl || 'https://via.placeholder.com/300x250?text=Product+Image',
            ...badgeValues
        };
        
        saveProduct(productData);
    });
    
    productImageInput.addEventListener('input', function(e) {
        var imageUrl = e.target.value;
        if (imageUrl) {
            previewImg.src = imageUrl;
            imagePreview.classList.add('active');
        } else {
            imagePreview.classList.remove('active');
        }
    });
    
    // Category management
    if (manageCategoriesBtn) {
        manageCategoriesBtn.addEventListener('click', openCategoryModal);
    }
    
    if (closeCategoryModal) {
        closeCategoryModal.addEventListener('click', closeCategoryModalFunc);
    }
    
    if (categoryModal) {
        categoryModal.addEventListener('click', function(e) {
            if (e.target === categoryModal) closeCategoryModalFunc();
        });
    }
    
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addNewCategory);
    }
    
    // Allow Enter key to add category
    if (newCategoryName) {
        newCategoryName.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addNewCategory();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
            closeCategoryModalFunc();
        }
    });
}

// Make functions available globally
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.deleteCategory = deleteCategory;
window.logoutAdmin = logoutAdmin;

