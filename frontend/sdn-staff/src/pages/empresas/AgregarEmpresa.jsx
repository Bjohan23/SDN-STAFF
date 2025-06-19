import React, { useState } from 'react';
import { registrarEmpresaPublica } from '../../services/empresasService';

const AgregarEmpresa = ({ onSuccess }) => {
  const [form, setForm] = useState({
    nombre_empresa: '',
    razon_social: '',
    email_contacto: '',
    ruc: '',
    telefono_contacto: '',
    sector: '',
    sitio_web: '',
    tamaño_empresa: '',
    descripcion: '',
    direccion: '',
    ciudad: '',
    pais: 'Perú',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const sectores = [
    'Tecnología',
    'Salud',
    'Educación',
    'Construcción',
    'Manufactura',
    'Servicios',
    'Comercio',
    'Turismo',
    'Agricultura',
    'Finanzas',
    'Energía',
    'Transporte',
    'Otro'
  ];

  const tamanos = [
    { value: 'pequeña', label: 'Pequeña (1-50 empleados)' },
    { value: 'mediana', label: 'Mediana (51-250 empleados)' },
    { value: 'grande', label: 'Grande (250+ empleados)' }
  ];

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'nombre_empresa':
        if (!value.trim()) {
          errors[name] = 'El nombre de la empresa es requerido';
        } else if (value.length < 2) {
          errors[name] = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete errors[name];
        }
        break;
      case 'email_contacto':
        { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors[name] = 'El email es requerido';
        } else if (!emailRegex.test(value)) {
          errors[name] = 'Email inválido';
        } else {
          delete errors[name];
        }
        break; }
      case 'ruc':
        if (!value.trim()) {
          errors[name] = 'El RUC es requerido';
        } else if (!/^\d{11}$/.test(value)) {
          errors[name] = 'El RUC debe tener 11 dígitos';
        } else {
          delete errors[name];
        }
        break;
      case 'telefono_contacto':
        if (value && !/^[\d\s\+\-\(\)]+$/.test(value)) {
          errors[name] = 'Formato de teléfono inválido';
        } else {
          delete errors[name];
        }
        break;
      case 'sitio_web':
        if (value && !/^https?:\/\/.+\..+/.test(value)) {
          errors[name] = 'URL inválida (debe incluir http:// o https://)';
        } else {
          delete errors[name];
        }
        break;
      default:
        delete errors[name];
    }
    
    setFieldErrors(errors);
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    // Validar todos los campos requeridos
    const requiredFields = ['nombre_empresa', 'email_contacto', 'ruc'];
    const newErrors = {};
    
    requiredFields.forEach(field => {
      if (!form[field].trim()) {
        newErrors[field] = 'Este campo es requerido';
      }
    });

    if (Object.keys(newErrors).length > 0 || Object.keys(fieldErrors).length > 0) {
      setFieldErrors({ ...fieldErrors, ...newErrors });
      setError('Por favor, corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Preparar datos para envío, excluyendo campos vacíos opcionales
      const dataToSend = {
        nombre_empresa: form.nombre_empresa.trim(),
        razon_social: form.razon_social.trim(),
        email_contacto: form.email_contacto.trim(),
        ruc: form.ruc.trim(),
        sector: form.sector,
        descripcion: form.descripcion.trim(),
        sitio_web: form.sitio_web.trim(),
        tamaño_empresa: form.tamaño_empresa,
        direccion: form.direccion.trim(),
        ciudad: form.ciudad.trim(),
        pais: form.pais,
      };

      // Agregar campos opcionales solo si tienen valor
      if (form.telefono_contacto.trim()) {
        dataToSend.telefono_contacto = form.telefono_contacto.trim();
      }

      const res = await registrarEmpresaPublica(dataToSend);
      if (res.success || res.status === 'success') {
        setSuccess('¡Empresa registrada exitosamente! Está pendiente de aprobación.');
        setForm({
          nombre_empresa: '',
          razon_social: '',
          email_contacto: '',
          ruc: '',
          telefono_contacto: '',
          sector: '',
          sitio_web: '',
          tamaño_empresa: '',
          descripcion: '',
          direccion: '',
          ciudad: '',
          pais: 'Perú',
        });
        setFieldErrors({});
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || 'No se pudo registrar la empresa');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Error al registrar empresa. Por favor, inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Registrar Nueva Empresa Expositora</h2>
        <p className="text-gray-400">Completa la información básica de la empresa</p>
      </div>

      {/* Mensajes de estado */}
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

      {/* Formulario */}
      <div className="space-y-6">
        {/* Información básica */}
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Información Básica
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre de la empresa */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                name="nombre_empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.nombre_empresa 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-500 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Nombre completo de la empresa"
              />
              {fieldErrors.nombre_empresa && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.nombre_empresa}</p>
              )}
            </div>

            {/* Razón Social */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Razón Social
              </label>
              <input
                type="text"
                name="razon_social"
                value={form.razon_social}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Empresa S.A.C., Empresa E.I.R.L., etc."
              />
            </div>

            {/* RUC */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RUC *
              </label>
              <input
                type="text"
                name="ruc"
                value={form.ruc}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.ruc 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-500 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="12345678901"
                maxLength="11"
              />
              {fieldErrors.ruc && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.ruc}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email de Contacto *
              </label>
              <input
                type="email"
                name="email_contacto"
                value={form.email_contacto}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.email_contacto 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-500 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="contacto@empresa.com"
              />
              {fieldErrors.email_contacto && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.email_contacto}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                name="telefono_contacto"
                value={form.telefono_contacto}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.telefono_contacto 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-500 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="+51 999 999 999"
              />
              {fieldErrors.telefono_contacto && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.telefono_contacto}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información comercial */}
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Información Comercial
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sector
              </label>
              <select
                name="sector"
                value={form.sector}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Seleccionar sector</option>
                {sectores.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            {/* Tamaño */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tamaño de Empresa
              </label>
              <select
                name="tamaño_empresa"
                value={form.tamaño_empresa}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Seleccionar tamaño</option>
                {tamanos.map(tamano => (
                  <option key={tamano.value} value={tamano.value}>{tamano.label}</option>
                ))}
              </select>
            </div>

            {/* Sitio web */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                name="sitio_web"
                value={form.sitio_web}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-600 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.sitio_web 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-500 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="https://www.empresa.com"
              />
              {fieldErrors.sitio_web && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.sitio_web}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ubicación
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dirección */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Av. Principal 123, Distrito"
              />
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Lima"
              />
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                País
              </label>
              <input
                type="text"
                name="pais"
                value={form.pais}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Perú"
              />
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Descripción
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción de la Empresa
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Breve descripción de los productos o servicios que ofrece la empresa..."
            />
            <p className="mt-1 text-sm text-gray-400">
              {form.descripcion.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(fieldErrors).length > 0}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[200px] justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Registrando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Registrar Empresa
              </>
            )}
          </button>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-200">Información importante</h4>
            <p className="mt-1 text-sm text-blue-300">
              Una vez registrada, la empresa quedará en estado "pendiente" hasta ser aprobada por un administrador. 
              Recibirás una notificación por email una vez que sea procesada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgregarEmpresa;