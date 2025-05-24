import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../config/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  const login = async (correo, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { correo, password })
      console.log('Login response:', response)

      const { accessToken, user } = response.data.data
      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      setUser(user)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', userData)
      console.log('Registration response:', response)
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
    return user?.roles?.some(role => role.nombre_rol === requiredRole)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
