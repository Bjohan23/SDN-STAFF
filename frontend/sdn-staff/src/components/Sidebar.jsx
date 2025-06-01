import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, hasRole } = useAuth()

  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: '🏠', roles: ['user', 'admin'] },
    { path: '/profile', name: 'Perfil', icon: '👤', roles: ['user', 'admin'] },
    { path: '/admin/roles', name: 'Gestión de Roles', icon: '🔑', roles: ['admin'] },
  ]

  return (
    <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-indigo-700 
      text-white transition-transform duration-300 ease-in-out z-50`}>
      
      <div className="p-4 flex items-center justify-between border-b border-indigo-600">
        <h1 className="text-xl font-bold">SDN Staff</h1>
        <button 
          className="md:hidden text-white"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <p className="text-indigo-200">Bienvenido,</p>
          <p className="font-semibold truncate">{user?.correo || 'Usuario'}</p>
        </div>
        
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              item.roles.some(role => hasRole(role)) && (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </NavLink>
                </li>
              )
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="absolute bottom-0 w-full p-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center p-3 rounded-lg bg-indigo-800 hover:bg-indigo-600 transition-colors"
        >
          <span className="mr-3">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar