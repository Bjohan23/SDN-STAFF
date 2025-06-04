import { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import PrivateRoute from './auth/PrivateRoute'
import RoleRoute from './auth/RoleRoute'
import Home from './pages/Home'
import Login from './pages/auth/inicioSesion'
import Register from './pages/auth/registro'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard/Dashboard'
import Profile from './pages/Dashboard/Profile'
import RoleManagement from './pages/admin/RoleManagement'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  
  // Determinar si mostrar el sidebar
  const showLayout = location.pathname.startsWith('/dashboard') || 
                    location.pathname.startsWith('/profile') || 
                    location.pathname.startsWith('/admin/roles')

  return (
    <AuthProvider>
      {showLayout ? (
        <div className="flex h-screen bg-gray-100">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar setSidebarOpen={setSidebarOpen} />
            
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                
                <Route path="/admin/roles" element={
                  <RoleRoute allowedRoles={['administrador']}>
                    <RoleManagement />
                  </RoleRoute>
                } />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </div>
      )}
    </AuthProvider>
  )
}

export default App