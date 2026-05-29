import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Applies the school's primary color as a CSS variable on <html>
function applyThemeColor(color) {
  if (color) document.documentElement.style.setProperty('--primary', color)
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sw_user')
    const token  = localStorage.getItem('sw_token')
    if (stored && token) {
      const parsed = JSON.parse(stored)
      setUser(parsed)
      applyThemeColor(parsed.primaryColor)
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('sw_token', token)
    localStorage.setItem('sw_user', JSON.stringify(userData))
    setUser(userData)
    applyThemeColor(userData.primaryColor)
  }

  const logout = () => {
    localStorage.removeItem('sw_token')
    localStorage.removeItem('sw_user')
    document.documentElement.style.removeProperty('--primary')
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