import React, { useState, useEffect } from "react";
import axios from "../../config/axios";
import { useAuth } from "../../auth/AuthContext";
import RegistrarTipoEvento from "./RegistrarTipoEvento";

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

const estados = ["borrador", "publicado", "activo", "finalizado", "archivado"];
// Eliminado: tipos hardcodeados. Ahora se cargan dinámicamente desde el backend.

const CrearEvento = () => {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialState);
  const [eventos, setEventos] = useState([]);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showRegistrarTipo, setShowRegistrarTipo] = useState(false);
  const { user } = useAuth();

  const fetchEventos = async () => {
    try {
      const res = await axios.get("/api/eventos?limit=10");
      setEventos(res.data.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchTiposEvento();
  }, []);

  const fetchTiposEvento = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/tiposEvento", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const lista = res.data.data || [];
      setTiposEvento(lista);
      if (lista.length === 0) {
        setShowRegistrarTipo(true);
      }
    } catch {
      setTiposEvento([]);
      setShowRegistrarTipo(true);
    }
  };

  const allowedRoles = ["administrador", "manager"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  if (!isAuthorized) return <div>No autorizado</div>;

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
      await axios.post("/api/eventos", payload);
      setSuccess("Evento creado exitosamente");
      setForm(initialState);
      setFieldErrors({});
      fetchEventos();
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-10">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8">
        <div className="flex-1 bg-white shadow-xl rounded-2xl p-6 border border-gray-100 flex flex-col items-center justify-center min-h-[260px]">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4 text-center">
            ¿Quieres crear un nuevo evento?
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow transition text-base"
          >
            Crear evento
          </button>
        </div>

        <div className="flex-1 bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-indigo-700 mb-4">
            Últimos eventos creados
          </h3>
          <button
            onClick={fetchEventos}
            className="mb-4 px-4 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium transition text-sm"
          >
            Recargar lista
          </button>
          {eventos.length === 0 ? (
            <div className="text-gray-400">No hay eventos recientes.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full bg-white border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-indigo-100 text-indigo-800">
                    <th className="py-2 px-4 border-b border-gray-200">
                      Nombre
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200">
                      Estado
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200">
                      Inicio
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200">Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {eventos.map((ev) => (
                    <tr
                      key={ev.id_evento}
                      className="hover:bg-indigo-50 transition"
                    >
                      <td className="py-2 px-4 border-b border-gray-100">
                        {ev.nombre_evento}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-100">
                        {ev.estado}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-100">
                        {ev.fecha_inicio?.slice(0, 10)}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-100">
                        {ev.fecha_fin?.slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl relative animate-fadeIn max-h-[90vh] flex flex-col">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowModal(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700 text-center mt-4">
              Nuevo evento
            </h3>
            <div
              className="overflow-y-auto flex-1 px-6 pb-6"
              style={{ maxHeight: "70vh" }}
            >
              // ... Todo el código anterior permanece igual hasta llegar al
              formulario del modal
              <form
                onSubmit={(e) => handleSubmit(e, "publicado")}
                className="space-y-6"
              >
                {/* Nombre del evento */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Nombre del evento *
                  </label>
                  <input
                    name="nombre_evento"
                    value={form.nombre_evento}
                    onChange={handleChange}
                    placeholder="Nombre del evento"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      fieldErrors.nombre_evento
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
                  />
                  {fieldErrors.nombre_evento && (
                    <span className="text-red-500 text-xs">
                      {fieldErrors.nombre_evento}
                    </span>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Fechas */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                      Fecha de inicio *
                    </label>
                    <input
                      type="date"
                      name="fecha_inicio"
                      value={form.fecha_inicio}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        fieldErrors.fecha_inicio
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErrors.fecha_inicio && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.fecha_inicio}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                      Fecha de fin *
                    </label>
                    <input
                      type="date"
                      name="fecha_fin"
                      value={form.fecha_fin}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        fieldErrors.fecha_fin
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErrors.fecha_fin && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.fecha_fin}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ubicación y URL */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                      Ubicación
                    </label>
                    <input
                      name="ubicacion"
                      value={form.ubicacion}
                      onChange={handleChange}
                      placeholder="Ubicación (si aplica)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                      URL virtual
                    </label>
                    <input
                      name="url_virtual"
                      value={form.url_virtual}
                      onChange={handleChange}
                      placeholder="URL virtual (si aplica)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                {/* Tipo de evento */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Tipo de evento *
                  </label>
                  <div className="flex gap-2 items-center">
                    <select
                      name="id_tipo_evento"
                      value={form.id_tipo_evento}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${fieldErrors.id_tipo_evento ? 'border-red-400' : 'border-gray-300'}`}
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
                      className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded border border-indigo-300 hover:bg-indigo-200"
                      onClick={() => setShowRegistrarTipo(true)}
                    >
                      + Nuevo
                    </button>
                  </div>
                  {fieldErrors.id_tipo_evento && (
                    <span className="text-red-500 text-xs">
                      {fieldErrors.id_tipo_evento}
                    </span>
                  )}
                </div>

                {/* Estado del evento */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {estados.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacidad, Precio, Moneda */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                      Capacidad máxima
                    </label>
                    <input
                      name="capacidad_maxima"
                      type="number"
                      value={form.capacidad_maxima}
                      onChange={handleChange}
                      placeholder="Capacidad máxima"
                      min={1}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        fieldErrors.capacidad_maxima
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErrors.capacidad_maxima && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.capacidad_maxima}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                      Precio de entrada
                    </label>
                    <input
                      name="precio_entrada"
                      type="number"
                      step="0.01"
                      value={form.precio_entrada}
                      onChange={handleChange}
                      placeholder="Precio de entrada"
                      min={0}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                        fieldErrors.precio_entrada
                          ? "border-red-400"
                          : "border-gray-300"
                      }`}
                    />
                    {fieldErrors.precio_entrada && (
                      <span className="text-red-500 text-xs">
                        {fieldErrors.precio_entrada}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-1">
                      Moneda *
                    </label>
                    <input
                      name="moneda"
                      value={form.moneda}
                      onChange={handleChange}
                      placeholder="Moneda (ej: PEN)"
                      maxLength={3}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={(e) => handleSubmit(e, "borrador")}
                    className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  >
                    Guardar como borrador
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-md transition"
                  >
                    Publicar evento
                  </button>
                </div>

                {/* Mensajes */}
                {error && (
                  <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-center font-medium">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-4 bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded-lg text-center font-medium">
                    {success}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
      {showRegistrarTipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="relative w-full max-w-md">
            <button
              className="absolute -top-3 -right-3 bg-white rounded-full shadow p-1 text-gray-600 hover:text-gray-800"
              onClick={() => setShowRegistrarTipo(false)}
            >
              ×
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
