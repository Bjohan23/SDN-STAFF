const express = require('express');
const router = express.Router();
const AsignacionAutomaticaController = require('../controllers/AsignacionAutomaticaController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate } = require('../middlewares/audit');

// ==================== RUTAS PROTEGIDAS - CONSULTAS ====================

// Obtener algoritmos disponibles y sus descripciones
router.get('/automatica/algoritmos', authenticate, authorize(['administrador', 'manager', 'Editor']), AsignacionAutomaticaController.getAlgoritmosDisponibles);

// Obtener reporte de capacidad de asignación para un evento
router.get('/automatica/evento/:evento_id/capacidad', authenticate, authorize(['administrador', 'manager', 'Editor']), AsignacionAutomaticaController.getReporteCapacidadAsignacion);

// Obtener métricas de rendimiento de asignaciones automáticas
router.get('/automatica/metricas', authenticate, authorize(['administrador', 'manager']), AsignacionAutomaticaController.getMetricasRendimiento);

// Validar compatibilidad entre empresa y stand
router.post('/automatica/compatibilidad/:empresa_id/:stand_id', authenticate, authorize(['administrador', 'manager', 'Editor']), AsignacionAutomaticaController.validarCompatibilidad);

// Obtener mejores candidatos de stands para una empresa
router.post('/automatica/candidatos/:empresa_id/:evento_id', authenticate, authorize(['administrador', 'manager', 'Editor']), AsignacionAutomaticaController.getMejoresCandidatos);

// ==================== RUTAS PROTEGIDAS - EJECUCIÓN ====================

// Simular asignación automática sin ejecutar (para pruebas)
router.post('/automatica/evento/:evento_id/simular', authenticate, authorize(['administrador', 'manager']), AsignacionAutomaticaController.simularAsignacionAutomatica);

// Ejecutar asignación automática real para un evento
router.post('/automatica/evento/:evento_id/ejecutar', authenticate, authorize(['administrador']), auditCreate, AsignacionAutomaticaController.ejecutarAsignacionAutomatica);

module.exports = router;
