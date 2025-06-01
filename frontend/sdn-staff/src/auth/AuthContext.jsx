import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../config/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const navigate = useNavigate()

  // Al montar el contexto, leer datos guardados en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (correo, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', { correo, password })
      console.log('Login response:', response)

      const { accessToken, user } = response.data.data

      // Guardar token y usuario en localStorage para persistencia
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(user))

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
    localStorage.removeItem('user')  // también borrar el usuario guardado
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
