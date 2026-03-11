// config.js - Central configuration file
// This file loads environment variables and provides them to the application

require('dotenv').config();

// Video URLs
const VIDEO_URLS = {
    MAIN: process.env.MAIN_VIDEO_URL || '',
    GALLERY_1: process.env.GALLERY_VIDEO_1_URL || '',
    GALLERY_2: process.env.GALLERY_VIDEO_2_URL || ''
};

// Thumbnail URLs
const THUMBNAIL_URLS = {
    GALLERY_1: process.env.GALLERY_THUMBNAIL_1 || ''
};

// Contact Information
const CONTACT = {
    WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER || '919548190094',
    WHATSAPP_MESSAGE: 'Hi%2C%20I%27m%20interested%20in%20your%20wedding%20video%20invitation%20services.',
    EMAIL: 'jnvhimanshu11@gmail.com',
    PHONE: '+919548190094'
};

// URLs
const URLs = {
    WEBSITE: process.env.WEBSITE_URL || 'https://thebohothread.in',
    MAIN_PAGE: process.env.MAIN_PAGE_URL || '/WebPage/web.html',
    WHATSAPP_API: `https://wa.me/${CONTACT.WHATSAPP_NUMBER}?text=${CONTACT.WHATSAPP_MESSAGE}`
};

// Server Configuration
const SERVER = {
    PORT: process.env.PORT || 3000
};

// Admin Credentials
const ADMIN = {
    username: process.env.ADMIN_USERNAME || '9548190094',
    password: process.env.ADMIN_PASSWORD || '9548@sonI'
};

// Invite Data - Using environment variables
const INVITE_DATA = [
    { 
        id: "invitefamily.tech", 
        videoUrl: VIDEO_URLS.MAIN,
        title: "Let's Invite Family" 
    },
    { 
        id: "himanshu", 
        videoUrl: VIDEO_URLS.GALLERY_1,
        title: "Chopta Tour Vedio" 
    },
    { 
        id: "prachi", 
        videoUrl: VIDEO_URLS.GALLERY_2,
        title: "Prachi & Gaurav" 
    }
];

// ============================================
// CATEGORIES MANAGEMENT
// ============================================

let CATEGORIES = [
    { id: "cat_1", name: "jewelry", createdAt: new Date().toISOString() },
    { id: "cat_2", name: "clothing", createdAt: new Date().toISOString() },
    { id: "cat_3", name: "home", createdAt: new Date().toISOString() },
    { id: "cat_4", name: "accessories", createdAt: new Date().toISOString() }
];

function getCategories() {
    return CATEGORIES;
}

function addCategory(categoryName) {
    // Check if category already exists
    if (CATEGORIES.find(c => c.name.toLowerCase() === categoryName.toLowerCase())) {
        return null;
    }
    const newCategory = {
        id: "cat_" + Date.now(),
        name: categoryName.toLowerCase().trim(),
        createdAt: new Date().toISOString()
    };
    CATEGORIES.push(newCategory);
    return newCategory;
}

function deleteCategory(categoryName) {
    const index = CATEGORIES.findIndex(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (index !== -1) {
        CATEGORIES.splice(index, 1);
        return true;
    }
    return false;
}

// ============================================
// BADGES MANAGEMENT
// ============================================

let BADGES = [
    { id: "badge_new", name: "isNew", label: "NEW", color: "#f1c40f", backgroundColor: "rgba(241, 196, 15, 0.2)", textColor: "#f1c40f", icon: "fas fa-star", priority: 1 },
    { id: "badge_sale", name: "isSale", label: "SALE", color: "#e74c3c", backgroundColor: "rgba(231, 76, 60, 0.2)", textColor: "#e74c3c", icon: "fas fa-tag", priority: 2 },
    { id: "badge_new_launch", name: "isNewLaunch", label: "NEW LAUNCH", color: "#9b59b6", backgroundColor: "rgba(155, 89, 182, 0.2)", textColor: "#9b59b6", icon: "fas fa-rocket", priority: 3 },
    { id: "badge_best_seller", name: "isBestSeller", label: "BEST SELLER", color: "#2ecc71", backgroundColor: "rgba(46, 204, 113, 0.2)", textColor: "#2ecc71", icon: "fas fa-fire", priority: 4 },
    { id: "badge_limited", name: "isLimited", label: "LIMITED EDITION", color: "#e67e22", backgroundColor: "rgba(230, 126, 34, 0.2)", textColor: "#e67e22", icon: "fas fa-gem", priority: 5 }
];

function getBadges() {
    return BADGES;
}

function addBadge(badge) {
    // Check if badge with same name or id already exists
    if (BADGES.find(b => b.name === badge.name || b.id === badge.id)) {
        return null;
    }
    const newBadge = {
        id: badge.id || "badge_" + Date.now(),
        name: badge.name,
        label: badge.label,
        color: badge.color || "#888",
        backgroundColor: badge.backgroundColor || "rgba(136, 136, 136, 0.2)",
        textColor: badge.textColor || "#888",
        icon: badge.icon || "fas fa-tag",
        priority: badge.priority || (BADGES.length + 1)
    };
    BADGES.push(newBadge);
    return newBadge;
}

function updateBadge(id, updates) {
    const index = BADGES.findIndex(badge => badge.id === id);
    if (index !== -1) {
        BADGES[index] = { ...BADGES[index], ...updates };
        return BADGES[index];
    }
    return null;
}

function deleteBadge(id) {
    const index = BADGES.findIndex(badge => badge.id === id);
    if (index !== -1) {
        BADGES.splice(index, 1);
        return true;
    }
    return false;
}
let PRODUCTS = [
    {
        id: "prod_1",
        name: "Boho Beaded Necklace",
        category: "jewelry",
        actualMRP: 599,
        priceAfterDiscount: 899,
        stock: 15,
        description: "Beautiful handcrafted boho-style beaded necklace with natural stones. Perfect for casual and festival wear.",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
        isNew: true,
        isSale: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "prod_2",
        name: "Macrame Wall Hanging",
        category: "home",
        actualMRP: 1299,
        priceAfterDiscount: null,
        stock: 8,
        description: "Intricate macrame wall hanging made with love. Adds a bohemian touch to any room.",
        image: "https://images.unsplash.com/photo-1622227056993-6e7f88420855?w=400",
        isNew: true,
        isSale: false,
        createdAt: new Date().toISOString()
    },
    {
        id: "prod_3",
        name: "Handwoven Tote Bag",
        category: "accessories",
        actualMRP: 799,
        priceAfterDiscount: 999,
        stock: 20,
        description: "Spacious handwoven tote bag perfect for beach trips, shopping, or daily use.",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400",
        isNew: false,
        isSale: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "prod_4",
        name: "Silver Moon Earrings",
        category: "jewelry",
        actualMRP: 449,
        priceAfterDiscount: null,
        stock: 3,
        description: "Elegant silver moon phase earrings. Lightweight and perfect for everyday wear.",
        image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400",
        isNew: false,
        isSale: false,
        createdAt: new Date().toISOString()
    },
    {
        id: "prod_5",
        name: "Boho Maxi Dress",
        category: "clothing",
        actualMRP: 1899,
        priceAfterDiscount: 2499,
        stock: 12,
        description: "Flowy bohemian maxi dress with floral print. Perfect for summer occasions.",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
        isNew: true,
        isSale: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "prod_6",
        name: "Feather Dreamcatcher",
        category: "home",
        actualMRP: 549,
        priceAfterDiscount: null,
        stock: 25,
        description: "Traditional dreamcatcher with colorful feathers. Beautiful wall decor piece.",
        image: "https://images.unsplash.com/photo-1527515673510-813d3bb00b5f?w=400",
        isNew: false,
        isSale: false,
        createdAt: new Date().toISOString()
    }
];

// Functions to manage products
function getProducts() {
    return PRODUCTS;
}

function getProductById(id) {
    return PRODUCTS.find(p => p.id === id);
}

function addProduct(product) {
    const newProduct = {
        ...product,
        id: "prod_" + Date.now(),
        createdAt: new Date().toISOString()
    };
    PRODUCTS.push(newProduct);
    return newProduct;
}

function updateProduct(id, updates) {
    const index = PRODUCTS.findIndex(p => p.id === id);
    if (index !== -1) {
        PRODUCTS[index] = { ...PRODUCTS[index], ...updates };
        return PRODUCTS[index];
    }
    return null;
}

function deleteProduct(id) {
    const index = PRODUCTS.findIndex(p => p.id === id);
    if (index !== -1) {
        PRODUCTS.splice(index, 1);
        return true;
    }
    return false;
}

// Export all configurations
module.exports = {
    VIDEO_URLS,
    THUMBNAIL_URLS,
    CONTACT,
    URLs,
    SERVER,
    ADMIN,
    INVITE_DATA,
    PRODUCTS,
    CATEGORIES,
    BADGES,
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    addCategory,
    deleteCategory,
    getBadges,
    addBadge,
    updateBadge,
    deleteBadge
};
