#!/usr/bin/env node

/**
 * Script de pruebas de la API
 * Verifica que todos los endpoints funcionen correctamente
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Función para hacer peticiones HTTP
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// Función para mostrar resultados
const showResult = (test, result) => {
  const status = result.status >= 200 && result.status < 300 ? '✅' : '❌';
  console.log(`${status} ${test} - Status: ${result.status}`);
  if (result.status >= 400) {
    console.log(`   Error: ${JSON.stringify(result.data, null, 2)}`);
  }
};

// Ejecutar pruebas
const runTests = async () => {
  console.log('🧪 Iniciando pruebas de la API SDN-STAFF...\n');

  try {
    // Health check
    let result = await makeRequest('GET', '/health');
    showResult('Health Check', result);

    // Swagger Documentation
    result = await makeRequest('GET', '/api-docs.json');
    showResult('Swagger JSON Schema', result);

    // API Info
    result = await makeRequest('GET', '/api');
    showResult('API Info', result);

    // Usuarios (nuevo modelo)
    result = await makeRequest('GET', '/api/usuarios');
    showResult('GET /api/usuarios', result);

    result = await makeRequest('GET', '/api/usuarios/1');
    showResult('GET /api/usuarios/1', result);

    result = await makeRequest('GET', '/api/usuarios/username/admin');
    showResult('GET /api/usuarios/username/admin', result);

    result = await makeRequest('GET', '/api/usuarios/stats');
    showResult('GET /api/usuarios/stats', result);

    // Login test
    result = await makeRequest('POST', '/api/usuarios/login', {
      username: 'admin',
      password: 'admin123'
    });
    showResult('POST /api/usuarios/login', result);

    // Roles
    result = await makeRequest('GET', '/api/roles');
    showResult('GET /api/roles', result);

    result = await makeRequest('GET', '/api/roles/1');
    showResult('GET /api/roles/1', result);

    result = await makeRequest('GET', '/api/roles/stats');
    showResult('GET /api/roles/stats', result);

    // Test crear usuario
    result = await makeRequest('POST', '/api/usuarios', {
      username: 'testuser',
      password: '123456',
      estado: 'activo',
      roles: [3]
    });
    showResult('POST /api/usuarios (crear)', result);

    // Test crear rol
    result = await makeRequest('POST', '/api/roles', {
      nombre_rol: 'Tester',
      descripcion: 'Usuario de pruebas'
    });
    showResult('POST /api/roles (crear)', result);

    // Usuarios (modelo anterior)
    result = await makeRequest('GET', '/api/users');
    showResult('GET /api/users (modelo anterior)', result);

    console.log('\n🎉 Pruebas completadas!');
    console.log('\n📚 Para ver la documentación completa de Swagger:');
    console.log(`🔗 http://localhost:${BASE_URL.split(':')[2]}/api-docs`);
    console.log('\n📋 Para obtener el JSON Schema:');
    console.log(`🔗 http://localhost:${BASE_URL.split(':')[2]}/api-docs.json`);

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    console.log('\n💡 Asegúrate de que el servidor esté corriendo con: npm run dev');
  }
};

// Verificar si el servidor está corriendo
const checkServer = async () => {
  try {
    await makeRequest('GET', '/health');
    console.log('✅ Servidor detectado, iniciando pruebas...\n');
    await runTests();
  } catch (error) {
    console.log('❌ No se puede conectar al servidor');
    console.log('💡 Inicia el servidor con: npm run dev');
    console.log('🔗 El servidor debería estar en: http://localhost:3000');
  }
};

checkServer();
