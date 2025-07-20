const express = require('express');
const router = express.Router();
const CredencialController = require('../controllers/CredencialController');
const TipoCredencialController = require('../controllers/TipoCredencialController');
const PlantillaCredencialController = require('../controllers/PlantillaCredencialController');
const { authenticate } = require('../middlewares/auth');

// ========================
// RUTAS DE CREDENCIALES
// ========================

/**
 * @swagger
 * /api/credenciales:
 *   post:
 *     summary: Crear nueva credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_evento
 *               - id_tipo_credencial
 *               - nombre_completo
 *             properties:
 *               id_evento:
 *                 type: integer
 *               id_tipo_credencial:
 *                 type: integer
 *               nombre_completo:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               empresa_organizacion:
 *                 type: string
 *               cargo_titulo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Credencial creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 */
router.post('/', authenticate, CredencialController.crear);

/**
 * @swagger
 * /api/credenciales/lote:
 *   post:
 *     summary: Crear credenciales en lote
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.post('/lote', authenticate, CredencialController.crearLote);

/**
 * @swagger
 * /api/credenciales:
 *   get:
 *     summary: Listar credenciales con filtros
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto de búsqueda
 *       - in: query
 *         name: id_evento
 *         schema:
 *           type: integer
 *         description: ID del evento
 *       - in: query
 *         name: id_tipo_credencial
 *         schema:
 *           type: integer
 *         description: ID del tipo de credencial
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, activa, suspendida, revocada, expirada]
 *         description: Estado de la credencial
 */
router.get('/', authenticate, CredencialController.listar);

/**
 * @swagger
 * /api/credenciales/{id}:
 *   get:
 *     summary: Obtener credencial por ID
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', authenticate, CredencialController.obtenerPorId);

/**
 * @swagger
 * /api/credenciales/{id}:
 *   put:
 *     summary: Actualizar credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, CredencialController.actualizar);

/**
 * @swagger
 * /api/credenciales/{id}:
 *   delete:
 *     summary: Eliminar credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, CredencialController.eliminar);

/**
 * @swagger
 * /api/credenciales/{id}/pdf:
 *   get:
 *     summary: Generar PDF de credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - application/pdf
 */
router.get('/:id/pdf', authenticate, CredencialController.generarPDF);

/**
 * @swagger
 * /api/credenciales/pdf/lote:
 *   post:
 *     summary: Generar PDFs en lote
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.post('/pdf/lote', authenticate, CredencialController.generarPDFLote);

/**
 * @swagger
 * /api/credenciales/{id}/qr:
 *   get:
 *     summary: Obtener imagen QR de credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 *     produces:
 *       - image/png
 */
router.get('/:id/qr', authenticate, CredencialController.obtenerQR);

/**
 * @swagger
 * /api/credenciales/{id}/revocar:
 *   post:
 *     summary: Revocar credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/revocar', authenticate, CredencialController.revocar);

/**
 * @swagger
 * /api/credenciales/{id}/reactivar:
 *   post:
 *     summary: Reactivar credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/reactivar', authenticate, CredencialController.reactivar);

/**
 * @swagger
 * /api/credenciales/{id}/reimprimir:
 *   post:
 *     summary: Reimprimir credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/reimprimir', authenticate, CredencialController.reimprimir);

/**
 * @swagger
 * /api/credenciales/{id}/duplicar:
 *   post:
 *     summary: Duplicar credencial
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/duplicar', authenticate, CredencialController.duplicar);

/**
 * @swagger
 * /api/credenciales/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de credenciales
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.get('/estadisticas', authenticate, CredencialController.obtenerEstadisticas);

/**
 * @swagger
 * /api/credenciales/evento/{id_evento}:
 *   get:
 *     summary: Obtener credenciales por evento
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.get('/evento/:id_evento', authenticate, CredencialController.obtenerPorEvento);

/**
 * @swagger
 * /api/credenciales/evento/{id_evento}/reporte:
 *   get:
 *     summary: Generar reporte de credenciales del evento
 *     tags: [Credenciales]
 *     security:
 *       - bearerAuth: []
 */
router.get('/evento/:id_evento/reporte', authenticate, CredencialController.generarReporte);

// ========================
// RUTAS DE TIPOS DE CREDENCIAL
// ========================

