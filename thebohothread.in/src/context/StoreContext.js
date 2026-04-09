// src/context/StoreContext.js
import React, { createContext, useContext, useReducer, useEffect } from "react";

const StoreContext = createContext();
export const useStore = () => useContext(StoreContext);

const initialState = {
  cart: [],
  wishlist: [],
  appliedCoupon: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const exists = state.cart.find((i) => i.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { ...action.payload, qty: 1 }] };
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((i) => i.id !== action.payload) };
    case "UPDATE_QTY":
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, cart: [], appliedCoupon: null };
    case "TOGGLE_WISHLIST": {
      const exists = state.wishlist.find((i) => i.id === action.payload.id);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter((i) => i.id !== action.payload.id)
          : [...state.wishlist, action.payload],
      };
    }
    case "APPLY_COUPON":
      return { ...state, appliedCoupon: action.payload };
    case "REMOVE_COUPON":
      return { ...state, appliedCoupon: null };
    case "LOAD_STATE":
      return action.payload;
    default:
      return state;
  }
}

export const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const saved = localStorage.getItem("storeState");
    if (saved) dispatch({ type: "LOAD_STATE", payload: JSON.parse(saved) });
  }, []);

  useEffect(() => {
    localStorage.setItem("storeState", JSON.stringify(state));
  }, [state]);

  const cartTotal = state.cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discountedTotal = state.appliedCoupon
    ? cartTotal * (1 - state.appliedCoupon.discount / 100)
    : cartTotal;

  return (
    <StoreContext.Provider value={{ state, dispatch, cartTotal, discountedTotal }}>
      {children}
    </StoreContext.Provider>
  );
};
