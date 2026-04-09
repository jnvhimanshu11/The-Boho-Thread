// src/pages/Admin.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  onSnapshot, serverTimestamp, query, where
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiTag, FiPercent, FiLayers, FiStar } from "react-icons/fi";

const TABS = ["Products", "Categories", "Badges", "Reviews", "Coupons", "Campaigns"];

export default function Admin() {
  const { isAdmin, adminLogin, adminLogout } = useAuth();
  const [creds, setCreds] = useState({ u: "", p: "" });
  const [tab, setTab] = useState("Products");

  if (!isAdmin) return <AdminLogin creds={creds} setCreds={setCreds} adminLogin={adminLogin} />;

  return (
    <div style={{ position: "relative", zIndex: 1, padding: "100px 0 60px" }}>
      <div className="container">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem", fontWeight: 900 }}>
              Admin Dashboard
            </h1>
            <p style={{ color: "var(--text-muted)", marginTop: 4 }}>Manage your store</p>
          </div>
          <button className="btn btn-outline" onClick={adminLogout}>Logout</button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "10px 22px",
                borderRadius: 50,
                border: `1px solid ${tab === t ? "#7c3aed" : "rgba(255,255,255,0.1)"}`,
                background: tab === t ? "rgba(124,58,237,0.2)" : "transparent",
                color: tab === t ? "#a78bfa" : "var(--text-muted)",
                cursor: "pointer",
                fontWeight: 500,
                transition: "all 0.2s",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Products" && <ProductsTab />}
        {tab === "Categories" && <SimpleListTab collectionName="categories" label="Category" />}
        {tab === "Badges" && <SimpleListTab collectionName="badges" label="Badge" />}
        {tab === "Reviews" && <ReviewsTab />}
        {tab === "Coupons" && <CouponsTab />}
        {tab === "Campaigns" && <CampaignsTab />}
      </div>
    </div>
  );
}