/**
 * @swagger
 * /api/credenciales/tipos:
 *   post:
 *     summary: Crear nuevo tipo de credencial
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/tipos', authenticate, TipoCredencialController.crear);

/**
 * @swagger
 * /api/credenciales/tipos:
 *   get:
 *     summary: Listar tipos de credencial
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tipos', authenticate, TipoCredencialController.listar);

/**
 * @swagger
 * /api/credenciales/tipos/activos:
 *   get:
 *     summary: Obtener tipos activos para formularios
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tipos/activos', authenticate, TipoCredencialController.obtenerActivos);

/**
 * @swagger
 * /api/credenciales/tipos/niveles-acceso:
 *   get:
 *     summary: Obtener niveles de acceso disponibles
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tipos/niveles-acceso', authenticate, TipoCredencialController.obtenerNivelesAcceso);

/**
 * @swagger
 * /api/credenciales/tipos/{id}:
 *   get:
 *     summary: Obtener tipo de credencial por ID
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tipos/:id', authenticate, TipoCredencialController.obtenerPorId);

/**
 * @swagger
 * /api/credenciales/tipos/{id}:
 *   put:
 *     summary: Actualizar tipo de credencial
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.put('/tipos/:id', authenticate, TipoCredencialController.actualizar);

/**
 * @swagger
 * /api/credenciales/tipos/{id}:
 *   delete:
 *     summary: Eliminar tipo de credencial
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/tipos/:id', authenticate, TipoCredencialController.eliminar);

/**
 * @swagger
 * /api/credenciales/tipos/{id}/toggle-activo:
 *   post:
 *     summary: Activar/Desactivar tipo de credencial
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/tipos/:id/toggle-activo', authenticate, TipoCredencialController.toggleActivo);

/**
 * @swagger
 * /api/credenciales/tipos/{id}/duplicar:
 *   post:
 *     summary: Duplicar tipo de credencial
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/tipos/:id/duplicar', authenticate, TipoCredencialController.duplicar);

/**
 * @swagger
 * /api/credenciales/tipos/{id}/configuracion-accesos:
 *   get:
 *     summary: Obtener configuración de accesos del tipo
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tipos/:id/configuracion-accesos', authenticate, TipoCredencialController.obtenerConfiguracionAccesos);

/**
 * @swagger
 * /api/credenciales/tipos/{id}/configuracion-accesos:
 *   put:
 *     summary: Actualizar configuración de accesos
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.put('/tipos/:id/configuracion-accesos', authenticate, TipoCredencialController.actualizarConfiguracionAccesos);

/**
 * @swagger
 * /api/credenciales/tipos/{id}/estadisticas-uso:
 *   get:
 *     summary: Obtener estadísticas de uso del tipo
 *     tags: [Tipos de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/tipos/:id/estadisticas-uso', authenticate, TipoCredencialController.obtenerEstadisticasUso);

// ========================
// RUTAS DE PLANTILLAS
// ========================

/**
 * @swagger
 * /api/credenciales/plantillas:
 *   post:
 *     summary: Crear nueva plantilla de credencial
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plantillas', authenticate, PlantillaCredencialController.crear);

/**
 * @swagger
 * /api/credenciales/plantillas:
 *   get:
 *     summary: Listar plantillas con filtros
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/plantillas', authenticate, PlantillaCredencialController.listar);

/**
 * @swagger
 * /api/credenciales/plantillas/variables:
 *   get:
 *     summary: Obtener variables disponibles para templates
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/plantillas/variables', authenticate, PlantillaCredencialController.obtenerVariablesDisponibles);

/**
 * @swagger
 * /api/credenciales/plantillas/predefinidas/{tipo}:
 *   get:
 *     summary: Obtener template predefinido por tipo
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/plantillas/predefinidas/:tipo', authenticate, PlantillaCredencialController.obtenerTemplatesPredefinidos);

/**
 * @swagger
 * /api/credenciales/plantillas/validar:
 *   post:
 *     summary: Validar template HTML
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plantillas/validar', authenticate, PlantillaCredencialController.validarTemplate);

/**
 * @swagger
 * /api/credenciales/plantillas/{id}:
 *   get:
 *     summary: Obtener plantilla por ID
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/plantillas/:id', authenticate, PlantillaCredencialController.obtenerPorId);

/**
 * @swagger
 * /api/credenciales/plantillas/{id}:
 *   put:
 *     summary: Actualizar plantilla
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.put('/plantillas/:id', authenticate, PlantillaCredencialController.actualizar);

/**
 * @swagger
 * /api/credenciales/plantillas/{id}:
 *   delete:
 *     summary: Eliminar plantilla
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/plantillas/:id', authenticate, PlantillaCredencialController.eliminar);

/**
 * @swagger
 * /api/credenciales/plantillas/{id}/clonar:
 *   post:
 *     summary: Clonar plantilla
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plantillas/:id/clonar', authenticate, PlantillaCredencialController.clonar);

/**
 * @swagger
 * /api/credenciales/plantillas/{id}/preview:
 *   post:
 *     summary: Generar preview de plantilla
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plantillas/:id/preview', authenticate, PlantillaCredencialController.generarPreview);

/**
 * @swagger
 * /api/credenciales/plantillas/{id}/preview-html:
 *   post:
 *     summary: Generar preview HTML completo
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plantillas/:id/preview-html', authenticate, PlantillaCredencialController.generarPreviewHTML);

/**
 * @swagger
 * /api/credenciales/plantillas/tipo/{id_tipo_credencial}:
 *   get:
 *     summary: Obtener plantillas por tipo de credencial
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.get('/plantillas/tipo/:id_tipo_credencial', authenticate, PlantillaCredencialController.obtenerPorTipo);

/**
 * @swagger
 * /api/credenciales/plantillas/{id}/establecer-defecto:
 *   post:
 *     summary: Establecer como plantilla por defecto
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plantillas/:id/establecer-defecto', authenticate, PlantillaCredencialController.establecerComoDefecto);

/**
 * @swagger
 * /api/credenciales/plantillas/{id}/toggle-activa:
 *   post:
 *     summary: Activar/Desactivar plantilla
 *     tags: [Plantillas de Credencial]
 *     security:
 *       - bearerAuth: []
 */
router.post('/plantillas/:id/toggle-activa', authenticate, PlantillaCredencialController.toggleActiva);

module.exports = router;