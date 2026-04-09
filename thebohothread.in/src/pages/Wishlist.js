// src/pages/Wishlist.js
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";
import { FiHeart } from "react-icons/fi";

export default function Wishlist() {
  const { state } = useStore();
  const navigate = useNavigate();

  if (state.wishlist.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 1, position: "relative" }}>
        <FiHeart size={64} color="#7c3aed" style={{ marginBottom: 20, opacity: 0.5 }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: 10 }}>Wishlist is empty</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>Save products you love for later</p>
        <button className="btn btn-primary" onClick={() => navigate("/shop")}>Explore Shop</button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 0 80px" }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 900 }}>
            My Wishlist
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: 6 }}>{state.wishlist.length} saved items</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 24 }}>
          {state.wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
