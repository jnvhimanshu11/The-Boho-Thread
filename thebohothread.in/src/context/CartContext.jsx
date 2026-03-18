import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

const initialState = {
  items: JSON.parse(localStorage.getItem("cart") || "[]"),
  isOpen: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const existing = state.items.find(
        i => i.id === action.item.id && i.size === action.item.size
      );
      const items = existing
        ? state.items.map(i =>
            i.id === action.item.id && i.size === action.item.size
              ? { ...i, qty: i.qty + (action.item.qty || 1) }
              : i
          )
        : [...state.items, { ...action.item, qty: action.item.qty || 1 }];
      return { ...state, items };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter(i => !(i.id === action.id && i.size === action.size)) };
    case "UPDATE_QTY":
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.id && i.size === action.size
            ? { ...i, qty: Math.max(1, action.qty) }
            : i
        ),
      };
    case "CLEAR":
      return { ...state, items: [] };
    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((s, i) => s + i.qty, 0);
  const subtotal   = state.items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping   = subtotal > 999 ? 0 : 99;
  const total      = subtotal + shipping;

  const addToCart    = (item)          => dispatch({ type: "ADD", item });
  const removeFromCart = (id, size)    => dispatch({ type: "REMOVE", id, size });
  const updateQty    = (id, size, qty) => dispatch({ type: "UPDATE_QTY", id, size, qty });
  const clearCart    = ()              => dispatch({ type: "CLEAR" });
  const toggleCart   = ()              => dispatch({ type: "TOGGLE_CART" });
  const openCart     = ()              => dispatch({ type: "OPEN_CART" });
  const closeCart    = ()              => dispatch({ type: "CLOSE_CART" });

  return (
    <CartContext.Provider value={{
      items: state.items, isOpen: state.isOpen,
      totalItems, subtotal, shipping, total,
      addToCart, removeFromCart, updateQty, clearCart,
      toggleCart, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
