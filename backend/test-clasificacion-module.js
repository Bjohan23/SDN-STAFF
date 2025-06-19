/**
 * Script de pruebas para el Módulo de Clasificación por Tipo de Evento
 * Prueba todos los endpoints y funcionalidades del módulo
 * 
 * Ejecutar con: node test-clasificacion-module.js
 */

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  magenta: '\x1b[35m'
};

// Función para mostrar mensajes con colores
function log(message, color = 'white') {
  console.log(colors[color] + message + colors.reset);
}

// Función para hacer peticiones HTTP
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Authorization': authToken ? `Bearer ${authToken}` : '',
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Función para autenticarse
async function authenticate() {
  log('\n🔐 Autenticando usuario...', 'blue');
  
  const loginData = {
    email: 'admin@sdn.com',
    password: 'admin123'
  };

  const result = await makeRequest('POST', '/auth/login', loginData);
  
  if (result.success) {
    authToken = result.data.data.accessToken;
    log('✅ Autenticación exitosa', 'green');
    return true;
  } else {
    log('❌ Error en autenticación: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

// Pruebas de Configuraciones de Tipos de Evento
async function testConfiguracionesTipoEvento() {
  log('\n⚙️ === PRUEBAS DE CONFIGURACIONES DE TIPOS DE EVENTO ===', 'cyan');

  // 1. Obtener configuraciones por tipo de evento
  log('\n1. Obteniendo configuraciones para Feria Comercial (ID: 1)...', 'yellow');
  let result = await makeRequest('GET', '/clasificacion-tipos-evento/tipos/1/configuraciones?include_validaciones=true');
  if (result.success) {
    log(`✅ ${result.data.data.length} configuraciones obtenidas`, 'green');
    if (result.data.data.length > 0) {
      log(`   Modalidades: ${result.data.data.map(c => c.modalidad).join(', ')}`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Obtener configuración específica por modalidad
  log('\n2. Obteniendo configuración presencial para Feria Comercial...', 'yellow');
  result = await makeRequest('GET', '/clasificacion-tipos-evento/tipos/1/configuraciones/presencial?include_validaciones=true');
  if (result.success) {
    log(`✅ Configuración presencial obtenida`, 'green');
    log(`   Capacidad: ${result.data.data.capacidad_minima} - ${result.data.data.capacidad_maxima} personas`, 'green');
    log(`   Permite stands físicos: ${result.data.data.permite_stands_fisicos ? 'Sí' : 'No'}`, 'green');
    if (result.data.data.validaciones && result.data.data.validaciones.length > 0) {
      log(`   Validaciones: ${result.data.data.validaciones.length} reglas configuradas`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Crear nueva configuración completa
  log('\n3. Creando nueva configuración híbrida para Seminario (ID: 3)...', 'yellow');
  const nuevaConfiguracion = {
    modalidad: 'hibrido',
    permite_presencial: true,
    permite_virtual: true,
    permite_hibrido: true,
    requiere_ubicacion_fisica: true,
    tipos_ubicacion_permitidos: ['salon_conferencias', 'centro_convenciones'],
    capacidad_minima: 10,
    capacidad_maxima: 100,
    requiere_plataforma_virtual: true,
    plataformas_permitidas: ['zoom', 'teams'],
    permite_transmision_vivo: true,
    permite_grabacion: true,
    permite_stands_fisicos: false,
    permite_stands_virtuales: false,
    requiere_registro_previo: true,
    permite_registro_in_situ: false,
    requiere_aprobacion_registro: true,
    tiene_costo_entrada: true,
    precio_base_entrada: 30.00,
    moneda_precio: 'PEN',
    duracion_minima_horas: 2,
    duracion_maxima_horas: 6,
    permite_eventos_multidia: false,
    requiere_acreditacion: true,
    permite_networking: true,
    permite_conferencias: true,
    permite_talleres: true,
    campos_obligatorios: ['ubicacion', 'plataforma_virtual', 'agenda'],
    servicios_incluidos: ['plataforma_virtual', 'grabacion', 'soporte_tecnico'],
    servicios_recomendados: ['interpretacion', 'chat_moderado'],
    estado: 'activo'
  };
  
  result = await makeRequest('POST', '/clasificacion-tipos-evento/tipos/3/configuraciones', nuevaConfiguracion);
  if (result.success) {
    log(`✅ Configuración híbrida creada con ID: ${result.data.data.id_configuracion}`, 'green');
    log(`   Modalidad: ${result.data.data.modalidad}`, 'green');
    log(`   Estado: ${result.data.data.estado}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Obtener información completa de tipo de evento
  log('\n4. Obteniendo información completa del tipo Conferencia...', 'yellow');
  result = await makeRequest('GET', '/clasificacion-tipos-evento/tipos/2/completo?include_validaciones=true&include_plantillas=true');
  if (result.success) {
    log(`✅ Información completa obtenida`, 'green');
    log(`   Tipo: ${result.data.data.tipo_evento.nombre_tipo}`, 'green');
    log(`   Configuraciones: ${result.data.data.configuraciones.length}`, 'green');
    if (result.data.data.validaciones) {
      log(`   Validaciones: ${result.data.data.validaciones.length}`, 'green');
    }
    if (result.data.data.plantillas) {
      log(`   Plantillas: ${result.data.data.plantillas.length}`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 5. Duplicar configuración existente
  log('\n5. Duplicando configuración presencial para modalidad virtual...', 'yellow');
  const duplicarData = {
    nueva_modalidad: 'virtual'
  };
  
  result = await makeRequest('POST', '/clasificacion-tipos-evento/configuraciones/1/duplicar', duplicarData);
  if (result.success) {
    log(`✅ Configuración duplicada con ID: ${result.data.data.id_configuracion}`, 'green');
    log(`   Nueva modalidad: ${result.data.data.modalidad}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de Validaciones de Configuración
async function testValidacionesConfiguracion() {
  log('\n✅ === PRUEBAS DE VALIDACIONES DE CONFIGURACIÓN ===', 'cyan');

  // 1. Validar configuración correcta
  log('\n1. Validando configuración correcta para Feria Comercial...', 'yellow');
  const datosValidos = {
    modalidad: 'presencial',
    capacidad_maxima: 500,
    duracion_horas: 24,
    ubicacion: 'Centro de Convenciones Lima',
    tipo_ubicacion: 'centro_convenciones',
    fecha_inicio: '2024-06-15T09:00:00Z',
    fecha_fin: '2024-06-16T18:00:00Z'
  };
  
  let result = await makeRequest('POST', '/clasificacion-tipos-evento/tipos/1/validar', datosValidos);
  if (result.success) {
    log(`✅ Validación completada - Válido: ${result.data.data.valido}`, 'green');
    log(`   Errores: ${result.data.data.errores.length}`, 'green');
    log(`   Advertencias: ${result.data.data.advertencias.length}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Validar configuración con errores
  log('\n2. Validando configuración con errores (capacidad muy baja)...', 'yellow');
  const datosInvalidos = {
    modalidad: 'presencial',
    capacidad_maxima: 10, // Muy baja para una feria
    duracion_horas: 2,    // Muy corta para una feria
    ubicacion: '',        // Vacía cuando es requerida
    fecha_inicio: '2024-06-15T09:00:00Z',
    fecha_fin: '2024-06-14T18:00:00Z' // Fecha fin antes que inicio
  };
  
  result = await makeRequest('POST', '/clasificacion-tipos-evento/tipos/1/validar', datosInvalidos);
  if (result.success) {
    log(`✅ Validación completada - Válido: ${result.data.data.valido}`, 'green');
    log(`   Errores encontrados: ${result.data.data.errores.length}`, 'yellow');
    if (result.data.data.errores.length > 0) {
      result.data.data.errores.forEach((error, index) => {
        log(`     ${index + 1}. ${error.campo}: ${error.mensaje}`, 'red');
      });
    }
    log(`   Advertencias: ${result.data.data.advertencias.length}`, 'yellow');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Validar configuración para evento virtual
  log('\n3. Validando configuración para evento virtual...', 'yellow');
  const datosVirtuales = {
    modalidad: 'virtual',
    capacidad_maxima: 1000,
    duracion_horas: 4,
    plataforma_virtual: 'zoom',
    fecha_inicio: '2024-07-01T19:00:00Z',
    fecha_fin: '2024-07-01T23:00:00Z'
  };
  
  result = await makeRequest('POST', '/clasificacion-tipos-evento/tipos/3/validar', datosVirtuales);
  if (result.success) {
    log(`✅ Validación para evento virtual completada`, 'green');
    log(`   Válido: ${result.data.data.valido}`, 'green');
    log(`   Errores: ${result.data.data.errores.length}`, 'green');
    log(`   Advertencias: ${result.data.data.advertencias.length}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de Plantillas de Eventos
async function testPlantillasEventos() {
  log('\n📋 === PRUEBAS DE PLANTILLAS DE EVENTOS ===', 'cyan');

  // 1. Obtener plantillas disponibles para tipo de evento
  log('\n1. Obteniendo plantillas para Feria Comercial...', 'yellow');
  let result = await makeRequest('GET', '/clasificacion-tipos-evento/tipos/1/plantillas?include_audit=true');
  if (result.success) {
    log(`✅ ${result.data.data.length} plantillas obtenidas`, 'green');
    if (result.data.data.length > 0) {
      const plantilla = result.data.data[0];
      log(`   Primera plantilla: "${plantilla.nombre_plantilla}"`, 'green');
      log(`   Modalidad: ${plantilla.modalidad_predefinida}`, 'green');
      log(`   Nivel: ${plantilla.nivel_complejidad}`, 'green');
      log(`   Popularidad: ${plantilla.popularidad}`, 'green');
      log(`   Calificación: ${plantilla.calificacion_promedio}`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Filtrar plantillas por modalidad
  log('\n2. Filtrando plantillas virtuales...', 'yellow');
  result = await makeRequest('GET', '/clasificacion-tipos-evento/tipos/1/plantillas?modalidad=virtual');
  if (result.success) {
    log(`✅ ${result.data.data.length} plantillas virtuales encontradas`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Filtrar plantillas por nivel de complejidad
  log('\n3. Filtrando plantillas básicas...', 'yellow');
  result = await makeRequest('GET', '/clasificacion-tipos-evento/tipos/2/plantillas?nivel_complejidad=basico');
  if (result.success) {
    log(`✅ ${result.data.data.length} plantillas básicas encontradas`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Aplicar plantilla con datos personalizados
  log('\n4. Aplicando plantilla de Feria Virtual con personalización...', 'yellow');
  const datosPersonalizados = {
    nombre_evento: 'Feria Tech Virtual 2024',
    descripcion: 'Feria virtual especializada en tecnología',
    modalidad: 'virtual',
    capacidad_maxima: 2000,
    precio_entrada: 10.00,
    plataforma_virtual: 'custom_platform',
    fecha_inicio: '2024-08-15T10:00:00Z',
    fecha_fin: '2024-08-16T22:00:00Z'
  };
  
  result = await makeRequest('POST', '/clasificacion-tipos-evento/plantillas/2/aplicar', datosPersonalizados);
  if (result.success) {
    log(`✅ Plantilla aplicada exitosamente`, 'green');
    log(`   Nombre generado: ${result.data.data.nombre_evento}`, 'green');
    log(`   Modalidad: ${result.data.data.modalidad}`, 'green');
    log(`   Capacidad: ${result.data.data.capacidad_maxima}`, 'green');
    log(`   Precio: ${result.data.data.precio_entrada} ${result.data.data.moneda || 'PEN'}`, 'green');
    if (result.data.data.servicios_incluidos) {
      log(`   Servicios incluidos: ${result.data.data.servicios_incluidos.length}`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 5. Aplicar plantilla básica sin personalización
  log('\n5. Aplicando plantilla de Conferencia sin personalización...', 'yellow');
  result = await makeRequest('POST', '/clasificacion-tipos-evento/plantillas/3/aplicar', {});
  if (result.success) {
    log(`✅ Plantilla base aplicada`, 'green');
    log(`   Configuración predefinida generada`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de Configuraciones por Modalidad
async function testConfiguracionesPorModalidad() {
  log('\n🌐 === PRUEBAS DE CONFIGURACIONES POR MODALIDAD ===', 'cyan');

  // 1. Obtener todas las configuraciones presenciales
  log('\n1. Obteniendo configuraciones presenciales (paginadas)...', 'yellow');
  let result = await makeRequest('GET', '/clasificacion-tipos-evento/modalidad/presencial?page=1&limit=5');
  if (result.success) {
    log(`✅ ${result.data.data.length} configuraciones presenciales obtenidas`, 'green');
    log(`   Página 1 de ${result.data.pagination.totalPages}`, 'green');
    log(`   Total: ${result.data.pagination.totalItems} configuraciones`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Obtener configuraciones virtuales
  log('\n2. Obteniendo configuraciones virtuales...', 'yellow');
  result = await makeRequest('GET', '/clasificacion-tipos-evento/modalidad/virtual');
  if (result.success) {
    log(`✅ ${result.data.data.length} configuraciones virtuales obtenidas`, 'green');
    if (result.data.data.length > 0) {
      const virtual = result.data.data[0];
      log(`   Ejemplo: ${virtual.tipoEvento?.nombre_tipo || 'N/A'} - ${virtual.modalidad}`, 'green');
      log(`   Plataformas: ${virtual.plataformas_permitidas?.join(', ') || 'N/A'}`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Obtener configuraciones híbridas
  log('\n3. Obteniendo configuraciones híbridas...', 'yellow');
  result = await makeRequest('GET', '/clasificacion-tipos-evento/modalidad/hibrido');
  if (result.success) {
    log(`✅ ${result.data.data.length} configuraciones híbridas obtenidas`, 'green');
    if (result.data.data.length > 0) {
      const hibrido = result.data.data[0];
      log(`   Requiere ubicación física: ${hibrido.requiere_ubicacion_fisica ? 'Sí' : 'No'}`, 'green');
      log(`   Requiere plataforma virtual: ${hibrido.requiere_plataforma_virtual ? 'Sí' : 'No'}`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de Estadísticas y Gestión
async function testEstadisticasGestion() {
  log('\n📊 === PRUEBAS DE ESTADÍSTICAS Y GESTIÓN ===', 'cyan');

  // 1. Obtener estadísticas de configuraciones para tipo de evento
  log('\n1. Obteniendo estadísticas para Feria Comercial...', 'yellow');
  let result = await makeRequest('GET', '/clasificacion-tipos-evento/tipos/1/stats');
  if (result.success) {
    log(`✅ Estadísticas obtenidas`, 'green');
    log(`   Total configuraciones: ${result.data.data.total_configuraciones || 0}`, 'green');
    log(`   Configuraciones activas: ${result.data.data.configuraciones_activas || 0}`, 'green');
    if (result.data.data.por_modalidad) {
      log(`   Por modalidad:`, 'green');
      Object.entries(result.data.data.por_modalidad).forEach(([modalidad, count]) => {
        log(`     ${modalidad}: ${count}`, 'green');
      });
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Actualizar configuración existente
  log('\n2. Actualizando configuración (cambiar estado)...', 'yellow');
  const updateData = {
    estado: 'en_revision',
    observaciones: 'Configuración en proceso de revisión para mejoras'
  };
  
  result = await makeRequest('PUT', '/clasificacion-tipos-evento/configuraciones/1', updateData);
  if (result.success) {
    log(`✅ Configuración actualizada`, 'green');
    log(`   Nuevo estado: ${result.data.data.estado}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Revertir estado (volver a activo)
  log('\n3. Revirtiendo estado a activo...', 'yellow');
  result = await makeRequest('PUT', '/clasificacion-tipos-evento/configuraciones/1', { estado: 'activo' });
  if (result.success) {
    log(`✅ Estado revertido a: ${result.data.data.estado}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de Casos Límite y Manejo de Errores
async function testCasosLimite() {
  log('\n⚠️ === PRUEBAS DE CASOS LÍMITE Y MANEJO DE ERRORES ===', 'cyan');

  // 1. Intentar obtener configuración de tipo inexistente
  log('\n1. Intentando obtener configuración de tipo inexistente...', 'yellow');
  let result = await makeRequest('GET', '/clasificacion-tipos-evento/tipos/999/configuraciones');
  if (!result.success && result.status === 404) {
    log('✅ Error 404 manejado correctamente para tipo inexistente', 'green');
  } else {
    log('❌ El error no fue manejado correctamente', 'red');
  }

  // 2. Intentar crear configuración duplicada
  log('\n2. Intentando crear configuración duplicada...', 'yellow');
  const configDuplicada = {
    modalidad: 'presencial', // Ya existe para tipo 1
    capacidad_minima: 100,
    estado: 'activo'
  };
  
  result = await makeRequest('POST', '/clasificacion-tipos-evento/tipos/1/configuraciones', configDuplicada);
  if (!result.success && result.status === 409) {
    log('✅ Error 409 manejado correctamente para configuración duplicada', 'green');
  } else {
    log('❌ El error de duplicación no fue manejado correctamente', 'red');
  }

  // 3. Intentar aplicar plantilla inexistente
  log('\n3. Intentando aplicar plantilla inexistente...', 'yellow');
  result = await makeRequest('POST', '/clasificacion-tipos-evento/plantillas/999/aplicar', {});
  if (!result.success && result.status === 404) {
    log('✅ Error 404 manejado correctamente para plantilla inexistente', 'green');
  } else {
    log('❌ El error de plantilla inexistente no fue manejado correctamente', 'red');
  }

  // 4. Validación con datos inválidos
  log('\n4. Validando con datos completamente inválidos...', 'yellow');
  const datosInvalidos = {
    modalidad: 'inexistente',
    capacidad_maxima: -50,
    duracion_horas: 'no_es_numero',
    fecha_inicio: 'fecha_invalida'
  };
  
  result = await makeRequest('POST', '/clasificacion-tipos-evento/tipos/1/validar', datosInvalidos);
  if (result.success || (!result.success && result.status === 400)) {
    log('✅ Validación de datos inválidos manejada correctamente', 'green');
  } else {
    log('❌ La validación de datos inválidos no fue manejada correctamente', 'red');
  }

  // 5. Intentar actualizar configuración inexistente
  log('\n5. Intentando actualizar configuración inexistente...', 'yellow');
  result = await makeRequest('PUT', '/clasificacion-tipos-evento/configuraciones/999', { estado: 'activo' });
  if (!result.success && result.status === 404) {
    log('✅ Error 404 manejado correctamente para configuración inexistente', 'green');
  } else {
    log('❌ El error de configuración inexistente no fue manejado correctamente', 'red');
  }
}

// Función principal
async function runTests() {
  log('🚀 INICIANDO PRUEBAS DEL MÓDULO DE CLASIFICACIÓN POR TIPO DE EVENTO', 'cyan');
  log('='.repeat(70), 'cyan');

  // Autenticación
  const authenticated = await authenticate();
  if (!authenticated) {
    log('\n❌ No se pudo autenticar. Abortando pruebas.', 'red');
    return;
  }

  try {
    // Ejecutar todas las pruebas
    await testConfiguracionesTipoEvento();
    await testValidacionesConfiguracion();
    await testPlantillasEventos();
    await testConfiguracionesPorModalidad();
    await testEstadisticasGestion();
    await testCasosLimite();

    log('\n🎉 === RESUMEN DE PRUEBAS ===', 'cyan');
    log('✅ Todas las pruebas del módulo de clasificación completadas', 'green');
    log('📊 Funcionalidades probadas:', 'yellow');
    log('   • CRUD completo de configuraciones por tipo de evento', 'white');
    log('   • Sistema de validaciones avanzadas', 'white');
    log('   • Gestión de plantillas de eventos', 'white');
    log('   • Aplicación y personalización de plantillas', 'white');
    log('   • Duplicación de configuraciones', 'white');
    log('   • Información completa de tipos de evento', 'white');
    log('   • Filtros por modalidad (presencial/virtual/híbrido)', 'white');
    log('   • Estadísticas y reportes', 'white');
    log('   • Manejo de errores y casos límite', 'white');
    log('   • Validaciones específicas por tipo de evento', 'white');
    log('   • Estados y flujos de configuración', 'white');

    log('\n🔧 Tipos de configuración soportados:', 'yellow');
    log('   • Modalidad presencial con ubicaciones físicas', 'white');
    log('   • Modalidad virtual con plataformas digitales', 'white');
    log('   • Modalidad híbrida combinando ambas', 'white');
    log('   • Validaciones personalizadas por tipo', 'white');
    log('   • Plantillas predefinidas optimizadas', 'white');

  } catch (error) {
    log('\n❌ Error durante las pruebas: ' + error.message, 'red');
  }

  log('\n🏁 Pruebas finalizadas', 'cyan');
  log('\n📝 Para ejecutar migraciones y seeders:', 'yellow');
  log('   npm run db:migrate', 'white');
  log('   npm run db:seed', 'white');
  log('\n🌐 Endpoints disponibles en:', 'yellow');
  log('   GET    /api/clasificacion-tipos-evento/tipos/:id/configuraciones', 'white');
  log('   POST   /api/clasificacion-tipos-evento/tipos/:id/configuraciones', 'white');
  log('   PUT    /api/clasificacion-tipos-evento/configuraciones/:id', 'white');
  log('   POST   /api/clasificacion-tipos-evento/tipos/:id/validar', 'white');
  log('   GET    /api/clasificacion-tipos-evento/tipos/:id/plantillas', 'white');
  log('   POST   /api/clasificacion-tipos-evento/plantillas/:id/aplicar', 'white');
}

// Ejecutar las pruebas
runTests().catch(console.error);
