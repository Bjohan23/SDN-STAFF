import React, { useState } from "react";
import axios from "axios";

const RegistrarTipoEvento = ({ onSuccess }) => {
  const [form, setForm] = useState({
    nombre_tipo: "",
    descripcion: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/tiposEvento`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess("Tipo de evento registrado exitosamente");
      setForm({ nombre_tipo: "", descripcion: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al registrar tipo de evento"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Registrar Tipo de Evento</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Nombre del tipo</label>
          <input
            type="text"
            name="nombre_tipo"
            value={form.nombre_tipo}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={50}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={2}
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Guardando..." : "Registrar"}
        </button>
      </form>
    </div>
  );
};

export default RegistrarTipoEvento;
