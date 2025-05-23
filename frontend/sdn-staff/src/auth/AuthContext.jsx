import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()


  const login = async (email, password) => {
    try {
      // Aquí iría tu llamada API real
      const response = 
      localStorage.setItem('token', response.data.token)
      setToken(response.data.token)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      // Aquí iría tu llamada API real
      console.log('Registering user:', userData)
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/login')
  }

  const isAuthenticated = () => {
    return !!token
  }

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)