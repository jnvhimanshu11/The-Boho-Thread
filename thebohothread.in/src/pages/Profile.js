// src/pages/Profile.js
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { FiShoppingBag, FiHeart, FiLogOut, FiUser } from "react-icons/fi";

export default function Profile() {
  const { user, logout } = useAuth();
  const { state } = useStore();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const stats = [
    { icon: <FiShoppingBag />, label: "Cart Items", value: state.cart.reduce((s, i) => s + i.qty, 0) },
    { icon: <FiHeart />, label: "Wishlist", value: state.wishlist.length },
  ];

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 0 80px" }}>
      <div className="container" style={{ maxWidth: 700 }}>
        {/* Profile header */}
        <div className="glass" style={{ padding: "40px 36px", marginBottom: 24, textAlign: "center" }}>
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.phoneNumber || "User")}&background=7c3aed&color=fff&size=120`}
            alt="Avatar"
            style={{ width: 100, height: 100, borderRadius: "50%", border: "3px solid #7c3aed", marginBottom: 16, display: "block", margin: "0 auto 16px" }}
          />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 900 }}>
            {user.displayName || "Welcome!"}
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
            {user.email || user.phoneNumber}
          </p>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 28 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 900, fontFamily: "'Playfair Display', serif", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {s.value}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            { icon: <FiShoppingBag />, label: "View Cart", to: "/cart" },
            { icon: <FiHeart />, label: "My Wishlist", to: "/wishlist" },
          ].map((item) => (
            <button
              key={item.label}
              className="glass btn"
              onClick={() => navigate(item.to)}
              style={{ padding: "20px", justifyContent: "center", flexDirection: "column", gap: 10, border: "1px solid rgba(255,255,255,0.08)", color: "var(--text)", fontSize: "0.95rem" }}
            >
              <span style={{ fontSize: "1.4rem", color: "#7c3aed" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          className="btn btn-outline"
          style={{ width: "100%", justifyContent: "center", padding: "14px", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" }}
          onClick={handleLogout}
        >
          <FiLogOut /> Sign Out
        </button>
      </div>
    </div>
  );
}
