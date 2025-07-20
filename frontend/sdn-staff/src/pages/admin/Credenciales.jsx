import React, { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import CredencialService from "../../services/CredencialService";
import ConfirmationModal from "../../components/ConfirmationModal";
import NotificationToast from "../../components/NotificationToast";
import { useNotification } from "../../hooks/useNotification";
import axios from "../../config/axios";
import QRCode from 'qrcode';
import {
  PlusIcon,
  XMarkIcon,
  QrCodeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Componente para mostrar QR
const QRCodeDisplay = ({ qrData, size = 120 }) => {
  const [qrImageUrl, setQrImageUrl] = useState('');

  useEffect(() => {
    if (qrData) {
      QRCode.toDataURL(qrData, {
        width: size,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).then(url => {
        setQrImageUrl(url);
      }).catch(err => {
        console.error('Error generando QR:', err);
      });
    }
  }, [qrData, size]);

  if (!qrImageUrl) {
    return <div className="w-30 h-30 bg-gray-300 animate-pulse rounded"></div>;
  }

  return <img src={qrImageUrl} alt="QR Code" className="rounded" />;
};

const Credenciales = () => {
  const { user } = useAuth();
  const allowedRoles = ["administrador"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  const [credenciales, setCredenciales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tiposCredencial, setTiposCredencial] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [credencialEditando, setCredencialEditando] = useState(null);
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Estado para nueva credencial
  const [nuevaCredencial, setNuevaCredencial] = useState({
    id_usuario: "",
    id_evento: "",
    id_tipo_credencial: "",
    nombre_completo: "",
    empresa_organizacion: "",
    cargo_puesto: "",
    telefono: "",
    email: "",
    observaciones: "",
    fecha_vencimiento: "",
  });

  useEffect(() => {
    const fetchCredenciales = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await CredencialService.getAll();
        setCredenciales(res.data || []);
      } catch (err) {
        setError("Error al cargar credenciales");
      } finally {
        setLoading(false);
      }
    };
    fetchCredenciales();
    cargarDatosFormulario();
  }, []);

  const cargarDatosFormulario = async () => {
    try {
      // Cargar tipos de credencial
      try {
        const tiposRes = await axios.get("/credenciales/tipos");
        console.log("Tipos de credencial response:", tiposRes.data);
        setTiposCredencial(tiposRes.data.data || []);
      } catch (tiposError) {
        console.error("Error cargando tipos de credencial:", tiposError);
        // Fallback: intentar con endpoint de activos
        try {
          const tiposActivosRes = await axios.get("/credenciales/tipos/activos");
          console.log("Tipos activos response:", tiposActivosRes.data);
          setTiposCredencial(tiposActivosRes.data.data || []);
        } catch (activosError) {
          console.error("Error cargando tipos activos:", activosError);
        }
      }

      // Cargar eventos
      const eventosRes = await axios.get("/eventos");
      console.error("Eventos cargados:", eventosRes.data.data);
      setEventos(eventosRes.data.data || []);

      // Cargar usuarios
      const usuariosRes = await axios.get("/usuarios");
      setUsuarios(usuariosRes.data.data || []);
    } catch (error) {
      console.error("Error cargando datos para formulario:", error);
    }
  };

  const handleCreateCredencial = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      let response;
      
      if (isEditing && credencialEditando) {
        // Actualizar credencial existente
        response = await axios.put(`/credenciales/${credencialEditando.id_credencial}`, nuevaCredencial);
        
        if (response.data.success) {
          // Actualizar la credencial en la lista
          setCredenciales(prev => prev.map(c => 
            c.id_credencial === credencialEditando.id_credencial 
              ? response.data.data 
              : c
          ));
          showSuccess("Credencial actualizada exitosamente");
        }
      } else {
        // Crear nueva credencial
        response = await axios.post("/credenciales", nuevaCredencial);
        
        if (response.data.success) {
          setCredenciales(prev => [...prev, response.data.data]);
          showSuccess("Credencial creada exitosamente");
        }
      }
      
      // Limpiar formulario y cerrar modal
      setShowCreateModal(false);
      setIsEditing(false);
      setCredencialEditando(null);
      setNuevaCredencial({
        id_usuario: "",
        id_evento: "",
        id_tipo_credencial: "",
        nombre_completo: "",
        empresa_organizacion: "",
        cargo_puesto: "",
        telefono: "",
        email: "",
        observaciones: "",
        fecha_vencimiento: "",
      });
      
    } catch (error) {
      console.error("Error procesando credencial:", error);
      const errorMessage = error.response?.data?.message || `Error al ${isEditing ? 'actualizar' : 'crear'} credencial`;
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
      {/* Header */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <QrCodeIcon className="h-8 w-8 mr-3 text-blue-400" />
              Gestión de Credenciales
            </h1>
            <p className="text-gray-400 mt-2">
              Administra las credenciales emitidas para los usuarios y expositores
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nueva Credencial
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 mt-4">
        <h2 className="text-xl font-semibold text-white mb-4">
          Listado de Credenciales
        </h2>
        {loading ? (
          <div className="text-gray-400">Cargando credenciales...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : credenciales.length === 0 ? (
          <div className="text-gray-400">No hay credenciales registradas.</div>
        ) : (
          <div className="space-y-4">
            {credenciales.map((cred) => (
              <div key={cred.id_credencial} className="bg-gray-700 rounded-lg border border-gray-600 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Información Principal */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <UserIcon className="h-5 w-5 mr-2 text-blue-400" />
                        {cred.nombre_completo}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cred.estado === "activa"
                            ? "bg-green-900 text-green-200"
                            : cred.estado === "pendiente"
                            ? "bg-yellow-900 text-yellow-200"
                            : "bg-gray-700 text-gray-300"
                        }`}
                      >
                        {cred.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">ID:</p>
                        <p className="text-white font-mono">{cred.id_credencial}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Código:</p>
                        <p className="text-white font-mono">{cred.codigo_unico}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Tipo:</p>
                        <p className="text-white">
                          <span 
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: cred.tipoCredencial?.color_identificacion || '#gray' }}
                          ></span>
                          {cred.tipoCredencial?.nombre_tipo || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Nivel de Acceso:</p>
                        <p className="text-white capitalize">{cred.tipoCredencial?.nivel_acceso || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Email:</p>
                        <p className="text-white">{cred.email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Teléfono:</p>
                        <p className="text-white">{cred.telefono || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Empresa:</p>
                        <p className="text-white">{cred.empresa_organizacion || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Usuario Asignado:</p>
                        <p className="text-white">{cred.usuario?.correo || "Sin asignar"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Evento:</p>
                        <p className="text-white">{cred.evento?.nombre_evento || "-"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Fecha Emisión:</p>
                        <p className="text-white">
                          {cred.fecha_emision
                            ? new Date(cred.fecha_emision).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {/* Estadísticas de uso */}
                    <div className="border-t border-gray-600 pt-4">
                      <p className="text-gray-400 text-sm mb-2">Estadísticas de Uso:</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Validaciones:</p>
                          <p className="text-white font-semibold">{cred.total_validaciones || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Reimpresiones:</p>
                          <p className="text-white font-semibold">{cred.total_reimpresiones || 0}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Última Validación:</p>
                          <p className="text-white text-xs">
                            {cred.ultima_validacion 
                              ? new Date(cred.ultima_validacion).toLocaleDateString()
                              : "Nunca"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Código QR */}
                  <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Código QR</h4>
                    <div className="bg-white p-4 rounded-lg">
                      <QRCodeDisplay qrData={cred.qr_data} size={120} />
                    </div>
                    <p className="text-gray-400 text-xs mt-2 text-center">
                      Escanea para validar
                    </p>
                    <p className="text-gray-500 text-xs mt-1 text-center font-mono">
                      {cred.qr_hash?.substring(0, 16)}...
                    </p>
                  </div>

                  {/* Accesos y Acciones */}
                  <div className="space-y-4">
                    {/* Lista de Accesos */}
                    {cred.accesos && cred.accesos.length > 0 && (
                      <div>
                        <h4 className="text-white font-medium mb-2">Accesos Otorgados:</h4>
                        <div className="space-y-2">
                          {cred.accesos.map((acceso, index) => (
                            <div key={acceso.id_acceso || index} className="bg-gray-600 rounded p-2">
                              <p className="text-white text-sm font-medium">
                                {acceso.descripcion_acceso || acceso.tipo_acceso}
                              </p>
                              <p className="text-gray-300 text-xs">
                                Usos: {acceso.usos_realizados || 0}
                                {acceso.limite_usos_totales && ` / ${acceso.limite_usos_totales}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="space-y-2">
                      <button
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                        onClick={() => descargarQR(cred)}
                      >
                        📱 Descargar QR
                      </button>
                      <button
                        className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                        onClick={() => generarPDF(cred)}
                      >
                        📄 Generar PDF
                      </button>
                      <button
                        className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                        onClick={() => editarCredencial(cred)}
                      >
                        ✏️ Editar
                      </button>
                      {cred.estado === "activa" && (
                        <button
                          className="w-full bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                          onClick={() => revocarCredencial(cred)}
                        >
                          🚫 Revocar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear credencial */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateCredencial}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-semibold text-white">
                    {isEditing ? 'Editar Credencial' : 'Crear Nueva Credencial'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditing(false);
                      setCredencialEditando(null);
                      setNuevaCredencial({
                        id_usuario: "",
                        id_evento: "",
                        id_tipo_credencial: "",
                        nombre_completo: "",
                        empresa_organizacion: "",
                        cargo_puesto: "",
                        telefono: "",
                        email: "",
                        observaciones: "",
                        fecha_vencimiento: "",
                      });
                    }}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Usuario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Usuario (Opcional)
                    </label>
                    <select
                      value={nuevaCredencial.id_usuario}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          id_usuario: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Sin usuario asignado</option>
                      {usuarios.map((usuario) => (
                        <option key={usuario.id_usuario} value={usuario.id_usuario}>
                          {usuario.correo} - {usuario.nombre} {usuario.apellido}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Evento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Evento *
                    </label>
                    <select
                      value={nuevaCredencial.id_evento}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          id_evento: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar evento</option>
                      {eventos.map((evento) => (
                        <option key={evento.id_evento} value={evento.id_evento}>
                          {evento.nombre_evento}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de Credencial */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Credencial *
                    </label>
                    <select
                      value={nuevaCredencial.id_tipo_credencial}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          id_tipo_credencial: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      {tiposCredencial.map((tipo) => (
                        <option key={tipo.id_tipo_credencial} value={tipo.id_tipo_credencial}>
                          {tipo.nombre_tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={nuevaCredencial.nombre_completo}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          nombre_completo: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      placeholder="Nombre completo del portador"
                      required
                    />
                  </div>

                  {/* Empresa/Organización */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Empresa/Organización
                    </label>
                    <input
                      type="text"
                      value={nuevaCredencial.empresa_organizacion}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          empresa_organizacion: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      placeholder="Empresa u organización"
                    />
                  </div>

                  {/* Cargo/Puesto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cargo/Puesto
                    </label>
                    <input
                      type="text"
                      value={nuevaCredencial.cargo_puesto}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          cargo_puesto: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      placeholder="Cargo o puesto"
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={nuevaCredencial.telefono}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          telefono: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      placeholder="Número de teléfono"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={nuevaCredencial.email}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                      placeholder="Correo electrónico"
                    />
                  </div>

                  {/* Fecha de Vencimiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      value={nuevaCredencial.fecha_vencimiento}
                      onChange={(e) =>
                        setNuevaCredencial((prev) => ({
                          ...prev,
                          fecha_vencimiento: e.target.value,
                        }))
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Observaciones */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={nuevaCredencial.observaciones}
                    onChange={(e) =>
                      setNuevaCredencial((prev) => ({
                        ...prev,
                        observaciones: e.target.value,
                      }))
                    }
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                    rows="3"
                    placeholder="Observaciones adicionales (opcional)"
                  />
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditing(false);
                      setCredencialEditando(null);
                      setNuevaCredencial({
                        id_usuario: "",
                        id_evento: "",
                        id_tipo_credencial: "",
                        nombre_completo: "",
                        empresa_organizacion: "",
                        cargo_puesto: "",
                        telefono: "",
                        email: "",
                        observaciones: "",
                        fecha_vencimiento: "",
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (isEditing ? "Actualizando..." : "Creando...") : (isEditing ? "Actualizar Credencial" : "Crear Credencial")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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

  // Funciones para las acciones de las credenciales
  function descargarQR(credencial) {
    if (!credencial.qr_data) {
      showError('No hay código QR disponible para esta credencial');
      return;
    }

    // Generar QR y descargarlo
    QRCode.toDataURL(credencial.qr_data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }).then(url => {
      const link = document.createElement('a');
      link.download = `credencial-qr-${credencial.codigo_unico}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccess('Código QR descargado exitosamente');
    }).catch(err => {
      console.error('Error generando QR para descarga:', err);
      showError('Error al generar el código QR');
    });
  }

  async function generarPDF(credencial) {
    try {
      setLoading(true);
      const response = await axios.get(`/credenciales/${credencial.id_credencial}/pdf`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credencial-${credencial.codigo_unico}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showSuccess('PDF de credencial descargado exitosamente');
    } catch (err) {
      setError('Error al generar el PDF de la credencial');
      showError('Error al generar el PDF de la credencial');
      console.error('Error generando PDF:', err);
    } finally {
      setLoading(false);
    }
  }

  function editarCredencial(credencial) {
    setError('');
    setIsEditing(true);
    setCredencialEditando(credencial);
    // Llenar el formulario con los datos actuales
    setNuevaCredencial({
      id_usuario: credencial.id_usuario || "",
      id_evento: credencial.id_evento || "",
      id_tipo_credencial: credencial.id_tipo_credencial || "",
      nombre_completo: credencial.nombre_completo || "",
      empresa_organizacion: credencial.empresa_organizacion || "",
      cargo_puesto: credencial.cargo_titulo || "",
      telefono: credencial.telefono || "",
      email: credencial.email || "",
      observaciones: credencial.notas_internas || "",
      fecha_vencimiento: credencial.fecha_expiracion ? credencial.fecha_expiracion.split('T')[0] : "",
    });
    setShowCreateModal(true);
  }

  function revocarCredencial(credencial) {
    setConfirmAction({
      title: "Revocar Credencial",
      message: `¿Está seguro de que desea revocar la credencial ${credencial.codigo_unico}? Esta acción no se puede deshacer.`,
      confirmText: "Revocar",
      type: "danger",
      action: async () => {
        try {
          setLoading(true);
          await axios.put(`/credenciales/${credencial.id_credencial}`, {
            estado: 'revocada'
          });
          
          // Actualizar el estado local
          setCredenciales(prevCredenciales => 
            prevCredenciales.map(c => 
              c.id_credencial === credencial.id_credencial 
                ? { ...c, estado: 'revocada' }
                : c
            )
          );
          
          setError("");
          showSuccess('Credencial revocada exitosamente');
        } catch (err) {
          setError('Error al revocar la credencial');
          showError('Error al revocar la credencial');
          console.error('Error:', err);
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirmModal(true);
  }
};

export default Credenciales;
