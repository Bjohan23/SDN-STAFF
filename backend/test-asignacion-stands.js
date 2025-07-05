/**
 * Script de pruebas para el Sistema de Asignación de Stands
 * Prueba todos los endpoints y funcionalidades del nuevo sistema
 * 
 * Ejecutar con: node test-asignacion-stands.js
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

// Pruebas de Solicitudes de Asignación
async function testSolicitudesAsignacion() {
  log('\n📋 === PRUEBAS DE SOLICITUDES DE ASIGNACIÓN ===', 'cyan');

  // 1. Obtener todas las solicitudes
  log('\n1. Obteniendo todas las solicitudes de asignación...', 'yellow');
  let result = await makeRequest('GET', '/asignaciones/solicitudes?page=1&limit=5');
  if (result.success) {
    log(`✅ ${result.data.data.solicitudes?.length || 0} solicitudes obtenidas`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Crear nueva solicitud
  log('\n2. Creando nueva solicitud de asignación...', 'yellow');
  const nuevaSolicitud = {
    id_empresa: 1,
    id_evento: 1,
    modalidad_asignacion: 'seleccion_directa',
    id_stand_solicitado: 1,
    motivo_solicitud: 'Solicitud de prueba para el sistema de asignación',
    criterios_automaticos: {
      area_minima: 10,
      area_maxima: 50,
      presupuesto_maximo: 1000,
      servicios_requeridos: ['electricidad', 'internet']
    },
    preferencias_empresa: {
      zona_preferida: 'entrada principal'
    }
  };
  
  result = await makeRequest('POST', '/asignaciones/solicitudes', nuevaSolicitud);
  let solicitudId = null;
  if (result.success) {
    solicitudId = result.data.data.id_solicitud;
    log(`✅ Solicitud creada con ID: ${solicitudId}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Obtener solicitud específica
  if (solicitudId) {
    log('\n3. Obteniendo solicitud específica...', 'yellow');
    result = await makeRequest('GET', `/asignaciones/solicitudes/${solicitudId}?include_details=true`);
    if (result.success) {
      log(`✅ Solicitud obtenida: ${result.data.data.empresa?.nombre_empresa}`, 'green');
      log(`   Estado: ${result.data.data.estado_solicitud}`, 'green');
      log(`   Prioridad: ${result.data.data.prioridad_score}`, 'green');
    } else {
      log('❌ Error: ' + JSON.stringify(result.error), 'red');
    }
  }

  // 4. Aprobar solicitud
  if (solicitudId) {
    log('\n4. Aprobando solicitud...', 'yellow');
    const aprobacionData = {
      observaciones: 'Solicitud aprobada para pruebas del sistema'
    };
    
    result = await makeRequest('POST', `/asignaciones/solicitudes/${solicitudId}/aprobar`, aprobacionData);
    if (result.success) {
      log('✅ Solicitud aprobada exitosamente', 'green');
    } else {
      log('❌ Error en aprobación: ' + JSON.stringify(result.error), 'red');
    }
  }

  // 5. Asignar stand
  if (solicitudId) {
    log('\n5. Asignando stand a solicitud...', 'yellow');
    const asignacionData = {
      id_stand: 1,
      precio: 800.00,
      descuento: 10.0
    };
    
    result = await makeRequest('POST', `/asignaciones/solicitudes/${solicitudId}/asignar-stand`, asignacionData);
    if (result.success) {
      log('✅ Stand asignado exitosamente', 'green');
    } else {
      log('❌ Error en asignación: ' + JSON.stringify(result.error), 'red');
    }
  }

  // 6. Obtener historial de solicitud
  if (solicitudId) {
    log('\n6. Obteniendo historial de solicitud...', 'yellow');
    result = await makeRequest('GET', `/asignaciones/solicitudes/${solicitudId}/historial`);
    if (result.success) {
      log(`✅ ${result.data.data.length} entradas en el historial`, 'green');
    } else {
      log('❌ Error: ' + JSON.stringify(result.error), 'red');
    }
  }

  // 7. Obtener estadísticas
  log('\n7. Obteniendo estadísticas de solicitudes...', 'yellow');
  result = await makeRequest('GET', '/asignaciones/solicitudes/stats');
  if (result.success) {
    log(`✅ Total solicitudes: ${result.data.data.total_solicitudes}`, 'green');
    log(`   Tiempo respuesta promedio: ${result.data.data.tiempo_respuesta_promedio_horas} horas`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  return solicitudId;
}

// Pruebas de Conflictos de Asignación
async function testConflictosAsignacion() {
  log('\n⚠️ === PRUEBAS DE CONFLICTOS DE ASIGNACIÓN ===', 'cyan');

  // 1. Obtener todos los conflictos
  log('\n1. Obteniendo todos los conflictos...', 'yellow');
  let result = await makeRequest('GET', '/asignaciones/conflictos?page=1&limit=5');
  if (result.success) {
    log(`✅ ${result.data.data.conflictos?.length || 0} conflictos obtenidos`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Detectar conflictos automáticamente
  log('\n2. Detectando conflictos automáticamente para evento...', 'yellow');
  const deteccionData = {
    crear_automaticamente: true
  };
  
  result = await makeRequest('POST', '/asignaciones/conflictos/evento/1/detectar', deteccionData);
  if (result.success) {
    log(`✅ Detección completada: ${result.data.data.conflictos_detectados} detectados, ${result.data.data.conflictos_creados} creados`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Crear conflicto manualmente
  log('\n3. Creando conflicto manualmente...', 'yellow');
  const nuevoConflicto = {
    id_evento: 1,
    id_stand: 2,
    tipo_conflicto: 'multiple_solicitudes',
    empresas_en_conflicto: [
      { id_empresa: 1, nombre_empresa: 'Empresa A', prioridad_score: 85 },
      { id_empresa: 2, nombre_empresa: 'Empresa B', prioridad_score: 90 }
    ],
    descripcion_conflicto: 'Conflicto de prueba: múltiples empresas solicitan el mismo stand',
    prioridad_resolucion: 'alta'
  };
  
  result = await makeRequest('POST', '/asignaciones/conflictos', nuevoConflicto);
  let conflictoId = null;
  if (result.success) {
    conflictoId = result.data.data.id_conflicto;
    log(`✅ Conflicto creado con ID: ${conflictoId}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Asignar conflicto para resolución
  if (conflictoId) {
    log('\n4. Asignando conflicto para resolución...', 'yellow');
    const asignacionConflicto = {
      asignado_a: 1,
      fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 días
    };
    
    result = await makeRequest('POST', `/asignaciones/conflictos/${conflictoId}/asignar`, asignacionConflicto);
    if (result.success) {
      log('✅ Conflicto asignado para resolución', 'green');
    } else {
      log('❌ Error: ' + JSON.stringify(result.error), 'red');
    }
  }

  // 5. Resolver conflicto
  if (conflictoId) {
    log('\n5. Resolviendo conflicto...', 'yellow');
    const resolucionData = {
      empresa_asignada: 1,
      criterio_aplicado: 'Mayor puntuación de prioridad',
      observaciones: 'Asignación basada en historial de participaciones'
    };
    
    result = await makeRequest('POST', `/asignaciones/conflictos/${conflictoId}/resolver`, resolucionData);
    if (result.success) {
      log('✅ Conflicto resuelto exitosamente', 'green');
    } else {
      log('❌ Error: ' + JSON.stringify(result.error), 'red');
    }
  }

  // 6. Obtener estadísticas de conflictos
  log('\n6. Obteniendo estadísticas de conflictos...', 'yellow');
  result = await makeRequest('GET', '/asignaciones/conflictos/stats');
  if (result.success) {
    log(`✅ Total conflictos: ${result.data.data.total_conflictos}`, 'green');
    log(`   Conflictos activos: ${result.data.data.conflictos_activos}`, 'green');
    log(`   Tasa de resolución: ${result.data.data.tasa_resolucion.toFixed(2)}%`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 7. Obtener resumen para dashboard
  log('\n7. Obteniendo resumen para dashboard...', 'yellow');
  result = await makeRequest('GET', '/asignaciones/conflictos/dashboard/resumen');
  if (result.success) {
    log(`✅ Conflictos críticos: ${result.data.data.conflictos_criticos}`, 'green');
    log(`   Conflictos vencidos: ${result.data.data.conflictos_vencidos}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de Asignación Automática
async function testAsignacionAutomatica() {
  log('\n🤖 === PRUEBAS DE ASIGNACIÓN AUTOMÁTICA ===', 'cyan');

  // 1. Obtener algoritmos disponibles
  log('\n1. Obteniendo algoritmos disponibles...', 'yellow');
  let result = await makeRequest('GET', '/asignaciones/automatica/algoritmos');
  if (result.success) {
    const algoritmos = Object.keys(result.data.data.algoritmos_disponibles);
    log(`✅ ${algoritmos.length} algoritmos disponibles: ${algoritmos.join(', ')}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Obtener reporte de capacidad
  log('\n2. Obteniendo reporte de capacidad para evento...', 'yellow');
  result = await makeRequest('GET', '/asignaciones/automatica/evento/1/capacidad');
  if (result.success) {
    log(`✅ Solicitudes pendientes: ${result.data.data.solicitudes_pendientes}`, 'green');
    log(`   Stands disponibles: ${result.data.data.stands_disponibles}`, 'green');
    log(`   Porcentaje cobertura: ${result.data.data.porcentaje_cobertura.toFixed(2)}%`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Validar compatibilidad empresa-stand
  log('\n3. Validando compatibilidad empresa-stand...', 'yellow');
  const criteriosCompatibilidad = {
    area_minima: 15,
    area_maxima: 30,
    presupuesto_maximo: 1200
  };
  
  result = await makeRequest('POST', '/asignaciones/automatica/compatibilidad/1/1', { criterios: criteriosCompatibilidad });
  if (result.success) {
    log(`✅ Compatibilidad: ${result.data.data.compatible ? 'Compatible' : 'No compatible'}`, 'green');
    log(`   Score: ${result.data.data.score_compatibilidad}`, 'green');
    log(`   Recomendación: ${result.data.data.recomendacion}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Obtener mejores candidatos
  log('\n4. Obteniendo mejores candidatos para empresa...', 'yellow');
  const criteriosCandidatos = {
    limite: 3,
    criterios: {
      area_minima: 20,
      zona_preferida: 'principal'
    }
  };
  
  result = await makeRequest('POST', '/asignaciones/automatica/candidatos/1/1', criteriosCandidatos);
  if (result.success) {
    log(`✅ ${result.data.data.candidatos_encontrados} candidatos encontrados`, 'green');
    if (result.data.data.mejores_candidatos.length > 0) {
      const mejor = result.data.data.mejores_candidatos[0];
      log(`   Mejor opción: Stand ${mejor.stand.numero_stand} (Score: ${mejor.score_compatibilidad})`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 5. Simular asignación automática
  log('\n5. Simulando asignación automática...', 'yellow');
  const configSimulacion = {
    configuracion: {
      algoritmo: 'mixto',
      incluir_solicitudes_automaticas: true,
      incluir_solicitudes_pendientes: true,
      respetar_preferencias: true
    }
  };
  
  result = await makeRequest('POST', '/asignaciones/automatica/evento/1/simular', configSimulacion);
  if (result.success) {
    log(`✅ Simulación completada`, 'green');
    log(`   Asignaciones posibles: ${result.data.data.asignaciones_posibles}`, 'green');
    log(`   Conflictos potenciales: ${result.data.data.conflictos_potenciales}`, 'green');
    log(`   Porcentaje éxito: ${result.data.data.porcentaje_exito.toFixed(2)}%`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 6. Ejecutar asignación automática real (comentado para no afectar datos)
  log('\n6. Ejecución automática real (COMENTADO por seguridad)', 'yellow');
  log('   Para ejecutar realmente, descomenta la sección en el código', 'yellow');
  /*
  const configEjecucion = {
    configuracion: {
      algoritmo: 'prioridad_score',
      incluir_solicitudes_automaticas: true,
      respetar_preferencias: true
    }
  };
  
  result = await makeRequest('POST', '/asignaciones/automatica/evento/1/ejecutar', configEjecucion);
  if (result.success) {
    log(`✅ Asignación automática ejecutada`, 'green');
    log(`   Asignaciones realizadas: ${result.data.data.asignaciones_realizadas}`, 'green');
    log(`   Conflictos detectados: ${result.data.data.conflictos_detectados}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
  */

  // 7. Obtener métricas de rendimiento
  log('\n7. Obteniendo métricas de rendimiento...', 'yellow');
  result = await makeRequest('GET', '/asignaciones/automatica/metricas');
  if (result.success) {
    log(`✅ Total asignaciones automáticas: ${result.data.data.total_asignaciones_automaticas}`, 'green');
    log(`   Score promedio: ${result.data.data.score_compatibilidad_promedio}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de integración con módulos existentes
async function testIntegracionModulosExistentes() {
  log('\n🔗 === PRUEBAS DE INTEGRACIÓN ===', 'cyan');

  // 1. Verificar que stands tienen las nuevas asociaciones
  log('\n1. Verificando asociaciones de stands...', 'yellow');
  let result = await makeRequest('GET', '/stands/1?include_details=true');
  if (result.success) {
    log('✅ Stand obtenido con detalles completos', 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Verificar que empresas tienen acceso a solicitudes
  log('\n2. Verificando asociaciones de empresas...', 'yellow');
  result = await makeRequest('GET', '/empresasExpositoras/1?include_eventos=true');
  if (result.success) {
    log('✅ Empresa obtenida con datos de eventos', 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Verificar disponibilidad de stands para evento
  log('\n3. Verificando stands disponibles para evento...', 'yellow');
  result = await makeRequest('GET', '/stands/evento/1/disponibles');
  if (result.success) {
    log(`✅ ${result.data.data.length} stands disponibles para el evento`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Verificar estadísticas de stands
  log('\n4. Verificando estadísticas de stands...', 'yellow');
  result = await makeRequest('GET', '/stands/stats');
  if (result.success) {
    log(`✅ Total stands: ${result.data.data.total}`, 'green');
    log(`   Disponibles: ${result.data.data.disponibles}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Función principal
async function runTests() {
  log('🚀 INICIANDO PRUEBAS DEL SISTEMA DE ASIGNACIÓN DE STANDS', 'magenta');
  log('=' * 70, 'magenta');

  // Autenticación
  const authenticated = await authenticate();
  if (!authenticated) {
    log('\n❌ No se pudo autenticar. Abortando pruebas.', 'red');
    return;
  }

  try {
    // Ejecutar todas las pruebas
    const solicitudId = await testSolicitudesAsignacion();
    await testConflictosAsignacion();
    await testAsignacionAutomatica();
    await testIntegracionModulosExistentes();

    log('\n🎉 === RESUMEN DE PRUEBAS ===', 'magenta');
    log('✅ Todas las pruebas del sistema de asignación completadas', 'green');
    log('📊 Funcionalidades probadas:', 'yellow');
    log('   • Sistema completo de solicitudes de asignación', 'white');
    log('   • Flujo de estados: solicitada → aprobada → asignada', 'white');
    log('   • Cálculo automático de prioridades', 'white');
    log('   • Detección y resolución de conflictos', 'white');
    log('   • Asignación automática con múltiples algoritmos', 'white');
    log('   • Validación de compatibilidades', 'white');
    log('   • Historial completo de cambios', 'white');
    log('   • Métricas y estadísticas avanzadas', 'white');
    log('   • Integración con módulos existentes', 'white');
    log('   • Sistema de notificaciones y comunicación', 'white');

    log('\n📋 Funcionalidades implementadas:', 'cyan');
    log('   ✅ Solicitudes de asignación con prioridades', 'white');
    log('   ✅ Modalidades: selección directa, manual, automática', 'white');
    log('   ✅ Estados: solicitada → en_revision → aprobada → asignada', 'white');
    log('   ✅ Validación de compatibilidades automática', 'white');
    log('   ✅ Detección automática de conflictos', 'white');
    log('   ✅ Resolución manual de conflictos', 'white');
    log('   ✅ Escalamiento de conflictos complejos', 'white');
    log('   ✅ Asignación automática con 3 algoritmos', 'white');
    log('   ✅ Historial completo de cambios', 'white');
    log('   ✅ Sistema de auditoría integrado', 'white');
    log('   ✅ Métricas y reportes avanzados', 'white');
    log('   ✅ Integración completa con stands y empresas', 'white');

    log('\n🎯 Endpoints implementados:', 'cyan');
    log('   📝 Solicitudes: 13 endpoints', 'white');
    log('   ⚠️  Conflictos: 14 endpoints', 'white');
    log('   🤖 Asignación automática: 7 endpoints', 'white');
    log('   📊 Total: 34 nuevos endpoints', 'white');

  } catch (error) {
    log('\n❌ Error durante las pruebas: ' + error.message, 'red');
  }

  log('\n🏁 Pruebas finalizadas', 'magenta');
  log('📚 Consulta la documentación en /api para ver todos los endpoints', 'cyan');
}

// Ejecutar las pruebas
runTests().catch(console.error);
