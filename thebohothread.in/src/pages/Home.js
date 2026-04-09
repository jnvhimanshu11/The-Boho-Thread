// src/pages/Home.js
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import ProductCard from "../components/ProductCard";
import { FiArrowRight, FiZap, FiTrendingUp, FiAward } from "react-icons/fi";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCat, setSelectedCat] = useState("All");
  const heroRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Products
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // Categories
    const unsub2 = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    // Active campaigns
    const unsub3 = onSnapshot(
      query(collection(db, "campaigns"), where("active", "==", true)),
      (snap) => setCampaigns(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => { unsub(); unsub2(); unsub3(); };
  }, []);

  // Parallax on scroll
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`;
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = selectedCat === "All"
    ? products
    : products.filter((p) => p.category === selectedCat);

  const featured = products.filter((p) => p.badge === "Featured" || p.badge === "Hot").slice(0, 8);

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "100px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div ref={heroRef} style={{ maxWidth: 800, position: "relative", zIndex: 2 }}>
          {campaigns.length > 0 && (
            <div
              className="glass"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                borderRadius: 50,
                marginBottom: 24,
                fontSize: "0.85rem",
                color: "#fbbf24",
                border: "1px solid rgba(245,158,11,0.3)",
                background: "rgba(245,158,11,0.08)",
                animation: "fadeUp 0.5s ease",
              }}
            >
              <FiZap /> {campaigns[0].title} — {campaigns[0].description}
            </div>
          )}

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: 24,
              animation: "fadeUp 0.6s ease 0.1s both",
            }}
          >
            Discover the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 50%, #f59e0b 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shimmer 4s linear infinite",
              }}
            >
              Liquid Future
            </span>
            <br />
            of Shopping
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem,2.5vw,1.2rem)",
              color: "var(--text-muted)",
              maxWidth: 560,
              margin: "0 auto 40px",
              lineHeight: 1.7,
              animation: "fadeUp 0.6s ease 0.2s both",
            }}
          >
            Immersive product experiences with seamless discovery. Every scroll reveals something extraordinary.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animation: "fadeUp 0.6s ease 0.3s both" }}>
            <button className="btn btn-primary" onClick={() => navigate("/shop")} style={{ fontSize: "1rem", padding: "14px 36px" }}>
              Shop Now <FiArrowRight />
            </button>
            <button className="btn btn-outline" onClick={() => document.getElementById("featured").scrollIntoView({ behavior: "smooth" })}>
              See Featured
            </button>
          </div>
        </div>

        {/* Floating orbs */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: `radial-gradient(circle, ${["rgba(124,58,237,0.15)", "rgba(6,182,212,0.12)", "rgba(245,158,11,0.1)"][i]}, transparent)`,
              width: [500, 400, 350][i],
              height: [500, 400, 350][i],
              top: [`-10%`, `30%`, `50%`][i],
              left: [`-5%`, `60%`, `-10%`][i],
              animation: `float ${[8, 10, 12][i]}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
              pointerEvents: "none",
            }}
          />
        ))}
      </section>

      {/* Campaign Banner */}
      {campaigns.length > 0 && (
        <section style={{ padding: "0 0 60px" }}>
          <div className="container">
            <div
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.2))",
                border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: 20,
                padding: "32px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 20,
                backdropFilter: "blur(20px)",
              }}
            >
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: 8 }}>
                  🎉 {campaigns[0].title}
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>{campaigns[0].description}</p>
                {campaigns[0].couponCode && (
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Use code:</span>
                    <code
                      style={{
                        background: "rgba(245,158,11,0.15)",
                        border: "1px dashed rgba(245,158,11,0.5)",
                        borderRadius: 8,
                        padding: "4px 14px",
                        color: "#fbbf24",
                        fontWeight: 700,
                        fontSize: "1rem",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {campaigns[0].couponCode}
                    </code>
                    <span style={{ color: "#34d399", fontWeight: 600 }}>{campaigns[0].discount}% OFF</span>
                  </div>
                )}
              </div>
              <button className="btn btn-primary" onClick={() => navigate("/shop")}>
                Shop Now <FiArrowRight />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Horizontal Scrolling Products Banner */}
      {featured.length > 0 && (
        <section id="featured" style={{ padding: "0 0 60px", overflow: "hidden" }}>
          <div className="container" style={{ marginBottom: 24 }}>
            <SectionTitle icon={<FiTrendingUp />} label="Trending Now" />
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              padding: "10px 24px",
              animation: "scrollLeft 30s linear infinite",
              width: "max-content",
            }}
          >
            {[...featured, ...featured].map((p, i) => (
              <div key={`${p.id}-${i}`} style={{ width: 220, flexShrink: 0 }}>
                <ProductCard product={p} compact />
              </div>
            ))}
          </div>
          <style>{`
            @keyframes scrollLeft {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section style={{ padding: "0 0 60px" }}>
          <div className="container">
            <SectionTitle icon={<FiAward />} label="Shop by Category" />
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
              {["All", ...categories.map((c) => c.name)].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 50,
                    border: `1px solid ${selectedCat === cat ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
                    background: selectedCat === cat ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.03)",
                    color: selectedCat === cat ? "#a78bfa" : "var(--text-muted)",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section style={{ padding: "0 0 80px" }}>
        <div className="container">
          <SectionTitle icon={<FiZap />} label="All Products" />
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              No products found. Check back soon! ✨
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 24,
                marginTop: 28,
              }}
            >
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "linear-gradient(135deg,#7c3aed,#06b6d4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "1rem",
        }}
      >
        {icon}
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.6rem" }}>
        {label}
      </h2>
    </div>
  );
}
