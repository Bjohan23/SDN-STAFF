const express = require('express');
const router = express.Router();
const SolicitudAsignacionController = require('../controllers/SolicitudAsignacionController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// ==================== RUTAS PÚBLICAS ====================

// Crear solicitud de asignación (empresas pueden auto-registrarse)
router.post('/solicitudes', authenticate, auditCreate, SolicitudAsignacionController.createSolicitud);

// ==================== RUTAS PROTEGIDAS - CONSULTAS ====================

// Obtener todas las solicitudes de asignación
router.get('/solicitudes', authenticate, authorize(['administrador', 'manager', 'Editor']), SolicitudAsignacionController.getAllSolicitudes);

// Obtener solicitud específica por ID
router.get('/solicitudes/:id', authenticate, authorize(['administrador', 'manager', 'Editor']), SolicitudAsignacionController.getSolicitudById);

// Obtener solicitudes pendientes de un evento específico
router.get('/solicitudes/evento/:evento_id/pendientes', authenticate, authorize(['administrador', 'manager', 'Editor']), SolicitudAsignacionController.getSolicitudesPendientesEvento);

// Obtener estadísticas de solicitudes
router.get('/solicitudes/stats', authenticate, authorize(['administrador', 'manager']), SolicitudAsignacionController.getEstadisticas);

// Obtener historial de una solicitud específica
router.get('/solicitudes/:id/historial', authenticate, authorize(['administrador', 'manager', 'Editor']), SolicitudAsignacionController.getHistorialSolicitud);

// ==================== RUTAS PROTEGIDAS - GESTIÓN ====================

// Aprobar solicitud de asignación
router.post('/solicitudes/:id/aprobar', authenticate, authorize(['administrador', 'manager']), auditUpdate, SolicitudAsignacionController.aprobarSolicitud);

// Rechazar solicitud de asignación
router.post('/solicitudes/:id/rechazar', authenticate, authorize(['administrador', 'manager']), auditUpdate, SolicitudAsignacionController.rechazarSolicitud);

// Asignar stand a solicitud aprobada
router.post('/solicitudes/:id/asignar-stand', authenticate, authorize(['administrador', 'manager']), auditUpdate, SolicitudAsignacionController.asignarStand);

// Cancelar solicitud
router.post('/solicitudes/:id/cancelar', authenticate, authorize(['administrador', 'manager']), auditUpdate, SolicitudAsignacionController.cancelarSolicitud);

// Actualizar solicitud (campos limitados según estado)
router.put('/solicitudes/:id', authenticate, authorize(['administrador', 'manager', 'Editor']), auditUpdate, SolicitudAsignacionController.updateSolicitud);

// ==================== RUTAS ADMINISTRATIVAS ====================

// Eliminar solicitud (soft delete)
router.delete('/solicitudes/:id', authenticate, authorize(['administrador']), auditDelete, SolicitudAsignacionController.deleteSolicitud);

// Restaurar solicitud eliminada
router.post('/solicitudes/:id/restore', authenticate, authorize(['administrador']), SolicitudAsignacionController.restoreSolicitud);

module.exports = router;
