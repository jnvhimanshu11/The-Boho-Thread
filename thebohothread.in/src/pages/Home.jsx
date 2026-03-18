import { Link } from "react-router-dom";
import { CATEGORIES, formatPrice } from "../data/products";
import { useAdmin } from "../context/AdminContext";
import ProductCard from "../components/product/ProductCard";


const HERO_FEATURES = [
  { icon: "🚚", label: "Free Delivery", sub: "On orders over ₹999" },
  { icon: "🔒", label: "Secure Payment", sub: "256-bit SSL encryption" },
  { icon: "↩️", label: "Easy Returns",  sub: "7-day hassle-free" },
  { icon: "⭐", label: "Top Quality",   sub: "Curated products only" },
];

const CAT_ICONS = {
  Electronics:    { emoji: "⚡", bg: "bg-blue-50",   text: "text-blue-600" },
  Clothing:       { emoji: "👗", bg: "bg-pink-50",   text: "text-pink-600" },
  Books:          { emoji: "📚", bg: "bg-amber-50",  text: "text-amber-700" },
  "Home & Kitchen": { emoji: "🏠", bg: "bg-green-50",  text: "text-green-700" },
  Sports:         { emoji: "🏃", bg: "bg-purple-50", text: "text-purple-600" },
};



export default function Home() {
  const { products: PRODUCTS } = useAdmin();
  const featured = PRODUCTS.filter(p => p.badge).slice(0, 8);
  const newArrivals = PRODUCTS.filter(p => p.badge === "New" || p.badge === "Hot").slice(0, 4);


  return (
    <div className="animate-fadeIn">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f1c3f 0%, #162654 50%, #1e3a8a 100%)" }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}/>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-5"  style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}/>
        </div>
        <div className="page-container py-20 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-xs text-white/80 font-medium">New arrivals added daily</span>
            </div>
            <h1 className="font-sora text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
              Shop Smarter,<br/>
              <span className="text-indigo-400">Live Better.</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
              Discover thousands of curated products across electronics, fashion, books and more. Free delivery on orders over ₹999.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary px-8 py-3.5 text-sm">
                Shop Now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
              <Link to="/products?badge=Best+Seller" className="btn-secondary py-3.5 px-8 text-sm">
                View Best Sellers
              </Link>
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="page-container py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {HERO_FEATURES.map(f => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="text-white text-sm font-semibold">{f.label}</p>
                    <p className="text-white/50 text-xs">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="page-container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="text-sm text-indigo-500 font-semibold hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.filter(c => c !== "All").map(cat => {
            const icon = CAT_ICONS[cat];
            return (
              <Link key={cat} to={`/products?cat=${cat}`}
                className="card p-5 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl ${icon?.bg ?? "bg-gray-50"} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{icon?.emoji ?? "🛍️"}</span>
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">{cat}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {PRODUCTS.filter(p => p.category === cat).length} items
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="page-container py-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="text-sm text-gray-500 mt-1">Hand-picked deals just for you</p>
          </div>
          <Link to="/products" className="btn-secondary py-2 px-4 text-sm hidden sm:flex">View All Products</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-8 sm:hidden">
          <Link to="/products" className="btn-secondary">View All Products</Link>
        </div>
      </section>

      {/* ── Promo Banner ── */}
      <section className="page-container pb-16">
        <div className="rounded-2xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)" }}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full opacity-10 bg-white"/>
            <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full opacity-5  bg-white"/>
          </div>
          <div className="relative px-8 py-12 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <span className="badge bg-white/20 text-white mb-4 text-xs font-bold tracking-widest">LIMITED TIME</span>
              <h2 className="font-sora text-3xl md:text-4xl font-bold text-white mb-3">Get 20% Off<br/>Your First Order</h2>
              <p className="text-white/70 max-w-sm">Sign up today and use code <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">WELCOME20</span> at checkout.</p>
            </div>
            <Link to="/auth" className="btn-secondary shrink-0 py-3.5 px-8 font-bold">
              Claim Offer →
            </Link>
          </div>
        </div>
      </section>

      {/* ── New Arrivals strip ── */}
      <section className="page-container pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">New Arrivals</h2>
          <Link to="/products?badge=New" className="text-sm text-indigo-500 font-semibold hover:underline">See all →</Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {newArrivals.length > 0
            ? newArrivals.map(p => <ProductCard key={p.id} product={p}/>)
            : PRODUCTS.slice(0, 4).map(p => <ProductCard key={p.id} product={p}/>)
          }
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="bg-white border-y border-gray-100 py-12">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "50,000+", l: "Happy Customers" },
              { n: "10,000+", l: "Products Listed" },
              { n: "4.8★",   l: "Average Rating" },
              { n: "99%",    l: "Satisfaction Rate" },
            ].map(s => (
              <div key={s.l}>
                <p className="font-sora text-3xl font-bold text-indigo-600 mb-1">{s.n}</p>
                <p className="text-sm text-gray-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
