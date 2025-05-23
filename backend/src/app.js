const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Importar la base de datos
const db = require('../src/models');

// Importar rutas
const routes = require('../src/routes');

// Importar middlewares
const errorHandler = require('../src/middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
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
 *                   example: http://localhost:8000/api-docs
 */
// Ruta de health check
app.get('/health', (req, res) => {
  const port = process.env.PORT || 3000;
  res.status(200).json({ 
    status: 'OK', 
    message: 'SDN-STAFF Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    documentation: `http://localhost:${port}/api-docs`
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

const PORT = process.env.PORT || 3000;

// Función para inicializar la aplicación
const initializeApp = async () => {
  try {
    // Verificar conexión a la base de datos
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: false });
      console.log('✅ Modelos sincronizados con la base de datos.');
    }
    
    // Iniciar servidor con manejo de errores
    const server = app.listen(PORT, 'localhost', () => {
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log(`📚 Documentación Swagger: http://localhost:${PORT}/api-docs`);
      console.log(`📋 JSON Schema: http://localhost:${PORT}/api-docs.json`);
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

// Inicializar la aplicación siempre que se importe el módulo
initializeApp();

module.exports = app;
