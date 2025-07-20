const express = require('express');
const router = express.Router();
const ReportesController = require('../controllers/ReportesController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReporteGeneral:
 *       type: object
 *       properties:
 *         metricas_principales:
 *           type: object
 *           properties:
 *             total_eventos:
 *               type: integer
 *             total_registros:
 *               type: integer
 *             total_participantes:
 *               type: integer
 *             ingresos_totales:
 *               type: number
 *             tasa_conversion:
 *               type: number
 *             satisfaccion_promedio:
 *               type: number
 *         eventos_por_mes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               mes:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *         tipos_participacion:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *         eventos_populares:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               registros:
 *                 type: integer
 */

// Middleware de autenticación para todas las rutas
router.use(authenticate);

// Middleware para verificar permisos de reportes
router.use((req, res, next) => {
  const { user } = req;
  
  // Solo administradores y organizadores pueden acceder a reportes
  const rolesPermitidos = ['administrador', 'organizador', 'coordinador'];
  
  if (!rolesPermitidos.includes(user.rol)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a los reportes'
    });
  }

  next();
});

/**
 * @swagger
 * /api/reportes/general:
 *   get:
 *     summary: Obtener reporte general de eventos
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: evento_id
 *         schema:
 *           type: integer
 *         description: ID del evento específico (opcional)
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *       - in: query
 *         name: incluir_graficos
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Incluir datos para gráficos
 *     responses:
 *       200:
 *         description: Reporte general generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReporteGeneral'
 *       403:
 *         description: Sin permisos para acceder a reportes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/general', ReportesController.obtenerReporteGeneral);

/**
 * @swagger
 * /api/reportes/visitantes:
 *   get:
 *     summary: Obtener reporte de visitantes y registros
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: evento_id
 *         schema:
 *           type: integer
 *         description: ID del evento específico (opcional)
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *     responses:
 *       200:
 *         description: Reporte de visitantes generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     registros_por_dia:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fecha:
 *                             type: string
 *                             format: date
 *                           cantidad:
 *                             type: integer
 *                     fuentes_trafico:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fuente:
 *                             type: string
 *                           cantidad:
 *                             type: integer
 *                     embudo_conversion:
 *                       type: object
 *                       properties:
 *                         visitas_web:
 *                           type: integer
 *                         iniciaron_registro:
 *                           type: integer
 *                         completaron_registro:
 *                           type: integer
 *                         asistieron_evento:
 *                           type: integer
 */
router.get('/visitantes', ReportesController.obtenerReporteVisitantes);

/**
 * @swagger
 * /api/reportes/financiero:
 *   get:
 *     summary: Obtener reporte financiero
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: evento_id
 *         schema:
 *           type: integer
 *         description: ID del evento específico (opcional)
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *     responses:
 *       200:
 *         description: Reporte financiero generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     ingresos_por_mes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           mes:
 *                             type: string
 *                           ingresos:
 *                             type: number
 *                     ingresos_por_tipo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tipo:
 *                             type: string
 *                           ingresos:
 *                             type: number
 *                           cantidad:
 *                             type: integer
 *                     metricas_financieras:
 *                       type: object
 *                       properties:
 *                         ingresos_totales:
 *                           type: number
 *                         costos_estimados:
 *                           type: number
 *                         beneficio_neto:
 *                           type: number
 *                         roi:
 *                           type: number
 *                         margen_beneficio:
 *                           type: number
 */
router.get('/financiero', ReportesController.obtenerReporteFinanciero);

/**
 * @swagger
 * /api/reportes/comparativo:
 *   get:
 *     summary: Obtener reporte comparativo entre períodos
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: evento_id
 *         schema:
 *           type: integer
 *         description: ID del evento específico (opcional)
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período actual
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período actual
 *     responses:
 *       200:
 *         description: Reporte comparativo generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     comparacion_metricas:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           actual:
 *                             type: number
 *                           anterior:
 *                             type: number
 *                           crecimiento:
 *                             type: number
 *                     datos_por_trimestre:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           trimestre:
 *                             type: string
 *                           actual:
 *                             type: integer
 *                           anterior:
 *                             type: integer
 */
router.get('/comparativo', ReportesController.obtenerReporteComparativo);

/**
 * @swagger
 * /api/reportes/demografico:
 *   get:
 *     summary: Obtener reporte demográfico de participantes
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: evento_id
 *         schema:
 *           type: integer
 *         description: ID del evento específico (opcional)
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *     responses:
 *       200:
 *         description: Reporte demográfico generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     edad_participantes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rango:
 *                             type: string
 *                           cantidad:
 *                             type: integer
 *                     genero_participantes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           genero:
 *                             type: string
 *                           cantidad:
 *                             type: integer
 *                     sectores_empresa:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           sector:
 *                             type: string
 *                           cantidad:
 *                             type: integer
 */
router.get('/demografico', ReportesController.obtenerReporteDemografico);

