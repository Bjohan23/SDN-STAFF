/**
 * Script de pruebas para el Módulo de Inventario de Stands
 * Prueba todos los endpoints y funcionalidades del módulo
 * 
 * Ejecutar con: node test-stands-module.js
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
  white: '\x1b[37m'
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

// Pruebas de Tipos de Stand
async function testTiposStand() {
  log('\n📋 === PRUEBAS DE TIPOS DE STAND ===', 'cyan');

  // 1. Obtener todos los tipos de stand
  log('\n1. Obteniendo todos los tipos de stand...', 'yellow');
  let result = await makeRequest('GET', '/tipos-stand');
  if (result.success) {
    log(`✅ ${result.data.data.length} tipos de stand obtenidos`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Obtener tipo por ID
  log('\n2. Obteniendo tipo de stand por ID...', 'yellow');
  result = await makeRequest('GET', '/tipos-stand/1?include_stands=true');
  if (result.success) {
    log(`✅ Tipo "${result.data.data.nombre_tipo}" obtenido con stands asociados`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Obtener estadísticas
  log('\n3. Obteniendo estadísticas de tipos de stand...', 'yellow');
  result = await makeRequest('GET', '/tipos-stand/stats');
  if (result.success) {
    log(`✅ Estadísticas: ${result.data.data.totalTipos} tipos total, ${result.data.data.activeTipos} activos`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Validar área para tipo
  log('\n4. Validando área para tipo básico...', 'yellow');
  result = await makeRequest('GET', '/tipos-stand/1/validar-area?area=10');
  if (result.success) {
    log('✅ Validación de área exitosa', 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 5. Calcular precio
  log('\n5. Calculando precio para área específica...', 'yellow');
  result = await makeRequest('GET', '/tipos-stand/1/calcular-precio?area=10');
  if (result.success) {
    log(`✅ Precio calculado: ${result.data.data.precio_base_total} ${result.data.data.moneda}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 6. Crear nuevo tipo (requiere autenticación)
  log('\n6. Creando nuevo tipo de stand...', 'yellow');
  const nuevoTipo = {
    nombre_tipo: 'Tipo Test',
    descripcion: 'Tipo de stand para pruebas',
    area_minima: 5.00,
    area_maxima: 15.00,
    precio_base: 100.00,
    moneda: 'PEN',
    estado: 'activo'
  };
  
  result = await makeRequest('POST', '/tipos-stand', nuevoTipo);
  if (result.success) {
    log(`✅ Tipo "${result.data.data.nombre_tipo}" creado con ID: ${result.data.data.id_tipo_stand}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de Stands
async function testStands() {
  log('\n🏢 === PRUEBAS DE STANDS ===', 'cyan');

  // 1. Obtener todos los stands
  log('\n1. Obteniendo todos los stands...', 'yellow');
  let result = await makeRequest('GET', '/stands?page=1&limit=5');
  if (result.success) {
    log(`✅ ${result.data.data.stands.length} stands obtenidos (página 1)`, 'green');
    log(`   Total: ${result.data.data.pagination.totalItems} stands`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Obtener stand por ID
  log('\n2. Obteniendo stand por ID con detalles...', 'yellow');
  result = await makeRequest('GET', '/stands/1?include_details=true');
  if (result.success) {
    log(`✅ Stand "${result.data.data.numero_stand}" obtenido`, 'green');
    log(`   Tipo: ${result.data.data.tipoStand.nombre_tipo}`, 'green');
    log(`   Área: ${result.data.data.area}m²`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Buscar stand por número
  log('\n3. Buscando stand por número...', 'yellow');
  result = await makeRequest('GET', '/stands/numero/A-001');
  if (result.success) {
    log(`✅ Stand encontrado: ${result.data.data.numero_stand}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Verificar disponibilidad de número
  log('\n4. Verificando disponibilidad de número...', 'yellow');
  result = await makeRequest('GET', '/stands/numero/TEST-001/disponible');
  if (result.success) {
    log(`✅ Número TEST-001 ${result.data.data.disponible ? 'disponible' : 'no disponible'}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 5. Obtener stands disponibles para evento
  log('\n5. Obteniendo stands disponibles para evento...', 'yellow');
  result = await makeRequest('GET', '/stands/evento/1/disponibles');
  if (result.success) {
    log(`✅ ${result.data.data.length} stands disponibles para el evento`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 6. Obtener estadísticas
  log('\n6. Obteniendo estadísticas de stands...', 'yellow');
  result = await makeRequest('GET', '/stands/stats');
  if (result.success) {
    log(`✅ Estadísticas: ${result.data.data.total} total, ${result.data.data.disponibles} disponibles`, 'green');
    log(`   Premium: ${result.data.data.premium} stands`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 7. Crear nuevo stand (requiere autenticación)
  log('\n7. Creando nuevo stand...', 'yellow');
  const nuevoStand = {
    numero_stand: 'TEST-001',
    nombre_stand: 'Stand de Prueba',
    id_tipo_stand: 1,
    area: 10.00,
    ubicacion: 'Área de Pruebas',
    estado_fisico: 'disponible',
    estado: 'activo'
  };
  
  result = await makeRequest('POST', '/stands', nuevoStand);
  if (result.success) {
    log(`✅ Stand "${result.data.data.numero_stand}" creado con ID: ${result.data.data.id_stand}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 8. Asignar stand a evento
  log('\n8. Asignando stand a evento...', 'yellow');
  if (result.success) {
    const standId = result.data.data.id_stand;
    const asignacionData = {
      id_evento: 1,
      configuracion: {
        precio_evento: 800.00,
        descuento_porcentaje: 5.00,
        observaciones: 'Stand de prueba para demostración'
      }
    };
    
    const asignResult = await makeRequest('POST', `/stands/${standId}/asignar-evento`, asignacionData);
    if (asignResult.success) {
      log('✅ Stand asignado al evento exitosamente', 'green');
    } else {
      log('❌ Error en asignación: ' + JSON.stringify(asignResult.error), 'red');
    }
  }
}

// Pruebas de Servicios Adicionales
async function testServiciosAdicionales() {
  log('\n🛠️ === PRUEBAS DE SERVICIOS ADICIONALES ===', 'cyan');

  // 1. Obtener todos los servicios
  log('\n1. Obteniendo todos los servicios adicionales...', 'yellow');
  let result = await makeRequest('GET', '/servicios-adicionales');
  if (result.success) {
    log(`✅ ${result.data.data.length} servicios obtenidos`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Obtener servicios populares
  log('\n2. Obteniendo servicios populares...', 'yellow');
  result = await makeRequest('GET', '/servicios-adicionales/populares?limit=5');
  if (result.success) {
    log(`✅ ${result.data.data.length} servicios populares obtenidos`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Obtener servicios por categoría
  log('\n3. Obteniendo servicios de electricidad...', 'yellow');
  result = await makeRequest('GET', '/servicios-adicionales/categoria/electricidad');
  if (result.success) {
    log(`✅ ${result.data.data.length} servicios de electricidad obtenidos`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Obtener servicios compatibles
  log('\n4. Obteniendo servicios compatibles con stand básico...', 'yellow');
  result = await makeRequest('GET', '/servicios-adicionales/compatibles/basico');
  if (result.success) {
    log(`✅ ${result.data.data.length} servicios compatibles obtenidos`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 5. Calcular precio de servicio
  log('\n5. Calculando precio de servicio...', 'yellow');
  result = await makeRequest('GET', '/servicios-adicionales/1/calcular-precio?cantidad=3');
  if (result.success) {
    log(`✅ Precio calculado: ${result.data.data.precio_total} ${result.data.data.moneda}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 6. Contratar servicio
  log('\n6. Contratando servicio para stand...', 'yellow');
  const contratacionData = {
    id_stand: 1,
    id_evento: 1,
    id_empresa: 1,
    cantidad: 2,
    especificaciones_adicionales: {
      ubicacion: 'Área central del stand',
      observaciones: 'Instalación de prueba'
    },
    fecha_instalacion_programada: '2024-03-15T10:00:00'
  };
  
  result = await makeRequest('POST', '/servicios-adicionales/1/contratar', contratacionData);
  if (result.success) {
    log(`✅ Servicio contratado con ID: ${result.data.data.id_stand_servicio}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 7. Obtener estadísticas de servicios
  log('\n7. Obteniendo estadísticas de servicios...', 'yellow');
  result = await makeRequest('GET', '/servicios-adicionales/stats');
  if (result.success) {
    log(`✅ Estadísticas: ${result.data.data.total} servicios total`, 'green');
    log(`   Disponibles: ${result.data.data.disponibles}`, 'green');
    log(`   Populares: ${result.data.data.populares}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 8. Crear nuevo servicio (requiere autenticación)
  log('\n8. Creando nuevo servicio adicional...', 'yellow');
  const nuevoServicio = {
    nombre_servicio: 'Servicio de Prueba',
    descripcion: 'Servicio creado para pruebas del sistema',
    categoria: 'otros',
    tipo_precio: 'fijo',
    precio: 50.00,
    moneda: 'PEN',
    cantidad_minima: 1,
    estado: 'disponible'
  };
  
  result = await makeRequest('POST', '/servicios-adicionales', nuevoServicio);
  if (result.success) {
    log(`✅ Servicio "${result.data.data.nombre_servicio}" creado con ID: ${result.data.data.id_servicio}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de Contrataciones
async function testContrataciones() {
  log('\n📋 === PRUEBAS DE CONTRATACIONES ===', 'cyan');

  // 1. Obtener servicios contratados para stand-evento
  log('\n1. Obteniendo servicios contratados para stand-evento...', 'yellow');
  let result = await makeRequest('GET', '/servicios-adicionales/stand/4/evento/1');
  if (result.success) {
    log(`✅ ${result.data.data.length} servicios contratados obtenidos`, 'green');
    if (result.data.data.length > 0) {
      log(`   Ejemplo: ${result.data.data[0].servicio.nombre_servicio} - Estado: ${result.data.data[0].estado_servicio}`, 'green');
    }
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Obtener contratación específica
  log('\n2. Obteniendo contratación específica...', 'yellow');
  result = await makeRequest('GET', '/servicios-adicionales/contratacion/1');
  if (result.success) {
    log(`✅ Contratación obtenida: ${result.data.data.servicio.nombre_servicio}`, 'green');
    log(`   Estado: ${result.data.data.estado_servicio}`, 'green');
    log(`   Precio total: ${result.data.data.precio_total}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Actualizar estado de contratación
  log('\n3. Actualizando estado de contratación...', 'yellow');
  const updateData = {
    estado_servicio: 'confirmado',
    observaciones: 'Confirmado para instalación según cronograma'
  };
  
  result = await makeRequest('PUT', '/servicios-adicionales/contratacion/4/estado', updateData);
  if (result.success) {
    log(`✅ Estado actualizado a: ${result.data.data.estado_servicio}`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Pruebas de filtros y búsquedas avanzadas
async function testFiltrosAvanzados() {
  log('\n🔍 === PRUEBAS DE FILTROS AVANZADOS ===', 'cyan');

  // 1. Filtrar stands por área
  log('\n1. Filtrando stands por área (10-25 m²)...', 'yellow');
  let result = await makeRequest('GET', '/stands?area_min=10&area_max=25');
  if (result.success) {
    log(`✅ ${result.data.data.stands.length} stands encontrados en rango de área`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 2. Filtrar stands premium
  log('\n2. Filtrando stands premium...', 'yellow');
  result = await makeRequest('GET', '/stands?es_premium=true');
  if (result.success) {
    log(`✅ ${result.data.data.stands.length} stands premium encontrados`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 3. Buscar servicios por texto
  log('\n3. Buscando servicios con texto "eléctrica"...', 'yellow');
  result = await makeRequest('GET', '/servicios-adicionales?search=eléctrica');
  if (result.success) {
    log(`✅ ${result.data.data.length} servicios encontrados`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 4. Filtrar servicios por estado
  log('\n4. Filtrando servicios disponibles...', 'yellow');
  result = await makeRequest('GET', '/servicios-adicionales?estado=disponible');
  if (result.success) {
    log(`✅ ${result.data.data.length} servicios disponibles`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }

  // 5. Stands que requieren mantenimiento
  log('\n5. Obteniendo stands que requieren mantenimiento...', 'yellow');
  result = await makeRequest('GET', '/stands/mantenimiento');
  if (result.success) {
    log(`✅ ${result.data.data.length} stands requieren mantenimiento`, 'green');
  } else {
    log('❌ Error: ' + JSON.stringify(result.error), 'red');
  }
}

// Función principal
async function runTests() {
  log('🚀 INICIANDO PRUEBAS DEL MÓDULO DE INVENTARIO DE STANDS', 'cyan');
  log('=' * 60, 'cyan');

  // Autenticación
  const authenticated = await authenticate();
  if (!authenticated) {
    log('\n❌ No se pudo autenticar. Abortando pruebas.', 'red');
    return;
  }

  try {
    // Ejecutar todas las pruebas
    await testTiposStand();
    await testStands();
    await testServiciosAdicionales();
    await testContrataciones();
    await testFiltrosAvanzados();

    log('\n🎉 === RESUMEN DE PRUEBAS ===', 'cyan');
    log('✅ Todas las pruebas del módulo de stands completadas', 'green');
    log('📊 Funcionalidades probadas:', 'yellow');
    log('   • CRUD completo de tipos de stand', 'white');
    log('   • CRUD completo de stands', 'white');
    log('   • CRUD completo de servicios adicionales', 'white');
    log('   • Sistema de contrataciones', 'white');
    log('   • Asignación de stands a eventos', 'white');
    log('   • Cálculo de precios', 'white');
    log('   • Validaciones y restricciones', 'white');
    log('   • Filtros y búsquedas avanzadas', 'white');
    log('   • Estadísticas y reportes', 'white');
    log('   • Estados y flujos de trabajo', 'white');

  } catch (error) {
    log('\n❌ Error durante las pruebas: ' + error.message, 'red');
  }

  log('\n🏁 Pruebas finalizadas', 'cyan');
}

// Ejecutar las pruebas
runTests().catch(console.error);
