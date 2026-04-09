// src/pages/ProductDetail.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { FiHeart, FiShoppingCart, FiStar, FiShare2, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { dispatch, state } = useStore();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 0, text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getDoc(doc(db, "products", id)).then((d) => {
      if (d.exists()) setProduct({ id: d.id, ...d.data() });
    });
  }, [id]);

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, position: "relative" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...(product.imageUrls || [])].filter(Boolean);
  const inWishlist = state.wishlist.some((i) => i.id === product.id);
  const salePrice = product.salePercent ? product.price * (1 - product.salePercent / 100) : null;
  const avgRating = product.approvedReviews?.length > 0
    ? product.approvedReviews.reduce((s, r) => s + r.rating, 0) / product.approvedReviews.length : 0;

  const handleAddToCart = () => {
    if (!user) { navigate("/login"); return; }
    for (let i = 0; i < qty; i++) dispatch({ type: "ADD_TO_CART", payload: product });
    toast.success(`Added ${qty} item(s) to cart!`, { icon: "🛒", style: { background: "#1a0a2e", color: "#f0f0ff", border: "1px solid rgba(124,58,237,0.3)" } });
  };

  const handleWishlist = () => {
    if (!user) { navigate("/login"); return; }
    dispatch({ type: "TOGGLE_WISHLIST", payload: product });
    toast(inWishlist ? "Removed from wishlist" : "Added to wishlist ❤️", { style: { background: "#1a0a2e", color: "#f0f0ff" } });
  };

  const handleReview = async () => {
    if (!user) { navigate("/login"); return; }
    if (review.rating === 0) { toast.error("Please select a rating"); return; }
    if (review.text.trim().length < 10) { toast.error("Review must be at least 10 characters"); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "reviews"), {
        productId: id,
        productName: product.name,
        uid: user.uid,
        userName: user.displayName || user.phoneNumber || "Anonymous",
        rating: review.rating,
        text: review.text,
        approved: false,
        createdAt: serverTimestamp(),
      });
      setReview({ rating: 0, text: "" });
      toast.success("Review submitted! Awaiting admin approval 🎉", { style: { background: "#1a0a2e", color: "#f0f0ff" } });
    } catch (e) {
      toast.error("Failed: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 0 80px" }}>
      <div className="container">
        <button className="btn btn-outline" style={{ marginBottom: 24, padding: "8px 18px" }} onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 20, overflow: "hidden", marginBottom: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", height: 420 }}>
              <img src={allImages[selectedImage] || "https://via.placeholder.com/600x420/1a0a2e/7c3aed?text=Product"} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {allImages.length > 1 && (
              <div style={{ display: "flex", gap: 10 }}>
                {allImages.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(i)} style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden", border: `2px solid ${selectedImage === i ? "#7c3aed" : "rgba(255,255,255,0.1)"}`, cursor: "pointer" }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            {product.category && <span style={{ fontSize: "0.75rem", color: "var(--accent2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{product.category}</span>}
            {product.badge && <span className={`badge badge-${product.badge.toLowerCase()}`} style={{ marginLeft: 10 }}>{product.badge}</span>}

            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 900, marginTop: 10, lineHeight: 1.2 }}>{product.name}</h1>

            {/* Rating */}
            {avgRating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1,2,3,4,5].map((s) => <FiStar key={s} fill={s<=Math.round(avgRating)?"#f59e0b":"none"} color={s<=Math.round(avgRating)?"#f59e0b":"#555"} />)}
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{avgRating.toFixed(1)} ({product.approvedReviews.length} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ margin: "20px 0" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "2.2rem", background: "linear-gradient(135deg,#7c3aed,#06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                ₹{salePrice ? salePrice.toFixed(0) : product.price}
              </span>
              {salePrice && <span style={{ marginLeft: 12, color: "var(--text-muted)", textDecoration: "line-through", fontSize: "1.1rem" }}>₹{product.price}</span>}
              {product.salePercent > 0 && <span className="badge badge-sale" style={{ marginLeft: 12 }}>{product.salePercent}% OFF</span>}
            </div>

            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>

            {/* Qty */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Quantity:</span>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ padding: "10px 16px", background: "transparent", border: "none", color: "var(--text)", cursor: "pointer", fontSize: "1.1rem" }}>−</button>
                <span style={{ padding: "0 16px", fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ padding: "10px 16px", background: "transparent", border: "none", color: "var(--text)", cursor: "pointer", fontSize: "1.1rem" }}>+</button>
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Stock: {product.stock || "∞"}</span>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" onClick={handleAddToCart} style={{ flex: 1, justifyContent: "center", padding: "14px" }}>
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                onClick={handleWishlist}
                style={{ padding: "14px 18px", borderRadius: 12, border: `1px solid ${inWishlist ? "#f87171" : "rgba(255,255,255,0.1)"}`, background: inWishlist ? "rgba(239,68,68,0.1)" : "transparent", color: inWishlist ? "#f87171" : "var(--text)", cursor: "pointer", transition: "all 0.2s" }}
              >
                <FiHeart fill={inWishlist ? "#f87171" : "none"} />
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                style={{ padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "var(--text)", cursor: "pointer" }}
              >
                <FiShare2 />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: 60 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: 32 }}>
            Reviews & Ratings
          </h2>

          {/* Write Review */}
          <div className="glass" style={{ padding: 28, marginBottom: 32, maxWidth: 600 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Write a Review</h3>
            <div style={{ marginBottom: 14 }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 8, display: "block" }}>Your Rating</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[1,2,3,4,5].map((s) => (
                  <FiStar
                    key={s}
                    size={28}
                    fill={s <= review.rating ? "#f59e0b" : "none"}
                    color={s <= review.rating ? "#f59e0b" : "#555"}
                    style={{ cursor: "pointer", transition: "transform 0.15s" }}
                    onClick={() => setReview((r) => ({ ...r, rating: s }))}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                ))}
              </div>
            </div>
            <textarea
              className="input"
              placeholder="Share your experience with this product..."
              rows={4}
              value={review.text}
              onChange={(e) => setReview((r) => ({ ...r, text: e.target.value }))}
              style={{ marginBottom: 14 }}
            />
            <button className="btn btn-primary" onClick={handleReview} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            {!user && <p style={{ marginTop: 10, fontSize: "0.8rem", color: "var(--text-muted)" }}>You must be logged in to submit a review.</p>}
          </div>

          {/* Approved reviews */}
          {product.approvedReviews?.length > 0 ? (
            <div style={{ display: "grid", gap: 16 }}>
              {product.approvedReviews.map((r, i) => (
                <div key={i} className="glass" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ display: "flex", gap: 3 }}>
                      {[1,2,3,4,5].map((s) => <FiStar key={s} size={13} fill={s<=r.rating?"#f59e0b":"none"} color={s<=r.rating?"#f59e0b":"#555"} />)}
                    </div>
                  </div>
                  <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{r.text}</p>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 8, display: "block" }}>
                    {new Date(r.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)" }}>No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>

      <style>{`@media (max-width: 768px) { .container > div:first-of-type + div { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
