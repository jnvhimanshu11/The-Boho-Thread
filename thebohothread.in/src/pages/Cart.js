// src/pages/Cart.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { FiTrash2, FiTag, FiShoppingBag } from "react-icons/fi";
import toast from "react-hot-toast";

export function Cart() {
  const { state, dispatch, cartTotal, discountedTotal } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [checking, setChecking] = useState(false);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setChecking(true);
    try {
      const q = query(
        collection(db, "coupons"),
        where("code", "==", couponInput.toUpperCase()),
        where("active", "==", true)
      );
      const snap = await getDocs(q);
      if (snap.empty) { toast.error("Invalid or expired coupon"); return; }
      const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() };
      if (cartTotal < coupon.minOrder) { toast.error(`Min order ₹${coupon.minOrder} required`); return; }
      dispatch({ type: "APPLY_COUPON", payload: coupon });
      toast.success(`Coupon applied! ${coupon.discount}% off 🎉`, {
        style: { background: "#1a0a2e", color: "#f0f0ff", border: "1px solid rgba(124,58,237,0.3)" },
      });
    } catch (e) {
      toast.error("Error: " + e.message);
    } finally {
      setChecking(false);
      setCouponInput("");
    }
  };

  const handleOrder = () => {
    if (!user) { navigate("/login"); return; }
    toast.success("Order placed successfully! 🎉", {
      style: { background: "#1a0a2e", color: "#f0f0ff", border: "1px solid rgba(16,185,129,0.3)" },
    });
    dispatch({ type: "CLEAR_CART" });
    navigate("/");
  };

  if (state.cart.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1, position: "relative" }}>
        <FiShoppingBag size={64} color="#7c3aed" style={{ marginBottom: 20, opacity: 0.5 }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: 10 }}>Your cart is empty</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Explore our products and add something you love</p>
        <button className="btn btn-primary" onClick={() => navigate("/shop")}>Explore Shop</button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 0 80px" }}>
      <div className="container">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 900, marginBottom: 32 }}>Your Cart</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32, alignItems: "start" }} className="cart-grid">
          {/* Items */}
          <div style={{ display: "grid", gap: 14 }}>
            {state.cart.map((item) => (
              <div key={item.id} className="glass" style={{ padding: "18px 20px", display: "flex", gap: 16, alignItems: "center" }}>
                <img
                  src={item.imageUrl || "https://via.placeholder.com/80x80/1a0a2e/7c3aed?text=P"}
                  alt={item.name}
                  onClick={() => navigate(`/product/${item.id}`)}
                  style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, cursor: "pointer", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>₹{item.price} each</div>
                  <div style={{ color: "#a78bfa", fontWeight: 700, marginTop: 2 }}>₹{(item.price * item.qty).toFixed(0)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <QtyBtn onClick={() => dispatch({ type: "UPDATE_QTY", payload: { id: item.id, qty: Math.max(1, item.qty - 1) } })}>−</QtyBtn>
                  <span style={{ minWidth: 24, textAlign: "center", fontWeight: 600 }}>{item.qty}</span>
                  <QtyBtn onClick={() => dispatch({ type: "UPDATE_QTY", payload: { id: item.id, qty: item.qty + 1 } })}>+</QtyBtn>
                </div>
                <button
                  onClick={() => dispatch({ type: "REMOVE_FROM_CART", payload: item.id })}
                  style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: 8, borderRadius: 8, transition: "background 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="glass" style={{ padding: 28, position: "sticky", top: 100 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", marginBottom: 20 }}>Order Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              <SummaryRow label="Subtotal" value={`₹${cartTotal.toFixed(0)}`} />
              {state.appliedCoupon && (
                <SummaryRow label={`Coupon (${state.appliedCoupon.code})`} value={`-₹${(cartTotal - discountedTotal).toFixed(0)}`} valueColor="#34d399" />
              )}
              <SummaryRow label="Shipping" value="Free" valueColor="#34d399" />
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
              <SummaryRow label="Total" value={`₹${discountedTotal.toFixed(0)}`} bold />
            </div>

            {!state.appliedCoupon ? (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input className="input" placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyCoupon()} style={{ flex: 1 }} />
                <button className="btn btn-outline" style={{ padding: "12px 16px" }} onClick={applyCoupon} disabled={checking}>
                  <FiTag />
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "10px 14px" }}>
                <span style={{ color: "#34d399", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6 }}>
                  <FiTag size={14} />{state.appliedCoupon.code} · {state.appliedCoupon.discount}% OFF
                </span>
                <button onClick={() => dispatch({ type: "REMOVE_COUPON" })} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.8rem" }}>Remove</button>
              </div>
            )}

            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px", marginBottom: 10 }} onClick={handleOrder}>
              Place Order — ₹{discountedTotal.toFixed(0)}
            </button>
            <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center", padding: "12px" }} onClick={() => navigate("/shop")}>
              Continue Shopping
            </button>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-around" }}>
              {["🔒 Secure", "🚚 Free Ship", "↩️ Easy Return"].map((b) => (
                <span key={b} style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center" }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .cart-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function QtyBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--text)", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </button>
  );
}

function SummaryRow({ label, value, bold, valueColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: bold ? "var(--text)" : "var(--text-muted)", fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: valueColor || "var(--text)", fontSize: bold ? "1.15rem" : "1rem" }}>{value}</span>
    </div>
  );
}
