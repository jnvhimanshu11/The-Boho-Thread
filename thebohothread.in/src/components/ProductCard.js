// src/components/ProductCard.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ProductCard({ product, compact = false }) {
  const { dispatch, state } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const inWishlist = state.wishlist.some((i) => i.id === product.id);
  const inCart = state.cart.some((i) => i.id === product.id);

  const avgRating =
    product.approvedReviews && product.approvedReviews.length > 0
      ? product.approvedReviews.reduce((s, r) => s + r.rating, 0) / product.approvedReviews.length
      : 0;

  const salePrice = product.salePercent
    ? product.price * (1 - product.salePercent / 100)
    : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    dispatch({ type: "ADD_TO_CART", payload: product });
    toast.success("Added to cart!", { icon: "🛒", style: { background: "#1a0a2e", color: "#f0f0ff", border: "1px solid rgba(124,58,237,0.3)" } });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    dispatch({ type: "TOGGLE_WISHLIST", payload: product });
    toast(inWishlist ? "Removed from wishlist" : "Added to wishlist ❤️", {
      style: { background: "#1a0a2e", color: "#f0f0ff", border: "1px solid rgba(124,58,237,0.3)" },
    });
  };

  return (
    <div
      className="glass"
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        overflow: "hidden",
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered ? "0 20px 60px rgba(124,58,237,0.3)" : "var(--shadow)",
        position: "relative",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", height: compact ? 160 : 220 }}>
        <img
          src={product.imageUrl || product.imageUrls?.[0] || "https://via.placeholder.com/400x300/1a0a2e/7c3aed?text=Product"}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}
        />

        {/* Badges */}
        <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {product.badge && (
            <span className={`badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>
          )}
          {product.salePercent && (
            <span className="badge badge-sale">-{product.salePercent}%</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: inWishlist ? "rgba(239,68,68,0.3)" : "rgba(0,0,0,0.5)",
            border: `1px solid ${inWishlist ? "#f87171" : "rgba(255,255,255,0.2)"}`,
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: inWishlist ? "#f87171" : "white",
            backdropFilter: "blur(10px)",
            transition: "all 0.2s",
          }}
        >
          <FiHeart fill={inWishlist ? "#f87171" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: compact ? "12px" : "16px" }}>
        {product.category && (
          <span style={{ fontSize: "0.7rem", color: "var(--accent2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {product.category}
          </span>
        )}

        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: compact ? "1rem" : "1.1rem",
            fontWeight: 700,
            margin: "6px 0 8px",
            color: "var(--text)",
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </h3>

        {/* Rating */}
        {avgRating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <FiStar
                  key={s}
                  size={12}
                  fill={s <= Math.round(avgRating) ? "#f59e0b" : "none"}
                  color={s <= Math.round(avgRating) ? "#f59e0b" : "#555"}
                />
              ))}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              ({product.approvedReviews.length})
            </span>
          </div>
        )}

        {/* Price + Cart */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: compact ? "1rem" : "1.2rem",
                background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ₹{salePrice ? salePrice.toFixed(0) : product.price}
            </span>
            {salePrice && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                ₹{product.price}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            style={{
              background: inCart ? "rgba(124,58,237,0.3)" : "linear-gradient(135deg,#7c3aed,#06b6d4)",
              border: inCart ? "1px solid #7c3aed" : "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "white",
              transition: "all 0.2s",
            }}
          >
            <FiShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
