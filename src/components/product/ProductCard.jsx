import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart }     from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import StarRating from "../ui/StarRating";
import { formatPrice, discount } from "../../data/products";

export default function ProductCard({ product }) {
  const { addToCart, openCart }   = useCart();
  const { toggleWishlist, isWished } = useWishlist();

  const hasSizes = product.sizePricing?.length > 0;
  const [selectedSize, setSelectedSize] = useState(
    hasSizes ? product.sizePricing[0].size : "default"
  );
  const [added,  setAdded]  = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const wished = isWished(product.id);

  const activePricing   = hasSizes ? product.sizePricing.find(s => s.size === selectedSize) || product.sizePricing[0] : null;
  const displayPrice    = activePricing ? activePricing.price         : product.price;
  const displayOriginal = activePricing ? activePricing.originalPrice : product.originalPrice;
  const disc = displayOriginal > displayPrice ? discount(displayPrice, displayOriginal) : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    addToCart({ id: product.id, name: product.name, price: displayPrice, image: product.images[0], size: selectedSize });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    openCart();
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <Link to={`/products/${product.id}`}
      className="group card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col">

      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {!imgErr ? (
          <img src={product.images[0]} alt={product.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && <span className="badge-indigo text-[11px] font-bold tracking-wide">{product.badge}</span>}
          {disc > 0 && <span className="badge-red text-[11px] font-bold">{disc}% OFF</span>}
        </div>

        {/* Wishlist heart button */}
        <button onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border flex items-center justify-center transition-all duration-200 ${
            wished
              ? "text-red-500 border-red-200 opacity-100"
              : "text-gray-400 border-gray-200 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100"
          }`}>
          <svg className="w-4 h-4" fill={wished ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        {/* Quick Add */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleAdd} disabled={added || product.stock === 0}
            className={`w-full py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
              added ? "bg-green-500 text-white"
              : product.stock === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gray-900 text-white hover:bg-gray-800"
            }`}>
            {added ? "✓ Added!" : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-indigo-500 font-semibold mb-1">{product.category}</p>
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>
        <StarRating rating={product.rating} reviews={product.reviews}/>

        {/* Size selector */}
        {hasSizes && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1.5">
              {product.sizePricing.map(sp => (
                <button key={sp.size}
                  onClick={e => { e.preventDefault(); setSelectedSize(sp.size); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all duration-150 ${
                    selectedSize === sp.size
                      ? "bg-indigo-500 border-indigo-500 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
                  }`}>
                  {sp.size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-gray-900">{formatPrice(displayPrice)}</span>
            {displayOriginal > displayPrice && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(displayOriginal)}</span>
            )}
          </div>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-amber-600 font-medium">Only {product.stock} left</span>
          )}
        </div>
      </div>
    </Link>
  );
}
