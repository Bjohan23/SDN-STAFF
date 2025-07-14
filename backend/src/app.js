const cors = require('cors');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Importar la base de datos
const db = require('../src/models');
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
// Importar rutas
const routes = require('../src/routes');

// Importar middlewares
const errorHandler = require('../src/middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173',
    'http://161.132.41.106', 'http://161.132.41.106:80','https://deborah-riding-operations-advertising.trycloudflare.com', 
    /\.trycloudflare\.com$/, "*"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rutas principales
app.use('/api', routes);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SDN-STAFF API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

// Ruta para obtener el JSON de Swagger
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: SDN-STAFF Backend funcionando correctamente
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 documentation:
 *                   type: string
 *                   example: http://${HOST}:8000/api-docs
 */
// Ruta de health check
app.get('/health', (req, res) => {
  const port = process.env.PORT || 3000;
  res.status(200).json({
    status: 'OK',
    message: 'SDN-STAFF Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    documentation: `http://${HOST}:${port}/api-docs`
  });
});



// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});



// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    // Verificar conexión a la base de datos
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Obtener configuración de sincronización desde .env
    const forceSync = process.env.SEQUELIZE_FORCE_SYNC === 'true';
    const alterSync = process.env.SEQUELIZE_ALTER_SYNC === 'true';
    
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      try {
        // Primero, actualizar registros NULL para evitar conflictos
        console.log('🔧 Verificando y corrigiendo datos NULL...');
        
        console.log('✅ Datos NULL corregidos.');
        
        // Configurar opciones de sincronización
        const syncOptions = {
          force: forceSync, // Controlado por .env
          alter: alterSync  // Opción adicional para alter tables
        };

        console.log(`🔧 Sincronizando con opciones:`, {
          force: syncOptions.force,
          alter: syncOptions.alter
        });
        
        // Ahora sincronizar con opciones configurables
        await db.sequelize.sync(syncOptions);
        console.log('✅ Modelos sincronizados con la base de datos.');
        
      } catch (syncError) {
        console.warn('⚠️ Error en sincronización automática:', syncError.message);
        console.log('💡 Continuando sin sincronización. Considera usar migraciones.');
        
        // Intentar solo verificar la conexión sin alterar estructura
        await db.sequelize.authenticate();
      }
    } else {
      console.log('🏭 Modo producción: Saltando sincronización automática');
      console.log('💡 En producción usa migraciones para cambios de esquema');
    }

    // Iniciar servidor con manejo de errores
    const server = app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
      console.log(`📊 API Base URL: http://${HOST}:${PORT}/api`);
      console.log(`📚 Documentación Swagger: http://${HOST}:${PORT}/api-docs`);
      console.log(`📋 JSON Schema: http://${HOST}:${PORT}/api-docs.json`);
      
      // Mostrar configuración de sync en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Sync config - Force: ${forceSync}, Alter: ${alterSync}`);
      }
    });

    // Manejo de errores del servidor
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: El puerto ${PORT} ya está en uso`);
        console.log(`💡 Intenta con otro puerto: PORT=3001 npm run dev`);
        console.log(`💡 O mata el proceso: netstat -ano | findstr :${PORT}`);
        process.exit(1);
      } else if (error.code === 'EACCES') {
        console.error(`❌ Error de permisos en puerto ${PORT}`);
        console.log(`💡 Intenta con otro puerto: PORT=8000 npm run dev`);
        console.log(`💡 O ejecuta como administrador`);
        process.exit(1);
      } else {
        console.error('❌ Error del servidor:', error);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    
    // Proporcionar información útil de debugging
    if (error.name === 'SequelizeDatabaseError') {
      console.log('\n💡 Sugerencias para resolver el error de base de datos:');
      console.log('1. Verifica que la base de datos existe');
      console.log('2. Verifica las credenciales de conexión');
      console.log('3. Si hay problemas con NULL values, ejecuta:');
      console.log('   UPDATE rol SET updated_at = created_at WHERE updated_at IS NULL;');
      console.log('4. Considera usar migraciones en lugar de sync para producción\n');
    }
    
    process.exit(1);
  }
};

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);
// Inicializar la aplicación siempre que se importe el módulo
initializeApp();

module.exports = app;