import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider }            from "./context/CartContext";
import { AuthProvider }            from "./context/AuthContext";
import { AdminProvider, useAdmin } from "./context/AdminContext";
import { WishlistProvider }        from "./context/WishlistContext";
import Navbar         from "./components/layout/Navbar";
import Footer         from "./components/layout/Footer";
import CartDrawer     from "./components/layout/CartDrawer";
import Home           from "./pages/Home";
import Auth           from "./pages/Auth";
import Products       from "./pages/Products";
import ProductDetail  from "./pages/ProductDetail";
import Cart           from "./pages/Cart";
import Checkout       from "./pages/Checkout";
import Orders         from "./pages/Orders";
import Profile        from "./pages/Profile";
import Wishlist       from "./pages/Wishlist";
import NotFound       from "./pages/NotFound";
import AdminLogin     from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";

function Layout({ children }) {
  return (
    <>
      <Navbar/>
      <CartDrawer/>
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <Footer/>
    </>
  );
}

function AdminGuard({ children }) {
  const { isAdmin } = useAdmin();
  return isAdmin ? children : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>
                {/* Admin */}
                <Route path="/admin"           element={<AdminLogin/>}/>
                <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard/></AdminGuard>}/>

                {/* Auth */}
                <Route path="/auth" element={<Auth/>}/>

                {/* Store */}
                <Route path="/"             element={<Layout><Home/></Layout>}/>
                <Route path="/products"     element={<Layout><Products/></Layout>}/>
                <Route path="/products/:id" element={<Layout><ProductDetail/></Layout>}/>
                <Route path="/cart"         element={<Layout><Cart/></Layout>}/>
                <Route path="/checkout"     element={<Layout><Checkout/></Layout>}/>
                <Route path="/wishlist"     element={<Layout><Wishlist/></Layout>}/>
                <Route path="/orders"       element={<Layout><Orders/></Layout>}/>
                <Route path="/profile"      element={<Layout><Profile/></Layout>}/>
                <Route path="*"             element={<Layout><NotFound/></Layout>}/>
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}