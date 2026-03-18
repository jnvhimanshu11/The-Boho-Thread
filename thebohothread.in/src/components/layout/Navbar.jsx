import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart }     from "../../context/CartContext";
import { useAuth }     from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";

const NAV = [
  { label: "Home",     to: "/" },
  { label: "Products", to: "/products" },
  { label: "Orders",   to: "/orders" },
];

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const { user, logout }         = useAuth();
  const { items: wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length;
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/auth"); setUserOpen(false); };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-white"}`}>
      <div className="page-container">
        <div className="flex items-center h-16 gap-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/favicon.svg"
              alt="TheBohoThread logo"
              className="w-8 h-8 object-contain"
            />
            <span className="font-sora text-lg font-bold text-gray-900 tracking-tight">The<span className="text-indigo-500">Boho</span>Thread</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`
                }>
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xs">
            <div className="relative w-full">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search products…"
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border focus:border-indigo-500/30 transition-all"
                onKeyDown={e => { if (e.key === "Enter") navigate(`/products?q=${e.target.value}`); }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Wishlist */}
            <Link to="/wishlist" className="relative btn-ghost p-2.5" title="My Wishlist">
              <svg className="w-5 h-5" fill={wishlistCount > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"
                style={{ color: wishlistCount > 0 ? "#ef4444" : undefined }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
            

     {/* Setting Gear Icon For Admin Portal Login */}

            <a href="/admin"
  title="Admin Panel"
  className="btn-ghost p-2.5 text-black hover:text-violet-500 transition-colors hidden md:flex items-center justify-center">
  Admin
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
</a>

            {/* Cart */}
            <button onClick={openCart} className="relative btn-ghost p-2.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 btn-ghost px-2.5 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold uppercase">
                    {user.name?.[0] ?? "U"}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7"/></svg>
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-48 card border border-gray-100 shadow-lg py-1 z-50">
                    <Link to="/profile" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                      My Orders
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth" className="btn-primary py-2 px-4 text-xs">Sign In</Link>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden btn-ghost p-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3">
            <div className="mb-3 px-1">
              <input type="text" placeholder="Search products…"
                className="w-full pl-4 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm placeholder-gray-400 outline-none"
                onKeyDown={e => { if (e.key === "Enter") { navigate(`/products?q=${e.target.value}`); setMobileOpen(false); } }}
              />
            </div>
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to === "/"} onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-gray-100"}`
                }>
                {n.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Overlay for user dropdown */}
      {userOpen && <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)}/>}
    </header>
  );
}
