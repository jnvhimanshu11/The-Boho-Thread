import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = async ({ email, password }) => {
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 800)); // simulate API
    if (password.length < 6) { setError("Invalid credentials."); setLoading(false); return false; }
    setUser({ id: 1, name: email.split("@")[0].replace(/\./g," "), email, avatar: null });
    setLoading(false);
    return true;
  };

  const register = async ({ firstName, lastName, email, password }) => {
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 800));
    if (password.length < 8) { setError("Password must be at least 8 characters."); setLoading(false); return false; }
    setUser({ id: Date.now(), name: `${firstName} ${lastName}`, email, avatar: null });
    setLoading(false);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, setError, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
