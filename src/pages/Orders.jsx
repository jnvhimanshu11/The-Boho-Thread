import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../data/products";

const MOCK_ORDERS = [
  { id: "ORD1748201", date: "12 Mar 2026", status: "Delivered",   total: 7498, items: [{ name: "Wireless Headphones",  img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=60" }] },
  { id: "ORD1747892", date: "28 Feb 2026", status: "Shipped",     total: 3299, items: [{ name: "Cookware Set",          img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=80&q=60" }] },
  { id: "ORD1746501", date: "14 Feb 2026", status: "Processing",  total: 1248, items: [{ name: "Slim Fit Shirt",        img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&q=60" }] },
  { id: "ORD1743002", date: "01 Jan 2026", status: "Cancelled",   total: 4999, items: [{ name: "Smart Watch Pro",       img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&q=60" }] },
];

const STATUS_STYLES = {
  Delivered:  "badge-green",
  Shipped:    "badge-indigo",
  Processing: "badge-amber",
  Cancelled:  "badge-red",
};

export default function Orders() {
  const { user } = useAuth();

  if (!user) return (
    <div className="page-container py-32 text-center">
      <div className="text-6xl mb-4">🔐</div>
      <h2 className="font-sora text-2xl font-bold text-gray-700 mb-3">Sign in to view orders</h2>
      <Link to="/auth" className="btn-primary">Sign In</Link>
    </div>
  );

  return (
    <div className="page-container py-10 animate-fadeIn">
      <h1 className="font-sora text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {MOCK_ORDERS.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="font-sora text-xl font-bold text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {MOCK_ORDERS.map(order => (
            <div key={order.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-sora font-bold text-gray-900 text-sm">{order.id}</span>
                    <span className={STATUS_STYLES[order.status]}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-400">Placed on {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-base">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover"/>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">{item.name}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="btn-ghost text-xs py-2 px-4 border border-gray-200 rounded-lg">View Details</button>
                {order.status === "Delivered" && (
                  <button className="btn-ghost text-xs py-2 px-4 border border-gray-200 rounded-lg">Write Review</button>
                )}
                {order.status === "Shipped" && (
                  <button className="btn-ghost text-xs py-2 px-4 border border-indigo-200 rounded-lg text-indigo-600">Track Shipment</button>
                )}
                {order.status === "Processing" && (
                  <button className="btn-ghost text-xs py-2 px-4 border border-red-200 rounded-lg text-red-500">Cancel Order</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
