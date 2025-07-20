import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import CredencialService from "../../services/CredencialService";
import ConfirmationModal from "../../components/ConfirmationModal";
import NotificationToast from "../../components/NotificationToast";
import { useNotification } from "../../hooks/useNotification";
import axios from "../../config/axios";
import {
  ShieldCheckIcon,
  ClockIcon,
  PrinterIcon,
  CheckBadgeIcon,
  XMarkIcon,
  EyeIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

const TiposCredencial = () => {
  const { user } = useAuth();
  const allowedRoles = ["administrador"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tipoEditando, setTipoEditando] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState({
    nombre_tipo: '',
    descripcion: '',
    nivel_acceso: 'basico',
    color_identificacion: '#3B82F6',
    duracion_validez_horas: 24,
    es_imprimible: true,
    requiere_aprobacion: false,
    permite_reingreso: true,
    activo: true
  });
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    const fetchTipos = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await CredencialService.getTipos();
        setTipos(res.data || []);
      } catch (err) {
        setError("Error al cargar tipos de credencial");
      } finally {
        setLoading(false);
      }
    };
    fetchTipos();
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gray-700 rounded-lg border border-red-600 p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
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
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h1 className="text-2xl font-bold text-white">Tipos de Credencial</h1>
        <p className="text-gray-400 mt-2">
          Administra los tipos de credencial disponibles en el sistema
        </p>
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            Listado de Tipos de Credencial
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Crear Tipo</span>
          </button>
        </div>
        {loading ? (
          <div className="text-gray-400">Cargando tipos de credencial...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : tipos.length === 0 ? (
          <div className="text-gray-400">
            No hay tipos de credencial registrados.
          </div>
        ) : (
          <div className="space-y-4">
            {tipos.map((tipo) => (
              <div key={tipo.id_tipo_credencial} className="bg-gray-700 rounded-lg border border-gray-600 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Información Principal */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <span 
                          className="inline-block w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: tipo.color_identificacion }}
                        ></span>
                        {tipo.nombre_tipo}
                        <span className="ml-2 text-sm text-gray-400">#{tipo.id_tipo_credencial}</span>
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tipo.activo
                            ? "bg-green-900 text-green-200"
                            : "bg-red-900 text-red-200"
                        }`}
                      >
                        {tipo.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div className="text-gray-300">
                      <p>{tipo.descripcion || "Sin descripción"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Nivel de Acceso:</p>
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-4 w-4 mr-2 text-blue-400" />
                          <span className="text-white capitalize font-medium">{tipo.nivel_acceso}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400">Duración de Validez:</p>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2 text-green-400" />
                          <span className="text-white">{tipo.duracion_validez_horas} horas</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400">Color de Identificación:</p>
                        <div className="flex items-center">
                          <div 
                            className="w-6 h-6 rounded border-2 border-gray-400 mr-2"
                            style={{ backgroundColor: tipo.color_identificacion }}
                          ></div>
                          <span className="text-white font-mono">{tipo.color_identificacion}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400">Configuración de Accesos:</p>
                        <span className="text-white">
                          {tipo.configuracion_accesos ? `Config ID: ${tipo.configuracion_accesos}` : "Configuración por defecto"}
                        </span>
                      </div>
                    </div>

                    {/* Fechas */}
                    <div className="border-t border-gray-600 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Fecha de Creación:</p>
                          <p className="text-white">
                            {new Date(tipo.created_at).toLocaleString()}
                          </p>
                        </div>
                        {tipo.updated_at && (
                          <div>
                            <p className="text-gray-400">Última Actualización:</p>
                            <p className="text-white">
                              {new Date(tipo.updated_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Características y Permisos */}
                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Características</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <PrinterIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-300 text-sm">Imprimible</span>
                        </div>
                        <span className={`text-sm ${tipo.es_imprimible ? 'text-green-400' : 'text-red-400'}`}>
                          {tipo.es_imprimible ? '✓' : '✗'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckBadgeIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-300 text-sm">Requiere Aprobación</span>
                        </div>
                        <span className={`text-sm ${tipo.requiere_aprobacion ? 'text-yellow-400' : 'text-green-400'}`}>
                          {tipo.requiere_aprobacion ? '✓' : '✗'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-gray-300 text-sm">Permite Reingreso</span>
                        </div>
                        <span className={`text-sm ${tipo.permite_reingreso ? 'text-green-400' : 'text-red-400'}`}>
                          {tipo.permite_reingreso ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>

                    {/* Información de Auditoría */}
                    <div className="border-t border-gray-600 pt-4">
                      <h5 className="text-gray-400 text-sm mb-2">Auditoría</h5>
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-gray-400">Creado por:</span>
                          <span className="text-white ml-2">
                            {tipo.created_by ? `Usuario ${tipo.created_by}` : "Sistema"}
                          </span>
                        </div>
                        {tipo.updated_by && (
                          <div>
                            <span className="text-gray-400">Actualizado por:</span>
                            <span className="text-white ml-2">Usuario {tipo.updated_by}</span>
                          </div>
                        )}
                        {tipo.deleted_by && (
                          <div>
                            <span className="text-gray-400">Eliminado por:</span>
                            <span className="text-red-400 ml-2">Usuario {tipo.deleted_by}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="space-y-2 pt-4">
                      <button
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        onClick={() => editarTipo(tipo)}
                      >
                        ✏️ Editar Tipo
                      </button>
                      <button
                        className={`w-full px-3 py-2 rounded text-sm transition-colors ${
                          tipo.activo 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                        onClick={() => toggleEstadoTipo(tipo)}
                      >
                        {tipo.activo ? '🚫 Desactivar' : '✅ Activar'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction?.action || (() => {})}
        title={confirmAction?.title || ""}
        message={confirmAction?.message || ""}
        confirmText={confirmAction?.confirmText || "Confirmar"}
        cancelText="Cancelar"
        type={confirmAction?.type || "warning"}
      />

      {/* Modal de Crear Tipo */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Crear Nuevo Tipo de Credencial</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={crearTipo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Tipo *
                  </label>
                  <input
                    type="text"
                    value={nuevoTipo.nombre_tipo}
                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, nombre_tipo: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nivel de Acceso *
                  </label>
                  <select
                    value={nuevoTipo.nivel_acceso}
                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, nivel_acceso: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="basico">Básico</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color de Identificación *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={nuevoTipo.color_identificacion}
                      onChange={(e) => setNuevoTipo({ ...nuevoTipo, color_identificacion: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-600"
                    />
                    <input
                      type="text"
                      value={nuevoTipo.color_identificacion}
                      onChange={(e) => setNuevoTipo({ ...nuevoTipo, color_identificacion: e.target.value })}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duración de Validez (horas) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8760"
                    value={nuevoTipo.duracion_validez_horas}
                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, duracion_validez_horas: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  value={nuevoTipo.descripcion}
                  onChange={(e) => setNuevoTipo({ ...nuevoTipo, descripcion: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción del tipo de credencial..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Características</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PrinterIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-300 text-sm">Es Imprimible</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nuevoTipo.es_imprimible}
                      onChange={(e) => setNuevoTipo({ ...nuevoTipo, es_imprimible: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckBadgeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-300 text-sm">Requiere Aprobación</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nuevoTipo.requiere_aprobacion}
                      onChange={(e) => setNuevoTipo({ ...nuevoTipo, requiere_aprobacion: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-300 text-sm">Permite Reingreso</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nuevoTipo.permite_reingreso}
                      onChange={(e) => setNuevoTipo({ ...nuevoTipo, permite_reingreso: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ShieldCheckIcon className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-gray-300 text-sm">Activo</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={nuevoTipo.activo}
                      onChange={(e) => setNuevoTipo({ ...nuevoTipo, activo: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-medium">Vista Previa</h4>
                  <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                    <div className="flex items-center mb-2">
                      <span 
                        className="inline-block w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: nuevoTipo.color_identificacion }}
                      ></span>
                      <span className="text-white font-medium">{nuevoTipo.nombre_tipo || 'Nombre del Tipo'}</span>
                    </div>
                    <div className="text-sm text-gray-300 mb-2">
                      {nuevoTipo.descripcion || 'Sin descripción'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Nivel: {nuevoTipo.nivel_acceso} | Validez: {nuevoTipo.duracion_validez_horas}h
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Tipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast de Notificación */}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </div>
  );

  // Funciones para las acciones
  async function crearTipo(e) {
    e.preventDefault();
    
    if (!nuevoTipo.nombre_tipo.trim()) {
      showError('El nombre del tipo es requerido');
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const response = await CredencialService.createTipo(nuevoTipo);
      
      // Actualizar la lista de tipos
      setTipos(prevTipos => [...prevTipos, response.data]);
      
      // Resetear el formulario
      setNuevoTipo({
        nombre_tipo: '',
        descripcion: '',
        nivel_acceso: 'basico',
        color_identificacion: '#3B82F6',
        duracion_validez_horas: 24,
        es_imprimible: true,
        requiere_aprobacion: false,
        permite_reingreso: true,
        activo: true
      });
      
      setShowCreateModal(false);
      showSuccess('Tipo de credencial creado exitosamente');
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear el tipo de credencial';
      setError(errorMessage);
      showError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  function editarTipo(tipo) {
    setTipoEditando(tipo);
    setShowEditModal(true);
  }

  async function toggleEstadoTipo(tipo) {
    const accion = tipo.activo ? 'desactivar' : 'activar';
    setConfirmAction({
      title: `${accion.charAt(0).toUpperCase() + accion.slice(1)} Tipo de Credencial`,
      message: `¿Está seguro de que desea ${accion} el tipo de credencial "${tipo.nombre_tipo}"?`,
      confirmText: accion.charAt(0).toUpperCase() + accion.slice(1),
      type: tipo.activo ? 'danger' : 'info',
      action: async () => {
        try {
          setLoading(true);
          await axios.post(`/credenciales/tipos/${tipo.id_tipo_credencial}/toggle-activo`);
          
          // Actualizar el estado local
          setTipos(prevTipos => 
            prevTipos.map(t => 
              t.id_tipo_credencial === tipo.id_tipo_credencial 
                ? { ...t, activo: !t.activo }
                : t
            )
          );
          
          setError("");
          showSuccess(`Tipo de credencial ${accion}do exitosamente`);
        } catch (err) {
          setError(`Error al ${accion} el tipo de credencial`);
          showError(`Error al ${accion} el tipo de credencial`);
          console.error('Error:', err);
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirmModal(true);
  }
};

export default TiposCredencial;
