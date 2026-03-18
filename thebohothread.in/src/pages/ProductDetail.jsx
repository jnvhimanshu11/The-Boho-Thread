import { useWishlist } from "../context/WishlistContext";
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatPrice, discount } from "../data/products";
import { useCart } from "../context/CartContext";
import { useAdmin } from "../context/AdminContext";
import StarRating from "../components/ui/StarRating";
import ProductCard from "../components/product/ProductCard";

export default function ProductDetail() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { products } = useAdmin();
  const product   = products.find(p => p.id === Number(id));
  const related   = product
    ? products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  const { addToCart, openCart } = useCart();

  const hasSizes    = product?.sizePricing?.length > 0;
  const [activeImg, setActiveImg]   = useState(0);
  const [qty,       setQty]         = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    hasSizes ? product.sizePricing[0].size : "default"
  );
  const [tab,    setTab]   = useState("description");
  const [added,  setAdded] = useState(false);
  const { toggleWishlist, isWished } = useWishlist();
  const wished = isWished(product?.id);

  if (!product) {
    return (
      <div className="page-container py-32 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="font-sora text-2xl font-bold text-gray-700 mb-3">Product not found</h2>
        <p className="text-gray-400 mb-8">This product may have been removed or doesn't exist.</p>
        <button onClick={() => navigate("/products")} className="btn-primary">Back to Products</button>
      </div>
    );
  }

  // Active pricing based on selected size
  const activePricing = hasSizes
    ? product.sizePricing.find(s => s.size === selectedSize) || product.sizePricing[0]
    : null;

  const displayPrice    = activePricing ? activePricing.price         : product.price;
  const displayOriginal = activePricing ? activePricing.originalPrice : product.originalPrice;
  const disc = displayOriginal > displayPrice ? discount(displayPrice, displayOriginal) : 0;

  const handleAddToCart = () => {
    addToCart({
      id:    product.id,
      name:  product.name,
      price: displayPrice,
      image: product.images[0],
      size:  selectedSize,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  const MOCK_REVIEWS = [
    { name: "Priya M.",  rating: 5, date: "2 weeks ago",  text: "Absolutely love this product! Quality exceeded my expectations. Will definitely buy again." },
    { name: "Rahul K.",  rating: 4, date: "1 month ago",  text: "Great value for money. Delivery was fast and packaging was excellent." },
    { name: "Sneha A.",  rating: 5, date: "3 weeks ago",  text: "Exactly as described. Highly recommend to anyone looking for quality products." },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Breadcrumb */}
      <div className="page-container py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gray-600 transition-colors">Products</Link>
          <span>/</span>
          <Link to={`/products?cat=${product.category}`} className="hover:text-gray-600 transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1 max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <div className="page-container pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
{/* Images */}
<div>
  {/* Main image with arrows */}
  <div className="card overflow-hidden aspect-square bg-gray-50 mb-3 relative group">
    <img
      src={product.images[activeImg]}
      alt={product.name}
      className="w-full h-full object-cover transition-opacity duration-300"
      onError={e => { e.target.src = ""; }}
    />

    {/* Wishlist button */}
    <button onClick={() => toggleWishlist(product)}
      className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-200 ${
        wished ? "text-red-500 shadow-red-100" : "text-gray-400 hover:text-red-500"
      }`}>
      <svg className="w-5 h-5" fill={wished ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"
        style={{ color: wished ? "#ef4444" : undefined }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
      </svg>
    </button>

    {/* Discount badge */}
    {disc > 0 && (
      <div className="absolute top-4 left-4">
        <span className="badge-red font-bold">{disc}% OFF</span>
      </div>
    )}

    {/* Prev arrow — only if more than 1 image */}
    {product.images.filter(Boolean).length > 1 && (
      <>
        <button
          onClick={() => setActiveImg(i => i === 0 ? product.images.filter(Boolean).length - 1 : i - 1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-indigo-600 transition-all duration-200 opacity-0 group-hover:opacity-100">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Next arrow */}
        <button
          onClick={() => setActiveImg(i => i === product.images.filter(Boolean).length - 1 ? 0 : i + 1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-600 hover:bg-white hover:text-indigo-600 transition-all duration-200 opacity-0 group-hover:opacity-100">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {product.images.filter(Boolean).map((_, i) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className={`rounded-full transition-all duration-200 ${
                activeImg === i
                  ? "w-5 h-2 bg-indigo-500"
                  : "w-2 h-2 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </>
    )}
  </div>

  {/* Thumbnail strip */}
  {product.images.filter(Boolean).length > 1 && (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {product.images.filter(Boolean).map((img, i) => (
        <button key={i} onClick={() => setActiveImg(i)}
          className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
            activeImg === i
              ? "border-indigo-500 shadow-md shadow-indigo-500/20"
              : "border-gray-200 hover:border-gray-400"
          }`}>
          <img src={img} alt="" className="w-full h-full object-cover"/>
        </button>
      ))}
    </div>
  )}
</div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-indigo text-xs font-bold">{product.category}</span>
              {product.badge && <span className="badge-red text-xs font-bold">{product.badge}</span>}
            </div>

            <h1 className="font-sora text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-3">
              {product.name}
            </h1>

            <StarRating rating={product.rating} reviews={product.reviews} size="lg"/>

            {/* Price block — updates with size selection */}
            <div className="flex items-baseline gap-3 mt-5 mb-6">
              <span className="font-sora text-3xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
              {displayOriginal > displayPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">{formatPrice(displayOriginal)}</span>
                  <span className="badge-green font-bold">Save {formatPrice(displayOriginal - displayPrice)}</span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Size selector — dynamic from sizePricing */}
            {hasSizes && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Select Size</p>
                  <span className="text-xs text-indigo-500 font-medium">
                    Price varies by size
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizePricing.map(sp => (
                    <button
                      key={sp.size}
                      onClick={() => setSelectedSize(sp.size)}
                      className={`relative px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-150 ${
                        selectedSize === sp.size
                          ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/25"
                          : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                      }`}>
                      <span>{sp.size}</span>
                      <span className={`block text-[11px] font-medium mt-0.5 ${selectedSize === sp.size ? "text-indigo-200" : "text-gray-400"}`}>
                        {formatPrice(sp.price)}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Selected size summary */}
                {activePricing && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Selected:</span>
                    <span className="font-semibold text-indigo-600">{activePricing.size}</span>
                    <span className="text-gray-400">—</span>
                    <span className="font-bold text-gray-900">{formatPrice(activePricing.price)}</span>
                    {activePricing.originalPrice > activePricing.price && (
                      <span className="badge-green text-[11px]">
                        {discount(activePricing.price, activePricing.originalPrice)}% off
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Qty & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-semibold text-lg">−</button>
                <span className="px-4 text-base font-semibold text-gray-800 min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors font-semibold text-lg">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={added || product.stock === 0}
                className={`btn-primary flex-1 py-3 text-sm transition-all ${added ? "!bg-green-500" : ""}`}>
                {added
                  ? "✓ Added to Cart!"
                  : product.stock === 0
                  ? "Out of Stock"
                  : `Add to Cart · ${formatPrice(displayPrice * qty)}`}
              </button>
            </div>

            {/* Stock info */}
            <div className="flex items-center gap-2 mb-6">
              {product.stock > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500"/>
                  <span className="text-sm text-green-700 font-medium">
                    {product.stock <= 5 ? `Only ${product.stock} left in stock!` : "In Stock"}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500"/>
                  <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Delivery info */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              {[
                { icon: "🚚", title: "Free Delivery",   sub: "On orders above ₹999" },
                { icon: "↩️", title: "Easy Returns",    sub: "7 days return policy" },
                { icon: "🔒", title: "Secure Payment",  sub: "SSL encrypted checkout" },
              ].map(f => (
                <div key={f.title} className="flex items-center gap-3">
                  <span className="text-xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{f.title}</p>
                    <p className="text-xs text-gray-500">{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex border-b border-gray-200 mb-8">
            {["description","reviews"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-all relative ${tab === t ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}>
                {t === "reviews" ? `Reviews (${product.reviews.toLocaleString()})` : "Description"}
                {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t"/>}
              </button>
            ))}
          </div>

          {tab === "description" && (
            <div className="max-w-3xl">
              <p className="text-gray-600 leading-relaxed mb-4">{product.description}</p>
              {hasSizes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Size & Price Chart</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <span>Size</span><span>Selling Price</span><span>MRP</span>
                    </div>
                    {product.sizePricing.map(sp => (
                      <div key={sp.size} className={`grid grid-cols-3 px-4 py-3 border-t border-gray-100 text-sm ${selectedSize === sp.size ? "bg-indigo-50" : ""}`}>
                        <span className="font-semibold text-gray-800">{sp.size}</span>
                        <span className="font-bold text-indigo-600">{formatPrice(sp.price)}</span>
                        <span className="text-gray-400 line-through">{formatPrice(sp.originalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <h4 className="font-semibold text-gray-800 mb-3">Key Features</h4>
              <ul className="space-y-2">
                {["Premium quality materials","Manufacturer warranty included","Rigorously tested for performance","Eco-friendly packaging"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "reviews" && (
            <div className="max-w-3xl space-y-6">
              {MOCK_REVIEWS.map((r, i) => (
                <div key={i} className="card p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">{r.name[0]}</div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                        <p className="text-xs text-gray-400">{r.date}</p>
                      </div>
                    </div>
                    <StarRating rating={r.rating} reviews={0} showCount={false}/>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="section-title mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
