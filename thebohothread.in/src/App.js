// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./context/StoreContext";
import LiquidBackground from "./components/LiquidBackground";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";
import Campaigns from "./pages/Campaigns";
import Profile from "./pages/Profile";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <LiquidBackground />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1a0a2e",
                color: "#f0f0ff",
                border: "1px solid rgba(124,58,237,0.3)",
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          />
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}
