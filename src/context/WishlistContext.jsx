import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState(
    () => JSON.parse(localStorage.getItem("wishlist") || "[]")
  );

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(items));
  }, [items]);

  const addToWishlist    = (product) => setItems(prev => prev.find(p => p.id === product.id) ? prev : [...prev, product]);
  const removeFromWishlist = (id)    => setItems(prev => prev.filter(p => p.id !== id));
  const toggleWishlist   = (product) => setItems(prev =>
    prev.find(p => p.id === product.id)
      ? prev.filter(p => p.id !== product.id)
      : [...prev, product]
  );
  const isWished = (id) => items.some(p => p.id === id);
  const clearWishlist = () => setItems([]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, toggleWishlist, isWished, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
};
