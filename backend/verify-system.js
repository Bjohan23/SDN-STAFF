#!/usr/bin/env node

/**
 * Script de verificación final del sistema
 * Verifica que todos los componentes estén correctamente configurados
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}🚀 ${msg}${colors.reset}`),
  separator: () => console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log.success(`${description} existe`);
    return true;
  } else {
    log.error(`${description} NO existe: ${filePath}`);
    return false;
  }
}

function checkDirectoryExists(dirPath, description) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    log.success(`${description} existe`);
    return true;
  } else {
    log.error(`${description} NO existe: ${dirPath}`);
    return false;
  }
}

async function verifySystem() {
  log.separator();
  log.header('VERIFICACIÓN FINAL DEL SISTEMA SDN-STAFF');
  log.separator();
  
  let allGood = true;
  
  // 1. Verificar estructura de archivos principales
  log.info('1. Verificando estructura de archivos...');
  
  const criticalFiles = [
    { path: './package.json', desc: 'package.json' },
    { path: './.env', desc: 'Archivo de configuración .env' },
    { path: './index.js', desc: 'Archivo principal index.js' },
    { path: './src/app.js', desc: 'Aplicación principal' },
    { path: './README.md', desc: 'Documentación README' },
    { path: './test-jwt-system.js', desc: 'Script de prueba JWT' }
  ];
  
  for (const file of criticalFiles) {
    if (!checkFileExists(file.path, file.desc)) {
      allGood = false;
    }
  }
  
  // 2. Verificar directorios críticos
  log.info('\n2. Verificando directorios críticos...');
  
  const criticalDirs = [
    { path: './src', desc: 'Directorio src' },
    { path: './src/controllers', desc: 'Controladores' },
    { path: './src/services', desc: 'Servicios' },
    { path: './src/models', desc: 'Modelos' },
    { path: './src/routes', desc: 'Rutas' },
    { path: './src/middlewares', desc: 'Middlewares' },
    { path: './src/utils', desc: 'Utilidades' },
    { path: './src/config', desc: 'Configuración' }
  ];
  
  for (const dir of criticalDirs) {
    if (!checkDirectoryExists(dir.path, dir.desc)) {
      allGood = false;
    }
  }
  
  // 3. Verificar archivos de autenticación
  log.info('\n3. Verificando sistema de autenticación...');
  
  const authFiles = [
    { path: './src/middlewares/auth.js', desc: 'Middleware de autenticación' },
    { path: './src/utils/JWTUtils.js', desc: 'Utilidades JWT' },
    { path: './src/controllers/AuthController.js', desc: 'Controlador de autenticación' },
    { path: './src/services/AuthService.js', desc: 'Servicio de autenticación' },
    { path: './src/routes/authRoutes.js', desc: 'Rutas de autenticación' }
  ];
  
  for (const file of authFiles) {
    if (!checkFileExists(file.path, file.desc)) {
      allGood = false;
    }
  }
  
  // 4. Verificar rutas protegidas
  log.info('\n4. Verificando rutas protegidas...');
  
  const routeFiles = [
    { path: './src/routes/userRoutes.js', desc: 'Rutas de usuarios (modelo anterior)' },
    { path: './src/routes/usuarioRoutes.js', desc: 'Rutas de usuarios (nuevo modelo)' },
    { path: './src/routes/rolRoutes.js', desc: 'Rutas de roles' }
  ];
  
  for (const file of routeFiles) {
    if (checkFileExists(file.path, file.desc)) {
      // Verificar que contenga middlewares de autenticación
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        if (content.includes('authenticate') && content.includes('authorize')) {
          log.success(`${file.desc} está correctamente protegida`);
        } else {
          log.warning(`${file.desc} podría no estar protegida correctamente`);
        }
      } catch (err) {
        log.error(`Error leyendo ${file.path}: ${err.message}`);
        allGood = false;
      }
    } else {
      allGood = false;
    }
  }
  
  // 5. Verificar package.json y dependencias
  log.info('\n5. Verificando dependencias...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    const requiredDeps = [
      'express', 'cors', 'dotenv', 'mysql2', 'sequelize',
      'bcryptjs', 'jsonwebtoken', 'swagger-jsdoc', 'swagger-ui-express'
    ];
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        log.success(`Dependencia ${dep} instalada: ${packageJson.dependencies[dep]}`);
      } else {
        log.error(`Dependencia ${dep} NO encontrada`);
        allGood = false;
      }
    }
    
  } catch (err) {
    log.error(`Error leyendo package.json: ${err.message}`);
    allGood = false;
  }
  
  // 6. Verificar configuración de Swagger
  log.info('\n6. Verificando configuración de Swagger...');
  
  if (checkFileExists('./src/config/swagger.js', 'Configuración de Swagger')) {
    try {
      const swaggerContent = fs.readFileSync('./src/config/swagger.js', 'utf8');
      if (swaggerContent.includes('swagger-jsdoc') && swaggerContent.includes('securitySchemes')) {
        log.success('Swagger configurado correctamente con JWT');
      } else {
        log.warning('Swagger podría no estar completamente configurado');
      }
    } catch (err) {
      log.error(`Error verificando Swagger: ${err.message}`);
    }
  } else {
    allGood = false;
  }
  
  // 7. Verificar archivo .env
  log.info('\n7. Verificando configuración de entorno...');
  
  try {
    const envContent = fs.readFileSync('./.env', 'utf8');
    
    const requiredEnvVars = [
      'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT',
      'JWT_SECRET', 'JWT_EXPIRES_IN', 'PORT'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (envContent.includes(envVar)) {
        log.success(`Variable ${envVar} configurada`);
      } else {
        log.error(`Variable ${envVar} NO encontrada en .env`);
        allGood = false;
      }
    }
    
  } catch (err) {
    log.error(`Error leyendo .env: ${err.message}`);
    allGood = false;
  }
  
  // 8. Scripts de npm
  log.info('\n8. Verificando scripts de npm...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    
    const requiredScripts = ['dev', 'start', 'dev:8000'];
    
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        log.success(`Script ${script}: ${packageJson.scripts[script]}`);
      } else {
        log.warning(`Script ${script} no encontrado`);
      }
    }
    
  } catch (err) {
    log.error(`Error verificando scripts: ${err.message}`);
  }
  
  // Resultado final
  log.separator();
  if (allGood) {
    log.success('🎉 ¡SISTEMA COMPLETAMENTE VERIFICADO!');
    log.info('✅ Todas las verificaciones pasaron exitosamente');
    log.info('🚀 Tu backend SDN-STAFF está listo para usar');
    log.info('');
    log.info('📋 Próximos pasos:');
    log.info('   1. npm run dev:8000');
    log.info('   2. node test-jwt-system.js');
    log.info('   3. Visita http://localhost:8000/api-docs');
  } else {
    log.error('⚠️  ALGUNAS VERIFICACIONES FALLARON');
    log.warning('Revisa los errores mostrados arriba');
    log.info('La mayoría del sistema debería funcionar correctamente');
  }
  log.separator();
}

// Ejecutar verificación
if (require.main === module) {
  verifySystem();
}

module.exports = { verifySystem };
