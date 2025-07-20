import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import InteractiveCalendar from "../../components/Calendar/InteractiveCalendar";
import axios from "../../config/axios";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const CalendarioEventos = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [conflictos, setConflictos] = useState([]);
  const [showConflictsModal, setShowConflictsModal] = useState(false);

  // Estado para nuevo evento
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin: "",
    tipo: "conferencia",
    estado: "programado",
    categoria: "tecnologia",
    ubicacion: "",
    capacidad_maxima: "",
    requiere_registro: false,
    es_publico: true,
  });

  // Cargar eventos al montar el componente
  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/eventos");
      setEventos(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error cargando eventos:", error);
      setError("Error al cargar los eventos");
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de evento
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
  };

  // Manejar movimiento de evento (drag & drop)
  const handleEventMove = async ({ event, start, end }) => {
    try {
      const eventoActualizado = {
        ...event.resource,
        fecha_inicio: start.toISOString(),
        fecha_fin: end.toISOString(),
      };

      await axios.put(`/eventos/${event.id}`, eventoActualizado);

      // Actualizar en el estado local
      setEventos((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? {
                ...e,
                fecha_inicio: start.toISOString(),
                fecha_fin: end.toISOString(),
              }
            : e
        )
      );

      // Verificar conflictos después del movimiento
      verificarConflictos();
    } catch (error) {
      console.error("Error moviendo evento:", error);
      setError("Error al mover el evento");
    }
  };

  // Manejar selección de slot para crear nuevo evento
  const handleSlotSelect = (slotInfo) => {
    setNuevoEvento((prev) => ({
      ...prev,
      fecha_inicio: slotInfo.start.toISOString().slice(0, 16),
      fecha_fin: slotInfo.end.toISOString().slice(0, 16),
    }));
    setShowCreateModal(true);
  };

  // Crear nuevo evento
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/eventos", nuevoEvento);
      setEventos((prev) => [...prev, response.data.data]);
      setShowCreateModal(false);
      setNuevoEvento({
        nombre: "",
        descripcion: "",
        fecha_inicio: "",
        fecha_fin: "",
        tipo: "conferencia",
        estado: "programado",
        categoria: "tecnologia",
        ubicacion: "",
        capacidad_maxima: "",
        requiere_registro: false,
        es_publico: true,
      });
      verificarConflictos();
    } catch (error) {
      console.error("Error creando evento:", error);
      setError("Error al crear el evento");
    }
  };

  // Editar evento
  const handleEditEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/eventos/${selectedEvent.id}`,
        selectedEvent.resource
      );
      setEventos((prev) =>
        prev.map((e) => (e.id === selectedEvent.id ? response.data.data : e))
      );
      setShowEditModal(false);
      setSelectedEvent(null);
      verificarConflictos();
    } catch (error) {
      console.error("Error editando evento:", error);
      setError("Error al editar el evento");
    }
  };

  // Eliminar evento
  const handleDeleteEvent = async (eventoId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      try {
        await axios.delete(`/eventos/${eventoId}`);
        setEventos((prev) => prev.filter((e) => e.id !== eventoId));
        setSelectedEvent(null);
        setShowEditModal(false);
      } catch (error) {
        console.error("Error eliminando evento:", error);
        setError("Error al eliminar el evento");
      }
    }
  };

  // Verificar conflictos de programación
  const verificarConflictos = () => {
    const conflictosEncontrados = [];

    for (let i = 0; i < eventos.length; i++) {
      for (let j = i + 1; j < eventos.length; j++) {
        const evento1 = eventos[i];
        const evento2 = eventos[j];

        const inicio1 = new Date(evento1.fecha_inicio);
        const fin1 = new Date(evento1.fecha_fin);
        const inicio2 = new Date(evento2.fecha_inicio);
        const fin2 = new Date(evento2.fecha_fin);

        // Verificar solapamiento
        if (
          (inicio1 < fin2 && fin1 > inicio2) ||
          (inicio2 < fin1 && fin2 > inicio1)
        ) {
          conflictosEncontrados.push({
            evento1,
            evento2,
            tipoConflicto: "solapamiento",
            inicio: new Date(Math.max(inicio1, inicio2)),
            fin: new Date(Math.min(fin1, fin2)),
          });
        }
      }
    }

    setConflictos(conflictosEncontrados);
  };

  // Resolver conflicto automáticamente
  const resolverConflicto = async (conflicto, accion) => {
    try {
      if (accion === "mover_segundo") {
        // Mover el segundo evento después del primero
        const nuevoInicio = new Date(conflicto.evento1.fecha_fin);
        const duracion =
          new Date(conflicto.evento2.fecha_fin) -
          new Date(conflicto.evento2.fecha_inicio);
        const nuevoFin = new Date(nuevoInicio.getTime() + duracion);

        await axios.put(`/eventos/${conflicto.evento2.id}`, {
          ...conflicto.evento2,
          fecha_inicio: nuevoInicio.toISOString(),
          fecha_fin: nuevoFin.toISOString(),
        });
      } else if (accion === "reducir_duracion") {
        // Reducir la duración del primer evento
        await axios.put(`/eventos/${conflicto.evento1.id}`, {
          ...conflicto.evento1,
          fecha_fin: new Date(conflicto.evento2.fecha_inicio).toISOString(),
        });
      }

      cargarEventos();
    } catch (error) {
      console.error("Error resolviendo conflicto:", error);
      setError("Error al resolver el conflicto");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Calendario de Eventos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona y visualiza todos los eventos del sistema
          </p>
        </div>

        <div className="flex space-x-4">
          {conflictos.length > 0 && (
            <button
              onClick={() => setShowConflictsModal(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {conflictos.length} Conflictos
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nuevo Evento
          </button>
        </div>
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Calendario */}
      <InteractiveCalendar
        eventos={eventos}
        onEventSelect={handleEventSelect}
        onEventMove={handleEventMove}
        onSlotSelect={handleSlotSelect}
        userRole={user?.rol || "visitante"}
      />

      {/* Modal para crear evento */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateEvent}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Crear Nuevo Evento
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Evento
                    </label>
                    <input
                      type="text"
                      value={nuevoEvento.nombre}
                      onChange={(e) =>
                        setNuevoEvento((prev) => ({
                          ...prev,
                          nombre: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={nuevoEvento.descripcion}
                      onChange={(e) =>
                        setNuevoEvento((prev) => ({
                          ...prev,
                          descripcion: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha/Hora Inicio
                      </label>
                      <input
                        type="datetime-local"
                        value={nuevoEvento.fecha_inicio}
                        onChange={(e) =>
                          setNuevoEvento((prev) => ({
                            ...prev,
                            fecha_inicio: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha/Hora Fin
                      </label>
                      <input
                        type="datetime-local"
                        value={nuevoEvento.fecha_fin}
                        onChange={(e) =>
                          setNuevoEvento((prev) => ({
                            ...prev,
                            fecha_fin: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={nuevoEvento.tipo}
                        onChange={(e) =>
                          setNuevoEvento((prev) => ({
                            ...prev,
                            tipo: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="conferencia">Conferencia</option>
                        <option value="workshop">Workshop</option>
                        <option value="networking">Networking</option>
                        <option value="exposicion">Exposición</option>
                        <option value="reunion">Reunión</option>
                        <option value="presentacion">Presentación</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría
                      </label>
                      <select
                        value={nuevoEvento.categoria}
                        onChange={(e) =>
                          setNuevoEvento((prev) => ({
                            ...prev,
                            categoria: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="tecnologia">Tecnología</option>
                        <option value="negocios">Negocios</option>
                        <option value="educacion">Educación</option>
                        <option value="salud">Salud</option>
                        <option value="arte">Arte</option>
                        <option value="deportes">Deportes</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={nuevoEvento.ubicacion}
                      onChange={(e) =>
                        setNuevoEvento((prev) => ({
                          ...prev,
                          ubicacion: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacidad Máxima
                    </label>
                    <input
                      type="number"
                      value={nuevoEvento.capacidad_maxima}
                      onChange={(e) =>
                        setNuevoEvento((prev) => ({
                          ...prev,
                          capacidad_maxima: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={nuevoEvento.requiere_registro}
                        onChange={(e) =>
                          setNuevoEvento((prev) => ({
                            ...prev,
                            requiere_registro: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Requiere registro
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={nuevoEvento.es_publico}
                        onChange={(e) =>
                          setNuevoEvento((prev) => ({
                            ...prev,
                            es_publico: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Es público
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Evento
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de conflictos */}
      {showConflictsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Conflictos de Programación
                </h3>
                <button
                  onClick={() => setShowConflictsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {conflictos.map((conflicto, index) => (
                  <div
                    key={index}
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-red-800">
                          {conflicto.evento1.nombre} y{" "}
                          {conflicto.evento2.nombre}
                        </h4>
                        <p className="text-sm text-red-600 mt-1">
                          Se superponen desde{" "}
                          {conflicto.inicio.toLocaleString()}
                          hasta {conflicto.fin.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            resolverConflicto(conflicto, "mover_segundo")
                          }
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Mover segundo
                        </button>
                        <button
                          onClick={() =>
                            resolverConflicto(conflicto, "reducir_duracion")
                          }
                          className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                        >
                          Reducir duración
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarioEventos;