// ─── Admin Login ─────────────────────────────────────────────
function AdminLogin({ creds, setCreds, adminLogin }) {
  const [err, setErr] = useState("");
  const handleSubmit = () => {
    if (!adminLogin(creds.u, creds.p)) setErr("Invalid credentials");
  };
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, position: "relative", padding: "80px 24px" }}>
      <div className="glass" style={{ width: "100%", maxWidth: 400, padding: "48px 40px", textAlign: "center" }}>
        <FiLayers size={40} style={{ color: "#7c3aed", marginBottom: 20 }} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", marginBottom: 8 }}>Admin Access</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 28, fontSize: "0.9rem" }}>Enter your admin credentials</p>
        <input className="input" placeholder="Username" style={{ marginBottom: 12 }} value={creds.u} onChange={(e) => setCreds((c) => ({ ...c, u: e.target.value }))} />
        <input className="input" type="password" placeholder="Password" style={{ marginBottom: 16 }} value={creds.p} onChange={(e) => setCreds((c) => ({ ...c, p: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
        {err && <p style={{ color: "#f87171", marginBottom: 12, fontSize: "0.85rem" }}>{err}</p>}
        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "14px" }} onClick={handleSubmit}>
          <FiLayers /> Access Dashboard
        </button>
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [badges, setBadges] = useState([]);
  const [form, setForm] = useState(null); // null = hidden, {} = new, {...} = edit
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "products"), (s) => setProducts(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, "categories"), (s) => setCategories(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(collection(db, "badges"), (s) => setBadges(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); };
  }, []);

  const empty = { name: "", description: "", price: "", category: "", badge: "", imageUrl: "", imageUrls: [], salePercent: "", stock: "" };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error("Name and price required"); return; }
    setSaving(true);
    try {
      const data = {
        name: form.name,
        description: form.description || "",
        price: parseFloat(form.price),
        category: form.category || "",
        badge: form.badge || "",
        imageUrl: form.imageUrl || "",
        imageUrls: form.imageUrls || [],
        salePercent: form.salePercent ? parseFloat(form.salePercent) : 0,
        stock: form.stock ? parseInt(form.stock) : 99,
        approvedReviews: form.approvedReviews || [],
        updatedAt: serverTimestamp(),
      };
      if (form.id) {
        await updateDoc(doc(db, "products", form.id), data);
        toast.success("Product updated!");
      } else {
        await addDoc(collection(db, "products"), { ...data, createdAt: serverTimestamp() });
        toast.success("Product added!");
      }
      setForm(null);
    } catch (e) {
      toast.error("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    toast.success("Deleted");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setForm(empty)}>
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Product form modal */}
      {form && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(10px)" }}>
          <div className="glass" style={{ width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", padding: 32 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", marginBottom: 24 }}>
              {form.id ? "Edit Product" : "Add Product"}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Product Name *"><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
              <Field label="Price (₹) *"><input className="input" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></Field>
              <Field label="Category">
                <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  <option value="">Select...</option>
                  {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Badge">
                <select className="input" value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}>
                  <option value="">None</option>
                  {badges.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </Field>
              <Field label="Sale % (0 = no sale)"><input className="input" type="number" value={form.salePercent} onChange={(e) => setForm((f) => ({ ...f, salePercent: e.target.value }))} /></Field>
              <Field label="Stock"><input className="input" type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} /></Field>
            </div>

            <Field label="Description" style={{ marginTop: 14 }}>
              <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>

            <Field label="Main Image URL" style={{ marginTop: 14 }}>
              <input className="input" placeholder="https://example.com/image.jpg" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
              {form.imageUrl && <img src={form.imageUrl} alt="" style={{ marginTop: 8, width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />}
            </Field>

            <Field label="Additional Images (comma-separated URLs)" style={{ marginTop: 14 }}>
              <input
                className="input"
                placeholder="url1, url2, url3"
                value={(form.imageUrls || []).join(", ")}
                onChange={(e) => setForm((f) => ({ ...f, imageUrls: e.target.value.split(",").map((u) => u.trim()).filter(Boolean) }))}
              />
            </Field>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
                {saving ? "Saving..." : form.id ? "Update" : "Add Product"}
              </button>
              <button className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Product list */}
      <div style={{ display: "grid", gap: 12 }}>
        {products.map((p) => (
          <div key={p.id} className="glass" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <img src={p.imageUrl || "https://via.placeholder.com/60x60/1a0a2e/7c3aed?text=P"} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 10 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "1rem" }}>{p.name}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 2 }}>
                ₹{p.price} · {p.category || "Uncategorized"} {p.badge && `· ${p.badge}`} {p.salePercent > 0 && `· ${p.salePercent}% off`}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-outline" style={{ padding: "8px 12px" }} onClick={() => setForm({ ...p })}>
                <FiEdit2 />
              </button>
              <button className="btn btn-danger" style={{ padding: "8px 12px" }} onClick={() => handleDelete(p.id)}>
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Simple List Tab (Categories/Badges) ──────────────────────
function SimpleListTab({ collectionName, label }) {
  const [items, setItems] = useState([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    return onSnapshot(collection(db, collectionName), (s) => setItems(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, [collectionName]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addDoc(collection(db, collectionName), { name: newName.trim(), createdAt: serverTimestamp() });
    setNewName("");
    toast.success(`${label} added!`);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, collectionName, id));
    toast.success("Deleted");
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input className="input" placeholder={`New ${label} name`} value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <button className="btn btn-primary" onClick={handleAdd}><FiPlus /> Add</button>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => (
          <div key={item.id} className="glass" style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FiTag color="#7c3aed" />
              <span>{item.name}</span>
            </div>
            <button className="btn btn-danger" style={{ padding: "6px 10px" }} onClick={() => handleDelete(item.id)}><FiTrash2 /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────
function ReviewsTab() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    return onSnapshot(
      query(collection(db, "reviews"), where("approved", "==", false)),
      (s) => setPending(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const approve = async (review) => {
    // Add to product's approvedReviews array
    const productRef = doc(db, "products", review.productId);
    const productSnap = await (await import("firebase/firestore")).getDoc(productRef);
    const product = productSnap.data();
    const approved = [...(product.approvedReviews || []), { uid: review.uid, name: review.userName, rating: review.rating, text: review.text, date: new Date().toISOString() }];
    await updateDoc(productRef, { approvedReviews: approved });
    await updateDoc(doc(db, "reviews", review.id), { approved: true });
    toast.success("Review approved!");
  };

  const reject = async (id) => {
    await deleteDoc(doc(db, "reviews", id));
    toast.success("Review rejected");
  };

  if (pending.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No pending reviews ✅</div>;
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {pending.map((r) => (
        <div key={r.id} className="glass" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <span style={{ fontWeight: 600 }}>{r.userName}</span>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginLeft: 10 }}>{r.productName}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1,2,3,4,5].map((s) => <FiStar key={s} size={14} fill={s<=r.rating?"#f59e0b":"none"} color={s<=r.rating?"#f59e0b":"#555"} />)}
            </div>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 14 }}>{r.text}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" style={{ padding: "8px 18px" }} onClick={() => approve(r)}><FiCheck /> Approve</button>
            <button className="btn btn-danger" style={{ padding: "8px 18px" }} onClick={() => reject(r.id)}><FiX /> Reject</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Coupons Tab ─────────────────────────────────────────────
function CouponsTab() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", discount: "", minOrder: "", expiresAt: "", maxUses: "" });

  useEffect(() => {
    return onSnapshot(collection(db, "coupons"), (s) => setCoupons(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleAdd = async () => {
    if (!form.code || !form.discount) { toast.error("Code and discount required"); return; }
    await addDoc(collection(db, "coupons"), { ...form, discount: parseFloat(form.discount), minOrder: parseFloat(form.minOrder) || 0, maxUses: parseInt(form.maxUses) || 9999, uses: 0, active: true, createdAt: serverTimestamp() });
    setForm({ code: "", discount: "", minOrder: "", expiresAt: "", maxUses: "" });
    toast.success("Coupon created!");
  };

  const handleToggle = async (c) => {
    await updateDoc(doc(db, "coupons", c.id), { active: !c.active });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "coupons", id));
    toast.success("Coupon deleted");
  };

  return (
    <div>
      <div className="glass" style={{ padding: 24, marginBottom: 24, maxWidth: 600 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Create Coupon</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Code"><input className="input" placeholder="SAVE20" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} /></Field>
          <Field label="Discount %"><input className="input" type="number" placeholder="20" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} /></Field>
          <Field label="Min Order (₹)"><input className="input" type="number" placeholder="500" value={form.minOrder} onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))} /></Field>
          <Field label="Max Uses"><input className="input" type="number" placeholder="100" value={form.maxUses} onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))} /></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleAdd}><FiPercent /> Create Coupon</button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {coupons.map((c) => (
          <div key={c.id} className="glass" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <code style={{ background: "rgba(245,158,11,0.1)", border: "1px dashed rgba(245,158,11,0.4)", borderRadius: 8, padding: "4px 14px", color: "#fbbf24", fontWeight: 700, fontSize: "1rem" }}>{c.code}</code>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{c.discount}% OFF</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Min order: ₹{c.minOrder} · Used {c.uses}/{c.maxUses}</div>
            </div>
            <button onClick={() => handleToggle(c)} style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${c.active ? "#34d399" : "#555"}`, background: c.active ? "rgba(16,185,129,0.1)" : "transparent", color: c.active ? "#34d399" : "#555", cursor: "pointer", fontSize: "0.8rem" }}>
              {c.active ? "Active" : "Inactive"}
            </button>
            <button className="btn btn-danger" style={{ padding: "6px 10px" }} onClick={() => handleDelete(c.id)}><FiTrash2 /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Campaigns Tab ────────────────────────────────────────────
function CampaignsTab() {
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", couponCode: "", discount: "", active: true });

  useEffect(() => {
    return onSnapshot(collection(db, "campaigns"), (s) => setCampaigns(s.docs.map((d) => ({ id: d.id, ...d.data() }))));
  }, []);

  const handleAdd = async () => {
    if (!form.title) { toast.error("Title required"); return; }
    await addDoc(collection(db, "campaigns"), { ...form, discount: parseFloat(form.discount) || 0, createdAt: serverTimestamp() });
    setForm({ title: "", description: "", couponCode: "", discount: "", active: true });
    toast.success("Campaign created!");
  };

  const handleToggle = async (c) => {
    await updateDoc(doc(db, "campaigns", c.id), { active: !c.active });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "campaigns", id));
    toast.success("Campaign deleted");
  };

  return (
    <div>
      <div className="glass" style={{ padding: 24, marginBottom: 24, maxWidth: 600 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Create Campaign</h3>
        <Field label="Title"><input className="input" placeholder="Summer Sale" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
        <Field label="Description" style={{ marginTop: 12 }}><input className="input" placeholder="Get up to 50% off on all items" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <Field label="Coupon Code"><input className="input" placeholder="SUMMER50" value={form.couponCode} onChange={(e) => setForm((f) => ({ ...f, couponCode: e.target.value.toUpperCase() }))} /></Field>
          <Field label="Discount %"><input className="input" type="number" placeholder="50" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} /></Field>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleAdd}><FiPlus /> Create Campaign</button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {campaigns.map((c) => (
          <div key={c.id} className="glass" style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>{c.title}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 2 }}>{c.description}</div>
              {c.couponCode && <code style={{ marginTop: 6, display: "inline-block", background: "rgba(245,158,11,0.1)", border: "1px dashed rgba(245,158,11,0.3)", borderRadius: 6, padding: "2px 10px", color: "#fbbf24", fontSize: "0.85rem" }}>{c.couponCode} · {c.discount}% OFF</code>}
            </div>
            <button onClick={() => handleToggle(c)} style={{ padding: "6px 16px", borderRadius: 20, border: `1px solid ${c.active ? "#34d399" : "#555"}`, background: c.active ? "rgba(16,185,129,0.1)" : "transparent", color: c.active ? "#34d399" : "#555", cursor: "pointer", fontSize: "0.8rem" }}>
              {c.active ? "Active" : "Inactive"}
            </button>
            <button className="btn btn-danger" style={{ padding: "6px 10px" }} onClick={() => handleDelete(c.id)}><FiTrash2 /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: "block", marginBottom: 6, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}
