import React, { useState } from 'react';
import { registrarEmpresaPublica } from '../../services/empresasService';

const RegistrarExpositor = ({ onSuccess }) => {
  const [form, setForm] = useState({
    nombre_empresa: '',
    razon_social: '',
    email_contacto: '',
    ruc: '',
    telefono_contacto: '',
    nombre_contacto: '',
    cargo_contacto: '',
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
    { value: 'micro', label: 'Micro (1-10 empleados)' },
    { value: 'pequeña', label: 'Pequeña (11-50 empleados)' },
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
      if (form.nombre_contacto.trim()) {
        dataToSend.nombre_contacto = form.nombre_contacto.trim();
      }
      if (form.cargo_contacto.trim()) {
        dataToSend.cargo_contacto = form.cargo_contacto.trim();
      }

      const res = await registrarEmpresaPublica(dataToSend);
      if (res.success || res.status === 'success') {
        setSuccess('¡Expositor registrado exitosamente! Está pendiente de aprobación.');
        setForm({
          nombre_empresa: '',
          razon_social: '',
          email_contacto: '',
          ruc: '',
          telefono_contacto: '',
          nombre_contacto: '',
          cargo_contacto: '',
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
        setError(res.message || 'No se pudo registrar el expositor');
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError('Error al registrar expositor. Por favor, inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Registrar Nuevo Expositor</h2>
        <p className="text-gray-400">Completa la información del expositor para participar en eventos</p>
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
      <div className="bg-gray-800 rounded-lg p-6 space-y-6">
        {/* Información Básica */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                type="text"
                name="nombre_empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.nombre_empresa ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Nombre de la empresa"
              />
              {fieldErrors.nombre_empresa && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.nombre_empresa}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Razón Social
              </label>
              <input
                type="text"
                name="razon_social"
                value={form.razon_social}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Razón social"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RUC *
              </label>
              <input
                type="text"
                name="ruc"
                value={form.ruc}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.ruc ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="11 dígitos"
                maxLength="11"
              />
              {fieldErrors.ruc && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.ruc}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sector
              </label>
              <select
                name="sector"
                value={form.sector}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar sector</option>
                {sectores.map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email de Contacto *
              </label>
              <input
                type="email"
                name="email_contacto"
                value={form.email_contacto}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.email_contacto ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="contacto@empresa.com"
              />
              {fieldErrors.email_contacto && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.email_contacto}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                name="telefono_contacto"
                value={form.telefono_contacto}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.telefono_contacto ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="+51 999 999 999"
              />
              {fieldErrors.telefono_contacto && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.telefono_contacto}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Contacto
              </label>
              <input
                type="text"
                name="nombre_contacto"
                value={form.nombre_contacto}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cargo del Contacto
              </label>
              <input
                type="text"
                name="cargo_contacto"
                value={form.cargo_contacto}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Gerente, Director, etc."
              />
            </div>
          </div>
        </div>

        {/* Información Adicional */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Información Adicional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                name="sitio_web"
                value={form.sitio_web}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  fieldErrors.sitio_web ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="https://www.empresa.com"
              />
              {fieldErrors.sitio_web && (
                <p className="text-red-400 text-sm mt-1">{fieldErrors.sitio_web}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tamaño de la Empresa
              </label>
              <select
                name="tamaño_empresa"
                value={form.tamaño_empresa}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar tamaño</option>
                {tamanos.map((tamano) => (
                  <option key={tamano.value} value={tamano.value}>{tamano.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción de la Empresa
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe brevemente los productos o servicios de la empresa..."
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Dirección</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección completa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ciudad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                País
              </label>
              <input
                type="text"
                name="pais"
                value={form.pais}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="País"
              />
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-8 py-3 rounded-md font-medium text-white transition-colors ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </div>
            ) : (
              'Registrar Expositor'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrarExpositor; 