// badges-config.js - Centralized Badge Management for Admin Panel
// This file manages all available badges that can be assigned to products

// ============================================
// BADGES CONFIGURATION
// ============================================

const BADGES = [
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
    },
    {
        id: "badge_best_seller",
        name: "isBestSeller",
        label: "BEST SELLER",
        color: "#2ecc71",
        backgroundColor: "rgba(46, 204, 113, 0.2)",
        textColor: "#2ecc71",
        icon: "fas fa-fire",
        priority: 4
    },
    {
        id: "badge_limited",
        name: "isLimited",
        label: "LIMITED EDITION",
        color: "#e67e22",
        backgroundColor: "rgba(230, 126, 34, 0.2)",
        textColor: "#e67e22",
        icon: "fas fa-gem",
        priority: 5
    }
];

// ============================================
// BADGE MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get all available badges
 * @returns {Array} Array of badge objects
 */
function getBadges() {
    return [...BADGES];
}

/**
 * Get a badge by its identifier name
 * @param {string} name - The badge identifier name (e.g., 'isNew', 'isSale')
 * @returns {Object|null} Badge object or null if not found
 */
function getBadgeByName(name) {
    return BADGES.find(badge => badge.name === name) || null;
}

/**
 * Get a badge by its ID
 * @param {string} id - The badge ID (e.g., 'badge_new')
 * @returns {Object|null} Badge object or null if not found
 */
function getBadgeById(id) {
    return BADGES.find(badge => badge.id === id) || null;
}

/**
 * Add a new badge to the configuration
 * @param {Object} badge - Badge object to add
 * @returns {Object} The added badge
 */
function addBadge(badge) {
    // Check if badge with same name or id already exists
    if (BADGES.find(b => b.name === badge.name || b.id === badge.id)) {
        console.warn(`Badge with name "${badge.name}" or id "${badge.id}" already exists`);
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

/**
 * Update an existing badge
 * @param {string} id - The badge ID to update
 * @param {Object} updates - Object containing badge properties to update
 * @returns {Object|null} Updated badge object or null if not found
 */
function updateBadge(id, updates) {
    const index = BADGES.findIndex(badge => badge.id === id);
    
    if (index === -1) {
        console.warn(`Badge with id "${id}" not found`);
        return null;
    }

    BADGES[index] = { ...BADGES[index], ...updates };
    return BADGES[index];
}

/**
 * Delete a badge from the configuration
 * @param {string} id - The badge ID to delete
 * @returns {boolean} True if deleted, false if not found
 */
function deleteBadge(id) {
    const index = BADGES.findIndex(badge => badge.id === id);
    
    if (index === -1) {
        console.warn(`Badge with id "${id}" not found`);
        return false;
    }

    BADGES.splice(index, 1);
    return true;
}

/**
 * Get badges as HTML checkbox elements for admin form
 * @param {Object} product - Optional product object to check existing badges
 * @returns {string} HTML string of checkbox inputs
 */
function renderBadgeCheckboxes(product = null) {
    return BADGES.map(badge => {
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

/**
 * Get badge display HTML for product cards
 * @param {Object} product - Product object containing badge properties
 * @returns {string} HTML string of badge spans
 */
function renderProductBadges(product) {
    const activeBadges = BADGES.filter(badge => product[badge.name]).sort((a, b) => a.priority - b.priority);
    
    if (activeBadges.length === 0) return '';
    
    return activeBadges.map(badge => `
        <span style="
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: ${badge.backgroundColor};
            color: ${badge.textColor};
            margin-right: 5px;
        ">
            <i class="${badge.icon}" style="margin-right: 4px;"></i>${badge.label}
        </span>
    `).join('');
}

// ============================================
// EXPORT FOR MODULE USAGE
// ============================================

// If using ES modules, uncomment the following:
// export {
//     BADGES,
//     getBadges,
//     getBadgeByName,
//     getBadgeById,
//     addBadge,
//     updateBadge,
//     deleteBadge,
//     renderBadgeCheckboxes,
//     renderProductBadges
// };

// For global usage (script tags), functions are already available globally
// Make functions available globally for admin.js usage
window.getBadges = getBadges;
window.getBadgeByName = getBadgeByName;
window.getBadgeById = getBadgeById;
window.addBadge = addBadge;
window.updateBadge = updateBadge;
window.deleteBadge = deleteBadge;
window.renderBadgeCheckboxes = renderBadgeCheckboxes;
window.renderProductBadges = renderProductBadges;

