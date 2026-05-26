import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem('sw_user')
    const token = sessionStorage.getItem('sw_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    sessionStorage.setItem('sw_token', token)
    sessionStorage.setItem('sw_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    sessionStorage.removeItem('sw_token')
    sessionStorage.removeItem('sw_user')
    setUser(null)
  }

  const updateLogo = (logoBase64) => {
    const updated = { ...user, logoBase64 }
    sessionStorage.setItem('sw_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateLogo }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
