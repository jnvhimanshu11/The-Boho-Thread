import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import ProductCard from "../components/product/ProductCard";

const SORT_OPTIONS = [
  { label: "Featured",       value: "featured" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Best Rated",     value: "rating" },
  { label: "Most Reviews",   value: "reviews" },
];

export default function Products() {
  const { products: PRODUCTS, categories } = useAdmin();
  const CATEGORIES = ["All", ...categories];
  const [params, setParams] = useSearchParams();
  const [sort,   setSort]   = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 15000]);

  const activeCategory = params.get("cat") || "All";
  const searchQuery    = params.get("q")   || "";

  const setCategory = (cat) => {
    const p = new URLSearchParams(params);
    if (cat === "All") p.delete("cat"); else p.set("cat", cat);
    setParams(p);
  };

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];
    if (activeCategory !== "All") result = result.filter(p => p.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.tags?.some(t => t.includes(q)));
    }
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    switch (sort) {
      case "price_asc":  return result.sort((a,b) => a.price - b.price);
      case "price_desc": return result.sort((a,b) => b.price - a.price);
      case "rating":     return result.sort((a,b) => b.rating - a.rating);
      case "reviews":    return result.sort((a,b) => b.reviews - a.reviews);
      default:           return result;
    }
  }, [activeCategory, searchQuery, sort, priceRange]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [activeCategory]);

  return (
    <div className="page-container py-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sora text-3xl font-bold text-gray-900 tracking-tight">
          {searchQuery ? `Results for "${searchQuery}"` : activeCategory === "All" ? "All Products" : activeCategory}
        </h1>
        <p className="text-gray-500 mt-1">{filtered.length} products found</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Categories</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 flex items-center justify-between ${
                    activeCategory === cat ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  <span>{cat}</span>
                  <span className={`text-xs ${activeCategory === cat ? "text-indigo-400" : "text-gray-400"}`}>
                    {cat === "All" ? PRODUCTS.length : PRODUCTS.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide">Price Range</h3>
              <div className="space-y-3">
                {[[0,1000],[1000,3000],[3000,7000],[7000,15000]].map(([min,max]) => (
                  <label key={`${min}-${max}`} className="flex items-center gap-3 cursor-pointer group">
                    <input type="radio" name="price" className="accent-indigo-500"
                      checked={priceRange[0] === min && priceRange[1] === max}
                      onChange={() => setPriceRange([min,max])}/>
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">
                      {min === 0 ? "Under" : "₹" + min.toLocaleString()} {max < 15000 ? "– ₹" + max.toLocaleString() : "+"}
                    </span>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="radio" name="price" className="accent-indigo-500"
                    checked={priceRange[0] === 0 && priceRange[1] === 15000}
                    onChange={() => setPriceRange([0,15000])}/>
                  <span className="text-sm text-gray-600">Any price</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Mobile categories */}
            <div className="flex gap-2 lg:hidden overflow-x-auto pb-1 flex-nowrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    activeCategory === cat
                      ? "bg-indigo-500 text-white border-indigo-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-500 hidden sm:block">{filtered.length} results</span>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none bg-white text-gray-700 cursor-pointer focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-sora text-xl font-bold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search term</p>
              <button onClick={() => { setCategory("All"); setParams({}); setPriceRange([0,15000]); }}
                className="btn-primary py-2.5 px-6 text-sm">Clear all filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {filtered.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}