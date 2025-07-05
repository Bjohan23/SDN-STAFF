import React, { useState, useEffect } from "react";
import axios from "../../config/axios";
import { useAuth } from "../../auth/AuthContext";
import RegistrarTipoEvento from "./RegistrarTipoEvento";
import eventosService from '../../services/eventosService';

const initialState = {
  nombre_evento: "",
  descripcion: "",
  fecha_inicio: "",
  fecha_fin: "",
  ubicacion: "",
  url_virtual: "",
  id_tipo_evento: "",
  estado: "borrador",
  imagen_logo: "",
  capacidad_maxima: "",
  precio_entrada: "",
  moneda: "PEN",
  configuracion_especifica: "",
};

const estados = [
  { value: "borrador", label: "Borrador", color: "bg-gray-900 text-gray-200" },
  { value: "publicado", label: "Publicado", color: "bg-blue-900 text-blue-200" },
  { value: "activo", label: "Activo", color: "bg-green-900 text-green-200" },
  { value: "finalizado", label: "Finalizado", color: "bg-purple-900 text-purple-200" },
  { value: "archivado", label: "Archivado", color: "bg-red-900 text-red-200" }
];

import { useParams } from 'react-router-dom';

const CrearEvento = () => {
  const { id_evento } = useParams(); // Si existe, es edición
  // ... (resto igual)

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventosRecientes, setEventosRecientes] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loadingFiltrados, setLoadingFiltrados] = useState(false);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showRegistrarTipo, setShowRegistrarTipo] = useState(false);
  const { user } = useAuth();
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [eventoParaEditar, setEventoParaEditar] = useState(null);

  const fetchEventosRecientes = async () => {
    try {
      const res = await axios.get('/api/eventos?limit=10');
      setEventosRecientes(res.data.data || []);
    } catch (e) {
      setEventosRecientes([]);
    }
  };

  const fetchEventosFiltrados = async (tipoId = '') => {
    setLoadingFiltrados(true);
    try {
      if (tipoId) {
        const res = await eventosService.getEventosPorTipo(tipoId, 1, 10);
        setEventosFiltrados(res.data || []);
      } else {
        setEventosFiltrados(eventosRecientes);
      }
    } catch (e) {
      setEventosFiltrados([]);
    } finally {
      setLoadingFiltrados(false);
    }
  };

  useEffect(() => {
    fetchEventosRecientes();
    fetchTiposEvento();
    // Si es edición, cargar datos del evento
    if (id_evento) {
      setIsEditMode(true);
      setLoading(true);
      import('../../services/eventosService').then(({ default: eventosService }) => {
        eventosService.getEventoById(id_evento)
          .then(res => {
            const data = res.data;
            setForm({
              ...initialState,
              ...data,
              fecha_inicio: data.fecha_inicio ? data.fecha_inicio.slice(0, 10) : '',
              fecha_fin: data.fecha_fin ? data.fecha_fin.slice(0, 10) : '',
              configuracion_especifica: data.configuracion_especifica ? JSON.stringify(data.configuracion_especifica, null, 2) : '',
            });
          })
          .catch(() => setError('No se pudo cargar el evento'))
          .finally(() => setLoading(false));
      });
    }
  }, [id_evento]);

  useEffect(() => {
    if (tipoFiltro) {
      fetchEventosFiltrados(tipoFiltro);
    } else {
      setEventosFiltrados(eventosRecientes);
    }
    // eslint-disable-next-line
  }, [tipoFiltro, eventosRecientes]);

  const fetchTiposEvento = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/tiposEvento", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lista = res.data.data || [];
      setTiposEvento(lista);
    } catch {
      setTiposEvento([]);
    }
  };

  const allowedRoles = ["administrador", "manager"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gray-700 rounded-lg border border-red-600 p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">No autorizado</h3>
              <p className="text-gray-300">No tienes permisos para acceder a esta sección</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!form.nombre_evento.trim())
      errors.nombre_evento = "El nombre es obligatorio";
    if (form.nombre_evento.length < 3 || form.nombre_evento.length > 100)
      errors.nombre_evento = "Debe tener entre 3 y 100 caracteres";
    if (!form.fecha_inicio) errors.fecha_inicio = "Fecha de inicio requerida";
    if (!form.fecha_fin) errors.fecha_fin = "Fecha de fin requerida";
    if (
      form.fecha_inicio &&
      form.fecha_fin &&
      form.fecha_fin < form.fecha_inicio
    )
      errors.fecha_fin = "La fecha de fin debe ser posterior a la de inicio";
    if (!form.id_tipo_evento)
      errors.id_tipo_evento = "Selecciona el tipo de evento";
    if (form.capacidad_maxima && parseInt(form.capacidad_maxima) <= 0)
      errors.capacidad_maxima = "Debe ser mayor a 0";
    if (form.precio_entrada && parseFloat(form.precio_entrada) < 0)
      errors.precio_entrada = "No puede ser negativo";
    if (form.configuracion_especifica) {
      try {
        JSON.parse(form.configuracion_especifica);
      } catch {
        errors.configuracion_especifica = "Debe ser un JSON válido";
      }
    }
    return errors;
  };

  const handleEditEvento = async (evento) => {
    setEventoParaEditar(evento);
    setForm({
      ...initialState,
      ...evento,
      fecha_inicio: evento.fecha_inicio ? evento.fecha_inicio.slice(0, 10) : '',
      fecha_fin: evento.fecha_fin ? evento.fecha_fin.slice(0, 10) : '',
      configuracion_especifica: evento.configuracion_especifica ? JSON.stringify(evento.configuracion_especifica, null, 2) : '',
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e, estadoFinal = "borrador") => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        estado: estadoFinal,
        capacidad_maxima: form.capacidad_maxima
          ? parseInt(form.capacidad_maxima)
          : null,
        precio_entrada: form.precio_entrada
          ? parseFloat(parseFloat(form.precio_entrada).toFixed(2))
          : null,
        configuracion_especifica: form.configuracion_especifica
          ? JSON.parse(form.configuracion_especifica)
          : null,
      };
      if (isEditMode && (id_evento || eventoParaEditar)) {
        // EDITAR
        const eventoId = id_evento || eventoParaEditar.id_evento;
        import('../../services/eventosService').then(({ default: eventosService }) => {
          eventosService.updateEvento(eventoId, payload)
            .then(() => {
              setSuccess('Evento actualizado exitosamente');
              fetchEventosRecientes();
              setShowModal(false);
              setEventoParaEditar(null);
              setIsEditMode(false);
              setForm(initialState);
            })
            .catch(err => {
              setError(err.response?.data?.message || 'Error al actualizar evento');
            })
            .finally(() => setLoading(false));
        });
      } else {
        // CREAR
        await axios.post("/api/eventos", payload);
        setSuccess("Evento creado exitosamente");
        setForm(initialState);
        setFieldErrors({});
        fetchEventosRecientes();
        setShowModal(false);
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear evento");
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estadoConfig = estados.find(e => e.value === estado) || estados[0];
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoConfig.color}`;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-9 p-4 md:p-8 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Gestión de Eventos</h2>
        <p className="text-gray-400">Crea y administra eventos del sistema</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12h0m-8 0h16a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Eventos</p>
              <p className="text-2xl font-semibold text-white">{eventosRecientes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Eventos Activos</p>
              <p className="text-2xl font-semibold text-green-300">{eventosRecientes.filter(e => e.estado === 'activo').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Tipos Disponibles</p>
              <p className="text-2xl font-semibold text-purple-300">{tiposEvento.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Acción principal */}
      <div className="bg-gray-700 rounded-lg border border-gray-600 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            ¿Quieres crear un nuevo evento?
          </h3>
          <p className="text-gray-400 mb-4">
            Configura todos los detalles y publica tu evento
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-700 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Crear Nuevo Evento
          </button>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className="bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden">
        <div className="bg-gray-600 px-6 py-4 border-b border-gray-500">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12h0m-8 0h16a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Gestión de Eventos
          </h3>
        </div>
        <div className="flex flex-col md:flex-row gap-6 p-6 bg-gray-700">
          {/* Tabla de todos los eventos recientes */}
          <div className="flex-1 bg-gray-800 rounded-lg shadow p-4 border border-gray-600">
            <h4 className="text-md font-bold text-white mb-3 text-center">Todos los eventos recientes</h4>
            {eventosRecientes.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay eventos recientes</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Evento</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fechas</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {eventosRecientes.map(ev => (
                      <tr key={ev.id_evento} className="hover:bg-gray-600 transition-colors duration-200">
                        <td className="px-4 py-2 whitespace-nowrap text-white">{ev.nombre_evento}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-200">
                            {ev.tipoEvento?.nombre_tipo || "No especificado"}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={getEstadoBadge(ev.estado)}>{ev.estado}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-white">
                          {formatFecha(ev.fecha_inicio)}<br />
                          <span className="text-gray-400">hasta {formatFecha(ev.fecha_fin)}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            onClick={() => handleEditEvento(ev)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-200 bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* Tabla de eventos filtrados */}
          <div className="flex-1 bg-gray-800 rounded-lg shadow p-4 border border-gray-600">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
              <h4 className="text-md font-bold text-white text-center md:text-left">Filtrar por tipo de evento</h4>
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <button
                  className={`px-3 py-1 rounded font-semibold border transition shadow-sm ${tipoFiltro === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-800 text-gray-200 border-gray-500 hover:bg-indigo-700 hover:text-white'}`}
                  onClick={() => setTipoFiltro('')}
                >
                  Todos
                </button>
                {tiposEvento.map(tipo => (
                  <button
                    key={tipo.id_tipo_evento}
                    className={`px-3 py-1 rounded font-semibold border transition shadow-sm ${tipoFiltro === String(tipo.id_tipo_evento) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-800 text-gray-200 border-gray-500 hover:bg-indigo-700 hover:text-white'}`}
                    onClick={() => setTipoFiltro(String(tipo.id_tipo_evento))}
                  >
                    {tipo.nombre_tipo}
                  </button>
                ))}
                <button
                  onClick={() => fetchEventosFiltrados(tipoFiltro)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-blue-200 bg-blue-700 hover:bg-blue-600 transition-colors ml-2"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recargar
                </button>
              </div>
            </div>
            {loadingFiltrados ? (
              <div className="p-8 text-center text-white">Cargando eventos...</div>
            ) : eventosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No hay eventos para este filtro</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Evento</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fechas</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {eventosFiltrados.map(ev => (
                      <tr key={ev.id_evento} className="hover:bg-gray-600 transition-colors duration-200">
                        <td className="px-4 py-2 whitespace-nowrap text-white">{ev.nombre_evento}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-200">
                            {ev.tipoEvento?.nombre_tipo || "No especificado"}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={getEstadoBadge(ev.estado)}>{ev.estado}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-white">
                          {formatFecha(ev.fecha_inicio)}<br />
                          <span className="text-gray-400">hasta {formatFecha(ev.fecha_fin)}</span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            onClick={() => handleEditEvento(ev)}
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-200 bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de crear evento */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="relative inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-600">
              <div className="bg-gray-800 px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl leading-6 font-bold text-white">
                    {isEditMode ? 'Editar Evento' : 'Crear Nuevo Evento'}
                  </h3>
                  <button
                    type="button"
                    className="bg-gray-700 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  {/* Mensajes de estado */}
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
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-900 border border-green-600 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-green-200 font-medium">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formulario */}
                  <div className="space-y-6">
                    {/* Nombre del evento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre del evento *
                      </label>
                      <input
                        name="nombre_evento"
                        value={form.nombre_evento}
                        onChange={handleChange}
                        placeholder="Nombre del evento"
                        className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                          fieldErrors.nombre_evento
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                      />
                      {fieldErrors.nombre_evento && (
                        <p className="mt-1 text-sm text-red-400">{fieldErrors.nombre_evento}</p>
                      )}
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        placeholder="Descripción del evento"
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Fecha de inicio *
                        </label>
                        <input
                          type="date"
                          name="fecha_inicio"
                          value={form.fecha_inicio}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${
                            fieldErrors.fecha_inicio
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {fieldErrors.fecha_inicio && (
                          <p className="mt-1 text-sm text-red-400">{fieldErrors.fecha_inicio}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Fecha de fin *
                        </label>
                        <input
                          type="date"
                          name="fecha_fin"
                          value={form.fecha_fin}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${
                            fieldErrors.fecha_fin
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {fieldErrors.fecha_fin && (
                          <p className="mt-1 text-sm text-red-400">{fieldErrors.fecha_fin}</p>
                        )}
                      </div>
                    </div>

                    {/* Ubicación y URL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Ubicación
                        </label>
                        <input
                          name="ubicacion"
                          value={form.ubicacion}
                          onChange={handleChange}
                          placeholder="Ubicación física (si aplica)"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          URL virtual
                        </label>
                        <input
                          name="url_virtual"
                          value={form.url_virtual}
                          onChange={handleChange}
                          placeholder="URL virtual (si aplica)"
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Tipo de evento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de evento *
                      </label>
                      <div className="flex gap-2 items-center">
                        <select
                          name="id_tipo_evento"
                          value={form.id_tipo_evento}
                          onChange={handleChange}
                          className={`flex-1 px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${
                            fieldErrors.id_tipo_evento
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        >
                          <option value="">Selecciona tipo</option>
                          {tiposEvento.map((tipo) => (
                            <option key={tipo.id_tipo_evento} value={tipo.id_tipo_evento}>
                              {tipo.nombre_tipo}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="px-3 py-2 text-sm bg-gray-600 text-gray-300 rounded border border-gray-500 hover:bg-gray-500 transition-colors"
                          onClick={() => setShowRegistrarTipo(true)}
                        >
                          + Nuevo
                        </button>
                      </div>
                      {fieldErrors.id_tipo_evento && (
                        <p className="mt-1 text-sm text-red-400">{fieldErrors.id_tipo_evento}</p>
                      )}
                    </div>

                    {/* Estado del evento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Estado
                      </label>
                      <select
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        {estados.map((e) => (
                          <option key={e.value} value={e.value}>
                            {e.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Capacidad, Precio, Moneda */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Capacidad máxima
                        </label>
                        <input
                          name="capacidad_maxima"
                          type="number"
                          value={form.capacidad_maxima}
                          onChange={handleChange}
                          placeholder="Capacidad"
                          min={1}
                          className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                            fieldErrors.capacidad_maxima
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {fieldErrors.capacidad_maxima && (
                          <p className="mt-1 text-sm text-red-400">{fieldErrors.capacidad_maxima}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Precio de entrada
                        </label>
                        <input
                          name="precio_entrada"
                          type="number"
                          step="0.01"
                          value={form.precio_entrada}
                          onChange={handleChange}
                          placeholder="Precio"
                          min={0}
                          className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                            fieldErrors.precio_entrada
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                        />
                        {fieldErrors.precio_entrada && (
                          <p className="mt-1 text-sm text-red-400">{fieldErrors.precio_entrada}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Moneda *
                        </label>
                        <input
                          name="moneda"
                          value={form.moneda}
                          onChange={handleChange}
                          placeholder="PEN"
                          maxLength={3}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={(e) => handleSubmit(e, "borrador")}
                        className="inline-flex items-center px-4 py-2 border border-gray-500 text-sm font-medium rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
                            Guardando...
                          </>
                        ) : (
                          isEditMode ? 'Actualizar como borrador' : 'Guardar como borrador'
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={(e) => handleSubmit(e, "publicado")}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Publicando...
                          </>
                        ) : (
                          isEditMode ? 'Publicar cambios' : 'Publicar evento'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para registrar tipo de evento */}
      {showRegistrarTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 p-4">
          <div className="relative w-full max-w-md">
            <button
              className="absolute -top-3 -right-3 bg-gray-700 rounded-full shadow-lg p-2 text-gray-400 hover:text-white transition-colors"
              onClick={() => setShowRegistrarTipo(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <RegistrarTipoEvento
              onSuccess={() => {
                fetchTiposEvento();
                setShowRegistrarTipo(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearEvento;