const express = require('express');
const router = express.Router();

// Importar rutas específicas aquí
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const rolRoutes = require('./rolRoutes');

// Configurar rutas
router.use('/auth', authRoutes); // Rutas de autenticación (públicas)
router.use('/users', userRoutes); // Modelo anterior (mantener por compatibilidad)
router.use('/usuarios', usuarioRoutes); // Nuevo modelo Usuario (protegido)
router.use('/roles', rolRoutes); // Roles (protegido)

// Ruta de prueba
router.get('/', (req, res) => {
  res.json({
    message: 'API SDN-STAFF funcionando correctamente',
    version: '1.0.0',
    authentication: {
      status: 'JWT implementado',
      tokenExpiration: '6 horas',
      publicEndpoints: [
        'GET /',
        'GET /health',
        'GET /api',
        'POST /api/auth/login',
        'POST /api/auth/refresh',
        'GET /api/auth/public',
        'GET /api-docs',
        'GET /api-docs.json'
      ]
    },
    endpoints: {
      health: '/health',
      api: '/api',
      documentation: '/api-docs',
      // Autenticación (público)
      auth: '/api/auth',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',//registro de usuario
      refresh: 'POST /api/auth/refresh',
      public: 'GET /api/auth/public',
      // Modelo anterior User (compatibilidad - protegido)
      users: '/api/users',
      // Nuevos modelos (protegidos con JWT)
      usuarios: '/api/usuarios',
      roles: '/api/roles'
    },
    protected_endpoints: {
      note: 'Todos los endpoints excepto los públicos requieren Bearer token',
      usuarios_endpoints: {
        lista: 'GET /api/usuarios (Admin/Manager)',
        crear: 'POST /api/usuarios (Admin)',
        obtener: 'GET /api/usuarios/:id (Self/Admin)',
        actualizar: 'PUT /api/usuarios/:id (Self/Admin)',
        eliminar: 'DELETE /api/usuarios/:id (Admin)',
        profile: 'GET /api/usuarios/profile (Authenticated)',
        stats: 'GET /api/usuarios/stats (Admin)'
      },
      roles_endpoints: {
        lista: 'GET /api/roles (Admin/Manager)',
        crear: 'POST /api/roles (Admin)',
        obtener: 'GET /api/roles/:id (Admin/Manager)',
        actualizar: 'PUT /api/roles/:id (Admin)',
        eliminar: 'DELETE /api/roles/:id (Admin)',
        stats: 'GET /api/roles/stats (Admin)'
      },
      auth_endpoints: {
        me: 'GET /api/auth/me (Authenticated)',
        profile: 'GET /api/auth/profile (Authenticated)',
        logout: 'POST /api/auth/logout (Authenticated)',
        verify: 'GET /api/auth/verify (Any token)',
        changePassword: 'POST /api/auth/change-password (Authenticated)',
        tokenInfo: 'GET /api/auth/token-info (Authenticated)'
      }
    },
    howToUse: {
      step1: 'POST /api/auth/login con correoassword',
      step2: 'Usar el accessToken en header: Authorization: Bearer <token>',
      step3: 'Acceder a endpoints protegidos con el token',
      step4: 'Renovar token con POST /api/auth/refresh cuando expire'
    }
  });
});

module.exports = router;
