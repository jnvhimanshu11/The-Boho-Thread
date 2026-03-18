import { Link } from "react-router-dom";

const LINKS = {
  "Shop": [
    { label: "All Products", to: "/products" },
    { label: "Electronics",  to: "/products?cat=Electronics" },
    { label: "Clothing",     to: "/products?cat=Clothing" },
    { label: "Books",        to: "/products?cat=Books" },
  ],
  "Account": [
    { label: "Sign In",   to: "/auth" },
    { label: "Register",  to: "/auth?tab=register" },
    { label: "Orders",    to: "/orders" },
    { label: "Profile",   to: "/profile" },
  ],
  "Support": [
    { label: "Help Center",    to: "#" },
    { label: "Return Policy",  to: "#" },
    { label: "Shipping Info",  to: "#" },
    { label: "Contact Us",     to: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
               <img
    src="/favicon.svg"
    alt="TheBohoThread logo"
    className="w-8 h-8 object-contain"
  />
              <span className="font-sora text-lg font-bold text-white">The<span className="text-indigo-400">Boho</span>Thread</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs mb-6">
              Your one-stop destination for quality products across electronics, fashion, books, and more. Trusted by 50,000+ happy customers.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <span className="text-green-400 font-medium">Secure & Encrypted Checkout</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white text-sm font-semibold mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map(l => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm hover:text-white transition-colors duration-150">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} TheBohoThread. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(t => (
              <Link key={t} to="#" className="text-xs hover:text-gray-300 transition-colors">{t}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
