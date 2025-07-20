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
        <h2 className="text-xl font-semibold text-white mb-4">
          Listado de Tipos de Credencial
        </h2>
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
