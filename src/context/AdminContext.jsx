import { createContext, useContext, useState, useEffect } from "react";
import { PRODUCTS as INITIAL_PRODUCTS } from "../data/products";
 
const ADMIN_EMAIL    = "admin@shopPro.com";
const ADMIN_PASSWORD = "Admin@1234";
 
const DEFAULT_CATEGORIES = ["Electronics", "Clothing", "Books", "Home & Kitchen", "Sports"];
const DEFAULT_BADGES     = ["New", "Hot", "Sale", "Best Seller", "Top Rated", "Popular", "Deal", "Classic"];
 
const AdminContext = createContext(null);
 
export function AdminProvider({ children }) {
  const [isAdmin,    setIsAdmin]    = useState(() => localStorage.getItem("adminAuth") === "true");
  const [loginError, setLoginError] = useState("");
 
  const [products, setProducts] = useState(
    () => JSON.parse(localStorage.getItem("adminProducts") || "null") || INITIAL_PRODUCTS
  );
  const [categories, setCategories] = useState(
    () => JSON.parse(localStorage.getItem("adminCategories") || "null") || DEFAULT_CATEGORIES
  );
  const [badges, setBadges] = useState(
    () => JSON.parse(localStorage.getItem("adminBadges") || "null") || DEFAULT_BADGES
  );
 
  useEffect(() => { localStorage.setItem("adminProducts",   JSON.stringify(products));   }, [products]);
  useEffect(() => { localStorage.setItem("adminCategories", JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem("adminBadges",     JSON.stringify(badges));     }, [badges]);
 
  const adminLogin = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("adminAuth", "true");
      setIsAdmin(true); setLoginError(""); return true;
    }
    setLoginError("Invalid admin credentials."); return false;
  };
  const adminLogout = () => { localStorage.removeItem("adminAuth"); setIsAdmin(false); };
 
  // Category CRUD
  const addCategory    = (name) => { if (name && !categories.includes(name)) setCategories(p => [...p, name]); };
  const deleteCategory = (name) => setCategories(p => p.filter(c => c !== name));
  const resetCategories = ()    => { setCategories(DEFAULT_CATEGORIES); localStorage.removeItem("adminCategories"); };
 
  // Badge CRUD
  const addBadge    = (name) => { if (name && !badges.includes(name)) setBadges(p => [...p, name]); };
  const deleteBadge = (name) => setBadges(p => p.filter(b => b !== name));
  const resetBadges = ()     => { setBadges(DEFAULT_BADGES); localStorage.removeItem("adminBadges"); };
 
  const parse = (d) => {
    const sizePricing = (d.sizePricing || []).map(s => ({
      size:          String(s.size || "").trim().toUpperCase(),
      price:         Number(s.price) || 0,
      originalPrice: Number(s.originalPrice) || Number(s.price) || 0,
    })).filter(s => s.size && s.price > 0);
 
    const basePrice    = sizePricing.length > 0 ? Math.min(...sizePricing.map(s => s.price)) : Number(d.price) || 0;
    const baseOriginal = sizePricing.length > 0 ? Math.max(...sizePricing.map(s => s.originalPrice)) : Number(d.originalPrice) || basePrice;
 
    return {
      ...d,
      price:         basePrice,
      originalPrice: baseOriginal,
      rating:        Number(d.rating)  || 0,
      reviews:       Number(d.reviews) || 0,
      stock:         Number(d.stock)   || 0,
      images:        (d.images || []).filter(Boolean),
      tags:          typeof d.tags === "string" ? d.tags.split(",").map(t => t.trim()).filter(Boolean) : (d.tags || []),
      sizePricing,
      badge:         d.badge || null,
    };
  };
 
  const addProduct    = (d)     => { const p = { ...parse(d), id: Date.now() }; setProducts(prev => [p, ...prev]); return p; };
  const updateProduct = (id, d) => setProducts(prev => prev.map(p => p.id === id ? { ...parse(d), id } : p));
  const deleteProduct = (id)    => setProducts(prev => prev.filter(p => p.id !== id));
  const resetProducts = ()      => { setProducts(INITIAL_PRODUCTS); localStorage.removeItem("adminProducts"); };
 
  return (
    <AdminContext.Provider value={{
      isAdmin, loginError, setLoginError, adminLogin, adminLogout,
      products, addProduct, updateProduct, deleteProduct, resetProducts,
      categories, addCategory, deleteCategory, resetCategories,
      badges, addBadge, deleteBadge, resetBadges,
    }}>
      {children}
    </AdminContext.Provider>
  );
}
 
export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be inside AdminProvider");
  return ctx;
};