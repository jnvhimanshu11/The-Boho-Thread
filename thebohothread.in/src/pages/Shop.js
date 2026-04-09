// src/pages/Shop.js
import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import ProductCard from "../components/ProductCard";
import { FiSearch, FiFilter } from "react-icons/fi";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [sort, setSort] = useState("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "products"), (s) => setProducts(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, "categories"), (s) => setCategories(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); };
  }, []);

  let filtered = products
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase()))
    .filter((p) => selectedCat === "All" || p.category === selectedCat)
    .filter((p) => !minPrice || p.price >= parseFloat(minPrice))
    .filter((p) => !maxPrice || p.price <= parseFloat(maxPrice));

  if (sort === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === "rating") filtered = [...filtered].sort((a, b) => {
    const ra = a.approvedReviews?.length ? a.approvedReviews.reduce((s,r)=>s+r.rating,0)/a.approvedReviews.length : 0;
    const rb = b.approvedReviews?.length ? b.approvedReviews.reduce((s,r)=>s+r.rating,0)/b.approvedReviews.length : 0;
    return rb - ra;
  });
  else if (sort === "newest") filtered = [...filtered].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 0 80px" }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 900 }}>Shop</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6 }}>{filtered.length} products</p>
        </div>

        {/* Search and Sort bar */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="input" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
          </div>
          <select className="input" style={{ width: "auto", minWidth: 180 }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="newest">Newest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
          <button className="btn btn-outline" onClick={() => setShowFilters(!showFilters)} style={{ padding: "12px 18px" }}>
            <FiFilter /> Filters
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="glass" style={{ padding: "20px 24px", marginBottom: 24, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8rem", color: "var(--text-muted)" }}>Min Price (₹)</label>
              <input className="input" type="number" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: 120 }} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontSize: "0.8rem", color: "var(--text-muted)" }}>Max Price (₹)</label>
              <input className="input" type="number" placeholder="99999" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: 120 }} />
            </div>
            <button className="btn btn-outline" style={{ alignSelf: "flex-end", padding: "12px 18px" }} onClick={() => { setMinPrice(""); setMaxPrice(""); setSearch(""); setSelectedCat("All"); setSort("default"); }}>
              Reset
            </button>
          </div>
        )}

        {/* Category chips */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {["All", ...categories.map((c) => c.name)].map((cat) => (
            <button key={cat} onClick={() => setSelectedCat(cat)}
              style={{ padding: "8px 20px", borderRadius: 50, border: `1px solid ${selectedCat === cat ? "#7c3aed" : "rgba(255,255,255,0.1)"}`, background: selectedCat === cat ? "rgba(124,58,237,0.15)" : "transparent", color: selectedCat === cat ? "#a78bfa" : "var(--text-muted)", cursor: "pointer", fontWeight: 500, transition: "all 0.2s" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
