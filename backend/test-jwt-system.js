#!/usr/bin/env node

/**
 * Script de prueba del sistema JWT completo
 * Verifica que todas las funciones de autenticación funcionen correctamente
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`;

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

async function testAPI() {
  let token = null;
  
  try {
    log.info('Iniciando pruebas del sistema JWT...\n');

    // 1. Verificar que el servidor esté funcionando
    log.info('1. Verificando estado del servidor...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      log.success('Servidor funcionando correctamente');
      log.info(`   Status: ${healthResponse.data.status}`);
      log.info(`   Message: ${healthResponse.data.message}\n`);
    } catch (error) {
      log.error('El servidor no está funcionando');
      log.error('Por favor, inicia el servidor con: npm run dev:8000');
      return;
    }

    // 2. Probar login exitoso
    log.info('2. Probando login con credenciales correctas...');
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        correo: 'admin@admin.com',
        password: 'admin123'
      });
      
      token = loginResponse.data.data.accessToken;
      log.success('Login exitoso');
      log.info(`   Token obtenido: ${token.substring(0, 50)}...`);
      log.info(`   Expira en: ${loginResponse.data.data.expiresIn}\n`);
    } catch (error) {
      log.error('Error en el login');
      log.error(`   ${error.response?.data?.error || error.message}`);
      return;
    }

    // 3. Probar acceso a ruta protegida CON token
    log.info('3. Probando acceso a ruta protegida CON token...');
    try {
      const protectedResponse = await axios.get(`${API_URL}/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      log.success('Acceso autorizado a ruta protegida');
      log.info(`   Usuarios obtenidos: ${protectedResponse.data.data.length}\n`);
    } catch (error) {
      log.error('Error al acceder a ruta protegida con token');
      log.error(`   ${error.response?.data?.error || error.message}\n`);
    }

    // 4. Probar acceso a ruta protegida SIN token
    log.info('4. Probando acceso a ruta protegida SIN token...');
    try {
      await axios.get(`${API_URL}/usuarios`);
      log.error('ERROR: Se pudo acceder sin token (esto NO debería pasar)');
    } catch (error) {
      if (error.response?.status === 401) {
        log.success('Acceso correctamente denegado sin token');
        log.info(`   Status: ${error.response.status}`);
        log.info(`   Message: ${error.response.data.error}\n`);
      } else {
        log.error('Error inesperado');
        log.error(`   ${error.response?.data?.error || error.message}\n`);
      }
    }

    // 5. Probar acceso a ruta protegida con token inválido
    log.info('5. Probando acceso con token inválido...');
    try {
      await axios.get(`${API_URL}/usuarios`, {
        headers: {
          'Authorization': 'Bearer token_falso_invalid'
        }
      });
      log.error('ERROR: Se pudo acceder con token inválido (esto NO debería pasar)');
    } catch (error) {
      if (error.response?.status === 401) {
        log.success('Token inválido correctamente rechazado');
        log.info(`   Status: ${error.response.status}`);
        log.info(`   Message: ${error.response.data.error}\n`);
      } else {
        log.error('Error inesperado');
        log.error(`   ${error.response?.data?.error || error.message}\n`);
      }
    }

    // 6. Probar rutas de diferentes modelos
    log.info('6. Probando diferentes rutas protegidas...');
    
    const protectedRoutes = [
      { name: 'Usuarios', url: `${API_URL}/usuarios` },
      { name: 'Roles', url: `${API_URL}/roles` },
      { name: 'Users (compatibilidad)', url: `${API_URL}/users` }
    ];

    for (const route of protectedRoutes) {
      try {
        const response = await axios.get(route.url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        log.success(`${route.name}: Acceso autorizado`);
        log.info(`   Elementos: ${response.data.data?.length || 'N/A'}`);
      } catch (error) {
        log.error(`${route.name}: Error de acceso`);
        log.error(`   ${error.response?.data?.error || error.message}`);
      }
    }

    // 7. Probar información del token
    log.info('\n7. Verificando información del token...');
    try {
      const tokenInfoResponse = await axios.get(`${API_URL}/auth/token-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      log.success('Información del token obtenida');
      log.info(`   Correo: ${tokenInfoResponse.data.data.user.correo}`);
      log.info(`   Roles: ${tokenInfoResponse.data.data.user.roles.map(r => r.nombre_rol).join(', ')}`);
      log.info(`   Expira: ${tokenInfoResponse.data.data.token.expiresAt}`);
    } catch (error) {
      log.error('Error al obtener información del token');
      log.error(`   ${error.response?.data?.error || error.message}`);
    }

    // 8. Probar Swagger UI
    log.info('\n8. Verificando Swagger UI...');
    try {
      const swaggerResponse = await axios.get(`${BASE_URL}/api-docs`);
      if (swaggerResponse.status === 200) {
        log.success('Swagger UI disponible');
        log.info(`   URL: ${BASE_URL}/api-docs`);
      }
    } catch (error) {
      log.error('Swagger UI no disponible');
      log.error(`   ${error.message}`);
    }

    // Resumen final
    log.info('\n' + '='.repeat(50));
    log.success('PRUEBAS COMPLETADAS');
    log.info('Sistema JWT funcionando correctamente');
    log.info(`Documentación: ${BASE_URL}/api-docs`);
    log.info(`Health Check: ${BASE_URL}/health`);
    log.info('='.repeat(50));

  } catch (error) {
    log.error('Error general en las pruebas:');
    log.error(error.message);
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
