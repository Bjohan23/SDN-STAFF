import React, { useState } from 'react';
import { registrarEmpresaPublica } from '../../services/empresasService';

const AgregarEmpresa = ({ onSuccess }) => {
  const [form, setForm] = useState({
    nombre_empresa: '',
    email_contacto: '',
    ruc: '',
    telefono_contacto: '',
    sector: '',
    sitio_web: '',
    tamano_empresa: '',
    descripcion: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await registrarEmpresaPublica(form);
      if (res.success || res.status === 'success') {
        setSuccess('Empresa registrada correctamente');
        setForm({
          nombre_empresa: '',
          email_contacto: '',
          ruc: '',
          telefono_contacto: '',
          sector: '',
          sitio_web: '',
          tamano_empresa: '',
          descripcion: '',
        });
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'No se pudo registrar la empresa');
      }
    } catch (err) {
      setError('Error al registrar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-indigo-700">Registrar Nueva Empresa Expositora</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <input className="input" name="nombre_empresa" placeholder="Nombre *" value={form.nombre_empresa} onChange={handleChange} required />
          <input className="input" name="email_contacto" placeholder="Email *" value={form.email_contacto} onChange={handleChange} required type="email" />
          <input className="input" name="ruc" placeholder="RUC *" value={form.ruc} onChange={handleChange} required />
          <input className="input" name="telefono_contacto" placeholder="Teléfono" value={form.telefono_contacto} onChange={handleChange} />
          <input className="input" name="sector" placeholder="Sector" value={form.sector} onChange={handleChange} />
          <input className="input" name="sitio_web" placeholder="Sitio web" value={form.sitio_web} onChange={handleChange} />
          <input className="input" name="tamano_empresa" placeholder="Tamaño" value={form.tamano_empresa} onChange={handleChange} />
        </div>
        <textarea className="input w-full" name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} rows={2} />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        {error && <div className="text-red-500 text-center text-sm">{error}</div>}
        {success && <div className="text-green-600 text-center text-sm">{success}</div>}
      </form>
    </div>
  );
};

export default AgregarEmpresa;
