import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart }     from "../context/CartContext";
import { formatPrice, discount } from "../data/products";
import StarRating from "../components/ui/StarRating";

export default function Wishlist() {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, openCart } = useCart();

  const handleAddToCart = (product) => {
    const price = product.sizePricing?.length > 0
      ? product.sizePricing[0].price
      : product.price;
    addToCart({
      id:    product.id,
      name:  product.name,
      price,
      image: product.images?.[0],
      size:  product.sizePricing?.length > 0 ? product.sizePricing[0].size : "default",
    });
    openCart();
  };

  if (items.length === 0) return (
    <div className="page-container py-32 text-center animate-fadeIn">
      <div className="inline-flex w-24 h-24 rounded-full bg-pink-50 items-center justify-center mb-6">
        <svg className="w-12 h-12 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
        </svg>
      </div>
      <h2 className="font-sora text-2xl font-bold text-gray-700 mb-3">Your wishlist is empty</h2>
      <p className="text-gray-400 mb-8">Save products you love by clicking the heart icon</p>
      <Link to="/products" className="btn-primary">Browse Products</Link>
    </div>
  );

  return (
    <div className="page-container py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sora text-3xl font-bold text-gray-900 tracking-tight">My Wishlist</h1>
          <p className="text-sm text-gray-400 mt-1">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={clearWishlist}
          className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
        {items.map(product => {
          const hasSizes  = product.sizePricing?.length > 0;
          const basePrice = hasSizes ? product.sizePricing[0].price : product.price;
          const baseOrig  = hasSizes ? product.sizePricing[0].originalPrice : product.originalPrice;
          const disc      = baseOrig > basePrice ? discount(basePrice, baseOrig) : 0;

          return (
            <div key={product.id} className="card overflow-hidden group flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              {/* Image */}
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.images?.[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.style.display="none"; }}
                  />
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.badge && <span className="badge-indigo text-[11px] font-bold">{product.badge}</span>}
                  {disc > 0 && <span className="badge-red text-[11px] font-bold">{disc}% OFF</span>}
                </div>

                {/* Remove from wishlist */}
                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Remove from wishlist">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </button>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-indigo-500 font-semibold mb-1">{product.category}</p>
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <StarRating rating={product.rating} reviews={product.reviews}/>

                {/* Sizes preview */}
                {hasSizes && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.sizePricing.slice(0, 4).map(sp => (
                      <span key={sp.size} className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                        {sp.size}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="mt-auto pt-3">
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-base font-bold text-gray-900">{formatPrice(basePrice)}</span>
                    {baseOrig > basePrice && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(baseOrig)}</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg,#4338ca,#6366f1)" }}>
                      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                      title="Remove">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
