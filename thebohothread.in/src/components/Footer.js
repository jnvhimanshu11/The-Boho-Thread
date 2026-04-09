// src/components/Footer.js
import { Link } from "react-router-dom";
import { FiInstagram, FiTwitter, FiFacebook, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer
      style={{
        position: "relative",
        zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,26,0.8)",
        backdropFilter: "blur(20px)",
        padding: "48px 0 24px",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>✦</div>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "1.2rem", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>LiquidStore</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 260 }}>
              An immersive shopping experience where design meets discovery. Curated products for the modern lifestyle.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              {[FiInstagram, FiTwitter, FiFacebook, FiMail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--text-muted)",
                    transition: "all 0.2s",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.color = "#7c3aed"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Shop</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["All Products", "/shop"], ["New Arrivals", "/shop"], ["Campaigns", "/campaigns"], ["Wishlist", "/wishlist"]].map(([label, to]) => (
                <Link key={label} to={to} style={{ color: "rgba(240,240,255,0.6)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.target.style.color = "#7c3aed")}
                  onMouseLeave={(e) => (e.target.style.color = "rgba(240,240,255,0.6)")}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Account</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[["Sign In", "/login"], ["My Cart", "/cart"], ["My Profile", "/profile"]].map(([label, to]) => (
                <Link key={label} to={to} style={{ color: "rgba(240,240,255,0.6)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.target.style.color = "#7c3aed")}
                  onMouseLeave={(e) => (e.target.style.color = "rgba(240,240,255,0.6)")}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>Support</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Contact Us", "FAQs", "Return Policy", "Privacy Policy"].map((label) => (
                <a key={label} href="#" style={{ color: "rgba(240,240,255,0.6)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.target.style.color = "#7c3aed")}
                  onMouseLeave={(e) => (e.target.style.color = "rgba(240,240,255,0.6)")}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} LiquidStore. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Visa", "Mastercard", "UPI", "Razorpay"].map((m) => (
              <span key={m} style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "3px 10px" }}>{m}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
