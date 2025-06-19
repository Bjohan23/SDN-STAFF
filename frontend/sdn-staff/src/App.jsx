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
import CrearEvento from './pages/admin/CrearEvento'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import './App.css'
// Empresas expositoras
import RegistroEmpresaPublica from './pages/empresas/RegistroEmpresaPublica'
import ListadoEmpresas from './pages/empresas/ListadoEmpresas'
import DetalleEmpresa from './pages/empresas/DetalleEmpresa'
import AprobacionEmpresas from './pages/empresas/AprobacionEmpresas'
import RegistroEnEvento from './pages/empresas/RegistroEnEvento'
import HistorialParticipacion from './pages/empresas/HistorialParticipacion'
import DetalleParticipacionEvento from './pages/empresas/DetalleParticipacionEvento'
import DocumentosPorVencer from './pages/empresas/DocumentosPorVencer'
import DashboardEmpresas from './pages/empresas/DashboardEmpresas'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  
  // Determinar si mostrar el sidebar
  const showLayout = location.pathname.startsWith('/dashboard') || 
                    location.pathname.startsWith('/profile') || 
                    location.pathname.startsWith('/admin/roles') ||
                    location.pathname.startsWith('/admin/crear-evento') ||
                    location.pathname.startsWith('/empresas');

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
                <Route path="/admin/crear-evento" element={
                  <RoleRoute allowedRoles={['administrador', 'manager']}>
                    <CrearEvento />
                  </RoleRoute>
                } />
                {/* Gestión integral de empresas expositoras en una sola vista */}
                <Route path="/empresas" element={
                  <RoleRoute allowedRoles={['administrador', 'manager']}>
                    <ListadoEmpresas />
                  </RoleRoute>
                } />
                {/* Redirección de cualquier subruta de empresas a la vista principal */}
                <Route path="/empresas/*" element={
                  <RoleRoute allowedRoles={['administrador', 'manager']}>
                    <ListadoEmpresas />
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
            {/* Registro público de empresa */}
            <Route path="/empresas/registro" element={<RegistroEmpresaPublica />} />
            {/* ruta para paginas no encontradas  */}
            <Route path="*" element={<h1 className="text-center text-2xl mt-10">Página no encontrada</h1>} />
          </Routes>
        </div>
      )}
    </AuthProvider>
  )
}

export default App