const express = require('express');
const router = express.Router();

// Importar rutas específicas aquí
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const rolRoutes = require('./rolRoutes');
const eventoRoutes = require('./eventoRoutes');
const tipoEventoRoutes = require('./tipoEventoRoutes');
const empresaExpositoraRoutes = require('./empresaExpositoraRoutes');

// Configurar rutas
router.use('/auth', authRoutes); // Rutas de autenticación (públicas)
router.use('/usuarios', usuarioRoutes); // Nuevo modelo Usuario (protegido)
router.use('/roles', rolRoutes); // Roles (protegido)
router.use('/eventos', eventoRoutes); // Eventos (protegido)
router.use('/tipos-evento', tipoEventoRoutes); // Tipos de evento (protegido)
router.use('/empresas-expositoras', empresaExpositoraRoutes); // Empresas expositoras (protegido/público)

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
      roles: '/api/roles',
      eventos: '/api/eventos',
      tipos_evento: '/api/tipos-evento',
      empresas_expositoras: '/api/empresas-expositoras'
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
      },
      eventos_endpoints: {
        lista: 'GET /api/eventos (Admin/Manager)',
        crear: 'POST /api/eventos (Admin/Manager)',
        obtener: 'GET /api/eventos/:id (Admin/Manager)',
        actualizar: 'PUT /api/eventos/:id (Admin/Manager)',
        eliminar: 'DELETE /api/eventos/:id (Admin)',
        cambiarEstado: 'PATCH /api/eventos/:id/estado (Admin/Manager)',
        duplicar: 'POST /api/eventos/:id/duplicate (Admin/Manager)',
        stats: 'GET /api/eventos/stats (Admin)',
        proximos: 'GET /api/eventos/proximos (Admin/Manager)',
        activos: 'GET /api/eventos/activos (Admin/Manager)',
        urlPublica: 'GET /api/eventos/public/url/:url (Público)'
      },
      tipos_evento_endpoints: {
        lista: 'GET /api/tipos-evento (Admin/Manager)',
        crear: 'POST /api/tipos-evento (Admin)',
        obtener: 'GET /api/tipos-evento/:id (Admin/Manager)',
        actualizar: 'PUT /api/tipos-evento/:id (Admin)',
        eliminar: 'DELETE /api/tipos-evento/:id (Admin)',
        stats: 'GET /api/tipos-evento/stats (Admin)',
        eventos: 'GET /api/tipos-evento/:id/eventos (Admin/Manager)'
      },
      empresas_expositoras_endpoints: {
        lista: 'GET /api/empresas-expositoras (Admin/Manager)',
        crear: 'POST /api/empresas-expositoras (Admin/Manager)',
        obtener: 'GET /api/empresas-expositoras/:id (Admin/Manager)',
        actualizar: 'PUT /api/empresas-expositoras/:id (Admin/Manager)',
        eliminar: 'DELETE /api/empresas-expositoras/:id (Admin)',
        aprobar: 'POST /api/empresas-expositoras/:id/aprobar (Admin)',
        rechazar: 'POST /api/empresas-expositoras/:id/rechazar (Admin)',
        suspender: 'POST /api/empresas-expositoras/:id/suspender (Admin)',
        stats: 'GET /api/empresas-expositoras/stats (Admin)',
        pendientes: 'GET /api/empresas-expositoras/pendientes (Admin/Manager)',
        registroPublico: 'POST /api/empresas-expositoras/registro-publico (Público)',
        registrarEvento: 'POST /api/empresas-expositoras/:id/eventos (Admin/Manager)',
        cargaMasiva: 'POST /api/empresas-expositoras/carga-masiva (Admin)'
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
