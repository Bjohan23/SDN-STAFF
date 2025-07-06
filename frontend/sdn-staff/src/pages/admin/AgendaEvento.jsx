import React, { useEffect, useState } from "react";
import {
  getActividades,
  crearActividad,
  actualizarActividad,
  eliminarActividad,
} from "../../services/actividadesService";

const initialForm = {
  titulo: "",
  descripcion: "",
  tipo_actividad: "",
  modalidad: "",
  fecha_inicio: "",
  fecha_fin: "",
  duracion_minutos: "",
  ubicacion: "",
  aforo_maximo: "",
}; // id_evento se agrega al enviar

const AgendaEvento = ({ idEvento }) => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({ search: '', modalidad: '', fecha_inicio: '', fecha_fin: '' });
  const [vista, setVista] = useState("cronologica");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchActividades();
    // eslint-disable-next-line
  }, [idEvento]); // Solo recarga al cambiar evento

  const fetchActividades = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { id_evento: idEvento, ...filtros, limit: 100 };
      const res = await getActividades(params);
      setActividades(res.data || []);
    } catch {
      setError("Error al cargar actividades");
    }
    setLoading(false);
  };

  // Filtros frontend: solo campos del listado
  const handleFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  // Filtrado frontend
  const actividadesFiltradas = actividades.filter((actividad) => {
    // Texto: título o ubicación
    const search = filtros.search?.toLowerCase() || '';
    const matchSearch =
      actividad.titulo?.toLowerCase().includes(search) ||
      actividad.ubicacion?.toLowerCase().includes(search);
    // Modalidad
    const matchModalidad =
      !filtros.modalidad || actividad.modalidad === filtros.modalidad;
    // Fechas (rango)
    let matchFechaInicio = true;
    let matchFechaFin = true;
    if (filtros.fecha_inicio) {
      matchFechaInicio =
        actividad.fecha_inicio &&
        new Date(actividad.fecha_inicio) >= new Date(filtros.fecha_inicio);
    }
    if (filtros.fecha_fin) {
      matchFechaFin =
        actividad.fecha_fin &&
        new Date(actividad.fecha_fin) <= new Date(filtros.fecha_fin);
    }
    return matchSearch && matchModalidad && matchFechaInicio && matchFechaFin;
  });

  // Handlers CRUD
  const handleOpenAdd = () => {
    setForm(initialForm);
    setEditId(null);
    setFormError(null);
    setShowForm(true);
  };

  const handleOpenEdit = (actividad) => {
    setForm({
      titulo: actividad.titulo || "",
      descripcion: actividad.descripcion || "",
      tipo_actividad: actividad.tipo_actividad || "",
      modalidad: actividad.modalidad || "",
      fecha_inicio: actividad.fecha_inicio
        ? actividad.fecha_inicio.slice(0, 16)
        : "",
      fecha_fin: actividad.fecha_fin ? actividad.fecha_fin.slice(0, 16) : "",
      duracion_minutos: actividad.duracion_minutos || "",
      ubicacion: actividad.ubicacion || "",
      aforo_maximo: actividad.aforo_maximo || "",
    });
    setEditId(actividad.id_actividad);
    setFormError(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta actividad?")) return;
    setLoading(true);
    setError(null);
    try {
      await eliminarActividad(id);
      fetchActividades();
    } catch {
      setError("Error al eliminar actividad");
    }
    setLoading(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    // Validación básica frontend
    if (
      !form.titulo ||
      !form.tipo_actividad ||
      !form.modalidad ||
      !form.fecha_inicio ||
      !form.fecha_fin
    ) {
      setFormError(
        "Título, tipo, modalidad, fecha inicio y fecha fin son obligatorios"
      );
      return;
    }
    // Validar fechas
    if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) {
      setFormError("La fecha de fin debe ser posterior a la de inicio");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        id_evento: idEvento,
        titulo: form.titulo,
        tipo_actividad: form.tipo_actividad,
        modalidad: form.modalidad,
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin,
        descripcion: form.descripcion || undefined,
        duracion_minutos:
          form.duracion_minutos !== ""
            ? Number(form.duracion_minutos)
            : undefined,
        ubicacion: form.ubicacion || undefined,
        aforo_maximo:
          form.aforo_maximo !== "" ? Number(form.aforo_maximo) : undefined,
      };
      if (editId) {
        await actualizarActividad(editId, payload);
      } else {
        await crearActividad(payload);
      }
      setShowForm(false);
      fetchActividades();
    } catch (err) {
      // Mostrar errores del backend si faltan campos
      if (
        err.response &&
        err.response.data &&
        err.response.data.campos_requeridos
      ) {
        setFormError(
          "Faltan campos requeridos: " +
            err.response.data.campos_requeridos.join(", ")
        );
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setFormError(err.response.data.message);
      } else {
        setFormError("Error al guardar la actividad");
      }
    }
    setLoading(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormError(null);
    setEditId(null);
  };

  // Renderizado por vista
  const renderActividades = () => {
    if (vista === "cronologica") {
      if (!actividades || actividades.length === 0) {
        return (
          <div className="text-gray-500 text-center py-8">
            No hay actividades para este evento.
          </div>
        );
      }
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Título
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Fecha inicio
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Fecha fin
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Duración
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Modalidad
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Ubicación
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Aforo
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {actividadesFiltradas.map((actividad) => (
                <tr key={actividad.id_actividad} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {actividad.titulo}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {actividad.fecha_inicio
                      ? new Date(actividad.fecha_inicio).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {actividad.fecha_fin
                      ? new Date(actividad.fecha_fin).toLocaleString()
                      : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {actividad.duracion_minutos} min
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap capitalize">
                    {actividad.modalidad || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {actividad.ubicacion || "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {actividad.aforo_maximo ?? "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                    <button
                      className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300"
                      onClick={() => handleOpenEdit(actividad)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                      onClick={() => handleDelete(actividad.id_actividad)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    // Otras vistas: por track, por ponente...
    // Puedes expandir aquí según necesidad
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Agenda del Evento</h2>
      <div className="flex justify-between items-center mb-4">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 -mb-px border-b-2 font-medium focus:outline-none transition-colors ${
              vista === "cronologica"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500 hover:text-blue-700"
            }`}
            onClick={() => setVista("cronologica")}
          >
            Listado
          </button>
          {/* Más tabs pueden agregarse aquí */}
        </div>
        <button
          className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors text-sm"
          onClick={handleOpenAdd}
        >
          + Agregar Actividad
        </button>
      </div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por título o ubicación"
          className="border border-gray-300 rounded px-3 py-1 focus:ring focus:ring-blue-200 focus:border-blue-400 w-52"
          value={filtros.search}
          onChange={e => handleFiltro('search', e.target.value)}
        />
        <select
          className="border border-gray-300 rounded px-3 py-1 focus:ring focus:ring-blue-200 focus:border-blue-400 w-32"
          value={filtros.modalidad}
          onChange={e => handleFiltro('modalidad', e.target.value)}
        >
          <option value="">Modalidad</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
          <option value="hibrido">Híbrido</option>
        </select>
        <input
          type="date"
          className="border border-gray-300 rounded px-3 py-1 focus:ring focus:ring-blue-200 focus:border-blue-400"
          value={filtros.fecha_inicio}
          onChange={e => handleFiltro('fecha_inicio', e.target.value)}
          placeholder="Desde"
        />
        <input
          type="date"
          className="border border-gray-300 rounded px-3 py-1 focus:ring focus:ring-blue-200 focus:border-blue-400"
          value={filtros.fecha_fin}
          onChange={e => handleFiltro('fecha_fin', e.target.value)}
          placeholder="Hasta"
        />
        <button
          className="ml-2 px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 border border-gray-300"
          onClick={() => setFiltros({ search: '', modalidad: '', fecha_inicio: '', fecha_fin: '' })}
        >
          Limpiar filtros
        </button>
      </div>
      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300">
          {error}
        </div>
      )}
      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <svg
            className="animate-spin h-6 w-6 text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        </div>
      ) : (
        renderActividades()
      )}

      {/* Modal/Formulario para Agregar/Editar */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg mx-auto p-0">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">
                {editId ? "Editar Actividad" : "Agregar Actividad"}
              </h3>
              <button
                className="text-gray-400 hover:text-white transition-colors p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={closeForm}
              >
                <span className="sr-only">Cerrar</span>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
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
            <form
              onSubmit={handleFormSubmit}
              className="px-6 pb-6 pt-2 space-y-4"
            >
              {formError && (
                <div className="mb-2 p-2 rounded bg-red-900 text-red-200 border border-red-600 text-sm">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Título *
                </label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Conferencia de apertura"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                  placeholder="Opcional"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fecha de inicio *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    value={form.fecha_inicio}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fecha de fin *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_fin"
                    value={form.fecha_fin}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo *
                  </label>
                  <select
                    name="tipo_actividad"
                    value={form.tipo_actividad}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona...</option>
                    <option value="conferencia">Conferencia</option>
                    <option value="taller">Taller</option>
                    <option value="demostracion">Demostración</option>
                    <option value="panel">Panel</option>
                    <option value="keynote">Keynote</option>
                    <option value="networking">Networking</option>
                    <option value="ceremonia">Ceremonia</option>
                    <option value="masterclass">Masterclass</option>
                    <option value="webinar">Webinar</option>
                    <option value="mesa_redonda">Mesa Redonda</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Modalidad *
                  </label>
                  <select
                    name="modalidad"
                    value={form.modalidad}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona...</option>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    name="duracion_minutos"
                    value={form.duracion_minutos}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={1}
                    placeholder="Ej: 60"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Aforo Máximo
                  </label>
                  <input
                    type="number"
                    name="aforo_maximo"
                    value={form.aforo_maximo}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={0}
                    placeholder="Ej: 200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Ubicación
                </label>
                <input
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Auditorio, Zoom, etc."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                  onClick={closeForm}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading
                    ? "Guardando..."
                    : editId
                    ? "Guardar cambios"
                    : "Crear actividad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaEvento;
