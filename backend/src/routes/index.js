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
// Nuevas rutas para sistema de asignación de stands
const solicitudAsignacionRoutes = require('./solicitudAsignacionRoutes');
const conflictoAsignacionRoutes = require('./conflictoAsignacionRoutes');
const asignacionAutomaticaRoutes = require('./asignacionAutomaticaRoutes');
// Nuevas rutas para sistema de clasificación de expositores
const categoriaComercialRoutes = require('./categoriaComercialRoutes');
const etiquetaLibreRoutes = require('./etiquetaLibreRoutes');
const clasificacionExpositorRoutes = require('./clasificacionExpositorRoutes');

// Configurar rutas existentes
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

// Configurar nuevas rutas para sistema de asignación
router.use('/asignaciones', solicitudAsignacionRoutes); // Solicitudes de asignación
router.use('/asignaciones', conflictoAsignacionRoutes); // Conflictos de asignación
router.use('/asignaciones', asignacionAutomaticaRoutes); // Asignación automática

// Configurar nuevas rutas para sistema de clasificación de expositores
router.use('/categorias', categoriaComercialRoutes); // Gestión de categorías comerciales
router.use('/etiquetas', etiquetaLibreRoutes); // Gestión de etiquetas libres
router.use('/clasificacion', clasificacionExpositorRoutes); // Clasificación de expositores

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
      clasificacion_tipos_evento: '/api/clasificacion-tipos-evento',
      // Nuevos endpoints para sistema de asignación de stands
      asignaciones: '/api/asignaciones',
      // Nuevos endpoints para sistema de clasificación de expositores
      categorias: '/api/categorias',
      etiquetas: '/api/etiquetas',
      clasificacion_expositores: '/api/clasificacion'
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
      },
      // NUEVOS ENDPOINTS PARA SISTEMA DE ASIGNACIÓN DE STANDS
      asignaciones_solicitudes_endpoints: {
        crearSolicitud: 'POST /api/asignaciones/solicitudes (Authenticated)',
        listarSolicitudes: 'GET /api/asignaciones/solicitudes (Admin/Manager/Editor)',
        obtenerSolicitud: 'GET /api/asignaciones/solicitudes/:id (Admin/Manager/Editor)',
        aprobarSolicitud: 'POST /api/asignaciones/solicitudes/:id/aprobar (Admin/Manager)',
        rechazarSolicitud: 'POST /api/asignaciones/solicitudes/:id/rechazar (Admin/Manager)',
        asignarStand: 'POST /api/asignaciones/solicitudes/:id/asignar-stand (Admin/Manager)',
        cancelarSolicitud: 'POST /api/asignaciones/solicitudes/:id/cancelar (Admin/Manager)',
        actualizarSolicitud: 'PUT /api/asignaciones/solicitudes/:id (Admin/Manager/Editor)',
        eliminarSolicitud: 'DELETE /api/asignaciones/solicitudes/:id (Admin)',
        restaurarSolicitud: 'POST /api/asignaciones/solicitudes/:id/restore (Admin)',
        solicitudesPendientesEvento: 'GET /api/asignaciones/solicitudes/evento/:evento_id/pendientes (Admin/Manager/Editor)',
        estadisticasSolicitudes: 'GET /api/asignaciones/solicitudes/stats (Admin/Manager)',
        historialSolicitud: 'GET /api/asignaciones/solicitudes/:id/historial (Admin/Manager/Editor)'
      },
      asignaciones_conflictos_endpoints: {
        listarConflictos: 'GET /api/asignaciones/conflictos (Admin/Manager/Editor)',
        obtenerConflicto: 'GET /api/asignaciones/conflictos/:id (Admin/Manager/Editor)',
        crearConflicto: 'POST /api/asignaciones/conflictos (Admin/Manager)',
        detectarConflictos: 'POST /api/asignaciones/conflictos/evento/:evento_id/detectar (Admin/Manager)',
        asignarConflicto: 'POST /api/asignaciones/conflictos/:id/asignar (Admin/Manager)',
        resolverConflicto: 'POST /api/asignaciones/conflictos/:id/resolver (Admin/Manager)',
        escalarConflicto: 'POST /api/asignaciones/conflictos/:id/escalar (Admin/Manager)',
        cancelarConflicto: 'POST /api/asignaciones/conflictos/:id/cancelar (Admin/Manager)',
        addComunicacion: 'POST /api/asignaciones/conflictos/:id/comunicacion (Admin/Manager/Editor)',
        eliminarConflicto: 'DELETE /api/asignaciones/conflictos/:id (Admin)',
        conflictosVencidos: 'GET /api/asignaciones/conflictos/vencidos (Admin/Manager)',
        estadisticasConflictos: 'GET /api/asignaciones/conflictos/stats (Admin/Manager)',
        conflictosUsuario: 'GET /api/asignaciones/conflictos/usuario/:usuario_id (Admin/Manager/Editor)',
        resumenDashboard: 'GET /api/asignaciones/conflictos/dashboard/resumen (Admin/Manager)'
      },
      asignaciones_automatica_endpoints: {
        ejecutarAsignacion: 'POST /api/asignaciones/automatica/evento/:evento_id/ejecutar (Admin)',
        simularAsignacion: 'POST /api/asignaciones/automatica/evento/:evento_id/simular (Admin/Manager)',
        validarCompatibilidad: 'POST /api/asignaciones/automatica/compatibilidad/:empresa_id/:stand_id (Admin/Manager/Editor)',
        reporteCapacidad: 'GET /api/asignaciones/automatica/evento/:evento_id/capacidad (Admin/Manager/Editor)',
        mejoresCandidatos: 'POST /api/asignaciones/automatica/candidatos/:empresa_id/:evento_id (Admin/Manager/Editor)',
        algoritmosDisponibles: 'GET /api/asignaciones/automatica/algoritmos (Admin/Manager/Editor)',
        metricasRendimiento: 'GET /api/asignaciones/automatica/metricas (Admin/Manager)'
      },
      // NUEVOS ENDPOINTS PARA SISTEMA DE CLASIFICACIÓN DE EXPOSITORES
      categorias_endpoints: {
        listaPublica: 'GET /api/categorias/publicas (Público)',
        arbolJerarquico: 'GET /api/categorias/arbol (Público)',
        destacadas: 'GET /api/categorias/destacadas (Público)',
        buscar: 'GET /api/categorias/buscar (Público)',
        lista: 'GET /api/categorias (Admin/Manager)',
        crear: 'POST /api/categorias (Admin)',
        obtener: 'GET /api/categorias/:id (Admin/Manager)',
        actualizar: 'PUT /api/categorias/:id (Admin)',
        eliminar: 'DELETE /api/categorias/:id (Admin)',
        stats: 'GET /api/categorias/stats (Admin/Manager)',
        actualizarContadores: 'POST /api/categorias/:id/actualizar-contadores (Admin)'
      },
      etiquetas_endpoints: {
        listaPublica: 'GET /api/etiquetas/publicas (Público)',
        porTipo: 'GET /api/etiquetas/tipo/:tipo (Público)',
        destacadas: 'GET /api/etiquetas/destacadas (Público)',
        buscar: 'GET /api/etiquetas/buscar (Público)',
        tipos: 'GET /api/etiquetas/tipos (Público)',
        lista: 'GET /api/etiquetas (Admin/Manager)',
        crear: 'POST /api/etiquetas (Admin)',
        obtener: 'GET /api/etiquetas/:id (Admin/Manager)',
        actualizar: 'PUT /api/etiquetas/:id (Admin)',
        eliminar: 'DELETE /api/etiquetas/:id (Admin)',
        stats: 'GET /api/etiquetas/stats (Admin/Manager)',
        sugerencias: 'GET /api/etiquetas/sugerencias/:empresaId (Admin/Manager/Editor)',
        actualizarContadores: 'POST /api/etiquetas/:id/actualizar-contadores (Admin)'
      },
      clasificacion_expositores_endpoints: {
        // Gestión de categorías de empresas
        categoriasEmpresa: 'GET /api/clasificacion/empresas/:empresaId/categorias (Admin/Manager/Editor)',
        asignarCategorias: 'POST /api/clasificacion/empresas/:empresaId/categorias (Admin/Manager)',
        categoriaPrincipal: 'POST /api/clasificacion/empresas/:empresaId/categorias/:categoriaId/principal (Admin/Manager)',
        removerCategoria: 'DELETE /api/clasificacion/empresas/:empresaId/categorias/:categoriaId (Admin/Manager)',
        // Gestión de etiquetas de empresas
        etiquetasEmpresa: 'GET /api/clasificacion/empresas/:empresaId/etiquetas (Admin/Manager/Editor)',
        asignarEtiquetas: 'POST /api/clasificacion/empresas/:empresaId/etiquetas (Admin/Manager)',
        removerEtiqueta: 'DELETE /api/clasificacion/empresas/:empresaId/etiquetas/:etiquetaId (Admin/Manager)',
        // Búsqueda y filtrado
        buscarPorCategorias: 'GET /api/clasificacion/buscar/categorias (Admin/Manager/Editor)',
        buscarPorEtiquetas: 'GET /api/clasificacion/buscar/etiquetas (Admin/Manager/Editor)',
        buscarPublicoCategorias: 'GET /api/clasificacion/publico/buscar/categorias (Público)',
        buscarPublicoEtiquetas: 'GET /api/clasificacion/publico/buscar/etiquetas (Público)',
        // Directorios y reportes
        directorioTematico: 'GET /api/clasificacion/directorio/categoria/:categoriaId (Admin/Manager/Editor)',
        directorioPublico: 'GET /api/clasificacion/publico/directorio/categoria/:categoriaId (Público)',
        stats: 'GET /api/clasificacion/stats (Admin/Manager)'
      }
    },
    howToUse: {
      step1: 'POST /api/auth/login con email y password',
      step2: 'Usar el accessToken en header: Authorization: Bearer <token>',
      step3: 'Acceder a endpoints protegidos con el token',
      step4: 'Renovar token con POST /api/auth/refresh cuando expire',
      newFeatures: {
        sistemaAsignacion: 'Nuevo sistema completo de asignación de stands',
        solicitudes: 'Gestión de solicitudes de asignación con estados y prioridades',
        conflictos: 'Detección y resolución automática de conflictos',
        asignacionAutomatica: 'Algoritmos inteligentes para asignación automática',
        historial: 'Seguimiento completo de cambios y auditoría',
        // NUEVAS FUNCIONALIDADES DE CLASIFICACIÓN
        clasificacionExpositores: 'Sistema completo de clasificación de expositores por sectores',
        categoriasComerciales: 'Categorías jerárquicas con subcategorías y asignación múltiple',
        etiquetasLibres: 'Sistema de etiquetas flexibles con tipos y vigencia temporal',
        busquedaAvanzada: 'Búsqueda y filtrado de expositores por categorías y etiquetas',
        directoriosTematicos: 'Generación automática de directorios por categoría',
        sugerenciasInteligentes: 'Sugerencias de categorías y etiquetas basadas en IA',
        clasificacionJerarquica: 'Organización jerárquica con categorías principales y secundarias'
      }
    }
  });
});

module.exports = router;
