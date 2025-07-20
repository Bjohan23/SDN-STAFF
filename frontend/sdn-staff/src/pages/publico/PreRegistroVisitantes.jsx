import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../config/axios';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  UsersIcon,
  CreditCardIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const PreRegistroVisitantes = () => {
  const navigate = useNavigate();
  const { eventoId } = useParams();
  
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    // Datos personales
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    documento_identidad: '',
    tipo_documento: 'cedula',
    fecha_nacimiento: '',
    genero: '',
    
    // Datos profesionales
    empresa: '',
    cargo: '',
    sector_empresa: '',
    anos_experiencia: '',
    
    // Datos del evento
    tipo_participacion: 'visitante',
    intereses: [],
    expectativas: '',
    como_se_entero: '',
    
    // Datos adicionales
    necesidades_especiales: '',
    comentarios: '',
    acepta_terminos: false,
    acepta_marketing: false,
    
    // Para registro grupal
    es_registro_grupal: false,
    participantes_adicionales: []
  });

  // Opciones para los selects
  const tiposDocumento = [
    { value: 'cedula', label: 'Cédula de Identidad' },
    { value: 'pasaporte', label: 'Pasaporte' },
    { value: 'ruc', label: 'RUC' },
    { value: 'otro', label: 'Otro' }
  ];

  const sectoresEmpresa = [
    'Tecnología', 'Salud', 'Educación', 'Finanzas', 'Manufactura',
    'Comercio', 'Servicios', 'Agricultura', 'Turismo', 'Construcción',
    'Transporte', 'Comunicaciones', 'Energía', 'Otro'
  ];

  const tiposParticipacion = [
    { value: 'visitante', label: 'Visitante General', precio: 0 },
    { value: 'profesional', label: 'Profesional', precio: 50 },
    { value: 'estudiante', label: 'Estudiante', precio: 25 },
    { value: 'vip', label: 'VIP', precio: 150 },
    { value: 'prensa', label: 'Prensa', precio: 0 }
  ];

  const interesesDisponibles = [
    'Tecnología', 'Negocios', 'Marketing', 'Ventas', 'Innovación',
    'Sostenibilidad', 'Liderazgo', 'Networking', 'Educación', 'Salud'
  ];

  const comoseEntero = [
    'Redes sociales', 'Página web', 'Email marketing', 'Recomendación',
    'Medios de comunicación', 'Evento anterior', 'Publicidad', 'Otro'
  ];

  // Cargar datos del evento
  useEffect(() => {
    if (eventoId) {
      cargarEvento();
    }
  }, [eventoId]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/eventos/${eventoId}/publico`);
      setEvento(response.data.data);
    } catch (error) {
      console.error('Error cargando evento:', error);
      setErrors({ general: 'Error al cargar la información del evento' });
    } finally {
      setLoading(false);
    }
  };

  // Validar formulario por paso
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Datos personales
        if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
        if (!formData.apellidos.trim()) newErrors.apellidos = 'Los apellidos son requeridos';
        if (!formData.email.trim()) {
          newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Email inválido';
        }
        if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
        if (!formData.documento_identidad.trim()) newErrors.documento_identidad = 'El documento es requerido';
        break;

      case 2: // Datos profesionales
        if (!formData.empresa.trim()) newErrors.empresa = 'La empresa es requerida';
        if (!formData.cargo.trim()) newErrors.cargo = 'El cargo es requerido';
        if (!formData.sector_empresa) newErrors.sector_empresa = 'El sector es requerido';
        break;

      case 3: // Datos del evento
        if (formData.intereses.length === 0) newErrors.intereses = 'Selecciona al menos un interés';
        if (!formData.como_se_entero) newErrors.como_se_entero = 'Indica cómo te enteraste';
        break;

      case 4: // Términos y condiciones
        if (!formData.acepta_terminos) newErrors.acepta_terminos = 'Debes aceptar los términos';
        break;
    }

    return newErrors;
  };

  // Avanzar al siguiente paso
  const nextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  // Retroceder al paso anterior
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  // Verificar duplicados
  const verificarDuplicados = async () => {
    try {
      const response = await axios.post('/api/pre-registro/verificar-duplicado', {
        email: formData.email,
        documento_identidad: formData.documento_identidad,
        evento_id: eventoId
      });
      
      return response.data.existe;
    } catch (error) {
      console.error('Error verificando duplicados:', error);
      return false;
    }
  };

  // Enviar formulario
  const handleSubmit = async () => {
    const finalErrors = validateStep(4);
    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    try {
      setSubmitting(true);

      // Verificar duplicados
      const existeDuplicado = await verificarDuplicados();
      if (existeDuplicado) {
        setErrors({ general: 'Ya existe un registro con este email o documento para este evento' });
        return;
      }

      // Enviar registro
      const response = await axios.post('/api/pre-registro', {
        ...formData,
        evento_id: eventoId
      });

      setRegistrationData(response.data.data);
      setSuccess(true);
      
      // Enviar email de confirmación automáticamente
      await axios.post(`/api/pre-registro/${response.data.data.id}/enviar-confirmacion`);

    } catch (error) {
      console.error('Error en el registro:', error);
      setErrors({ 
        general: error.response?.data?.message || 'Error al procesar el registro' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Manejar intereses múltiples
  const handleInterestToggle = (interest) => {
    const newInterests = formData.intereses.includes(interest)
      ? formData.intereses.filter(i => i !== interest)
      : [...formData.intereses, interest];
    
    handleInputChange('intereses', newInterests);
  };

  // Agregar participante adicional (registro grupal)
  const agregarParticipante = () => {
    const nuevosParticipantes = [...formData.participantes_adicionales, {
      nombre: '',
      apellidos: '',
      email: '',
      empresa: '',
      cargo: ''
    }];
    handleInputChange('participantes_adicionales', nuevosParticipantes);
  };

  // Remover participante adicional
  const removerParticipante = (index) => {
    const nuevosParticipantes = formData.participantes_adicionales.filter((_, i) => i !== index);
    handleInputChange('participantes_adicionales', nuevosParticipantes);
  };

  // Calcular precio total
  const calcularPrecioTotal = () => {
    const tipoSeleccionado = tiposParticipacion.find(t => t.value === formData.tipo_participacion);
    const precioBase = tipoSeleccionado?.precio || 0;
    const cantidad = 1 + (formData.es_registro_grupal ? formData.participantes_adicionales.length : 0);
    return precioBase * cantidad;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Registro Exitoso!
          </h2>
          <p className="text-gray-600 mb-6">
            Tu pre-registro ha sido procesado exitosamente. Recibirás un email de confirmación 
            con tu código QR en los próximos minutos.
          </p>
          
          {registrationData && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Código de registro:</strong> {registrationData.codigo_registro}
              </p>
              {calcularPrecioTotal() > 0 && (
                <p className="text-sm text-blue-800 mt-2">
                  <strong>Total a pagar:</strong> ${calcularPrecioTotal()}
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al inicio
            </button>
            
            {calcularPrecioTotal() > 0 && (
              <button
                onClick={() => navigate(`/pago/${registrationData.id}`)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Proceder al pago
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Pre-registro para {evento?.nombre}
            </h1>
            <p className="text-gray-600 mt-2">
              Completa tu registro para participar en el evento
            </p>
          </div>
          
          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Datos Personales</span>
              <span>Datos Profesionales</span>
              <span>Preferencias</span>
              <span>Confirmación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{errors.general}</span>
              </div>
            </div>
          )}

          {/* Step 1: Datos Personales */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <UserIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Datos Personales</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nombre ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tu nombre"
                  />
                  {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    value={formData.apellidos}
                    onChange={(e) => handleInputChange('apellidos', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.apellidos ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tus apellidos"
                  />
                  {errors.apellidos && <p className="text-red-600 text-sm mt-1">{errors.apellidos}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.telefono ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="+593 99 123 4567"
                  />
                  {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento *
                  </label>
                  <select
                    value={formData.tipo_documento}
                    onChange={(e) => handleInputChange('tipo_documento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {tiposDocumento.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    value={formData.documento_identidad}
                    onChange={(e) => handleInputChange('documento_identidad', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.documento_identidad ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="1234567890"
                  />
                  {errors.documento_identidad && <p className="text-red-600 text-sm mt-1">{errors.documento_identidad}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    value={formData.genero}
                    onChange={(e) => handleInputChange('genero', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiero_no_decir">Prefiero no decir</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Datos Profesionales */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Datos Profesionales</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => handleInputChange('empresa', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.empresa ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nombre de tu empresa"
                  />
                  {errors.empresa && <p className="text-red-600 text-sm mt-1">{errors.empresa}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => handleInputChange('cargo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cargo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Tu cargo o posición"
                  />
                  {errors.cargo && <p className="text-red-600 text-sm mt-1">{errors.cargo}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector de la Empresa *
                  </label>
                  <select
                    value={formData.sector_empresa}
                    onChange={(e) => handleInputChange('sector_empresa', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.sector_empresa ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar sector</option>
                    {sectoresEmpresa.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                  {errors.sector_empresa && <p className="text-red-600 text-sm mt-1">{errors.sector_empresa}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Años de Experiencia
                  </label>
                  <select
                    value={formData.anos_experiencia}
                    onChange={(e) => handleInputChange('anos_experiencia', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar</option>
                    <option value="0-1">0-1 años</option>
                    <option value="2-5">2-5 años</option>
                    <option value="6-10">6-10 años</option>
                    <option value="11-15">11-15 años</option>
                    <option value="16+">Más de 16 años</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.es_registro_grupal}
                    onChange={(e) => handleInputChange('es_registro_grupal', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Esto es un registro grupal (registrar múltiples participantes)
                  </span>
                </label>
              </div>
              
              {/* Participantes adicionales */}
              {formData.es_registro_grupal && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Participantes Adicionales</h3>
                    <button
                      type="button"
                      onClick={agregarParticipante}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <UsersIcon className="w-4 h-4 inline mr-2" />
                      Agregar Participante
                    </button>
                  </div>
                  
                  {formData.participantes_adicionales.map((participante, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Participante {index + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removerParticipante(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remover
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Nombre"
                          value={participante.nombre}
                          onChange={(e) => {
                            const nuevosParticipantes = [...formData.participantes_adicionales];
                            nuevosParticipantes[index].nombre = e.target.value;
                            handleInputChange('participantes_adicionales', nuevosParticipantes);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        
                        <input
                          type="text"
                          placeholder="Apellidos"
                          value={participante.apellidos}
                          onChange={(e) => {
                            const nuevosParticipantes = [...formData.participantes_adicionales];
                            nuevosParticipantes[index].apellidos = e.target.value;
                            handleInputChange('participantes_adicionales', nuevosParticipantes);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        
                        <input
                          type="email"
                          placeholder="Email"
                          value={participante.email}
                          onChange={(e) => {
                            const nuevosParticipantes = [...formData.participantes_adicionales];
                            nuevosParticipantes[index].email = e.target.value;
                            handleInputChange('participantes_adicionales', nuevosParticipantes);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        
                        <input
                          type="text"
                          placeholder="Cargo"
                          value={participante.cargo}
                          onChange={(e) => {
                            const nuevosParticipantes = [...formData.participantes_adicionales];
                            nuevosParticipantes[index].cargo = e.target.value;
                            handleInputChange('participantes_adicionales', nuevosParticipantes);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preferencias del Evento */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Preferencias del Evento</h2>
              </div>
              
              <div className="space-y-6">
                {/* Tipo de participación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Participación
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tiposParticipacion.map(tipo => (
                      <label key={tipo.value} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="tipo_participacion"
                          value={tipo.value}
                          checked={formData.tipo_participacion === tipo.value}
                          onChange={(e) => handleInputChange('tipo_participacion', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{tipo.label}</div>
                          <div className="text-sm text-gray-600">
                            ${tipo.precio} {tipo.precio === 0 ? '(Gratuito)' : ''}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Intereses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Áreas de Interés *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {interesesDisponibles.map(interes => (
                      <label key={interes} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.intereses.includes(interes)}
                          onChange={() => handleInterestToggle(interes)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{interes}</span>
                      </label>
                    ))}
                  </div>
                  {errors.intereses && <p className="text-red-600 text-sm mt-1">{errors.intereses}</p>}
                </div>
                
                {/* Expectativas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Qué esperas del evento?
                  </label>
                  <textarea
                    value={formData.expectativas}
                    onChange={(e) => handleInputChange('expectativas', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Cuéntanos qué esperas obtener de este evento..."
                  />
                </div>
                
                {/* Cómo se enteró */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Cómo te enteraste del evento? *
                  </label>
                  <select
                    value={formData.como_se_entero}
                    onChange={(e) => handleInputChange('como_se_entero', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.como_se_entero ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar</option>
                    {comoseEntero.map(medio => (
                      <option key={medio} value={medio}>{medio}</option>
                    ))}
                  </select>
                  {errors.como_se_entero && <p className="text-red-600 text-sm mt-1">{errors.como_se_entero}</p>}
                </div>
                
                {/* Necesidades especiales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Necesidades Especiales
                  </label>
                  <textarea
                    value={formData.necesidades_especiales}
                    onChange={(e) => handleInputChange('necesidades_especiales', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Indica si tienes alguna necesidad especial o requerimiento de accesibilidad..."
                  />
                </div>
                
                {/* Comentarios adicionales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios Adicionales
                  </label>
                  <textarea
                    value={formData.comentarios}
                    onChange={(e) => handleInputChange('comentarios', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="2"
                    placeholder="Cualquier comentario adicional que quieras compartir..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmación */}
          {currentStep === 4 && (
            <div>
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Confirmación y Términos</h2>
              </div>
              
              {/* Resumen del registro */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del Registro</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nombre:</span>
                    <span className="ml-2 text-gray-900">{formData.nombre} {formData.apellidos}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <span className="ml-2 text-gray-900">{formData.email}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Empresa:</span>
                    <span className="ml-2 text-gray-900">{formData.empresa}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Cargo:</span>
                    <span className="ml-2 text-gray-900">{formData.cargo}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Tipo de participación:</span>
                    <span className="ml-2 text-gray-900">
                      {tiposParticipacion.find(t => t.value === formData.tipo_participacion)?.label}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Participantes:</span>
                    <span className="ml-2 text-gray-900">
                      {1 + (formData.es_registro_grupal ? formData.participantes_adicionales.length : 0)}
                    </span>
                  </div>
                </div>
                
                {calcularPrecioTotal() > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-900">Total a pagar:</span>
                      <span className="text-xl font-bold text-blue-600">${calcularPrecioTotal()}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Términos y condiciones */}
              <div className="space-y-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.acepta_terminos}
                    onChange={(e) => handleInputChange('acepta_terminos', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Acepto los <a href="/terminos" target="_blank" className="text-blue-600 hover:underline">términos y condiciones</a> y la 
                    <a href="/privacidad" target="_blank" className="text-blue-600 hover:underline ml-1">política de privacidad</a> *
                  </span>
                </label>
                {errors.acepta_terminos && <p className="text-red-600 text-sm">{errors.acepta_terminos}</p>}
                
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.acepta_marketing}
                    onChange={(e) => handleInputChange('acepta_marketing', e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    Acepto recibir comunicaciones de marketing sobre futuros eventos y noticias relacionadas
                  </span>
                </label>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Al completar tu registro:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Recibirás un email de confirmación con tu código QR</li>
                      <li>• Podrás descargar tu credencial de acceso</li>
                      <li>• Tendrás acceso a la agenda del evento</li>
                      {calcularPrecioTotal() > 0 && (
                        <li>• Serás redirigido para completar el pago</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Anterior
            </button>
            
            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                Siguiente
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    Completar Registro
                    <CheckCircleIcon className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreRegistroVisitantes;