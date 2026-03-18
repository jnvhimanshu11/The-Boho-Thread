import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../data/products";

function CartRow({ item }) {
  const { removeFromCart, updateQty } = useCart();
  return (
    <div className="card p-5 flex flex-col sm:flex-row gap-5">
      <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-sora font-bold text-gray-900 text-base leading-tight mb-1">{item.name}</p>
            {item.size !== "default" && (
              <span className="badge-gray mb-2">Size: {item.size}</span>
            )}
          </div>
          <button onClick={() => removeFromCart(item.id, item.size)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => item.qty > 1 ? updateQty(item.id, item.size, item.qty - 1) : removeFromCart(item.id, item.size)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-semibold">
              {item.qty === 1 ? "×" : "−"}
            </button>
            <span className="px-3 font-semibold text-sm text-gray-800 min-w-[32px] text-center">{item.qty}</span>
            <button onClick={() => updateQty(item.id, item.size, item.qty + 1)}
              className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors font-semibold">+</button>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-base">{formatPrice(item.price * item.qty)}</p>
            {item.qty > 1 && <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const { items, subtotal, shipping, total, clearCart } = useCart();

  if (items.length === 0) return (
    <div className="page-container py-32 text-center animate-fadeIn">
      <div className="inline-flex w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-6">
        <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>
      </div>
      <h2 className="font-sora text-2xl font-bold text-gray-700 mb-3">Your cart is empty</h2>
      <p className="text-gray-400 mb-8">Looks like you haven't added anything yet</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div className="page-container py-10 animate-fadeIn">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sora text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors">Clear all</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => <CartRow key={`${item.id}-${item.size}`} item={item}/>)}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-sora text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({items.reduce((s,i) => s+i.qty, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax (18% GST)</span>
                <span>{formatPrice(Math.round(subtotal * 0.18))}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>{formatPrice(total + Math.round(subtotal * 0.18))}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  Add {formatPrice(999 - subtotal)} more to get free delivery
                </p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex gap-2">
                <input type="text" placeholder="Promo code" className="input-field py-2.5 text-sm flex-1"/>
                <button className="btn-secondary py-2.5 px-4 text-sm">Apply</button>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary w-full py-3.5 text-sm">
              Proceed to Checkout →
            </Link>
            <Link to="/products" className="btn-ghost w-full py-2.5 text-sm mt-2 justify-center">
              ← Continue Shopping
            </Link>

            <div className="mt-5 flex items-center justify-center gap-4 text-xs text-gray-400">
              <span>🔒 Secured</span>
              <span>🚚 Fast Delivery</span>
              <span>↩️ Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
