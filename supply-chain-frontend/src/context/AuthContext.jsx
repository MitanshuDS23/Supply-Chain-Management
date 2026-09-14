import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const KEY = 'scm_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setUser(JSON.parse(raw))
    } catch { /* ignore */ }
    setReady(true)
  }, [])

  const login = (u) => {
    setUser(u)
    try { localStorage.setItem(KEY, JSON.stringify(u)) } catch { /* ignore */ }
  }
  const logout = () => {
    setUser(null)
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
