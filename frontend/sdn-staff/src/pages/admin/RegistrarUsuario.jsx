import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import axios from "../../config/axios";
import {
  UserPlusIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const RegistrarUsuario = () => {
  const { user } = useAuth();
  const allowedRoles = ["administrador"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado para nuevo usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    cargo: "",
    departamento: "",
    activo: true,
    roles: [], // Array de IDs de roles
  });

  useEffect(() => {
    if (isAuthorized) {
      cargarUsuarios();
      cargarRoles();
    }
  }, [isAuthorized]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/usuarios");
      setUsuarios(response.data.data || []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const cargarRoles = async () => {
    try {
      const response = await axios.get("/roles");
      setRoles(response.data.data || []);
    } catch (error) {
      console.error("Error cargando roles:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setNuevoUsuario(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (roleId, checked) => {
    setNuevoUsuario(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(id => id !== roleId)
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!nuevoUsuario.nombre.trim()) errors.push("El nombre es requerido");
    if (!nuevoUsuario.apellido.trim()) errors.push("El apellido es requerido");
    if (!nuevoUsuario.correo.trim()) errors.push("El correo es requerido");
    if (!nuevoUsuario.password.trim()) errors.push("La contraseña es requerida");
    if (nuevoUsuario.password !== nuevoUsuario.confirmPassword) {
      errors.push("Las contraseñas no coinciden");
    }
    if (nuevoUsuario.password.length < 6) {
      errors.push("La contraseña debe tener al menos 6 caracteres");
    }
    if (nuevoUsuario.roles.length === 0) {
      errors.push("Debe asignar al menos un rol");
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (nuevoUsuario.correo && !emailRegex.test(nuevoUsuario.correo)) {
      errors.push("El formato del correo no es válido");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    setLoading(true);
    try {
      const userData = {
        nombre: nuevoUsuario.nombre,
        apellido: nuevoUsuario.apellido,
        correo: nuevoUsuario.correo,
        password: nuevoUsuario.password,
        telefono: nuevoUsuario.telefono,
        cargo: nuevoUsuario.cargo,
        departamento: nuevoUsuario.departamento,
        activo: nuevoUsuario.activo,
        roles: nuevoUsuario.roles
      };

      const response = await axios.post("/usuarios", userData);
      
      if (response.data.success) {
        setSuccess("Usuario creado exitosamente");
        setNuevoUsuario({
          nombre: "",
          apellido: "",
          correo: "",
          password: "",
          confirmPassword: "",
          telefono: "",
          cargo: "",
          departamento: "",
          activo: true,
          roles: [],
        });
        cargarUsuarios();
      }
    } catch (error) {
      console.error("Error creando usuario:", error);
      setError(error.response?.data?.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNuevoUsuario({
      nombre: "",
      apellido: "",
      correo: "",
      password: "",
      confirmPassword: "",
      telefono: "",
      cargo: "",
      departamento: "",
      activo: true,
      roles: [],
    });
    setError("");
    setSuccess("");
  };

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gray-700 rounded-lg border border-red-600 p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">No autorizado</h3>
              <p className="text-gray-300">
                No tienes permisos para acceder a esta sección
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <UserPlusIcon className="h-8 w-8 mr-3 text-blue-400" />
          Registro de Usuarios
        </h1>
        <p className="text-gray-400 mt-2">
          Crear y gestionar cuentas de usuario del sistema
        </p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-200">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-600 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-green-200">{success}</span>
            <button
              onClick={() => setSuccess("")}
              className="ml-auto text-green-400 hover:text-green-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Crear Nuevo Usuario
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={nuevoUsuario.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Nombre del usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                value={nuevoUsuario.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Apellido del usuario"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico *
              </label>
              <input
                type="email"
                value={nuevoUsuario.correo}
                onChange={(e) => handleInputChange("correo", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={nuevoUsuario.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Número de teléfono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cargo
              </label>
              <input
                type="text"
                value={nuevoUsuario.cargo}
                onChange={(e) => handleInputChange("cargo", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Cargo o puesto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Departamento
              </label>
              <input
                type="text"
                value={nuevoUsuario.departamento}
                onChange={(e) => handleInputChange("departamento", e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                placeholder="Departamento o área"
              />
            </div>
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={nuevoUsuario.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={nuevoUsuario.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  placeholder="Repetir contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Roles del Usuario *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roles.map((rol) => (
                <label key={rol.id_rol} className="flex items-center space-x-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={nuevoUsuario.roles.includes(rol.id_rol)}
                    onChange={(e) => handleRoleChange(rol.id_rol, e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{rol.nombre_rol}</span>
                  {rol.descripcion && (
                    <span className="text-xs text-gray-400">({rol.descripcion})</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="flex items-center space-x-2 text-gray-300">
              <input
                type="checkbox"
                checked={nuevoUsuario.activo}
                onChange={(e) => handleInputChange("activo", e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Usuario activo</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Limpiar Formulario
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de usuarios existentes */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          Usuarios Registrados ({usuarios.length})
        </h2>
        
        {loading ? (
          <div className="text-gray-400">Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div className="text-gray-400">No hay usuarios registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td className="px-4 py-2 text-white">
                      {usuario.nombre} {usuario.apellido}
                    </td>
                    <td className="px-4 py-2 text-white">
                      {usuario.correo}
                    </td>
                    <td className="px-4 py-2 text-white">
                      {usuario.roles?.map(r => r.nombre_rol).join(", ") || "-"}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.activo
                            ? "bg-green-900 text-green-200"
                            : "bg-red-900 text-red-200"
                        }`}
                      >
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-white">
                      {usuario.created_at
                        ? new Date(usuario.created_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrarUsuario;