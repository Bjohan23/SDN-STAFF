const express = require('express');
const router = express.Router();

// Importar rutas específicas aquí
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const rolRoutes = require('./rolRoutes');
const eventoRoutes = require('./eventoRoutes');
const tipoEventoRoutes = require('./tipoEventoRoutes');
const empresaExpositoraRoutes = require('./empresaExpositoraRoutes');
const tipoStandRoutes = require('./tipoStandRoutes');
const standRoutes = require('./standRoutes');
const servicioAdicionalRoutes = require('./servicioAdicionalRoutes');
const clasificacionTipoEventoRoutes = require('./clasificacionTipoEventoRoutes');

// Configurar rutas
router.use('/auth', authRoutes); // Rutas de autenticación (públicas)
router.use('/usuarios', usuarioRoutes); // Nuevo modelo Usuario (protegido)
router.use('/roles', rolRoutes); // Roles (protegido)
router.use('/eventos', eventoRoutes); // Eventos (protegido)
router.use('/tiposEvento', tipoEventoRoutes); // Tipos de evento (protegido)
router.use('/empresasExpositoras', empresaExpositoraRoutes); // Empresas expositoras (protegido/público)
router.use('/tiposStand', tipoStandRoutes); // Tipos de stand (protegido/público)
router.use('/stands', standRoutes); // Stands (protegido)
router.use('/serviciosAdicionales', servicioAdicionalRoutes); // Servicios adicionales (protegido/público)
router.use('/clasificacionTiposEvento', clasificacionTipoEventoRoutes); // Clasificación por tipo de evento (protegido)

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
      empresas_expositoras: '/api/empresas-expositoras',
      tipos_stand: '/api/tipos-stand',
      stands: '/api/stands',
      servicios_adicionales: '/api/servicios-adicionales',
      clasificacion_tipos_evento: '/api/clasificacion-tipos-evento'
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
      },
      tipos_stand_endpoints: {
        lista: 'GET /api/tipos-stand (Público)',
        crear: 'POST /api/tipos-stand (Admin/Organizador)',
        obtener: 'GET /api/tipos-stand/:id (Público)',
        actualizar: 'PUT /api/tipos-stand/:id (Admin/Organizador)',
        eliminar: 'DELETE /api/tipos-stand/:id (Admin)',
        stats: 'GET /api/tipos-stand/stats (Público)',
        stands: 'GET /api/tipos-stand/:id/stands (Público)',
        validarArea: 'GET /api/tipos-stand/:id/validar-area (Público)',
        calcularPrecio: 'GET /api/tipos-stand/:id/calcular-precio (Público)',
        paraArea: 'GET /api/tipos-stand/para-area (Público)'
      },
      stands_endpoints: {
        lista: 'GET /api/stands (Público)',
        crear: 'POST /api/stands (Admin/Organizador)',
        obtener: 'GET /api/stands/:id (Público)',
        actualizar: 'PUT /api/stands/:id (Admin/Organizador)',
        eliminar: 'DELETE /api/stands/:id (Admin)',
        cambiarEstado: 'PATCH /api/stands/:id/estado-fisico (Admin/Organizador)',
        asignarEvento: 'POST /api/stands/:id/asignar-evento (Admin/Organizador)',
        disponiblesEvento: 'GET /api/stands/evento/:evento_id/disponibles (Público)',
        stats: 'GET /api/stands/stats (Público)',
        mantenimiento: 'GET /api/stands/mantenimiento (Admin/Organizador)',
        cargaMasiva: 'POST /api/stands/carga-masiva (Admin)'
      },
      servicios_adicionales_endpoints: {
        lista: 'GET /api/servicios-adicionales (Público)',
        crear: 'POST /api/servicios-adicionales (Admin/Organizador)',
        obtener: 'GET /api/servicios-adicionales/:id (Público)',
        actualizar: 'PUT /api/servicios-adicionales/:id (Admin/Organizador)',
        eliminar: 'DELETE /api/servicios-adicionales/:id (Admin)',
        contratar: 'POST /api/servicios-adicionales/:id/contratar (Admin/Organizador/Empresa)',
        categoria: 'GET /api/servicios-adicionales/categoria/:categoria (Público)',
        populares: 'GET /api/servicios-adicionales/populares (Público)',
        compatibles: 'GET /api/servicios-adicionales/compatibles/:tipo_stand (Público)',
        stats: 'GET /api/servicios-adicionales/stats (Público)',
        contratacion: 'GET /api/servicios-adicionales/contratacion/:id (Admin/Organizador)',
        actualizarEstado: 'PUT /api/servicios-adicionales/contratacion/:id/estado (Admin/Organizador)'
      },
      clasificacion_tipos_evento_endpoints: {
        configuracionesPorModalidad: 'GET /api/clasificacion-tipos-evento/modalidad/:modalidad (Admin/Manager)',
        estadisticasConfiguraciones: 'GET /api/clasificacion-tipos-evento/tipos/:tipo_evento_id/stats (Admin/Manager)',
        informacionCompleta: 'GET /api/clasificacion-tipos-evento/tipos/:tipo_evento_id/completo (Admin/Manager)',
        validarConfiguracion: 'POST /api/clasificacion-tipos-evento/tipos/:tipo_evento_id/validar (Admin/Manager)',
        configuracionesPorTipo: 'GET /api/clasificacion-tipos-evento/tipos/:tipo_evento_id/configuraciones (Admin/Manager)',
        configuracionPorModalidad: 'GET /api/clasificacion-tipos-evento/tipos/:tipo_evento_id/configuraciones/:modalidad (Admin/Manager)',
        crearConfiguracion: 'POST /api/clasificacion-tipos-evento/tipos/:tipo_evento_id/configuraciones (Admin/Manager)',
        duplicarConfiguracion: 'POST /api/clasificacion-tipos-evento/configuraciones/:configuracion_id/duplicar (Admin/Manager)',
        actualizarConfiguracion: 'PUT /api/clasificacion-tipos-evento/configuraciones/:configuracion_id (Admin/Manager)',
        eliminarConfiguracion: 'DELETE /api/clasificacion-tipos-evento/configuraciones/:configuracion_id (Admin)',
        plantillasDisponibles: 'GET /api/clasificacion-tipos-evento/tipos/:tipo_evento_id/plantillas (Admin/Manager)',
        aplicarPlantilla: 'POST /api/clasificacion-tipos-evento/plantillas/:plantilla_id/aplicar (Admin/Manager)'
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
