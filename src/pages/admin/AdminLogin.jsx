import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";

export default function AdminLogin() {
  const { adminLogin } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    await new Promise((r) => setTimeout(r, 700));
    const ok = adminLogin(form.username, form.password);
    if (ok) { navigate("/admin/dashboard"); }
    else { setError("Invalid credentials. Check username and password."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex font-jakarta" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>
      <div className="hidden lg:flex w-[42%] flex-col justify-between px-14 py-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10 bg-violet-400 blur-3xl pointer-events-none"/>
        <div className="flex items-center gap-3 relative">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <span className="font-sora text-xl font-bold text-white">The<span className="text-violet-400">Boho</span>Thread</span>
        </div>
        <div className="flex-1 flex flex-col justify-center py-10 relative">
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-7 w-fit"
            style={{ background:"rgba(139,92,246,0.15)", borderColor:"rgba(139,92,246,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400"/>
            <span className="text-xs text-violet-300 font-medium">Restricted Access</span>
          </div>
          <h2 className="font-sora text-4xl font-bold text-white leading-tight tracking-tight mb-5">
            Manage your<br/><span className="text-violet-400">Store</span><br/>with ease.
          </h2>
          <p className="text-sm leading-relaxed max-w-xs mb-10" style={{ color:"rgba(196,181,253,0.65)" }}>
            Add products, update inventory, manage categories and monitor your store from one dashboard.
          </p>
          <ul className="flex flex-col gap-4">
            {["Add & edit products instantly","Drag & drop image uploads","Manage stock & pricing","Category management"].map((f) => (
              <li key={f} className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background:"rgba(139,92,246,0.15)" }}>
                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
                <span className="text-sm" style={{ color:"rgba(196,181,253,0.7)" }}>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-6 pt-8 relative" style={{ borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          {[["🔐","Secure Login"],["⚡","Real-time Updates"],["💾","Auto-save"]].map(([icon, label]) => (
            <div key={label} className="text-center">
              <div className="text-lg mb-1">{icon}</div>
              <div className="text-[11px]" style={{ color:"rgba(196,181,253,0.5)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 py-12" style={{ background:"rgba(255,255,255,0.03)" }}>
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <p className="text-xs font-semibold text-violet-400 tracking-widest uppercase mb-2">Admin Access Only</p>
            <h1 className="font-sora text-2xl font-bold text-white tracking-tight mb-1">Sign in to Admin</h1>
            <p className="text-sm" style={{ color:"rgba(196,181,253,0.6)" }}>Enter your admin credentials to continue</p>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium mb-5 text-center bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color:"rgba(196,181,253,0.7)" }}>Username</label>
              <input type="text" placeholder="admin" value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(139,92,246,0.25)", color:"#fff" }}/>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wide mb-1.5" style={{ color:"rgba(196,181,253,0.7)" }}>Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} placeholder="••••••••••" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-16 rounded-xl text-sm outline-none"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(139,92,246,0.25)", color:"#fff" }}/>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold"
                  style={{ color:"rgba(196,181,253,0.5)" }}>
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-70"
              style={{ background:"linear-gradient(135deg,#7c3aed,#8b5cf6)" }}>
              {loading ? "Authenticating\u2026" : <>Sign In to Admin <span className="text-base"></span></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
