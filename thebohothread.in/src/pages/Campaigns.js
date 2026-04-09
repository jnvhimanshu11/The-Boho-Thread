// src/pages/Campaigns.js
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiZap, FiArrowRight } from "react-icons/fi";

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    return onSnapshot(query(collection(db, "campaigns"), where("active", "==", true)), (s) =>
      setCampaigns(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 0 80px" }}>
      <div className="container">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 900, marginBottom: 8 }}>Active Campaigns</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>Exclusive deals and offers for you</p>

        {campaigns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
            <FiZap size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
            <h3>No active campaigns</h3>
            <p>Check back soon for great deals!</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 24 }}>
            {campaigns.map((c, i) => (
              <div
                key={c.id}
                style={{
                  background: `linear-gradient(135deg, ${["rgba(124,58,237,0.2)","rgba(6,182,212,0.2)","rgba(245,158,11,0.2)"][i%3]}, rgba(10,10,26,0.8))`,
                  border: `1px solid ${["rgba(124,58,237,0.4)","rgba(6,182,212,0.4)","rgba(245,158,11,0.4)"][i%3]}`,
                  borderRadius: 20,
                  padding: "36px 40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 20,
                  backdropFilter: "blur(20px)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <FiZap color="#fbbf24" size={20} />
                    <span style={{ fontWeight: 700, color: "#fbbf24", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Active Campaign</span>
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: 8 }}>{c.title}</h2>
                  <p style={{ color: "var(--text-muted)", marginBottom: 14, fontSize: "1rem" }}>{c.description}</p>
                  {c.couponCode && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Use code:</span>
                      <code style={{ background: "rgba(245,158,11,0.15)", border: "1px dashed rgba(245,158,11,0.5)", borderRadius: 8, padding: "5px 16px", color: "#fbbf24", fontWeight: 700, fontSize: "1.1rem", letterSpacing: "0.1em" }}>
                        {c.couponCode}
                      </code>
                      <span style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 20, padding: "4px 14px", color: "#34d399", fontWeight: 700 }}>
                        {c.discount}% OFF
                      </span>
                    </div>
                  )}
                </div>
                <button className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "1rem" }} onClick={() => navigate("/shop")}>
                  Shop Now <FiArrowRight />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
