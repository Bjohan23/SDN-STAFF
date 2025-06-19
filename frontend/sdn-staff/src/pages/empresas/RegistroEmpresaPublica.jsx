import React, { useState, useRef } from 'react';
import { registrarEmpresaPublica } from '../../services/empresasService';

const RegistroEmpresaPublica = () => {
  const [form, setForm] = useState({
    nombre_empresa: '',
    logo_url: '',
    descripcion: '',
    sector: '',
    email_contacto: '',
    telefono_contacto: '',
    sitio_web: '',
    redes_sociales: '',
    documentos_legales: '',
  });
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errores, setErrores] = useState({});
  const firstInputRef = useRef();

  const validate = () => {
    const errs = {};
    if (!form.nombre_empresa) errs.nombre_empresa = 'El nombre es obligatorio';
    if (!form.email_contacto || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email_contacto)) errs.email_contacto = 'Email inválido';
    return errs;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrores({ ...errores, [e.target.name]: undefined });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    setSuccess(false);
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrores(errs);
      if (firstInputRef.current) firstInputRef.current.focus();
      return;
    }
    setLoading(true);
    try {
      const data = await registrarEmpresaPublica(form);
      if (data && !data.error) {
        setMensaje('¡Registro exitoso! Pronto será contactado.');
        setSuccess(true);
        setForm({
          nombre_empresa: '', logo_url: '', descripcion: '', sector: '',
          email_contacto: '', telefono_contacto: '', sitio_web: '',
          redes_sociales: '', documentos_legales: ''
        });
        setErrores({});
      } else {
        setMensaje(data.message || 'Ocurrió un error.');
      }
    } catch {
      setMensaje('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded shadow-md relative">
      <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">Registro de Empresa Expositora</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nombre_empresa"
          ref={firstInputRef}
          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${errores.nombre_empresa ? 'border-red-500 ring-red-200' : 'focus:ring-indigo-400'}`}
          placeholder="Nombre de la empresa"
          value={form.nombre_empresa}
          onChange={handleChange}
          required
          autoFocus
        />
        {errores.nombre_empresa && <div className="text-red-500 text-sm">{errores.nombre_empresa}</div>}
        <input name="logo_url" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="URL del logo" value={form.logo_url} onChange={handleChange} />
        <textarea name="descripcion" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Descripción" value={form.descripcion} onChange={handleChange} />
        <input name="sector" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Sector" value={form.sector} onChange={handleChange} />
        <input
          name="email_contacto"
          type="email"
          className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${errores.email_contacto ? 'border-red-500 ring-red-200' : 'focus:ring-indigo-400'}`}
          placeholder="Email de contacto"
          value={form.email_contacto}
          onChange={handleChange}
          required
        />
        {errores.email_contacto && <div className="text-red-500 text-sm">{errores.email_contacto}</div>}
        <input name="telefono_contacto" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Teléfono de contacto" value={form.telefono_contacto} onChange={handleChange} />
        <input name="sitio_web" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Sitio web" value={form.sitio_web} onChange={handleChange} />
        <input name="redes_sociales" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Redes sociales (links separados por coma)" value={form.redes_sociales} onChange={handleChange} />
        <input name="documentos_legales" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Documentación legal (URL o descripción)" value={form.documentos_legales} onChange={handleChange} />
        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition flex items-center justify-center" disabled={loading}>
          {loading && <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>}
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
      {mensaje && (
        <div className={`mt-4 text-center font-semibold transition-all duration-300 ${mensaje.includes('exitoso') ? 'text-green-600 scale-110' : 'text-red-600'}`}>
          {mensaje}
        </div>
      )}
      {/* Confeti animado tipo Amazon tras éxito */}
      {success && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 animate-fade-in">
          <svg width="200" height="80">
            <g>
              <circle cx="40" cy="40" r="8" fill="#fbbf24">
                <animate attributeName="cy" values="40;10;40" dur="1.2s" repeatCount="2" />
                <animate attributeName="opacity" values="1;0;1" dur="1.2s" repeatCount="2" />
              </circle>
              <circle cx="100" cy="30" r="6" fill="#22d3ee">
                <animate attributeName="cy" values="30;70;30" dur="1.1s" repeatCount="2" />
                <animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="2" />
              </circle>
              <circle cx="160" cy="50" r="7" fill="#34d399">
                <animate attributeName="cy" values="50;20;50" dur="1.3s" repeatCount="2" />
                <animate attributeName="opacity" values="1;0;1" dur="1.3s" repeatCount="2" />
              </circle>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
};

export default RegistroEmpresaPublica;
