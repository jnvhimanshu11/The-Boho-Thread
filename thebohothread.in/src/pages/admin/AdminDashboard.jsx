import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import { formatPrice, discount } from "../../data/products";

// ── Size Pricing Editor ───────────────────────────────────────
function SizePricingEditor({ sizePricing, onChange }) {
  const [newSize, setNewSize]   = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newMrp, setNewMrp]     = useState("");
  const inputCls = "bg-gray-50 border border-gray-200 rounded-lg py-2 px-2.5 text-sm text-gray-800 outline-none focus:border-violet-500 focus:bg-white transition-all w-full";

  const addRow = () => {
    if (!newSize.trim() || !newPrice) return;
    onChange([...sizePricing, { size: newSize.trim().toUpperCase(), price: Number(newPrice), originalPrice: Number(newMrp) || Number(newPrice) }]);
    setNewSize(""); setNewPrice(""); setNewMrp("");
  };
  const removeRow  = (i)           => onChange(sizePricing.filter((_, idx) => idx !== i));
  const updateRow  = (i, field, v) => onChange(sizePricing.map((r, idx) => idx === i ? { ...r, [field]: field === "size" ? v : Number(v) } : r));

  return (
    <div className="md:col-span-2">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-semibold text-gray-500 tracking-wide">Size-wise Pricing</label>
        {sizePricing.length > 0 && <span className="text-[11px] text-violet-500 font-medium">{sizePricing.length} size{sizePricing.length > 1 ? "s" : ""} added</span>}
      </div>
      {sizePricing.length > 0 && (
        <div className="mb-3 border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_1fr_36px] gap-2 px-3 py-2 bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            <span>Size</span><span>Selling Price</span><span>MRP</span><span/>
          </div>
          {sizePricing.map((row, i) => (
            <div key={i} className="grid grid-cols-[80px_1fr_1fr_36px] gap-2 px-3 py-2 border-t border-gray-100 items-center">
              <input value={row.size} onChange={e => updateRow(i, "size", e.target.value)} className={inputCls} placeholder="S"/>
              <input type="number" value={row.price} onChange={e => updateRow(i, "price", e.target.value)} className={inputCls} placeholder="299"/>
              <input type="number" value={row.originalPrice} onChange={e => updateRow(i, "originalPrice", e.target.value)} className={inputCls} placeholder="499"/>
              <button onClick={() => removeRow(i)} className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[80px_1fr_1fr_auto] gap-2 items-end">
        <div><p className="text-[11px] text-gray-400 mb-1">Size</p><input value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="e.g. M" className={inputCls} onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addRow())}/></div>
        <div><p className="text-[11px] text-gray-400 mb-1">Selling Price (Rs.)</p><input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="299" className={inputCls} onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addRow())}/></div>
        <div><p className="text-[11px] text-gray-400 mb-1">MRP (Rs.)</p><input type="number" value={newMrp} onChange={e => setNewMrp(e.target.value)} placeholder="499" className={inputCls} onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addRow())}/></div>
        <button type="button" onClick={addRow} className="h-9 px-4 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all hover:-translate-y-0.5" style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>Add
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">Leave empty for single-price products (electronics, books, etc.)</p>
    </div>
  );
}

