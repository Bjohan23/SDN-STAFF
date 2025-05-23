import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useEffect } from 'react'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return isAuthenticated() ? children : null
}

export default PrivateRoute