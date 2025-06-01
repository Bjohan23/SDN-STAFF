import { useAuth } from '../auth/AuthContext'

const Navbar = ({ setSidebarOpen }) => {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-0">
        <button 
          onClick={() => setSidebarOpen(prev => !prev)}
          className="md:hidden text-gray-500 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">{user?.email}</span>
        </div>
      </div>
    </header>
  )
}

export default Navbar