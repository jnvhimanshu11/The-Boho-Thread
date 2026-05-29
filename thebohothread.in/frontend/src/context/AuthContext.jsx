import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // localStorage survives hard refresh; sessionStorage does not
    const stored = localStorage.getItem('sw_user')
    const token  = localStorage.getItem('sw_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('sw_token', token)
    localStorage.setItem('sw_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('sw_token')
    localStorage.removeItem('sw_user')
    setUser(null)
  }

  const updateLogo = (logoBase64) => {
    const updated = { ...user, logoBase64 }
    localStorage.setItem('sw_user', JSON.stringify(updated))
    setUser(updated)
  }

  const updateBanner = (bannerBase64) => {
    const updated = { ...user, bannerBase64 }
    localStorage.setItem('sw_user', JSON.stringify(updated))
    setUser(updated)
  }

  /** Called after a successful forced password change */
  const clearMustChangePassword = () => {
    const updated = { ...user, mustChangePassword: false }
    localStorage.setItem('sw_user', JSON.stringify(updated))
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateLogo, updateBanner, clearMustChangePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)