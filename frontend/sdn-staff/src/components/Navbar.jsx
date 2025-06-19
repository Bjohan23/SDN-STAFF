import { useAuth } from '../auth/AuthContext'

const Navbar = ({ setSidebarOpen }) => {
  const { user } = useAuth()

  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Botón de menú móvil */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Breadcrumb o título de página */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-white">
              Panel de Administración
            </h2>
          </div>
        </div>
        
        {/* Información del usuario y acciones */}
        <div className="flex items-center space-x-4">
          {/* Notificaciones */}
          <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4h6a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h6m0 0V2m0 2V4m0 0h2m-2 0L9 6m2 6l3-3" />
            </svg>
            {/* Badge de notificación */}
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Información del usuario */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user?.correo || 'Usuario'}</p>
              <p className="text-xs text-gray-400">
                {user?.roles?.[0]?.nombre_rol || 'Sin rol'} 
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.correo?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar