import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext({
  user: null,
  login: () => false,
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (email, password) => {
    if (!email || !password) {
      return false
    }

    setUser({
      email,
      name: email.split('@')[0],
    })

    return true
  }

  const logout = () => {
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
