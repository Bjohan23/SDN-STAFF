const express = require('express');
const router = express.Router();
const PreRegistroController = require('../controllers/PreRegistroController');
const { authenticate } = require('../middlewares/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     PreRegistro:
 *       type: object
 *       required:
 *         - evento_id
 *         - nombre
 *         - apellidos
 *         - email
 *         - documento_identidad
 *         - acepta_terminos
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del pre-registro
 *         evento_id:
 *           type: integer
 *           description: ID del evento
 *         codigo_registro:
 *           type: string
 *           description: Código único de registro
 *         nombre:
 *           type: string
 *           description: Nombre del participante
 *         apellidos:
 *           type: string
 *           description: Apellidos del participante
 *         email:
 *           type: string
 *           format: email
 *           description: Email del participante
 *         telefono:
 *           type: string
 *           description: Teléfono del participante
 *         documento_identidad:
 *           type: string
 *           description: Número de documento de identidad
 *         tipo_documento:
 *           type: string
 *           enum: [cedula, pasaporte, ruc, otro]
 *           description: Tipo de documento
 *         empresa:
 *           type: string
 *           description: Empresa del participante
 *         cargo:
 *           type: string
 *           description: Cargo del participante
 *         tipo_participacion:
 *           type: string
 *           enum: [visitante, profesional, estudiante, vip, prensa]
 *           description: Tipo de participación
 *         estado:
 *           type: string
 *           enum: [pendiente, confirmado, pendiente_pago, pagado, cancelado, presente]
 *           description: Estado del registro
 *         acepta_terminos:
 *           type: boolean
 *           description: Acepta términos y condiciones
 *         es_registro_grupal:
 *           type: boolean
 *           description: Indica si es un registro grupal
 */

// ====================================
// RUTAS PÚBLICAS (sin autenticación)
// ====================================

/**
 * @swagger
 * /api/pre-registro:
 *   post:
 *     summary: Crear nuevo pre-registro (público)
 *     tags: [Pre-registro]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - evento_id
 *               - nombre
 *               - apellidos
 *               - email
 *               - documento_identidad
 *               - acepta_terminos
 *             properties:
 *               evento_id:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *               documento_identidad:
 *                 type: string
 *               tipo_documento:
 *                 type: string
 *                 enum: [cedula, pasaporte, ruc, otro]
 *               empresa:
 *                 type: string
 *               cargo:
 *                 type: string
 *               tipo_participacion:
 *                 type: string
 *                 enum: [visitante, profesional, estudiante, vip, prensa]
 *               intereses:
 *                 type: array
 *                 items:
 *                   type: string
 *               acepta_terminos:
 *                 type: boolean
 *               acepta_marketing:
 *                 type: boolean
 *               es_registro_grupal:
 *                 type: boolean
 *               participantes_adicionales:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     apellidos:
 *                       type: string
 *                     email:
 *                       type: string
 *                     empresa:
 *                       type: string
 *                     cargo:
 *                       type: string
 *     responses:
 *       201:
 *         description: Pre-registro creado exitosamente
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
 *                     codigo_registro:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     qr_code:
 *                       type: string
 *       400:
 *         description: Error en los datos enviados
 *       409:
 *         description: Registro duplicado
 */
router.post('/', PreRegistroController.crear);

/**
 * @swagger
 * /api/pre-registro/verificar-duplicado:
 *   post:
 *     summary: Verificar si existe un registro duplicado (público)
 *     tags: [Pre-registro]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - evento_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               documento_identidad:
 *                 type: string
 *               evento_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 existe:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   nullable: true
 */
router.post('/verificar-duplicado', PreRegistroController.verificarDuplicado);

/**
 * @swagger
 * /api/pre-registro/codigo/{codigo}:
 *   get:
 *     summary: Obtener pre-registro por código (público)
 *     tags: [Pre-registro]
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código de registro
 *     responses:
 *       200:
 *         description: Pre-registro encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PreRegistro'
 *       404:
 *         description: Registro no encontrado
 */
router.get('/codigo/:codigo', PreRegistroController.obtenerPorCodigo);

/**
 * @swagger
 * /api/pre-registro/{id}/enviar-confirmacion:
 *   post:
 *     summary: Reenviar email de confirmación (público)
 *     tags: [Pre-registro]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro
 *     responses:
 *       200:
 *         description: Email enviado exitosamente
 *       404:
 *         description: Registro no encontrado
 */
router.post('/:id/enviar-confirmacion', PreRegistroController.enviarConfirmacion);

// ====================================
// RUTAS ADMINISTRATIVAS (requieren autenticación)
// ====================================

/**
 * @swagger
 * /api/pre-registro/evento/{eventoId}:
 *   get:
 *     summary: Listar pre-registros de un evento
 *     tags: [Pre-registro]
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
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Registros por página
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pendiente, confirmado, pendiente_pago, pagado, cancelado, presente]
 *         description: Filtrar por estado
 *       - in: query
 *         name: tipo_participacion
 *         schema:
 *           type: string
 *           enum: [visitante, profesional, estudiante, vip, prensa]
 *         description: Filtrar por tipo de participación
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, email, empresa, etc.
 *     responses:
 *       200:
 *         description: Lista de pre-registros
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
 *                     registros:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PreRegistro'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         per_page:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 */
router.get('/evento/:eventoId', authenticate, PreRegistroController.listarPorEvento);

/**
 * @swagger
 * /api/pre-registro/{id}/estado:
 *   put:
 *     summary: Actualizar estado del pre-registro
 *     tags: [Pre-registro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [confirmado, pendiente_pago, pagado, cancelado, presente]
 *               motivo:
 *                 type: string
 *                 description: Motivo de cancelación (requerido si estado es 'cancelado')
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Estado no válido
 *       404:
 *         description: Registro no encontrado
 */
router.put('/:id/estado', authenticate, PreRegistroController.actualizarEstado);

/**
 * @swagger
 * /api/pre-registro/evento/{eventoId}/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de pre-registros
 *     tags: [Pre-registro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Estadísticas del evento
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
 *                     total_registros:
 *                       type: integer
 *                     total_participantes:
 *                       type: integer
 *                     registros_grupales:
 *                       type: integer
 *                     por_estado:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           estado:
 *                             type: string
 *                           cantidad:
 *                             type: integer
 *                     por_tipo:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tipo_participacion:
 *                             type: string
 *                           cantidad:
 *                             type: integer
 *                     por_fecha:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fecha:
 *                             type: string
 *                             format: date
 *                           cantidad:
 *                             type: integer
 */
router.get('/evento/:eventoId/estadisticas', authenticate, PreRegistroController.obtenerEstadisticas);

/**
 * @swagger
 * /api/pre-registro/evento/{eventoId}/exportar:
 *   get:
 *     summary: Exportar pre-registros a Excel
 *     tags: [Pre-registro]
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
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [xlsx, csv]
 *           default: xlsx
 *         description: Formato de exportación
 *     responses:
 *       200:
 *         description: Archivo Excel/CSV
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Evento no encontrado
 */
router.get('/evento/:eventoId/exportar', authenticate, PreRegistroController.exportarExcel);

/**
 * @swagger
 * /api/pre-registro/admin/{id}/enviar-confirmacion:
 *   post:
 *     summary: Reenviar email de confirmación (admin)
 *     tags: [Pre-registro]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del registro
 *     responses:
 *       200:
 *         description: Email enviado exitosamente
 *       404:
 *         description: Registro no encontrado
 */
router.post('/admin/:id/enviar-confirmacion', authenticate, PreRegistroController.enviarConfirmacion);

// Middleware para validar permisos en rutas administrativas
router.use('/evento/:eventoId/*', authenticate, (req, res, next) => {
  // Verificar que el usuario tenga permisos para gestionar pre-registros
  const { user } = req;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado'
    });
  }

  // Solo administradores y organizadores pueden gestionar pre-registros
  const rolesPermitidos = ['administrador', 'organizador', 'coordinador'];
  const userRoles = user.roles ? user.roles.map(rol => rol.nombre_rol) : [];
  const tienePermiso = userRoles.some(rol => rolesPermitidos.includes(rol));
  
  if (!tienePermiso) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para realizar esta acción'
    });
  }

  next();
});

// Middleware para logging de acciones administrativas
router.use('/evento/:eventoId/*', (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log de la acción realizada
    console.log(`Pre-registro Admin Action: ${req.method} ${req.path} by user ${req.user?.id} - Status: ${res.statusCode}`);
    originalSend.call(this, data);
  };
  
  next();
});

module.exports = router;