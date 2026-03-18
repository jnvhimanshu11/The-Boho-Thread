import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? "", email: user?.email ?? "",
    phone: "", city: "", bio: "",
  });

  if (!user) return (
    <div className="page-container py-32 text-center">
      <div className="text-6xl mb-4">🔐</div>
      <h2 className="font-sora text-2xl font-bold text-gray-700 mb-3">Please sign in</h2>
      <Link to="/auth" className="btn-primary">Sign In</Link>
    </div>
  );

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); navigate("/auth"); };

  return (
    <div className="page-container py-10 animate-fadeIn">
      <h1 className="font-sora text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600 font-sora text-3xl font-bold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <h2 className="font-sora text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-400 mb-4">{user.email}</p>
            <button className="btn-secondary py-2 px-5 text-xs w-full">Upload Photo</button>
          </div>

          <div className="card p-4">
            {[
              { icon: "📦", label: "My Orders",    to: "/orders" },
              { icon: "❤️", label: "Wishlist",      to: "#" },
              { icon: "🏠", label: "Addresses",     to: "#" },
              { icon: "💳", label: "Payment Methods", to: "#" },
            ].map(item => (
              <Link key={item.label} to={item.to}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                <span className="text-base">🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Main form */}
        <div className="lg:col-span-2">
          <div className="card p-8">
            <h2 className="font-sora text-lg font-bold text-gray-900 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {[
                { label: "Full Name",    key: "name",  type: "text", placeholder: "Jane Doe" },
                { label: "Email",        key: "email", type: "email", placeholder: "you@example.com" },
                { label: "Phone",        key: "phone", type: "tel",  placeholder: "+91 98765 43210" },
                { label: "City",         key: "city",  type: "text", placeholder: "Mumbai" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                    className="input-field"/>
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Bio</label>
                <textarea rows={3} placeholder="Tell us a bit about yourself…" value={form.bio}
                  onChange={e => setForm({...form, bio: e.target.value})}
                  className="input-field resize-none"/>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave}
                className={`btn-primary py-3 px-8 text-sm ${saved ? "!bg-green-500" : ""}`}>
                {saved ? "✓ Saved!" : "Save Changes"}
              </button>
              <button onClick={() => setForm({ name: user.name, email: user.email, phone: "", city: "", bio: "" })}
                className="btn-secondary py-3 px-6 text-sm">Reset</button>
            </div>
          </div>

          <div className="card p-8 mt-6">
            <h2 className="font-sora text-lg font-bold text-gray-900 mb-6">Change Password</h2>
            <div className="space-y-4 max-w-sm">
              {["Current Password","New Password","Confirm New Password"].map(l => (
                <div key={l}>
                  <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">{l}</label>
                  <input type="password" placeholder="••••••••" className="input-field"/>
                </div>
              ))}
              <button className="btn-primary py-3 px-8 text-sm">Update Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
