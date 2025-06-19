import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import usuarios from "../../services/usuarios";
import rolesService from "../../services/roles";

const RoleManagement = () => {
  const [rolesBackend, setRolesBackend] = useState([]);
  const { user } = useAuth();

  // Estados
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [processingUserId, setProcessingUserId] = useState(null);

  // Cargar roles del backend
  useEffect(() => {
    console.log("[DEBUG] Llamando rolesService.getRoles...");
    rolesService
      .getRoles()
      .then((roles) => {
        console.log("[DEBUG] rolesService.getRoles result:", roles);
        setRolesBackend(Array.isArray(roles) ? roles : []);
      })
      .catch((error) => {
        console.error("[ERROR] rolesService.getRoles falló:", error);
      });
  }, []);

  // Mapeo de iconos y colores para roles
  const roleIconMap = {
    administrador: (
      <svg className="h-4 w-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    organizador: (
      <svg className="h-4 w-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    expositor: (
      <svg className="h-4 w-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l4-2 4 2V4M7 4h10M7 4H5a2 2 0 00-2 2v1" />
      </svg>
    ),
    visitante: (
      <svg className="h-4 w-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  };

  const roleColorMap = {
    administrador: "bg-purple-900 text-purple-200 border-purple-600",
    organizador: "bg-blue-900 text-blue-200 border-blue-600",
    expositor: "bg-green-900 text-green-200 border-green-600",
    visitante: "bg-yellow-900 text-yellow-200 border-yellow-600",
  };

  const fallbackIcon = (
    <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
  const fallbackColor = "bg-gray-700 text-gray-300 border-gray-600";

  // Fetch con paginación
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usuarios.getUsuario(page, pagination.itemsPerPage);
      if (response.success) {
        setUserList(response.data);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.pagination.currentPage,
          totalPages: response.pagination.totalPages,
          itemsPerPage: response.pagination.itemsPerPage,
          totalItems: response.pagination.totalItems,
        }));
      } else {
        setError("Error al obtener usuarios");
      }
    } catch {
      setError("Error en la conexión o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage);
  }, []);

  // Obtener array solo con nombres de roles para el select multiple
  const getUserRoleNames = (roles) => roles.map((r) => r.nombre_rol);

  // Iniciar edición de roles
  const startEditing = (userId, currentRoles) => {
    setEditingUserId(userId);
    setSelectedRoles(getUserRoleNames(currentRoles));
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingUserId(null);
    setSelectedRoles([]);
  };

  // Guardar cambios de roles
  const saveRoleChanges = async (userId) => {
    setProcessingUserId(userId);
    try {
      const roleIds = selectedRoles.map((roleName) => {
        const option = rolesBackend.find((ro) => ro.nombre_rol === roleName);
        return option?.id_rol;
      });
      await rolesService.asignarMultiplesRoles(userId, roleIds);
      
      // Actualización optimista en UI
      setUserList((prev) =>
        prev.map((u) => {
          if (u.id_usuario === userId) {
            const updatedRoles = selectedRoles.map((roleName) => {
              const existing = u.roles.find((r) => r.nombre_rol === roleName);
              if (existing) return existing;
              const option = rolesBackend.find(
                (ro) => ro.nombre_rol === roleName
              );
              return {
                id_rol: option?.id_rol || null,
                nombre_rol: roleName,
                descripcion: option?.descripcion || "",
                UsuarioRol: { fecha_asignacion: new Date().toISOString() },
              };
            });
            return { ...u, roles: updatedRoles };
          }
          return u;
        })
      );
      setEditingUserId(null);
      setSelectedRoles([]);
      setError(null);
    } catch {
      setError("Error al asignar roles");
    } finally {
      setProcessingUserId(null);
    }
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchUsers(newPage);
  };

  // Manejar selección/deselección de roles
  const toggleRoleSelection = (roleName) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  // Formatear fecha
  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 space-y-9 p-4 md:p-8 bg-gray-900 min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
          <p className="text-gray-300 font-medium">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-9 p-4 md:p-8 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Gestión de Roles</h2>
        <p className="text-gray-400">Administra los permisos y accesos de los usuarios del sistema</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Usuarios</p>
              <p className="text-2xl font-semibold text-white">{pagination.totalItems || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Usuarios Activos</p>
              <p className="text-2xl font-semibold text-green-300">
                {userList.filter(u => u.estado === 'activo').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Roles Disponibles</p>
              <p className="text-2xl font-semibold text-purple-300">{rolesBackend.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Página Actual</p>
              <p className="text-2xl font-semibold text-yellow-300">
                {pagination.currentPage}/{pagination.totalPages}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-200 font-medium">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => fetchUsers(pagination.currentPage)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-200 bg-red-800 hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      {userList.length === 0 ? (
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No hay usuarios disponibles</h3>
          <p className="text-gray-400">No se encontraron usuarios en el sistema</p>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden">
          {/* Header de la tabla */}
          <div className="bg-gray-600 px-6 py-4 border-b border-gray-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Lista de Usuarios
              </h3>
              <span className="text-sm text-gray-300">
                {userList.length} de {pagination.totalItems} usuarios
              </span>
            </div>
          </div>

          {/* Lista de usuarios */}
          <div className="divide-y divide-gray-600 max-h-[600px] overflow-y-auto">
            {userList.map((u, idx) => (
              <div key={u.id_usuario || `usuario-${idx}`} className="px-6 py-6 hover:bg-gray-600 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Información del usuario */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {u.correo.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <p className="text-lg font-medium text-white truncate">{u.correo}</p>
                        {u.id_usuario === user?.id_usuario && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-900 text-blue-200">
                            Tú
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-600 text-gray-300">
                          ID: {u.id_usuario}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          u.estado === "activo" 
                            ? "bg-green-900 text-green-200" 
                            : "bg-red-900 text-red-200"
                        }`}>
                          {u.estado}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-900 text-purple-200">
                          {u.roles.length} rol{u.roles.length !== 1 ? 'es' : ''}
                        </span>
                      </div>

                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12h0m-8 0h16a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Creado: {formatFecha(u.fecha_creacion)}
                        </div>
                        {u.ultima_sesion && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Última sesión: {formatFecha(u.ultima_sesion)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Roles y acciones */}
                  <div className="lg:w-96">
                    {/* Mostrar roles actuales */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-300 mb-2">Roles asignados:</div>
                      <div className="flex flex-wrap gap-2">
                        {u.roles.length > 0 ? u.roles.map((role, idx) => {
                          const icon = roleIconMap[role.nombre_rol] || fallbackIcon;
                          const colorClass = roleColorMap[role.nombre_rol] || fallbackColor;
                          return (
                            <div key={role.id_rol || `role-${idx}`} className="group relative">
                              <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${colorClass}`}>
                                {icon}
                                {role.nombre_rol}
                              </span>
                              {/* Tooltip con información del rol */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                                <div className="font-medium">{role.descripcion}</div>
                                <div className="text-gray-400">Asignado: {formatFecha(role.UsuarioRol.fecha_asignacion)}</div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </div>
                          );
                        }) : (
                          <span className="text-sm text-gray-500 italic">Sin roles asignados</span>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    {u.id_usuario !== user?.id_usuario && (
                      <div className="flex justify-end">
                        {editingUserId === u.id_usuario ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveRoleChanges(u.id_usuario)}
                              disabled={processingUserId === u.id_usuario}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingUserId === u.id_usuario ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Guardar
                                </>
                              )}
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={processingUserId === u.id_usuario}
                              className="inline-flex items-center px-3 py-2 border border-gray-500 text-sm font-medium rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-700 disabled:opacity-50 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(u.id_usuario, u.roles)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-700 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar Roles
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selector de roles (solo en modo edición) */}
                {editingUserId === u.id_usuario && (
                  <div className="mt-6 pl-16">
                    <div className="bg-gray-600 rounded-lg p-4">
                      <div className="mb-3 text-sm font-medium text-white">
                        Selecciona los roles para este usuario:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rolesBackend.map((role, idx) => {
                          const icon = roleIconMap[role.nombre_rol] || fallbackIcon;
                          const colorClass = roleColorMap[role.nombre_rol] || fallbackColor;
                          const isSelected = selectedRoles.includes(role.nombre_rol);
                          return (
                            <button
                              key={role.id_rol || idx}
                              type="button"
                              onClick={() => toggleRoleSelection(role.nombre_rol)}
                              className={`flex items-start p-3 rounded-lg text-left transition-all ${
                                isSelected
                                  ? `${colorClass} ring-2 ring-blue-400`
                                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                              }`}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">{role.nombre_rol}</div>
                                <div className="text-xs opacity-80 mt-1">{role.descripcion}</div>
                              </div>
                              {isSelected && (
                                <div className="flex-shrink-0 ml-2">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-600 px-6 py-4 border-t border-gray-500 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-500 text-sm font-medium rounded-md transition-colors ${
                    pagination.currentPage === 1
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-500 text-sm font-medium rounded-md transition-colors ${
                    pagination.currentPage === pagination.totalPages
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Mostrando página{" "}
                    <span className="font-medium text-white">{pagination.currentPage}</span>{" "}
                    de{" "}
                    <span className="font-medium text-white">{pagination.totalPages}</span>
                    {" "}({pagination.totalItems} usuarios total)
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-500 text-sm font-medium transition-colors ${
                        pagination.currentPage === 1
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-500 text-sm font-medium transition-colors ${
                        pagination.currentPage === pagination.totalPages
                          ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Nota informativa */}
      <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-200">Información sobre roles</h4>
            <div className="mt-1 text-sm text-blue-300 space-y-1">
              <p>• Los cambios de roles se aplican inmediatamente</p>
              <p>• Un usuario puede tener múltiples roles asignados</p>
              <p>• No puedes modificar tus propios roles por seguridad</p>
              <p>• Pasa el cursor sobre los roles para ver más detalles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;