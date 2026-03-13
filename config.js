// config.js - Complete configuration for The Boho Thread
module.exports = {
  // Server config
  SERVER: {
    PORT: process.env.PORT || 3000
  },

  // Admin credentials (change these!)
  ADMIN_USERS: [
    {
      username: '9548190094',
      password: '9548@sonI'
    }
  ],

  // Contact information
  CONTACT: {
    phone: '9548190094',
    email: 'jnvhimanshu11@gmail.com'
  },

  // URLs configuration
  URLs: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    whatsapp: 'https://wa.me/919548190094'
  },

  // Video URLs and thumbnails for invite pages
  VIDEO_URLS: [
    'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849872/dhruv.mp4',
    'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849871/kajal.mp4',
    'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849871/pushpa.mp4'
  ],

  THUMBNAIL_URLS: [
    'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849872/dhruv_tn.jpg',
    'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849871/kajal_tn.jpg',
    'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849871/pushpa_tn.jpg'
  ],

  // Invite data for /v/:id pages
  INVITE_DATA: [
    {
      id: 'himanshu',
      title: 'Himanshu\'s Special Invite 🎉',
      videoUrl: 'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849872/dhruv.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849872/dhruv_tn.jpg'
    },
    {
      id: 'kajal',
      title: 'Kajal\'s Exclusive Access ✨',
      videoUrl: 'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849871/kajal.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849871/kajal_tn.jpg'
    },
    {
      id: 'pushpa',
      title: 'Pushpa\'s Private Collection 🔥',
      videoUrl: 'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849871/pushpa.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849871/pushpa_tn.jpg'
    }
  ],

  // Admin credential checker
  checkAdminCredentials: function(username, password) {
    return this.ADMIN_USERS.some(user => 
      user.username === username && user.password === password
    );
  },

  // Product data storage (in-memory - persists across restarts)
  _products: [
    {
      id: 1,
      name: 'Boho Necklace',
      category: 'jewelry',
      actualMRP: 1299,
      priceAfterDiscount: 999,
      stock: 10,
      description: 'Handcrafted boho necklace with natural stones',
      image: './product-images/1773305762145-964409636.png',
      isNew: true
    },
    {
      id: 2,
      name: 'Maxi Dress',
      category: 'clothing',
      actualMRP: 2999,
      priceAfterDiscount: 2499,
      stock: 8,
      description: 'Flowy maxi dress perfect for summer vibes',
      image: './product-images/1773305762150-71463976.png',
      isSale: true
    },
    {
      id: 3,
      name: 'Wall Hanging',
      category: 'home',
      actualMRP: 1499,
      priceAfterDiscount: 1499,
      stock: 15,
      description: 'Macrame wall hanging for boho decor',
      image: './product-images/1773306014188-545467905.jpeg'
    }
  ],

  // Get all products
  getProducts: function() {
    return this._products;
  },

  // Get product by ID
  getProductById: function(id) {
    return this._products.find(p => p.id == id);
  },

  // Add new product
  addProduct: function(productData) {
    console.log('➕ Adding product:', productData);  // 🔍 DEBUG
    
    // Dynamic badges: filter/accept is* booleans only
    const cleanData = {};
    Object.keys(productData).forEach(key => {
      if (['name', 'category', 'actualMRP', 'priceAfterDiscount', 'stock', 'description', 'image'].includes(key)) {
        cleanData[key] = productData[key];
      } else if (key.startsWith('is') && typeof productData[key] === 'boolean') {
        cleanData[key] = productData[key];
      }
    });
    
    const newId = Math.max(...this._products.map(p => p.id), 0) + 1;
    const newProduct = { id: newId, ...cleanData };
    this._products.unshift(newProduct);
    console.log('✅ Added:', newProduct.id);
    return newProduct;
  },

  // Update product
  updateProduct: function(id, updates) {
    const productIndex = this._products.findIndex(p => p.id == id);
    if (productIndex === -1) return null;
    
    this._products[productIndex] = { ...this._products[productIndex], ...updates };
    return this._products[productIndex];
  },

  // Delete product
  deleteProduct: function(id) {
    const initialLength = this._products.length;
    this._products = this._products.filter(p => p.id != id);
    return this._products.length < initialLength;
  },

  // Categories
  _categories: ['jewelry', 'clothing', 'home', 'accessories'],

  getCategories: function() {
    return this._categories;
  },

  addCategory: function(name) {
    if (this._categories.includes(name.toLowerCase())) return null;
    this._categories.push(name.toLowerCase());
    return { name: name.toLowerCase() };
  },

  deleteCategory: function(name) {
    const index = this._categories.indexOf(name.toLowerCase());
    if (index > -1) {
      this._categories.splice(index, 1);
      return true;
    }
    return false;
  },

  // Badges configuration (3 badges only)
  BADGES: [
    {
      id: "badge_new",
      name: "isNew",
      label: "NEW",
      color: "#f1c40f",
      backgroundColor: "rgba(241, 196, 15, 0.2)",
      textColor: "#f1c40f",
      icon: "fas fa-star",
      priority: 1
    },
    {
      id: "badge_sale",
      name: "isSale",
      label: "SALE",
      color: "#e74c3c",
      backgroundColor: "rgba(231, 76, 60, 0.2)",
      textColor: "#e74c3c",
      icon: "fas fa-tag",
      priority: 2
    },
    {
      id: "badge_new_launch",
      name: "isNewLaunch",
      label: "NEW LAUNCH",
      color: "#9b59b6",
      backgroundColor: "rgba(155, 89, 182, 0.2)",
      textColor: "#9b59b6",
      icon: "fas fa-rocket",
      priority: 3
    }
  ],

  // Badge helper functions
  getBadges: function() {
    return [...this.BADGES];
  },

  getBadgeByName: function(name) {
    return this.BADGES.find(badge => badge.name === name) || null;
  },

  addBadge: function(badgeData) {
    if (this.BADGES.find(b => b.name === badgeData.name || b.id === badgeData.id)) {
      return null;
    }
    const newBadge = { ...badgeData, priority: this.BADGES.length + 1 };
    this.BADGES.push(newBadge);
    return newBadge;
  },

  updateBadge: function(id, updates) {
    const index = this.BADGES.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.BADGES[index] = { ...this.BADGES[index], ...updates };
    return this.BADGES[index];
  },

  deleteBadge: function(id) {
    const index = this.BADGES.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.BADGES.splice(index, 1);
    return true;
  }
};
