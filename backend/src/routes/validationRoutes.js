const express = require('express');
const router = express.Router();
const ValidationController = require('../controllers/ValidationController');
const { authenticate } = require('../middlewares/auth');

// ========================
// RUTAS DE VALIDACIÓN
// ========================

/**
 * @swagger
 * /api/validation/qr:
 *   post:
 *     summary: Validar credencial por código QR
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qr_data
 *             properties:
 *               qr_data:
 *                 type: string
 *                 description: Datos del código QR a validar
 *               punto_acceso:
 *                 type: string
 *                 description: Punto de acceso donde se realiza la validación
 *               ubicacion_fisica:
 *                 type: string
 *                 description: Ubicación física específica
 *               dispositivo_validacion:
 *                 type: string
 *                 description: ID del dispositivo que realiza la validación
 *               nombre_validador:
 *                 type: string
 *                 description: Nombre del validador (si no es usuario del sistema)
 *               tipo_movimiento:
 *                 type: string
 *                 enum: [entrada, salida, verificacion]
 *                 default: entrada
 *               coordenadas_gps:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *     responses:
 *       200:
 *         description: Credencial válida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 result:
 *                   type: string
 *                   enum: [exitosa, fallida, bloqueada, sospechosa]
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     credencial:
 *                       type: object
 *                     nivel_riesgo:
 *                       type: string
 *                     tiempo_respuesta:
 *                       type: number
 *       401:
 *         description: Credencial inválida
 *       403:
 *         description: Actividad sospechosa detectada
 *       400:
 *         description: Datos de entrada inválidos
 */
router.post('/qr', authenticate, ValidationController.validarQR);

/**
 * @swagger
 * /api/validation/codigo:
 *   post:
 *     summary: Validar credencial por código único
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo_unico
 *             properties:
 *               codigo_unico:
 *                 type: string
 *                 description: Código único de la credencial
 *               punto_acceso:
 *                 type: string
 *               ubicacion_fisica:
 *                 type: string
 *               dispositivo_validacion:
 *                 type: string
 *               nombre_validador:
 *                 type: string
 *               tipo_movimiento:
 *                 type: string
 *                 enum: [entrada, salida, verificacion]
 *                 default: entrada
 *     responses:
 *       200:
 *         description: Validación exitosa
 *       401:
 *         description: Credencial inválida
 *       404:
 *         description: Credencial no encontrada
 */
router.post('/codigo', authenticate, ValidationController.validarPorCodigo);

/**
 * @swagger
 * /api/validation/grupal:
 *   post:
 *     summary: Validar múltiples credenciales (entrada grupal)
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qr_codes
 *             properties:
 *               qr_codes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 10
 *                 description: Array de códigos QR (máximo 10)
 *               punto_acceso:
 *                 type: string
 *               ubicacion_fisica:
 *                 type: string
 *               dispositivo_validacion:
 *                 type: string
 *               nombre_validador:
 *                 type: string
 *               coordenadas_gps:
 *                 type: object
 *     responses:
 *       200:
 *         description: Validación grupal completada
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
 *                     resultados:
 *                       type: array
 *                     resumen:
 *                       type: object
 *       400:
 *         description: Datos inválidos o demasiadas credenciales
 */
router.post('/grupal', authenticate, ValidationController.validarGrupal);

/**
 * @swagger
 * /api/validation/historial/{id_credencial}:
 *   get:
 *     summary: Obtener historial de validaciones de una credencial
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_credencial
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la credencial
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de registros
 *       - in: query
 *         name: desde
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha desde (ISO 8601)
 *       - in: query
 *         name: hasta
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha hasta (ISO 8601)
 *     responses:
 *       200:
 *         description: Historial de validaciones
 */
router.get('/historial/:id_credencial', authenticate, ValidationController.obtenerHistorial);

/**
 * @swagger
 * /api/validation/estadisticas/{id_evento}:
 *   get:
 *     summary: Obtener estadísticas de validaciones por evento
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_evento
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *           enum: [1h, 24h, 7d, 30d]
 *           default: 24h
 *         description: Período de tiempo para las estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas de validaciones
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
 *                     periodo:
 *                       type: string
 *                     fecha_inicio:
 *                       type: string
 *                     estadisticas:
 *                       type: array
 */
router.get('/estadisticas/:id_evento', authenticate, ValidationController.obtenerEstadisticas);

/**
 * @swagger
 * /api/validation/tiempo-real/{id_evento}:
 *   get:
 *     summary: Obtener resumen de validaciones en tiempo real
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_evento
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Resumen en tiempo real
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
 *                     resumen_por_hora:
 *                       type: array
 *                     totales:
 *                       type: array
 *                     periodo:
 *                       type: string
 *                     ultima_actualizacion:
 *                       type: string
 */
