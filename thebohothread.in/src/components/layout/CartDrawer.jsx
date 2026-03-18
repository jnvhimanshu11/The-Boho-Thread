import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { formatPrice } from "../../data/products";

function CartItem({ item }) {
  const { removeFromCart, updateQty } = useCart();
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.style.display="none"; }}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
        <p className="text-sm font-bold text-indigo-600 mt-0.5">{formatPrice(item.price)}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={() => item.qty > 1 ? updateQty(item.id, item.size, item.qty - 1) : removeFromCart(item.id, item.size)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-base font-medium">
              {item.qty === 1 ? "×" : "−"}
            </button>
            <span className="px-2 text-sm font-semibold text-gray-700 min-w-[24px] text-center">{item.qty}</span>
            <button onClick={() => updateQty(item.id, item.size, item.qty + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-medium">+</button>
          </div>
          <button onClick={() => removeFromCart(item.id, item.size)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors font-medium">Remove</button>
        </div>
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, shipping, total, clearCart } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h2 className="font-sora text-base font-bold text-gray-900">My Cart</h2>
            {items.length > 0 && <span className="badge-indigo">{items.length} item{items.length !== 1 ? "s" : ""}</span>}
          </div>
          <button onClick={closeCart} className="btn-g
          st p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Your cart is empty</p>
                <p className="text-sm text-gray-400">Add some products to get started</p>
              </div>
              <button onClick={closeCart} className="btn-primary py-2.5 px-6 text-sm">
                <Link to="/products" onClick={closeCart}>Start Shopping</Link>
              </button>
            </div>
          ) : (
            <>
              {items.map(item => <CartItem key={`${item.id}-${item.size}`} item={item} />)}
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 mt-2 font-medium transition-colors">Clear all</button>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-amber-600">Add {formatPrice(999 - subtotal)} more for free shipping</p>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link to="/checkout" onClick={closeCart} className="btn-primary w-full text-sm">
              Proceed to Checkout →
            </Link>
            <button onClick={closeCart} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3 transition-colors">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