// ── Product Form ──────────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel, title, categories, badges }) {
  const EMPTY = { name:"", category: categories[0] || "", price:"", originalPrice:"", rating:"4.5", reviews:"0", stock:"", badge:"", description:"", images:["", "", "", "", "", "", "", "", "", ""], tags:"", sizePricing:[] };
  const [form, setForm] = useState(initial || EMPTY);
  const [saving, setSaving] = useState(false);
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { alert("Product name is required."); return; }
    if (!form.sizePricing?.length && !form.price) { alert("Set a base price or add size-wise pricing."); return; }
    if (!form.stock) { alert("Stock is required."); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-sora text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Product Name *</label>
              <input value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Boho Floral Shirt" className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Category *</label>
              <select value={form.category} onChange={e => f("category", e.target.value)} className={inputCls}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Badge</label>
              <select value={form.badge || ""} onChange={e => f("badge", e.target.value)} className={inputCls}>
                <option value="">None</option>
                {badges.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <SizePricingEditor sizePricing={form.sizePricing || []} onChange={v => f("sizePricing", v)}/>
            {(!form.sizePricing?.length) && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Base Selling Price (Rs.) *</label>
                  <input type="number" value={form.price} onChange={e => f("price", e.target.value)} placeholder="999" className={inputCls}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Original / MRP (Rs.)</label>
                  <input type="number" value={form.originalPrice} onChange={e => f("originalPrice", e.target.value)} placeholder="1299" className={inputCls}/>
                </div>
              </>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Total Stock *</label>
              <input type="number" value={form.stock} onChange={e => f("stock", e.target.value)} placeholder="50" className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => f("rating", e.target.value)} placeholder="4.5" className={inputCls}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">No. of Reviews</label>
              <input type="number" value={form.reviews} onChange={e => f("reviews", e.target.value)} placeholder="0" className={inputCls}/>
            </div>
            
            {/* Image URLs — 1 required, up to 10 total */}
<div className="md:col-span-2">
  <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-3">
    Product Images (up to 10)
  </label>
  <div className="space-y-2.5">
    {Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        {/* Preview thumbnail */}
        <div className="w-10 h-10 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
          {form.images[i] ? (
            <img
              src={form.images[i]}
              alt={`img-${i}`}
              className="w-full h-full object-cover"
              onError={e => { e.target.style.display = "none"; }}
            />
          ) : (
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          )}
        </div>

        {/* Input */}
        <div className="flex-1 relative">
          <input
            value={form.images[i] || ""}
            onChange={e => {
              const updated = [...(form.images || [])];
              updated[i] = e.target.value;
              f("images", updated);
            }}
            placeholder={i === 0 ? "Image URL 1 (required) *" : `Image URL ${i + 1} (optional)`}
            className={inputCls}
          />
          {/* Clear button */}
          {form.images[i] && (
            <button
              type="button"
              onClick={() => {
                const updated = [...(form.images || [])];
                updated[i] = "";
                f("images", updated);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-gray-400 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Required badge */}
        {i === 0 && (
          <span className="text-[10px] font-bold text-red-400 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0">
            Required
          </span>
        )}
      </div>
    ))}
  </div>

  {/* Filled images count */}
  {form.images?.filter(Boolean).length > 0 && (
    <p className="text-[11px] text-indigo-500 font-medium mt-2">
      {form.images.filter(Boolean).length} image{form.images.filter(Boolean).length > 1 ? "s" : ""} added
    </p>
  )}
</div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Tags (comma-separated)</label>
              <input value={typeof form.tags==="string"?form.tags:form.tags?.join(", ")} onChange={e => f("tags", e.target.value)} placeholder="shirt, cotton, boho" className={inputCls}/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Description *</label>
              <textarea rows={3} value={form.description} onChange={e => f("description", e.target.value)} placeholder="Describe the product..." className={`${inputCls} resize-none`}/>
            </div>
          </div>
          {form.images[0] && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <img src={form.images[0]} alt="preview" className="w-14 h-14 object-cover rounded-lg border border-gray-200" onError={e => { e.target.style.display="none"; }}/>
              <div>
                <p className="text-sm font-semibold text-gray-800">{form.name||"Product name"}</p>
                {form.sizePricing?.length > 0
                  ? <p className="text-xs text-violet-600 font-medium">From {formatPrice(Math.min(...form.sizePricing.map(s=>s.price)))} · {form.sizePricing.length} sizes</p>
                  : <p className="text-xs text-gray-400">{form.price ? formatPrice(Number(form.price)) : "No price set"}</p>}
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-70" style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
              {saving ? "Saving..." : title.includes("Edit") ? "Save Changes" : "Add Product"}
            </button>
            <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────
function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:"rgba(0,0,0,0.5)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </div>
        <h3 className="font-sora text-lg font-bold text-gray-900 mb-2">Delete?</h3>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <strong className="text-gray-700">"{name}"</strong>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Categories Tab ────────────────────────────────────────────
function CategoriesTab({ categories, addCategory, deleteCategory, resetCategories, products }) {
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (categories.includes(name)) { showToast("Category already exists!"); return; }
    addCategory(name);
    setNewName("");
    showToast(`✅ "${name}" added!`);
  };

  const handleDelete = () => {
    deleteCategory(deleteTarget);
    showToast(`🗑️ "${deleteTarget}" deleted.`);
    setDeleteTarget(null);
  };

  const COLORS = ["bg-blue-50 text-blue-700 border-blue-200","bg-pink-50 text-pink-700 border-pink-200","bg-amber-50 text-amber-700 border-amber-200","bg-green-50 text-green-700 border-green-200","bg-purple-50 text-purple-700 border-purple-200","bg-red-50 text-red-700 border-red-200","bg-indigo-50 text-indigo-700 border-indigo-200","bg-teal-50 text-teal-700 border-teal-200"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sora text-xl font-bold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage product categories — these appear in product forms and store filters</p>
        </div>
        <button onClick={() => { if (window.confirm("Reset categories to defaults?")) { resetCategories(); showToast("Reset done."); }}}
          className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-red-200 hover:bg-red-50 transition-all">
          Reset to defaults
        </button>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Add New Category</h3>
        <div className="flex gap-3">
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Accessories, Footwear, Jewellery..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all"
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <button onClick={handleAdd}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Category
          </button>
        </div>
      </div>

      {/* Category list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide grid grid-cols-[1fr_80px_100px]">
          <span>Category Name</span><span className="text-center">Products</span><span className="text-right">Action</span>
        </div>
        {categories.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No categories yet. Add one above.</div>
        ) : (
          categories.map((cat, i) => {
            const count = products.filter(p => p.category === cat).length;
            const colorCls = COLORS[i % COLORS.length];
            return (
              <div key={cat} className={`grid grid-cols-[1fr_80px_100px] px-5 py-4 items-center ${i < categories.length-1 ? "border-b border-gray-100" : ""} hover:bg-gray-50/50 transition-colors`}>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colorCls}`}>
                    {cat}
                  </span>
                </div>
                <span className="text-center text-sm font-semibold text-gray-600">{count}</span>
                <div className="flex justify-end">
                  <button onClick={() => setDeleteTarget(cat)}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-200 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {deleteTarget && <DeleteModal name={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}/>}
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>}
    </div>
  );
}

// ── Badges Tab ────────────────────────────────────────────────
function BadgesTab({ badges, addBadge, deleteBadge, resetBadges, products }) {
  const [newName, setNewName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    if (badges.includes(name)) { showToast("Badge already exists!"); return; }
    addBadge(name);
    setNewName("");
    showToast(`✅ "${name}" badge added!`);
  };

  const handleDelete = () => {
    deleteBadge(deleteTarget);
    showToast(`🗑️ "${deleteTarget}" deleted.`);
    setDeleteTarget(null);
  };

  const BADGE_COLORS = [
    "bg-indigo-50 text-indigo-700","bg-red-50 text-red-700","bg-amber-50 text-amber-700",
    "bg-green-50 text-green-700","bg-blue-50 text-blue-700","bg-purple-50 text-purple-700",
    "bg-pink-50 text-pink-700","bg-teal-50 text-teal-700","bg-orange-50 text-orange-700",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-sora text-xl font-bold text-gray-900">Product Badges</h2>
          <p className="text-sm text-gray-400 mt-0.5">Manage badges — labels shown on product cards like "New", "Hot", "Sale"</p>
        </div>
        <button onClick={() => { if (window.confirm("Reset badges to defaults?")) { resetBadges(); showToast("Reset done."); }}}
          className="text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-red-200 hover:bg-red-50 transition-all">
          Reset to defaults
        </button>
      </div>

      {/* Add new */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-800 text-sm mb-4">Add New Badge</h3>
        <div className="flex gap-3">
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="e.g. Limited Edition, Trending, Exclusive..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-violet-500 focus:bg-white focus:ring-2 focus:ring-violet-500/10 transition-all"
            onKeyDown={e => e.key === "Enter" && handleAdd()}
          />
          <button onClick={handleAdd}
            className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            Add Badge
          </button>
        </div>
      </div>

      {/* Badge grid */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <p className="text-xs text-gray-400 font-medium mb-4 uppercase tracking-wide">All Badges ({badges.length})</p>
        {badges.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No badges yet. Add one above.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {badges.map((badge, i) => {
              const usedIn = products.filter(p => p.badge === badge).length;
              const colorCls = BADGE_COLORS[i % BADGE_COLORS.length];
              return (
                <div key={badge} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-gray-200 transition-all">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${colorCls}`}>
                      {badge}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1.5 ml-0.5">{usedIn} product{usedIn !== 1 ? "s" : ""}</p>
                  </div>
                  <button onClick={() => setDeleteTarget(badge)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {deleteTarget && <DeleteModal name={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}/>}
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>}
    </div>
  );
}

// ── Products Tab ──────────────────────────────────────────────
function ProductsTab({ products, categories, badges, addProduct, updateProduct, deleteProduct, resetProducts }) {
  const [search,     setSearch]     = useState("");
  const [catFilter,  setCatFilter]  = useState("All");
  const [showAdd,    setShowAdd]    = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toast,      setToast]      = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const allCats = ["All", ...categories];
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (catFilter === "All" || p.category === catFilter) &&
           (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  });

  const handleAdd    = (form) => { addProduct(form);                 setShowAdd(false);  showToast("✅ Product added!"); };
  const handleEdit   = (form) => { updateProduct(editItem.id, form); setEditItem(null);  showToast("✏️ Product updated!"); };
  const handleDelete = ()     => { deleteProduct(deleteItem.id);     setDeleteItem(null); showToast("🗑️ Product deleted."); };

  const totalStock = products.reduce((s, p) => s + Number(p.stock || 0), 0);
  const outOfStock = products.filter(p => Number(p.stock) === 0).length;

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Total Products", value:products.length,  icon:"📦", bg:"bg-violet-50" },
          { label:"Total Stock",    value:totalStock,        icon:"🏭", bg:"bg-blue-50" },
          { label:"Categories",     value:categories.length, icon:"🏷️", bg:"bg-green-50" },
          { label:"Out of Stock",   value:outOfStock,        icon:"⚠️", bg:"bg-red-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${s.bg}`}>{s.icon}</div>
            <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p><p className="font-sora text-2xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"/>
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-violet-500 cursor-pointer">
          {allCats.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} products</span>
        <button onClick={() => { if (window.confirm("Reset all products to default?")) { resetProducts(); showToast("Products reset."); }}}
          className="ml-auto text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-red-200 hover:bg-red-50 transition-all">
          Reset to defaults
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-sora text-lg font-bold text-gray-600 mb-2">No products found</h3>
          <button onClick={() => setShowAdd(true)} className="text-violet-500 font-semibold text-sm hover:underline mt-2">+ Add your first product</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide"
            style={{ gridTemplateColumns:"56px 1fr 110px 130px 70px 130px 90px" }}>
            <span>Image</span><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Sizes & Pricing</span><span className="text-right">Actions</span>
          </div>
          {filtered.map((p, i) => {
            const hasSizePricing = p.sizePricing?.length > 0;
            const baseDisc = !hasSizePricing && p.originalPrice > p.price ? discount(p.price, p.originalPrice) : 0;
            return (
              <div key={p.id}
                className={`grid gap-3 px-5 py-4 items-center transition-colors hover:bg-gray-50/50 ${i < filtered.length-1 ? "border-b border-gray-100" : ""}`}
                style={{ gridTemplateColumns:"56px 1fr 110px 130px 70px 130px 90px" }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.style.display="none"; }}/> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🖼</div>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                    {p.badge && <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full shrink-0">{p.badge}</span>}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">{p.description?.slice(0,45)}...</p>
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full w-fit">{p.category}</span>
                <div>
                  {hasSizePricing
                    ? <p className="text-sm font-bold text-violet-600">From {formatPrice(Math.min(...p.sizePricing.map(s=>s.price)))}</p>
                    : <><p className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</p>{baseDisc>0&&<p className="text-[11px] text-green-600 font-medium">{baseDisc}% off</p>}</>}
                </div>
                <span className={`text-sm font-semibold ${Number(p.stock)===0?"text-red-500":Number(p.stock)<=5?"text-amber-600":"text-gray-700"}`}>
                  {Number(p.stock)===0?"Out":p.stock}
                </span>
                <div>
                  {hasSizePricing ? (
                    <div className="flex flex-wrap gap-1">
                      {p.sizePricing.slice(0,3).map(s => <span key={s.size} className="text-[10px] font-semibold bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-md" title={formatPrice(s.price)}>{s.size}: {formatPrice(s.price)}</span>)}
                      {p.sizePricing.length>3 && <span className="text-[10px] text-gray-400 self-center">+{p.sizePricing.length-3}</span>}
                    </div>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setEditItem(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all" title="Edit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={() => setDeleteItem(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Delete">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd   && <ProductForm title="Add New Product" initial={null} onSave={handleAdd} onCancel={() => setShowAdd(false)} categories={categories} badges={badges}/>}
      {editItem  && <ProductForm title={`Edit — ${editItem.name}`} initial={{ ...editItem, tags: editItem.tags?.join(", ")||"", images:[...(editItem.images || []), "", "", "", "", "", "", "", "", "", ""].slice(0, 10), sizePricing: editItem.sizePricing||[] }} onSave={handleEdit} onCancel={() => setEditItem(null)} categories={categories} badges={badges}/>}
      {deleteItem && <DeleteModal name={deleteItem.name} onConfirm={handleDelete} onCancel={() => setDeleteItem(null)}/>}
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>}

      {/* Add product floating button in products tab */}
      <div className="flex justify-end mt-6">
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30" style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add Another Product
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts, adminLogout,
          categories, addCategory, deleteCategory, resetCategories,
          badges, addBadge, deleteBadge, resetBadges } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");

  const TABS = [
    { id:"products",   label:"Products",   icon:"📦", count: products.length },
    { id:"categories", label:"Categories", icon:"🏷️", count: categories.length },
    { id:"badges",     label:"Badges",     icon:"⭐", count: badges.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-jakarta">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-sora font-bold text-gray-900">The<span className="text-violet-500">Boho</span>Thread</span>
            <span className="text-[10px] font-bold tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full ml-1">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl px-3 py-1.5 hover:bg-gray-50 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              View Store
            </a>
            <button onClick={() => { adminLogout(); navigate("/admin"); }} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 border border-red-100 rounded-xl px-3 py-1.5 hover:bg-red-50 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Page title + Add button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sora text-2xl font-bold text-gray-900 tracking-tight">Store Manager</h1>
            <p className="text-sm text-gray-400 mt-1">Manage products, categories and badges</p>
          </div>
          {activeTab === "products" && (
            <button
              onClick={() => document.dispatchEvent(new CustomEvent("openAddProduct"))}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Add Product
            </button>
          )}
          {activeTab === "categories" && (
            <button onClick={() => document.getElementById("cat-input")?.focus()}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Add Category
            </button>
          )}
          {activeTab === "badges" && (
            <button onClick={() => document.getElementById("badge-input")?.focus()}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30"
              style={{ background:"linear-gradient(135deg,#7c3aed,#6366f1)" }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
              Add Badge
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 mb-8 w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-white shadow-md"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              style={activeTab === tab.id ? { background:"linear-gradient(135deg,#7c3aed,#6366f1)" } : {}}>
              <span className="text-base">{tab.icon}</span>
              {tab.label}
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "products" && (
          <ProductsTabWrapper
            products={products} categories={categories} badges={badges}
            addProduct={addProduct} updateProduct={updateProduct}
            deleteProduct={deleteProduct} resetProducts={resetProducts}
          />
        )}
        {activeTab === "categories" && (
          <CategoriesTab
            categories={categories} addCategory={addCategory}
            deleteCategory={deleteCategory} resetCategories={resetCategories}
            products={products}
          />
        )}
        {activeTab === "badges" && (
          <BadgesTab
            badges={badges} addBadge={addBadge}
            deleteBadge={deleteBadge} resetBadges={resetBadges}
            products={products}
          />
        )}
      </div>
    </div>
  );
}

// Wrapper to handle the custom event for Add Product button in header
function ProductsTabWrapper(props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [toast,      setToast]      = useState("");
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Listen for header "Add Product" button
  useState(() => {
    const handler = () => setShowAdd(true);
    document.addEventListener("openAddProduct", handler);
    return () => document.removeEventListener("openAddProduct", handler);
  });

  const { products, categories, badges, addProduct, updateProduct, deleteProduct, resetProducts } = props;
  const [search,    setSearch]    = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const allCats  = ["All", ...categories];
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    return (catFilter === "All" || p.category === catFilter) &&
           (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  });

  const handleAdd    = (form) => { addProduct(form);                 setShowAdd(false);   showToast("✅ Product added!"); };
  const handleEdit   = (form) => { updateProduct(editItem.id, form); setEditItem(null);   showToast("✏️ Product updated!"); };
  const handleDelete = ()     => { deleteProduct(deleteItem.id);     setDeleteItem(null); showToast("🗑️ Product deleted."); };

  const totalStock = products.reduce((s, p) => s + Number(p.stock || 0), 0);
  const outOfStock = products.filter(p => Number(p.stock) === 0).length;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:"Total Products", value:products.length,  icon:"📦", bg:"bg-violet-50" },
          { label:"Total Stock",    value:totalStock,        icon:"🏭", bg:"bg-blue-50" },
          { label:"Categories",     value:categories.length, icon:"🏷️", bg:"bg-green-50" },
          { label:"Out of Stock",   value:outOfStock,        icon:"⚠️", bg:"bg-red-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${s.bg}`}>{s.icon}</div>
            <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p><p className="font-sora text-2xl font-bold text-gray-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all"/>
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-violet-500 cursor-pointer">
          {allCats.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="text-sm text-gray-400">{filtered.length} products</span>
        <button onClick={() => { if (window.confirm("Reset all products to default?")) { resetProducts(); showToast("Products reset."); }}}
          className="ml-auto text-xs text-gray-400 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-2 hover:border-red-200 hover:bg-red-50 transition-all">Reset to defaults</button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="font-sora text-lg font-bold text-gray-600 mb-2">No products found</h3>
          <button onClick={() => setShowAdd(true)} className="text-violet-500 font-semibold text-sm hover:underline mt-2">+ Add your first product</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide"
            style={{ gridTemplateColumns:"56px 1fr 110px 130px 70px 130px 90px" }}>
            <span>Image</span><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Sizes & Pricing</span><span className="text-right">Actions</span>
          </div>
          {filtered.map((p, i) => {
            const hasSP = p.sizePricing?.length > 0;
            const baseDisc = !hasSP && p.originalPrice > p.price ? discount(p.price, p.originalPrice) : 0;
            return (
              <div key={p.id} className={`grid gap-3 px-5 py-4 items-center transition-colors hover:bg-gray-50/50 ${i < filtered.length-1 ? "border-b border-gray-100" : ""}`}
                style={{ gridTemplateColumns:"56px 1fr 110px 130px 70px 130px 90px" }}>
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" onError={e=>{e.target.style.display="none";}}/> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">🖼</div>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                    {p.badge && <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full shrink-0">{p.badge}</span>}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1">{p.description?.slice(0,45)}...</p>
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full w-fit">{p.category}</span>
                <div>
                  {hasSP ? <p className="text-sm font-bold text-violet-600">From {formatPrice(Math.min(...p.sizePricing.map(s=>s.price)))}</p>
                    : <><p className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</p>{baseDisc>0&&<p className="text-[11px] text-green-600 font-medium">{baseDisc}% off</p>}</>}
                </div>
                <span className={`text-sm font-semibold ${Number(p.stock)===0?"text-red-500":Number(p.stock)<=5?"text-amber-600":"text-gray-700"}`}>
                  {Number(p.stock)===0?"Out":p.stock}
                </span>
                <div>
                  {hasSP ? (
                    <div className="flex flex-wrap gap-1">
                      {p.sizePricing.slice(0,3).map(s=><span key={s.size} className="text-[10px] font-semibold bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-md">{s.size}: {formatPrice(s.price)}</span>)}
                      {p.sizePricing.length>3&&<span className="text-[10px] text-gray-400 self-center">+{p.sizePricing.length-3}</span>}
                    </div>
                  ) : <span className="text-xs text-gray-300">—</span>}
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setEditItem(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={() => setDeleteItem(p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd   && <ProductForm title="Add New Product" initial={null} onSave={handleAdd} onCancel={() => setShowAdd(false)} categories={categories} badges={badges}/>}
      {editItem  && <ProductForm title={`Edit — ${editItem.name}`} initial={{ ...editItem, tags:editItem.tags?.join(", ")||"", images:[...(editItem.images || []), "", "", "", "", "", "", "", "", "", ""].slice(0, 10), sizePricing:editItem.sizePricing||[] }} onSave={handleEdit} onCancel={() => setEditItem(null)} categories={categories} badges={badges}/>}
      {deleteItem && <DeleteModal name={deleteItem.name} onConfirm={handleDelete} onCancel={() => setDeleteItem(null)}/>}
      {toast && <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{toast}</div>}
    </div>
  );
}