router.get('/tiempo-real/:id_evento', authenticate, ValidationController.obtenerResumenTiempoReal);

/**
 * @swagger
 * /api/validation/recientes:
 *   get:
 *     summary: Obtener validaciones recientes
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_evento
 *         schema:
 *           type: integer
 *         description: ID del evento (opcional)
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de registros
 *       - in: query
 *         name: resultado
 *         schema:
 *           type: string
 *           enum: [exitosa, fallida, bloqueada, sospechosa]
 *         description: Filtrar por resultado
 *       - in: query
 *         name: nivel_riesgo
 *         schema:
 *           type: string
 *           enum: [bajo, medio, alto, critico]
 *         description: Filtrar por nivel de riesgo
 *       - in: query
 *         name: punto_acceso
 *         schema:
 *           type: string
 *         description: Filtrar por punto de acceso
 *     responses:
 *       200:
 *         description: Lista de validaciones recientes
 */
router.get('/recientes', authenticate, ValidationController.obtenerValidacionesRecientes);

/**
 * @swagger
 * /api/validation/patrones-sospechosos:
 *   get:
 *     summary: Detectar patrones sospechosos
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_evento
 *         schema:
 *           type: integer
 *         description: ID del evento (opcional)
 *     responses:
 *       200:
 *         description: Patrones sospechosos detectados
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
 *                     credenciales_sospechosas:
 *                       type: array
 *                     ips_sospechosas:
 *                       type: array
 */
router.get('/patrones-sospechosos', authenticate, ValidationController.detectarPatronesSospechosos);

/**
 * @swagger
 * /api/validation/logs/{id_log}/marcar-fraudulenta:
 *   post:
 *     summary: Marcar validación como fraudulenta
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_log
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del log de validación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivo
 *             properties:
 *               motivo:
 *                 type: string
 *                 description: Motivo por el cual se marca como fraudulenta
 *     responses:
 *       200:
 *         description: Validación marcada como fraudulenta
 *       400:
 *         description: Motivo requerido
 *       404:
 *         description: Log de validación no encontrado
 */
router.post('/logs/:id_log/marcar-fraudulenta', authenticate, ValidationController.marcarFraudulenta);

/**
 * @swagger
 * /api/validation/punto-acceso/{punto_acceso}:
 *   get:
 *     summary: Obtener información de punto de acceso
 *     tags: [Validación]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: punto_acceso
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del punto de acceso
 *       - in: query
 *         name: id_evento
 *         schema:
 *           type: integer
 *         description: ID del evento (opcional)
 *     responses:
 *       200:
 *         description: Información del punto de acceso
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
 *                     punto_acceso:
 *                       type: string
 *                     estadisticas_24h:
 *                       type: array
 *                     ultima_actividad:
 *                       type: object
 *                     estado:
 *                       type: string
 */
router.get('/punto-acceso/:punto_acceso', authenticate, ValidationController.obtenerInfoPuntoAcceso);

// ========================
// RUTAS PÚBLICAS DE VALIDACIÓN (sin autenticación para apps móviles)
// ========================

/**
 * @swagger
 * /api/validation/public/qr:
 *   post:
 *     summary: Validar credencial por QR (endpoint público)
 *     tags: [Validación Pública]
 *     description: Endpoint público para aplicaciones móviles de validación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qr_data
 *               - api_key
 *             properties:
 *               qr_data:
 *                 type: string
 *               api_key:
 *                 type: string
 *                 description: API Key para autenticación
 *               punto_acceso:
 *                 type: string
 *               dispositivo_validacion:
 *                 type: string
 *               coordenadas_gps:
 *                 type: object
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *       401:
 *         description: API Key inválida o credencial inválida
 *       403:
 *         description: Actividad sospechosa
 */
// Nota: Este endpoint requeriría un middleware de autenticación por API Key
// router.post('/public/qr', apiKeyAuth, ValidationController.validarQR);

/**
 * @swagger
 * /api/validation/public/estado:
 *   get:
 *     summary: Verificar estado del sistema de validación
 *     tags: [Validación Pública]
 *     responses:
 *       200:
 *         description: Estado del sistema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 estado:
 *                   type: string
 *                   enum: [activo, mantenimiento, inactivo]
 *                 version:
 *                   type: string
 *                 timestamp:
 *                   type: string
 */
router.get('/public/estado', (req, res) => {
  res.status(200).json({
    success: true,
    estado: 'activo',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints_disponibles: [
      'POST /api/validation/qr',
      'POST /api/validation/codigo',
      'POST /api/validation/grupal'
    ]
  });
});

module.exports = router;