import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z"
          />
        </svg>
      ),
      roles: ["user", "administrador"],
    },
    {
      path: "/profile",
      name: "Perfil",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      roles: ["user", "administrador"],
    },
    {
      path: "/admin/roles",
      name: "Gestión de Roles",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      roles: ["administrador"],
    },
    {
      path: "/admin/registrar-usuario",
      name: "👤 Registrar Usuario",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      ),
      roles: ["administrador"],
    },
    {
      path: "/admin/crear-evento",
      name: "Crear Evento",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3a4 4 0 118 0v4m-4 12h0m-8 0h16a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      roles: ["administrador", "manager"],
    },
    {
      path: "/admin/categorias",
      name: "Gestión de Categorías",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
      roles: ["administrador", "manager"],
    },
    {
      path: "/admin/credenciales",
      name: "🎫 Credenciales",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2a2 2 0 01-2 2H11a2 2 0 01-2-2z"
          />
          <circle
            cx="9"
            cy="7"
            r="4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      roles: ["administrador"],
    },
    {
      path: "/admin/validacion",
      name: "✅ Validar QR",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="14"
            y="3"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="14"
            y="14"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="3"
            y="14"
            width="7"
            height="7"
            rx="1"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M9 16l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      roles: ["administrador"],
    },
    {
      path: "/admin/tipos-credencial",
      name: "🪪 Tipos de Credencial",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="9"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M15 11h2v2h-2z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      roles: ["administrador"],
    },
    {
      path: "/admin/reportes",
      name: "📊 Reportes",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      roles: ["administrador", "manager"],
    },
  ];

  const empresaMenu = [
    {
      path: "/empresas",
      name: "Gestión de Empresas",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
  ];

  const standsMenu = [
    {
      path: "/stands",
      name: "Stands",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-gray-900 
        text-white transition-transform duration-300 ease-in-out z-50 flex flex-col overflow-y-auto`}
        style={{ height: "100vh" }}
      >
        {/* Header del sidebar */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">SDN Staff</h1>
            </div>
            <button
              className="md:hidden text-gray-400 hover:text-white p-1 rounded-md transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.correo?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-400">Bienvenido,</p>
              <p className="font-medium text-white truncate">
                {user?.correo || "Usuario"}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 p-6 space-y-8">
          {/* Menú principal */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Principal
            </h3>
            <ul className="space-y-1">
              {navItems.map(
                (item) =>
                  item.roles.some((role) => hasRole(role)) && (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-blue-600 text-white shadow-lg"
                              : "text-gray-300 hover:bg-gray-800 hover:text-white"
                          }`
                        }
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </NavLink>
                    </li>
                  )
              )}
            </ul>
          </div>

          {/* Menú de Empresas Expositoras */}
          {(hasRole("administrador") || hasRole("manager")) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Empresas Expositoras
              </h3>
              <ul className="space-y-1">
                {empresaMenu.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-green-600 text-white shadow-lg"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Menú de Stands */}
          {(hasRole("administrador") ||
            hasRole("manager") ||
            hasRole("staff")) && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Gestión de Stands
              </h3>
              <ul className="space-y-1">
                {standsMenu.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-purple-600 text-white shadow-lg"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Footer del sidebar */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
