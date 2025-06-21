import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import standsService from '../../services/standsService';

const AgregarStand = () => {
  const [form, setForm] = useState({
    nombre_stand: '',
    descripcion: '',
    id_tipo_stand: '',
    ubicacion: '',
    area: '',
    precio_base: '',
    estado: 'disponible',
    caracteristicas: '',
    imagen_url: '',
    orden_visualizacion: ''
  });

  const [tiposStand, setTiposStand] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { user } = useAuth();

  const estados = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupado', label: 'Ocupado' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'reservado', label: 'Reservado' }
  ];

  const allowedRoles = ["administrador", "manager"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  useEffect(() => {
    fetchTiposStand();
  }, []);

  const fetchTiposStand = async () => {
    try {
      const response = await standsService.getTiposStand();
      setTiposStand(response.data || []);
    } catch (err) {
      console.error('Error fetching tipos stand:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errors = {};
    
    if (!form.nombre_stand.trim()) {
      errors.nombre_stand = 'El nombre del stand es obligatorio';
    } else if (form.nombre_stand.length < 3 || form.nombre_stand.length > 100) {
      errors.nombre_stand = 'El nombre debe tener entre 3 y 100 caracteres';
    }

    if (!form.id_tipo_stand) {
      errors.id_tipo_stand = 'Debe seleccionar un tipo de stand';
    }

    if (form.area && (parseFloat(form.area) <= 0)) {
      errors.area = 'El área debe ser mayor a 0';
    }

    if (form.precio_base && (parseFloat(form.precio_base) < 0)) {
      errors.precio_base = 'El precio no puede ser negativo';
    }

    if (form.orden_visualizacion && (parseInt(form.orden_visualizacion) < 0)) {
      errors.orden_visualizacion = 'El orden de visualización no puede ser negativo';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const errors = validate();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        area: form.area ? parseFloat(form.area) : null,
        precio_base: form.precio_base ? parseFloat(form.precio_base) : null,
        orden_visualizacion: form.orden_visualizacion ? parseInt(form.orden_visualizacion) : null,
        caracteristicas: form.caracteristicas ? JSON.parse(form.caracteristicas) : null
      };

      await standsService.createStand(payload);
      setSuccess('Stand creado exitosamente');
      setForm({
        nombre_stand: '',
        descripcion: '',
        id_tipo_stand: '',
        ubicacion: '',
        area: '',
        precio_base: '',
        estado: 'disponible',
        caracteristicas: '',
        imagen_url: '',
        orden_visualizacion: ''
      });
      setFieldErrors({});
    } catch (err) {
      setError(err.message || 'Error al crear el stand');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    console.log('Usuario no autorizado en AgregarStand:', {
      user,
      userRoles,
      allowedRoles,
      isAuthorized
    });
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
              <p className="text-xs text-gray-400 mt-2">
                Roles del usuario: {userRoles.join(', ')}
              </p>
              <p className="text-xs text-gray-400">
                Roles permitidos: {allowedRoles.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agregar Nuevo Stand</h1>
          <p className="text-gray-400">Crea un nuevo stand en el sistema</p>
        </div>
        <button
          onClick={() => window.location.href = '/stands'}
          className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

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
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Stand *
              </label>
              <input
                type="text"
                name="nombre_stand"
                value={form.nombre_stand}
                onChange={handleChange}
                placeholder="Ej: Stand A1"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.nombre_stand
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {fieldErrors.nombre_stand && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.nombre_stand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Stand *
              </label>
              <select
                name="id_tipo_stand"
                value={form.id_tipo_stand}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.id_tipo_stand
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="">Selecciona un tipo</option>
                {tiposStand.map((tipo) => (
                  <option key={tipo.id_tipo_stand} value={tipo.id_tipo_stand}>
                    {tipo.nombre_tipo}
                  </option>
                ))}
              </select>
              {fieldErrors.id_tipo_stand && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.id_tipo_stand}</p>
              )}
            </div>
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
              placeholder="Descripción detallada del stand..."
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Ubicación y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ubicación
              </label>
              <input
                type="text"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Pabellón A, Nivel 1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

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
                {estados.map((estado) => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Área y Precio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Área (m²)
              </label>
              <input
                type="number"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="Ej: 25.5"
                step="0.1"
                min="0"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.area
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {fieldErrors.area && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.area}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio Base ($)
              </label>
              <input
                type="number"
                name="precio_base"
                value={form.precio_base}
                onChange={handleChange}
                placeholder="Ej: 1500.00"
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.precio_base
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {fieldErrors.precio_base && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.precio_base}</p>
              )}
            </div>
          </div>

          {/* Orden de visualización y URL de imagen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Orden de Visualización
              </label>
              <input
                type="number"
                name="orden_visualizacion"
                value={form.orden_visualizacion}
                onChange={handleChange}
                placeholder="Ej: 1"
                min="0"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.orden_visualizacion
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {fieldErrors.orden_visualizacion && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.orden_visualizacion}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de Imagen
              </label>
              <input
                type="url"
                name="imagen_url"
                value={form.imagen_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Características (JSON) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Características (JSON)
            </label>
            <textarea
              name="caracteristicas"
              value={form.caracteristicas}
              onChange={handleChange}
              placeholder='{"electricidad": true, "internet": true, "agua": false}'
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none font-mono text-sm"
            />
            <p className="mt-1 text-sm text-gray-400">
              Ingresa las características en formato JSON válido
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => window.location.href = '/stands'}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </div>
              ) : (
                'Crear Stand'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarStand; 