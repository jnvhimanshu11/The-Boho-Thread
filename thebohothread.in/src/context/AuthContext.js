// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// ADMIN CREDENTIALS — change these
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin@2024";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginWithGoogle = () => signInWithPopup(auth, googleProvider);

  const setupRecaptcha = (containerId) => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {},
    });
  };

  const sendOTP = async (phoneNumber) => {
    const appVerifier = window.recaptchaVerifier;
    const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = result;
    return result;
  };

  const verifyOTP = async (otp) => {
    const result = await window.confirmationResult.confirm(otp);
    return result;
  };

  const logout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  const adminLogin = (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => setIsAdmin(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        loginWithGoogle,
        setupRecaptcha,
        sendOTP,
        verifyOTP,
        logout,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
