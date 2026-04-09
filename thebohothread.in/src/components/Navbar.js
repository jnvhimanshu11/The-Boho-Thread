// src/components/Navbar.js
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiLogOut, FiSettings } from "react-icons/fi";

export default function Navbar() {
  const { user, isAdmin, logout, adminLogout } = useAuth();
  const { state } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = state.cart.reduce((s, i) => s + i.qty, 0);
  const wishCount = state.wishlist.length;

  const handleLogout = async () => {
    if (isAdmin) adminLogout();
    else await logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? "10px 0" : "18px 0",
        background: scrolled ? "rgba(10,10,26,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.2rem",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              ✦
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontSize: "1.4rem",
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              LiquidStore
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div
          style={{
            display: "flex",
            gap: 32,
            alignItems: "center",
          }}
          className="nav-desktop"
        >
          <NavLink to="/shop">Shop</NavLink>
          <NavLink to="/campaigns">Campaigns</NavLink>
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </div>

        {/* Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconBtn icon={<FiHeart />} badge={wishCount} onClick={() => navigate("/wishlist")} title="Wishlist" />
          <IconBtn icon={<FiShoppingCart />} badge={cartCount} onClick={() => navigate("/cart")} title="Cart" />

          {user || isAdmin ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {user && (
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.phoneNumber}&background=7c3aed&color=fff`}
                  alt="avatar"
                  style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #7c3aed", cursor: "pointer" }}
                  onClick={() => navigate("/profile")}
                />
              )}
              <button className="btn btn-outline" style={{ padding: "8px 14px", fontSize: "0.85rem" }} onClick={handleLogout}>
                <FiLogOut />
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ padding: "8px 18px", fontSize: "0.85rem" }} onClick={() => navigate("/login")}>
              <FiUser /> Sign In
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            className="btn btn-outline"
            style={{ padding: "8px 12px", display: "none" }}
            id="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="glass"
          style={{
            margin: "10px 16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/campaigns" onClick={() => setMenuOpen(false)}>Campaigns</NavLink>
          <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist ({wishCount})</NavLink>
          <NavLink to="/cart" onClick={() => setMenuOpen(false)}>Cart ({cartCount})</NavLink>
          {isAdmin && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          #hamburger { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      style={{
        color: "rgba(240,240,255,0.8)",
        textDecoration: "none",
        fontWeight: 500,
        fontSize: "0.95rem",
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => (e.target.style.color = "#7c3aed")}
      onMouseLeave={(e) => (e.target.style.color = "rgba(240,240,255,0.8)")}
    >
      {children}
    </Link>
  );
}

function IconBtn({ icon, badge, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        position: "relative",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "50%",
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--text)",
        fontSize: "1.1rem",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(124,58,237,0.2)"; e.currentTarget.style.borderColor = "#7c3aed"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
    >
      {icon}
      {badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
            borderRadius: "50%",
            width: 18,
            height: 18,
            fontSize: "0.65rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
