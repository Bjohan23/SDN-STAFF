import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { useEffect } from 'react'

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login')
    } else if (!allowedRoles.some(role => hasRole(role))) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, allowedRoles, hasRole, navigate])

  return isAuthenticated() && allowedRoles.some(role => hasRole(role)) ? children : null
}

export default RoleRoute