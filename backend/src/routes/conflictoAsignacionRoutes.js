const express = require('express');
const router = express.Router();
const ConflictoAsignacionController = require('../controllers/ConflictoAsignacionController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// ==================== RUTAS PROTEGIDAS - CONSULTAS ====================

// Obtener todos los conflictos de asignación
router.get('/conflictos', authenticate, authorize(['administrador', 'manager', 'Editor']), ConflictoAsignacionController.getAllConflictos);

// Obtener conflicto específico por ID
router.get('/conflictos/:id', authenticate, authorize(['administrador', 'manager', 'Editor']), ConflictoAsignacionController.getConflictoById);

// Obtener conflictos vencidos
router.get('/conflictos/vencidos', authenticate, authorize(['administrador', 'manager']), ConflictoAsignacionController.getConflictosVencidos);

// Obtener estadísticas de conflictos
router.get('/conflictos/stats', authenticate, authorize(['administrador', 'manager']), ConflictoAsignacionController.getEstadisticas);

// Obtener conflictos asignados a un usuario específico
router.get('/conflictos/usuario/:usuario_id', authenticate, authorize(['administrador', 'manager', 'Editor']), ConflictoAsignacionController.getConflictosAsignadosUsuario);

// Obtener resumen de conflictos para dashboard
router.get('/conflictos/dashboard/resumen', authenticate, authorize(['administrador', 'manager']), ConflictoAsignacionController.getResumenDashboard);

// ==================== RUTAS PROTEGIDAS - GESTIÓN ====================

// Crear conflicto manualmente
router.post('/conflictos', authenticate, authorize(['administrador', 'manager']), auditCreate, ConflictoAsignacionController.createConflicto);

// Detectar conflictos automáticamente para un evento
router.post('/conflictos/evento/:evento_id/detectar', authenticate, authorize(['administrador', 'manager']), ConflictoAsignacionController.detectarConflictosEvento);

// Asignar conflicto a usuario para resolución
router.post('/conflictos/:id/asignar', authenticate, authorize(['administrador', 'manager']), auditUpdate, ConflictoAsignacionController.asignarConflicto);

// Resolver conflicto
router.post('/conflictos/:id/resolver', authenticate, authorize(['administrador', 'manager']), auditUpdate, ConflictoAsignacionController.resolverConflicto);

// Escalar conflicto
router.post('/conflictos/:id/escalar', authenticate, authorize(['administrador', 'manager']), auditUpdate, ConflictoAsignacionController.escalarConflicto);

// Cancelar conflicto
router.post('/conflictos/:id/cancelar', authenticate, authorize(['administrador', 'manager']), auditUpdate, ConflictoAsignacionController.cancelarConflicto);

// Añadir comunicación a conflicto
router.post('/conflictos/:id/comunicacion', authenticate, authorize(['administrador', 'manager', 'Editor']), ConflictoAsignacionController.addComunicacion);

// ==================== RUTAS ADMINISTRATIVAS ====================

// Eliminar conflicto (soft delete)
router.delete('/conflictos/:id', authenticate, authorize(['administrador']), auditDelete, ConflictoAsignacionController.deleteConflicto);

module.exports = router;
