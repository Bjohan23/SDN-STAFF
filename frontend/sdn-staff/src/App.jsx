import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { StandsProvider } from "./contexts/StandsContext";
import PrivateRoute from "./auth/PrivateRoute";
import RoleRoute from "./auth/RoleRoute";
import Home from "./pages/Home";
import Login from "./pages/auth/inicioSesion";
import Register from "./pages/auth/registro";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import Profile from "./pages/Dashboard/Profile";
import RoleManagement from "./pages/admin/RoleManagement";
import CrearEvento from "./pages/admin/CrearEvento";
import GestionCategorias from "./pages/admin/GestionCategorias";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import "./App.css";
// Empresas expositoras
import RegistroEmpresaPublica from "./pages/empresas/RegistroEmpresaPublica";
import ListadoEmpresas from "./pages/empresas/ListadoEmpresas";
import DetalleEmpresa from "./pages/empresas/DetalleEmpresa";
import AprobacionEmpresas from "./pages/empresas/AprobacionEmpresas";
import RegistroEnEvento from "./pages/empresas/RegistroEnEvento";
import HistorialParticipacion from "./pages/empresas/HistorialParticipacion";
import DetalleParticipacionEvento from "./pages/empresas/DetalleParticipacionEvento";
import DocumentosPorVencer from "./pages/empresas/DocumentosPorVencer";
import DashboardEmpresas from "./pages/empresas/DashboardEmpresas";
import BuscarPorCategorias from "./pages/empresas/BuscarPorCategorias";
// Stands
import ListadoStands from "./pages/stands/ListadoStands";
import AgregarStand from "./pages/stands/AgregarStand";
import DashboardStands from "./pages/stands/DashboardStands";

// Nuevas funcionalidades Spring 3
import PreRegistroVisitantes from "./pages/publico/PreRegistroVisitantes";
import ReportesEventos from "./pages/admin/ReportesEventos";
import InteractiveCalendar from "./components/Calendar/InteractiveCalendar";
import GestionCredenciales from "./pages/admin/GestionCredenciales";
import ValidacionQR from "./pages/admin/ValidacionQR";
import TiposCredencial from "./pages/admin/TiposCredencial";
import CalendarioEvento from "./pages/eventos/CalendarioEvento";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determinar si mostrar el sidebar
  const showLayout =
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/empresas") ||
    location.pathname.startsWith("/stands") ||
    location.pathname.startsWith("/eventos") ||
    location.pathname.startsWith("/credenciales") ||
    location.pathname.startsWith("/calendario");

  return (
    <AuthProvider>
      <StandsProvider>
        {showLayout ? (
        <div className="flex h-screen bg-gray-100">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
 
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar setSidebarOpen={setSidebarOpen} />

            <main className="flex-1 overflow-y-auto bg-gray-100">
              <Routes>
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/admin/roles"
                  element={
                    <RoleRoute allowedRoles={["administrador"]}>
                      <RoleManagement />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/crear-evento"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <CrearEvento />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/categorias"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <GestionCategorias />
                    </RoleRoute>
                  }
                />
                {/* Rutas de Empresas */}
                <Route
                  path="/empresas"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <ListadoEmpresas />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/empresas/detalle/:id"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <DetalleEmpresa />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/empresas/aprobacion"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <AprobacionEmpresas />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/empresas/dashboard"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <DashboardEmpresas />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/empresas/documentos-vencer"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <DocumentosPorVencer />
                    </RoleRoute>
                  }
                />

                {/* Rutas de Stands */}
                <Route
                  path="/stands"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <DashboardStands />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/stands/*"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <DashboardStands />
                    </RoleRoute>
                  }
                />

                {/* Nuevas Rutas - Sistema de Credenciales */}
                <Route
                  path="/admin/credenciales"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <GestionCredenciales />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/tipos-credencial"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <TiposCredencial />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/validacion"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager", "editor"]}>
                      <ValidacionQR />
                    </RoleRoute>
                  }
                />

                {/* Nuevas Rutas - Reportes */}
                <Route
                  path="/admin/reportes"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager"]}>
                      <ReportesEventos />
                    </RoleRoute>
                  }
                />

                {/* Nuevas Rutas - Calendario */}
                <Route
                  path="/calendario/:eventoId"
                  element={
                    <PrivateRoute>
                      <CalendarioEvento />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/eventos/:eventoId/calendario"
                  element={
                    <RoleRoute allowedRoles={["administrador", "manager", "editor"]}>
                      <CalendarioEvento />
                    </RoleRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* Ruta pública de pre-registro */}
            <Route path="/pre-registro/:eventoId" element={<PreRegistroVisitantes />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Registro público de empresa */}
            <Route
              path="/empresas/registro"
              element={<RegistroEmpresaPublica />}
            />
            {/* ruta para paginas no encontradas  */}
            <Route
              path="*"
              element={
                <h1 className="text-center text-2xl mt-10">
                  Página no encontrada
                </h1>
              }
            />
          </Routes>
        </div>
      )}
      </StandsProvider>
    </AuthProvider>
  );
}

export default App;
