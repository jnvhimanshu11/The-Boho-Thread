import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PasswordStrength({ password }) {
  const score =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return password.length > 0 ? (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${score >= i ? colors[score] : "bg-gray-200"}`}/>
        ))}
      </div>
      <p className="text-[11px] text-gray-400">{labels[score]} password</p>
    </div>
  ) : null;
}

function Field({ label, icon, type = "text", placeholder, value, onChange, extra }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none">{icon}</span>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange}
          className="input-field pl-10 pr-12"/>
        {extra}
      </div>
    </div>
  );
}

const MailIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);
const UserIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function Auth() {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const { login, register, loading, error, setError, isAuth } = useAuth();

  const [tab,      setTab]    = useState(params.get("tab") === "register" ? "register" : "login");
  const [regStep,  setRegStep]= useState(1);
  const [showPwd,  setShowPwd]= useState(false);
  const [localMsg, setLocalMsg]= useState("");

  const [loginData, setLogin] = useState({ email: "", password: "", remember: false });
  const [regData,   setReg]   = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "", agree: false });

  useEffect(() => { if (isAuth) navigate("/"); }, [isAuth, navigate]);
  useEffect(() => { setError(""); setLocalMsg(""); }, [tab, setError]);

  const switchTab = (t) => { setTab(t); setRegStep(1); setError(""); setLocalMsg(""); };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) { setLocalMsg("Please fill in all fields."); return; }
    const ok = await login({ email: loginData.email, password: loginData.password });
    if (ok) navigate("/");
  };

  const nextStep = () => {
    if (!regData.firstName || !regData.lastName || !regData.email) { setLocalMsg("Please fill in all required fields."); return; }
    if (!regData.email.includes("@")) { setLocalMsg("Please enter a valid email."); return; }
    setLocalMsg(""); setRegStep(2);
  };

  const handleRegister = async () => {
    if (!regData.password || !regData.confirm) { setLocalMsg("Please fill in all fields."); return; }
    if (regData.password !== regData.confirm)  { setLocalMsg("Passwords do not match."); return; }
    if (regData.password.length < 8)           { setLocalMsg("Password must be at least 8 characters."); return; }
    if (!regData.agree)                        { setLocalMsg("Please accept the terms to continue."); return; }
    const ok = await register({ firstName: regData.firstName, lastName: regData.lastName, email: regData.email, password: regData.password });
    if (ok) navigate("/");
  };

  const msgText = localMsg || error;
  const PwdToggle = (
    <button type="button" onClick={() => setShowPwd(!showPwd)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 hover:text-indigo-500 transition-colors">
      {showPwd ? "Hide" : "Show"}
    </button>
  );

  const FEATURES = [
    { icon: "🚚", text: "Free delivery on orders over ₹999" },
    { icon: "🔒", text: "100% secure & encrypted payments" },
    { icon: "↩️", text: "Easy 7-day returns & exchanges" },
    { icon: "⭐", text: "24/7 dedicated customer support" },
  ];

  return (
    <div className="min-h-screen flex font-jakarta">
      {/* Left panel */}
      <div className="hidden lg:flex w-[44%] flex-col justify-between px-14 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0f1c3f 0%, #162654 40%, #1a2e6b 100%)" }}>
        <div className="absolute -top-28 -right-28 w-96 h-96 rounded-full opacity-10 bg-indigo-400 blur-3xl pointer-events-none"/>
        <div className="absolute -bottom-20 -left-16 w-72 h-72 rounded-full opacity-5  bg-indigo-300 blur-3xl pointer-events-none"/>

          <Link to="/" className="flex items-center gap-2.5 shrink-0">
  <img
    src="/favicon.svg"
    alt="TheBohoThread logo"
    className="w-8 h-8 object-contain"
  />
          <span className="font-sora text-xl font-bold text-white tracking-tight">The<span className="text-indigo-400">Boho</span>Thread</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center py-10 relative">
          <div className="inline-flex items-center gap-2 border rounded-full px-4 py-1.5 mb-7 w-fit"
            style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.3)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"/>
            <span className="text-xs text-indigo-300 font-medium">Trusted by 50,000+ customers</span>
          </div>
          <h2 className="font-sora text-5xl font-bold text-white leading-tight tracking-tight mb-5">
            Your Premium<br/><span className="text-indigo-400">Shopping</span><br/>Experience
          </h2>
          <p className="text-sm leading-relaxed max-w-xs mb-11" style={{ color: "rgba(199,210,254,0.65)" }}>
            Access thousands of curated products across electronics, fashion, books and more. Unbeatable deals, fast delivery.
          </p>
          <ul className="flex flex-col gap-4">
            {FEATURES.map(f => (
              <li key={f.text} className="flex items-center gap-3.5">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                  style={{ background: "rgba(99,102,241,0.12)" }}>{f.icon}</span>
                <span className="text-sm" style={{ color: "rgba(199,210,254,0.7)" }}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-8 pt-9 relative" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {[["50K+","Happy Customers"],["10K+","Products"],["4.8★","Avg Rating"]].map(([n,l]) => (
            <div key={l}>
              <div className="font-sora text-xl font-bold text-white">{n}</div>
              <div className="text-[11px] mt-0.5" style={{ color: "rgba(165,180,252,0.5)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-white px-8 py-16 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
             <img
    src="/favicon.svg"
    alt="TheBohoThread logo"
    className="w-8 h-8 object-contain"
  />
            <span className="font-sora text-lg font-bold text-gray-900">The<span className="text-indigo-500">Boho</span>Thread</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-indigo-500 tracking-widest uppercase mb-1.5">
              {tab === "login" ? "Welcome Back" : "Get Started Free"}
            </p>
            <h1 className="font-sora text-2xl font-bold text-gray-900 tracking-tight mb-1">
              {tab === "login" ? "Sign in to your account" : "Create your account"}
            </h1>
            <p className="text-sm text-gray-400">
              {tab === "login" ? "Enter your credentials to continue shopping" : "Join thousands of happy shoppers today"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            {["login","register"].map(t => (
              <button key={t} onClick={() => switchTab(t)}
                className={`flex-1 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 ${tab===t ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {msgText && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium mb-5 text-center ${
              msgText.includes("Welcome") || msgText.includes("success")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-600 border border-red-200"}`}>
              {msgText}
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <div className="animate-fadeIn">
              <Field label="Email Address" icon={<MailIcon/>} type="email" placeholder="you@example.com"
                value={loginData.email} onChange={e => setLogin({...loginData, email: e.target.value})}/>
              <Field label="Password" icon={<LockIcon/>} type={showPwd?"text":"password"} placeholder="Enter your password"
                value={loginData.password} onChange={e => setLogin({...loginData, password: e.target.value})} extra={PwdToggle}/>

              <div className="flex justify-between items-center mb-6">
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                  <input type="checkbox" checked={loginData.remember} onChange={e => setLogin({...loginData, remember: e.target.checked})} className="accent-indigo-500 w-4 h-4"/>
                  Remember me
                </label>
                <button onClick={() => setLocalMsg("Password reset email sent. Please check your inbox.")}
                  className="text-sm font-medium text-indigo-500 hover:underline">Forgot password?</button>
              </div>

              <button onClick={handleLogin} disabled={loading}
                className="btn-primary w-full py-3.5 text-sm mb-5 disabled:opacity-70">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    Signing in…
                  </span>
                ) : <>Sign In <span className="text-base">→</span></>}
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-100"/><span className="text-xs text-gray-300 font-medium">or continue with</span><div className="flex-1 h-px bg-gray-100"/>
              </div>
              <div className="flex gap-3 mb-6">
                {[["Google",<GoogleIcon/>],["Facebook",<svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>]].map(([label,icon]) => (
                  <button key={label} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                    {icon} {label}
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-400">
                Don't have an account? <button onClick={() => switchTab("register")} className="text-indigo-500 font-semibold hover:underline">Sign up free</button>
              </p>
            </div>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <div className="animate-fadeIn">
              {/* Progress steps */}
              <div className="flex items-center mb-8">
                {[1,2].map((s,i) => (
                  <div key={s} className={`flex items-center ${i < 1 ? "flex-1" : ""}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                        regStep > s ? "bg-indigo-500 border-indigo-500 text-white"
                        : regStep === s ? "border-indigo-500 text-indigo-500 bg-white"
                        : "border-gray-200 text-gray-300 bg-white"}`}>
                        {regStep > s ? "✓" : s}
                      </div>
                      <span className={`text-xs font-medium ${regStep===s ? "text-indigo-500" : "text-gray-300"}`}>
                        {s === 1 ? "Personal Info" : "Set Password"}
                      </span>
                    </div>
                    {i < 1 && <div className="flex-1 h-px bg-gray-200 mx-3"/>}
                  </div>
                ))}
              </div>

              {regStep === 1 && (
                <div className="animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3 mb-0">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">First Name *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"><UserIcon/></span>
                        <input placeholder="Jane" value={regData.firstName} onChange={e => setReg({...regData, firstName: e.target.value})} className="input-field pl-10"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Last Name *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"><UserIcon/></span>
                        <input placeholder="Doe" value={regData.lastName} onChange={e => setReg({...regData, lastName: e.target.value})} className="input-field pl-10"/>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Field label="Email Address *" icon={<MailIcon/>} type="email" placeholder="you@example.com"
                      value={regData.email} onChange={e => setReg({...regData, email: e.target.value})}/>
                  </div>
                  <button onClick={nextStep} className="btn-primary w-full py-3.5 text-sm mt-2">
                    Continue <span className="text-base">→</span>
                  </button>
                </div>
              )}

              {regStep === 2 && (
                <div className="animate-fadeIn">
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 tracking-wide mb-1.5">Create Password *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none"><LockIcon/></span>
                      <input type={showPwd?"text":"password"} placeholder="Min. 8 characters" value={regData.password}
                        onChange={e => setReg({...regData, password: e.target.value})}
                        className="input-field pl-10 pr-16"/>
                      {PwdToggle}
                    </div>
                    <PasswordStrength password={regData.password}/>
                  </div>
                  <Field label="Confirm Password *" icon={<LockIcon/>} type="password" placeholder="Re-enter password"
                    value={regData.confirm} onChange={e => setReg({...regData, confirm: e.target.value})}/>

                  <div className="flex items-start gap-3 mb-5">
                    <input type="checkbox" id="terms" checked={regData.agree} onChange={e => setReg({...regData, agree: e.target.checked})} className="w-4 h-4 mt-0.5 accent-indigo-500 shrink-0 cursor-pointer"/>
                    <label htmlFor="terms" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                      I agree to the <a href="#" className="text-indigo-500 font-medium">Terms of Service</a> and{" "}
                      <a href="#" className="text-indigo-500 font-medium">Privacy Policy</a>. I consent to receiving order updates via email.
                    </label>
                  </div>

                  <button onClick={handleRegister} disabled={loading} className="btn-primary w-full py-3.5 text-sm mb-3 disabled:opacity-70">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        Creating account…
                      </span>
                    ) : <>Create Account <span className="text-base">→</span></>}
                  </button>
                  <button onClick={() => { setRegStep(1); setLocalMsg(""); }}
                    className="w-full text-center text-sm text-gray-400 hover:text-indigo-500 transition-colors py-1">
                    ← Back to personal info
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-gray-400 mt-5">
                Already have an account? <button onClick={() => switchTab("login")} className="text-indigo-500 font-semibold hover:underline">Sign in</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
