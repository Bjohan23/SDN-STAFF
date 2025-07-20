import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useStands } from '../../contexts/StandsContext';
import NotificationToast from '../../components/NotificationToast';
import { useNotification } from '../../hooks/useNotification';
import standsService from '../../services/standsService';

const AgregarStand = () => {
  const [form, setForm] = useState({
    numero_stand: '',
    nombre_stand: '',
    id_tipo_stand: '',
    area: '',
    ubicacion: '',
    estado_fisico: 'disponible',
    permite_subdivision: false,
    capacidad_maxima_personas: '',
    observaciones: '',
    caracteristicas_fisicas: {
      puntos_electricos: 0,
      tipo_suelo: 'estandar',
      altura_techo_m: 3.0
    },
    equipamiento_fijo: {
      almacen_privado: '',
      sillas: 0
    },
    servicios_disponibles: {
      internet_dedicado_mbps: 0,
      limpieza_diaria: false,
      seguridad_24h: false
    }
  });

  const [tiposStand, setTiposStand] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const [fieldErrors, setFieldErrors] = useState({});
  const [precioCalculado, setPrecioCalculado] = useState(0);
  const { user } = useAuth();
  const { triggerRefresh } = useStands();

  const estadosFisicos = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupado', label: 'Ocupado' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'fuera_de_servicio', label: 'Fuera de Servicio' }
  ];

  const tiposSuelo = [
    { value: 'estandar', label: 'Estándar' },
    { value: 'alfombrado', label: 'Alfombrado' },
    { value: 'madera', label: 'Madera' },
    { value: 'concreto', label: 'Concreto' }
  ];

  const allowedRoles = ["administrador", "manager", "staff"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  useEffect(() => {
    fetchTiposStand();
  }, []);

  useEffect(() => {
    // Calcular precio inicial cuando se carguen los tipos de stand
    if (tiposStand.length > 0 && form.id_tipo_stand && form.area) {
      calcularPrecio(form.id_tipo_stand, form.area);
    }
  }, [tiposStand, form.id_tipo_stand, form.area]);

  const fetchTiposStand = async () => {
    try {
      const response = await standsService.getTiposStand();
      setTiposStand(response.data || []);
    } catch (err) {
      console.error('Error fetching tipos stand:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setForm(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    
    // Calcular precio cuando cambie el tipo de stand o área
    if (name === 'id_tipo_stand' || name === 'area') {
      calcularPrecio(name === 'id_tipo_stand' ? value : form.id_tipo_stand, 
                     name === 'area' ? value : form.area);
    }
  };

  const calcularPrecio = (tipoId, area) => {
    if (!tipoId || !area) {
      setPrecioCalculado(0);
      return;
    }
    
    const tipoSeleccionado = tiposStand.find(tipo => tipo.id_tipo_stand == tipoId);
    if (tipoSeleccionado && area > 0) {
      const precio = parseFloat(tipoSeleccionado.precio_base) * parseFloat(area);
      setPrecioCalculado(precio);
    } else {
      setPrecioCalculado(0);
    }
  };

  const validate = () => {
    const errors = {};
    
    if (!form.numero_stand.trim()) {
      errors.numero_stand = 'El número del stand es obligatorio';
    } else if (form.numero_stand.length < 2 || form.numero_stand.length > 20) {
      errors.numero_stand = 'El número debe tener entre 2 y 20 caracteres';
    }

    if (!form.nombre_stand.trim()) {
      errors.nombre_stand = 'El nombre del stand es obligatorio';
    } else if (form.nombre_stand.length < 3 || form.nombre_stand.length > 100) {
      errors.nombre_stand = 'El nombre debe tener entre 3 y 100 caracteres';
    }

    if (!form.id_tipo_stand) {
      errors.id_tipo_stand = 'Debe seleccionar un tipo de stand';
    }

    if (!form.area || parseFloat(form.area) <= 0) {
      errors.area = 'El área es requerida y debe ser mayor a 0';
    }

    if (form.capacidad_maxima_personas && parseInt(form.capacidad_maxima_personas) < 0) {
      errors.capacidad_maxima_personas = 'La capacidad máxima no puede ser negativa';
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
        capacidad_maxima_personas: form.capacidad_maxima_personas ? parseInt(form.capacidad_maxima_personas) : null,
        precio_personalizado: precioCalculado > 0 ? precioCalculado : null,
        caracteristicas_fisicas: {
          ...form.caracteristicas_fisicas,
          puntos_electricos: parseInt(form.caracteristicas_fisicas.puntos_electricos) || 0,
          altura_techo_m: parseFloat(form.caracteristicas_fisicas.altura_techo_m) || 3.0
        },
        equipamiento_fijo: {
          ...form.equipamiento_fijo,
          sillas: parseInt(form.equipamiento_fijo.sillas) || 0
        },
        servicios_disponibles: {
          ...form.servicios_disponibles,
          internet_dedicado_mbps: parseInt(form.servicios_disponibles.internet_dedicado_mbps) || 0
        }
      };

      console.log('🚀 Enviando payload:', payload);
      
      const response = await standsService.createStand(payload);
      console.log('✅ Respuesta del backend:', response);
      
      const successMessage = response.message || 'Stand creado exitosamente';
      setSuccess(successMessage);
      showSuccess(successMessage);
      console.log('✅ Mensaje de éxito establecido');
      
      // Mantener el mensaje visible por 3 segundos antes de actualizar la lista
      setTimeout(() => {
        setSuccess('');
        // Disparar actualización de la lista de stands después de mostrar el mensaje
        triggerRefresh();
      }, 3000);
      
      setForm({
        numero_stand: '',
        nombre_stand: '',
        id_tipo_stand: '',
        area: '',
        ubicacion: '',
        estado_fisico: 'disponible',
        permite_subdivision: false,
        capacidad_maxima_personas: '',
        observaciones: '',
        caracteristicas_fisicas: {
          puntos_electricos: 0,
          tipo_suelo: 'estandar',
          altura_techo_m: 3.0
        },
        equipamiento_fijo: {
          almacen_privado: '',
          sillas: 0
        },
        servicios_disponibles: {
          internet_dedicado_mbps: 0,
          limpieza_diaria: false,
          seguridad_24h: false
        }
      });
      setFieldErrors({});
    } catch (err) {
      console.log('❌ Error capturado:', err);
      console.log('❌ Tipo de error:', typeof err);
      console.log('❌ Error.message:', err.message);
      console.log('❌ Error.error:', err.error);
      const errorMessage = err.message || err.error || 'Error al crear el stand';
      setError(errorMessage);
      showError(errorMessage);
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
    <div className="space-y-6">
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
      <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
        {/* Mensaje de ayuda general */}
        <div className="bg-blue-900 border border-blue-600 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-200">Guía para crear un stand</h3>
              <div className="mt-2 text-sm text-blue-100">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Número del Stand:</strong> Debe ser único. Usa formato TIPO-NÚMERO (ej: BAS-001)</li>
                  <li><strong>Tipo de Stand:</strong> Determina equipamiento, servicios y precio base</li>
                  <li><strong>Área:</strong> Debe estar dentro del rango del tipo seleccionado</li>
                  <li><strong>Precio:</strong> Se calcula automáticamente (Precio base × Área)</li>
                  <li><strong>Campos opcionales:</strong> Puedes completarlos más tarde o dejarlos vacíos</li>
                  <li><strong>Tooltips:</strong> Pasa el mouse sobre los campos para más información</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Número del Stand *
              </label>
              <input
                type="text"
                name="numero_stand"
                value={form.numero_stand}
                onChange={handleChange}
                placeholder="Ej: BAS-001, PRE-002, COR-003"
                title="Ingresa un número único para identificar el stand. Ejemplos: BAS-001 (Básico), PRE-002 (Premium), COR-003 (Corporativo)"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.numero_stand
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {fieldErrors.numero_stand && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.numero_stand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Stand *
              </label>
              <input
                type="text"
                name="nombre_stand"
                value={form.nombre_stand}
                onChange={handleChange}
                placeholder="Ej: Stand Principal, Stand VIP, Stand Corporativo"
                title="Nombre descriptivo del stand para facilitar su identificación"
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
                title="Selecciona el tipo de stand que determina el equipamiento y servicios incluidos"
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.id_tipo_stand
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              >
                <option value="">Seleccionar tipo de stand</option>
                {tiposStand.map(tipo => (
                  <option key={tipo.id_tipo_stand} value={tipo.id_tipo_stand}>
                    {tipo.nombre_tipo} - {tipo.area_minima}-{tipo.area_maxima}m²
                  </option>
                ))}
              </select>
              {fieldErrors.id_tipo_stand && (
                <p className="mt-1 text-sm text-red-400">{fieldErrors.id_tipo_stand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Área (m²) *
              </label>
              <input
                type="number"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="Ej: 18.50, 25.00, 50.00"
                step="0.01"
                min="0"
                title="Área en metros cuadrados del stand. Debe estar dentro del rango del tipo seleccionado"
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
                Precio Calculado
              </label>
              <div className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white">
                <span className="text-lg font-semibold text-green-400">
                  S/ {precioCalculado.toFixed(2)}
                </span>
                {form.id_tipo_stand && form.area && (
                  <div className="text-xs text-gray-400 mt-1">
                    Precio base: S/ {tiposStand.find(t => t.id_tipo_stand == form.id_tipo_stand)?.precio_base || 0} × {form.area} m²
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Ubicación y Estado Físico */}
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
                placeholder="Ej: Zona A - Pasillo 1, Pabellón Central, Entrada Principal"
                title="Descripción de la ubicación física del stand dentro del evento"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado Físico
              </label>
              <select
                name="estado_fisico"
                value={form.estado_fisico}
                onChange={handleChange}
                title="Estado actual del stand que determina si está disponible para asignación"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {estadosFisicos.map(estado => (
                  <option key={estado.value} value={estado.value}>
                    {estado.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              placeholder="Observaciones adicionales sobre el stand, características especiales, restricciones, etc..."
              title="Información adicional relevante sobre el stand"
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Opciones booleanas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="permite_subdivision"
                checked={form.permite_subdivision}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-300">
                Permite Subdivisión
              </label>
            </div>
          </div>

          {/* Características Físicas */}
          <div className="bg-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Características Físicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Puntos Eléctricos
                </label>
                <input
                  type="number"
                  name="caracteristicas_fisicas.puntos_electricos"
                  value={form.caracteristicas_fisicas.puntos_electricos}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  title="Número de tomas eléctricas disponibles en el stand"
                  className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Suelo
                </label>
                <select
                  name="caracteristicas_fisicas.tipo_suelo"
                  value={form.caracteristicas_fisicas.tipo_suelo}
                  onChange={handleChange}
                  title="Tipo de material del suelo del stand"
                  className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  {tiposSuelo.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Altura del Techo (m)
                </label>
                <input
                  type="number"
                  name="caracteristicas_fisicas.altura_techo_m"
                  value={form.caracteristicas_fisicas.altura_techo_m}
                  onChange={handleChange}
                  placeholder="3.0"
                  step="0.1"
                  min="2.0"
                  max="10.0"
                  title="Altura del techo en metros (2.0 - 10.0 metros)"
                  className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Equipamiento Fijo */}
          <div className="bg-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Equipamiento Fijo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Almacén Privado
                </label>
                <input
                  type="text"
                  name="equipamiento_fijo.almacen_privado"
                  value={form.equipamiento_fijo.almacen_privado}
                  onChange={handleChange}
                  placeholder="Ej: 2m x 1m, No disponible"
                  title="Descripción del espacio de almacenamiento privado"
                  className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Sillas
                </label>
                <input
                  type="number"
                  name="equipamiento_fijo.sillas"
                  value={form.equipamiento_fijo.sillas}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  title="Número de sillas incluidas con el stand"
                  className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Servicios Disponibles */}
          <div className="bg-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Servicios Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Internet Dedicado (Mbps)
                </label>
                <input
                  type="number"
                  name="servicios_disponibles.internet_dedicado_mbps"
                  value={form.servicios_disponibles.internet_dedicado_mbps}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  title="Velocidad de internet dedicado en Mbps"
                  className="w-full px-3 py-2 bg-gray-500 border border-gray-400 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="servicios_disponibles.limpieza_diaria"
                  checked={form.servicios_disponibles.limpieza_diaria}
                  onChange={handleChange}
                  title="Incluye servicio de limpieza diaria"
                  className="w-4 h-4 text-blue-600 bg-gray-500 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label className="ml-2 text-sm text-gray-300">
                  Limpieza Diaria
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="servicios_disponibles.seguridad_24h"
                  checked={form.servicios_disponibles.seguridad_24h}
                  onChange={handleChange}
                  title="Incluye servicio de seguridad 24 horas"
                  className="w-4 h-4 text-blue-600 bg-gray-500 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label className="ml-2 text-sm text-gray-300">
                  Seguridad 24h
                </label>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
            <button
              type="button"
              onClick={() => setForm({
                codigo_stand: '',
                nombre_stand: '',
                id_tipo_stand: '',
                area: '',
                ubicacion: '',
                estado_fisico: 'disponible',
                permite_subdivision: false,
                capacidad_maxima_personas: '',
                observaciones: '',
                caracteristicas_fisicas: {
                  puntos_electricos: 0,
                  tipo_suelo: 'estandar',
                  altura_techo_m: 3.0
                },
                equipamiento_fijo: {
                  almacen_privado: '',
                  sillas: 0
                },
                servicios_disponibles: {
                  internet_dedicado_mbps: 0,
                  limpieza_diaria: false,
                  seguridad_24h: false
                }
              })}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-400 transition-colors"
            >
              Limpiar
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

      {/* Toast de Notificación */}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </div>
  );
};

export default AgregarStand; 