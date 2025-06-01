import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import usuarios from "../../services/usuarios";
import {
  UserCircleIcon,
  ShieldCheckIcon,
  CogIcon,
  PresentationChartBarIcon,
  TicketIcon,
  EyeIcon,
  PlusCircleIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const roleOptions = [
  {
    id: 1,
    name: "admin",
    label: "Administrador",
    icon: <ShieldCheckIcon className="h-5 w-5 mr-2 text-purple-600" />,
    color: "bg-purple-100 text-purple-800",
    description:
      "Rol con acceso completo al sistema. Puede gestionar usuarios, eventos y configuraciones.",
  },
  {
    id: 2,
    name: "organizador",
    label: "Organizador",
    icon: <CogIcon className="h-5 w-5 mr-2 text-blue-600" />,
    color: "bg-blue-100 text-blue-800",
    description: "Puede crear y gestionar ferias, stands y eventos.",
  },
  {
    id: 3,
    name: "expositor",
    label: "Expositor",
    icon: <PresentationChartBarIcon className="h-5 w-5 mr-2 text-green-600" />,
    color: "bg-green-100 text-green-800",
    description: "Puede gestionar su stand, productos y promociones.",
  },
  {
    id: 4,
    name: "visitante",
    label: "Visitante",
    icon: <EyeIcon className="h-5 w-5 mr-2 text-yellow-600" />,
    color: "bg-yellow-100 text-yellow-800",
    description:
      "Rol con acceso solo a la navegación de ferias y visualización de información pública.",
  },
];

const RoleManagement = () => {
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
          totalItems: response.pagination.totalItems
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
    try {
      // Actualización optimista en UI
      setUserList((prev) =>
        prev.map((u) => {
          if (u.id_usuario === userId) {
            const updatedRoles = selectedRoles.map((roleName) => {
              const existing = u.roles.find((r) => r.nombre_rol === roleName);
              if (existing) return existing;
              const option = roleOptions.find((ro) => ro.name === roleName);
              return {
                id_rol: option?.id || null,
                nombre_rol: roleName,
                descripcion: option?.description || "",
                UsuarioRol: { fecha_asignacion: new Date().toISOString() },
              };
            });
            return { ...u, roles: updatedRoles };
          }
          return u;
        })
      );

      // TODO: llamada real a backend para actualizar roles
      // await usuarios.updateUsuarioRoles(userId, selectedRoles);

      setEditingUserId(null);
      setSelectedRoles([]);
    } catch (error) {
      console.error("Error al actualizar roles:", error);
      // Opcional: mostrar mensaje de error al usuario
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
  console.log(pagination);
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
          <p className="mt-2 text-gray-600">
            Administra los permisos y accesos de los usuarios del sistema
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Lista de Usuarios
            </h2>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                Total: {pagination.totalItems || 0}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <ArrowPathIcon className="h-12 w-12 text-indigo-600 animate-spin" />
            <p className="mt-4 text-gray-600">Cargando usuarios...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-md bg-red-100 text-red-700">
              <XMarkIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
            <button
              onClick={() => fetchUsers(pagination.currentPage)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              Reintentar
            </button>
          </div>
        ) : userList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay usuarios disponibles.
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {userList.map((u) => (
                <div
                  key={u.id_usuario}
                  className="px-6 py-4 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Información del usuario */}
                    <div className="flex items-center space-x-4">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{u.correo}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                            ID: {u.id_usuario}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              u.estado === "activo"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.estado}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Roles y acciones */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Mostrar roles actuales */}
                      <div className="flex flex-wrap gap-2">
                        {u.roles.map((role) => {
                          const roleOption = roleOptions.find(
                            (r) => r.name === role.nombre_rol
                          );
                          return (
                            <span
                              key={role.id_rol}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                roleOption?.color || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {roleOption?.icon || null}
                              {role.nombre_rol}
                            </span>
                          );
                        })}
                      </div>

                      {/* Acciones */}
                      {u.id_usuario !== user?.id_usuario ? (
                        editingUserId === u.id_usuario ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => saveRoleChanges(u.id_usuario)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Guardar
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(u.id_usuario, u.roles)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                          >
                            Editar Roles
                          </button>
                        )
                      ) : (
                        <span className="text-sm italic text-indigo-600">
                          (Tú)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selector de roles (solo en modo edición) */}
                  {editingUserId === u.id_usuario && (
                    <div className="mt-4 pl-14">
                      <div className="mb-2 text-sm font-medium text-gray-700">
                        Selecciona los roles para este usuario:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {roleOptions.map((role) => (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => toggleRoleSelection(role.name)}
                            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                              selectedRoles.includes(role.name)
                                ? `${role.color} ring-2 ring-offset-1 ring-indigo-500`
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {role.icon}
                            {role.label}
                          </button>
                        ))}
                        {/* <button
                          type="button"
                          onClick={() => setShowAddRoleModal(true)}
                          className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        >
                          <PlusCircleIcon className="h-5 w-5 mr-1 text-gray-500" />
                          Agregar Rol
                        </button> */}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Paginación */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === pagination.totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando página{" "}
                    <span className="font-medium">
                      {pagination.currentPage}
                    </span>{" "}
                    de{" "}
                    <span className="font-medium">{pagination.totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        pagination.currentPage === pagination.totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <ChevronRightIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal para agregar nuevo rol */}
      {showAddRoleModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                  <PlusCircleIcon
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Agregar Nuevo Rol
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Esta funcionalidad permite crear nuevos roles
                      personalizados para el sistema.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <div className="grid gap-4">
                  <div>
                    <label
                      htmlFor="role-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre del Rol
                    </label>
                    <input
                      type="text"
                      name="role-name"
                      id="role-name"
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="role-description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Descripción
                    </label>
                    <textarea
                      name="role-description"
                      id="role-description"
                      rows={3}
                      className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  Crear Rol
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
