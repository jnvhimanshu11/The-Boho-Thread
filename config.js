const fs = require('fs');
const path = require('path');

module.exports = {
  SERVER: {
    PORT: process.env.PORT || 3000
  },

  ADMIN_USERS: [
    {
      username: '9548190094',
      password: '9548@sonI'
    }
  ],

  CONTACT: {
    phone: '9548190094',
    email: 'jnvhimanshu11@gmail.com'
  },

  URLs: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    whatsapp: 'https://wa.me/919548190094'
  },

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

  INVITE_DATA: [
    {
      id: 'himanshu',
      title: "Himanshu Special Invite",
      videoUrl: 'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849872/dhruv.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849872/dhruv_tn.jpg'
    },
    {
      id: 'kajal',
      title: "Kajal Exclusive Access",
      videoUrl: 'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849871/kajal.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849871/kajal_tn.jpg'
    },
    {
      id: 'pushpa',
      title: "Pushpa Private Collection",
      videoUrl: 'https://res.cloudinary.com/dq9wty6km/video/upload/v1727849871/pushpa.mp4',
      thumbnailUrl: 'https://res.cloudinary.com/dq9wty6km/image/upload/v1727849871/pushpa_tn.jpg'
    }
  ],

  checkAdminCredentials: function(username, password) {
    return this.ADMIN_USERS.some(function(user) {
      return user.username === username && user.password === password;
    });
  },

  _products: [],

  loadProductsFromFile: function() {
    try {
      const filePath = path.join(__dirname, 'products.json');
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const loaded = JSON.parse(data);
        this._products = loaded.map(function(p) {
          return { ...p, id: Number(p.id) };
        });
        if (this._products.length === 0) {
          console.log('Empty file, populating defaults');
          this._products = [
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
          ];
          this.saveProductsToFile();
        } else {
          console.log('Loaded ' + this._products.length + ' products from products.json');
        }
        return true;
      }
    } catch (error) {
      console.error('Failed to load products.json:', error.message);
    }
    console.log('No products.json found, using defaults');
    return false;
  },

  saveProductsToFile: function() {
    try {
      const filePath = path.join(__dirname, 'products.json');
      fs.writeFileSync(filePath, JSON.stringify(this._products, null, 2), 'utf8');
      console.log('Saved ' + this._products.length + ' products to products.json');
    } catch (error) {
      console.error('Failed to save products.json:', error.message);
    }
  },

  getProducts: function() {
    return this._products;
  },
  
  getProductById: function(id) {
    return this._products.find(function(p) {
      return p.id == id;
    });
  },

  addProduct: function(productData) {
    console.log('Adding product:', productData);
    
    const cleanData = {};
    Object.keys(productData).forEach(function(key) {
      if (['name', 'category', 'actualMRP', 'priceAfterDiscount', 'stock', 'description', 'image'].includes(key)) {
        cleanData[key] = productData[key];
      } else if (key.startsWith('is') && typeof productData[key] === 'boolean') {
        cleanData[key] = productData[key];
      }
    });
    
    const newId = Math.max.apply(Math, this._products.map(function(p) {
      return p.id;
    }), 0) + 1;
    const newProduct = { id: newId, ...cleanData };
    this._products.unshift(newProduct);
    console.log('Added:', newProduct.id);
    
    this.saveProductsToFile();
    return newProduct;
  },

  updateProduct: function(id, updates) {
    const productIndex = this._products.findIndex(function(p) {
      return p.id == id;
    });
    if (productIndex === -1) return null;
    
    this._products[productIndex] = Object.assign({}, this._products[productIndex], updates);
    this.saveProductsToFile();
    
    return this._products[productIndex];
  },

  deleteProduct: function(id) {
    const initialLength = this._products.length;
    this._products = this._products.filter(function(p) {
      return p.id != id;
    });
    this.saveProductsToFile();
    return this._products.length < initialLength;
  },

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

  BADGES: [
    {
      id: 'badge_new',
      name: 'isNew',
      label: 'NEW',
      color: '#f1c40f',
      backgroundColor: 'rgba(241, 196, 15, 0.2)',
      textColor: '#f1c40f',
      icon: 'fas fa-star',
      priority: 1
    },
    {
      id: 'badge_sale',
      name: 'isSale',
      label: 'SALE',
      color: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.2)',
      textColor: '#e74c3c',
      icon: 'fas fa-tag',
      priority: 2
    },
    {
      id: 'badge_new_launch',
      name: 'isNewLaunch',
      label: 'NEW LAUNCH',
      color: '#9b59b6',
      backgroundColor: 'rgba(155, 89, 182, 0.2)',
      textColor: '#9b59b6',
      icon: 'fas fa-rocket',
      priority: 3
    }
  ],

  getBadges: function() {
    return this.BADGES.slice();
  },

  getBadgeByName: function(name) {
    for (let i = 0; i < this.BADGES.length; i++) {
      if (this.BADGES[i].name === name) {
        return this.BADGES[i];
      }
    }
    return null;
  },

  addBadge: function(badgeData) {
    for (let i = 0; i < this.BADGES.length; i++) {
      if (this.BADGES[i].name === badgeData.name || this.BADGES[i].id === badgeData.id) {
        return null;
      }
    }
    const newBadge = Object.assign({}, badgeData, { priority: this.BADGES.length + 1 });
    this.BADGES.push(newBadge);
    return newBadge;
  },

  updateBadge: function(id, updates) {
    for (let i = 0; i < this.BADGES.length; i++) {
      if (this.BADGES[i].id === id) {
        this.BADGES[i] = Object.assign({}, this.BADGES[i], updates);
        return this.BADGES[i];
      }
    }
    return null;
  },

  deleteBadge: function(id) {
    for (let i = 0; i < this.BADGES.length; i++) {
      if (this.BADGES[i].id === id) {
        this.BADGES.splice(i, 1);
        return true;
      }
    }
    return false;
  }
};
