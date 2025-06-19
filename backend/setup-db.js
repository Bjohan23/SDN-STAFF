#!/usr/bin/env node

/**
 * Script de configuración inicial de la base de datos
 * Ejecuta migraciones y seeders de forma automatizada
 */

const { exec } = require("child_process");
const path = require("path");

// Cambiar al directorio del backend
process.chdir(__dirname);

console.log("🚀 Iniciando configuración de la base de datos SDN-STAFF...\n");

// Función para ejecutar comandos
const runCommand = (command, description) => {
  return new Promise((resolve, reject) => {
    console.log(`📋 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error en ${description}:`, error.message);
        reject(error);
        return;
      }
      if (stderr) {
        console.warn(`⚠️ Warning en ${description}:`, stderr);
      }
      if (stdout) {
        console.log(stdout);
      }
      console.log(`✅ ${description} completado\n`);
      resolve();
    });
  });
};

// Secuencia de comandos a ejecutar
const setupDatabase = async () => {
  try {
    console.log("==================================================");
    console.log("          CONFIGURACIÓN SDN-STAFF BACKEND        ");
    console.log("==================================================\n");

    // 1. Verificar que las dependencias estén instaladas
    await runCommand("npm list --depth=0", "Verificando dependencias");

    // 2. Crear base de datos (puede fallar si ya existe, está bien)
    try {
      await runCommand("npm run db:create", "Creando base de datos");
    } catch (error) {
      console.log(
        "ℹ️ La base de datos probablemente ya existe, continuando...\n"
      );
    }

    // 3. Ejecutar migraciones
    await runCommand("npm run db:migrate", "Ejecutando migraciones");

    // 4. Ejecutar seeders
    await runCommand("npm run db:seed", "Ejecutando seeders (datos de prueba)");

    console.log("==================================================");
    console.log("✅ ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!");
    console.log("==================================================\n");

    console.log("📊 DATOS DE ACCESO:");
    console.log("");
    console.log("🔐 USUARIOS DE PRUEBA (Nuevo modelo):");
    console.log("   👤 admin / admin123 (administrador)");
    console.log("   👤 usuario1 / usuario1123 (Usuario)");
    console.log("   👤 usuario2 / usuario2123 (Editor + Usuario)");
    console.log("");
    console.log("🔐 USUARIOS DE PRUEBA (Modelo anterior):");
    console.log("   👤 admin@sdn-staff.com / 123456");
    console.log("   👤 manager@sdn-staff.com / 123456");
    console.log("   👤 juan.perez@sdn-staff.com / 123456");
    console.log("");
    console.log("🎭 ROLES DISPONIBLES:");
    console.log("   🛡️ administrador - Control total del sistema");
    console.log("   ✏️ Editor - Puede editar contenidos y datos");
    console.log("   👥 Usuario - Acceso básico limitado");
    console.log("");
    console.log("🚀 COMANDOS ÚTILES:");
    console.log("   npm run dev      - Iniciar servidor en desarrollo");
    console.log("   npm start        - Iniciar servidor en producción");
    console.log("   npm run db:migrate:undo - Revertir última migración");
    console.log("");
    console.log("🌐 ENDPOINTS PRINCIPALES:");
    console.log("   GET  http://localhost:3000/health");
    console.log("   GET  http://localhost:3000/api");
    console.log("   POST http://localhost:3000/api/usuarios/login");
    console.log("   GET  http://localhost:3000/api/usuarios");
    console.log("   GET  http://localhost:3000/api/roles");
    console.log("");
    console.log("📖 Para más ejemplos, revisa el archivo EJEMPLOS_USO.md");
    console.log("");
  } catch (error) {
    console.error("\n❌ Error durante la configuración:", error.message);
    console.log("\n🔧 TROUBLESHOOTING:");
    console.log("1. Verifica que MySQL esté corriendo en el puerto 3307");
    console.log("2. Verifica las credenciales en el archivo .env");
    console.log("3. Ejecuta: npm install (por si faltan dependencias)");
    console.log("4. Ejecuta los comandos manualmente:");
    console.log("   npm run db:create");
    console.log("   npm run db:migrate");
    console.log("   npm run db:seed");
    process.exit(1);
  }
};

// Ejecutar setup
setupDatabase();