/**
 * @swagger
 * /api/reportes/evento/{eventoId}/exportar:
 *   get:
 *     summary: Exportar reporte a Excel o PDF
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *       - in: query
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [general, visitantes, financiero, comparativo, demografico]
 *         description: Tipo de reporte a exportar
 *       - in: query
 *         name: formato
 *         required: true
 *         schema:
 *           type: string
 *           enum: [xlsx, pdf]
 *         description: Formato de exportación
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *     responses:
 *       200:
 *         description: Archivo de reporte generado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: Evento no encontrado
 */
router.get('/evento/:eventoId/exportar', (req, res) => {
  const { formato } = req.query;
  
  if (formato === 'pdf') {
    ReportesController.exportarPDF(req, res);
  } else {
    ReportesController.exportarExcel(req, res);
  }
});

/**
 * @swagger
 * /api/reportes/evento/{eventoId}/enviar-email:
 *   post:
 *     summary: Enviar reporte por email
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - destinatarios
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [general, visitantes, financiero, comparativo, demografico]
 *                 description: Tipo de reporte
 *               destinatarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: Lista de emails destinatarios
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 description: Fecha de inicio del período
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 description: Fecha de fin del período
 *               incluir_adjunto:
 *                 type: boolean
 *                 default: true
 *                 description: Incluir reporte como adjunto
 *     responses:
 *       200:
 *         description: Reporte enviado por email exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos de solicitud inválidos
 *       404:
 *         description: Evento no encontrado
 */
router.post('/evento/:eventoId/enviar-email', ReportesController.enviarPorEmail);

/**
 * @swagger
 * /api/reportes/programar:
 *   post:
 *     summary: Programar reporte automático recurrente
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evento_id
 *               - tipo_reporte
 *               - frecuencia
 *               - destinatarios
 *             properties:
 *               evento_id:
 *                 type: integer
 *                 description: ID del evento
 *               tipo_reporte:
 *                 type: string
 *                 enum: [general, visitantes, financiero, comparativo, demografico]
 *                 description: Tipo de reporte
 *               frecuencia:
 *                 type: string
 *                 enum: [diario, semanal, mensual]
 *                 description: Frecuencia de envío
 *               destinatarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *                 description: Lista de emails destinatarios
 *               dia_envio:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 31
 *                 description: Día del mes para envío (solo para frecuencia mensual)
 *               hora_envio:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *                 description: Hora de envío en formato HH:MM
 *               activo:
 *                 type: boolean
 *                 default: true
 *                 description: Si el reporte programado está activo
 *     responses:
 *       201:
 *         description: Reporte programado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     evento_id:
 *                       type: integer
 *                     tipo_reporte:
 *                       type: string
 *                     frecuencia:
 *                       type: string
 *                     proximo_envio:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Datos de solicitud inválidos
 */
router.post('/programar', ReportesController.programarReporte);

/**
 * @swagger
 * /api/reportes/programados:
 *   get:
 *     summary: Listar reportes programados
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: evento_id
 *         schema:
 *           type: integer
 *         description: Filtrar por evento específico
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de reportes programados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       evento_id:
 *                         type: integer
 *                       tipo_reporte:
 *                         type: string
 *                       frecuencia:
 *                         type: string
 *                       destinatarios:
 *                         type: array
 *                         items:
 *                           type: string
 *                       activo:
 *                         type: boolean
 *                       proximo_envio:
 *                         type: string
 *                         format: date-time
 *                       ultimo_envio:
 *                         type: string
 *                         format: date-time
 */
router.get('/programados', (req, res) => {
  // Implementar listado de reportes programados
  res.json({
    success: true,
    data: [] // Temporal
  });
});

/**
 * @swagger
 * /api/reportes/programados/{id}:
 *   put:
 *     summary: Actualizar reporte programado
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reporte programado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               frecuencia:
 *                 type: string
 *                 enum: [diario, semanal, mensual]
 *               destinatarios:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *               activo:
 *                 type: boolean
 *               hora_envio:
 *                 type: string
 *                 pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *     responses:
 *       200:
 *         description: Reporte programado actualizado exitosamente
 *       404:
 *         description: Reporte programado no encontrado
 *   delete:
 *     summary: Eliminar reporte programado
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del reporte programado
 *     responses:
 *       200:
 *         description: Reporte programado eliminado exitosamente
 *       404:
 *         description: Reporte programado no encontrado
 */
router.put('/programados/:id', (req, res) => {
  res.json({ success: true, message: 'Reporte programado actualizado' });
});

router.delete('/programados/:id', (req, res) => {
  res.json({ success: true, message: 'Reporte programado eliminado' });
});

// Middleware para logging de acciones de reportes
router.use((req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log de la acción de reporte realizada
    console.log(`Reportes Action: ${req.method} ${req.path} by user ${req.user?.id} - Status: ${res.statusCode}`);
    originalSend.call(this, data);
  };
  
  next();
});

module.exports = router;