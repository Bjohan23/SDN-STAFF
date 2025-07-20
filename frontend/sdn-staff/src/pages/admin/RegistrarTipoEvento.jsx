import React, { useState } from "react";
import axios from "axios";

const RegistrarTipoEvento = ({ onSuccess }) => {
  const [form, setForm] = useState({
    nombre_tipo: "",
    descripcion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(null);

  const tiposValidos = [
    { value: "presencial", label: "Presencial" },
    { value: "virtual", label: "Virtual" },
    { value: "hibrido", label: "Híbrido" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${import.meta.env.VITE_API_URL}/tiposEvento`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess("Tipo de evento registrado exitosamente");
      setForm({ nombre_tipo: "", descripcion: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        // Manejar errores de validación específicos por campo
        const errors = {};
        err.response.data.errors.forEach((error) => {
          errors[error.field] = error.message;
        });
        setFieldErrors(errors);
        setError("Por favor, corrige los errores en el formulario");
      } else {
        setError(
          err.response?.data?.message || "Error al registrar tipo de evento"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Registrar Tipo de Evento
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Los tipos de evento permiten categorizar los eventos según su modalidad
        de realización.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Tipo de evento
          </label>
          <select
            name="nombre_tipo"
            value={form.nombre_tipo}
            onChange={handleChange}
            required
            className={`w-full border px-3 py-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              fieldErrors.nombre_tipo ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Selecciona un tipo</option>
            {tiposValidos.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>
          {fieldErrors.nombre_tipo && (
            <div className="text-red-500 text-sm mt-1">
              {fieldErrors.nombre_tipo}
            </div>
          )}
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={3}
            placeholder="Describe las características de este tipo de evento..."
            className={`w-full border px-3 py-2 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
              fieldErrors.descripcion ? "border-red-500" : "border-gray-300"
            }`}
          />
          {fieldErrors.descripcion && (
            <div className="text-red-500 text-sm mt-1">
              {fieldErrors.descripcion}
            </div>
          )}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
            {success}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white px-4 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {loading ? "Guardando..." : "Registrar Tipo de Evento"}
        </button>
      </form>
    </div>
  );
};

export default RegistrarTipoEvento;
