const express = require('express');
const router = express.Router();
const ClasificacionTipoEventoController = require('../controllers/ClasificacionTipoEventoController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// ============================================================================
// RUTAS DE CONFIGURACIONES DE TIPOS DE EVENTO
// ============================================================================

// Obtener configuraciones por modalidad (todas las configuraciones de una modalidad específica)
router.get('/modalidad/:modalidad', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  ClasificacionTipoEventoController.getConfiguracionesByModalidad
);

// Obtener estadísticas de configuraciones por tipo de evento
router.get('/tipos/:tipo_evento_id/stats', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  ClasificacionTipoEventoController.getEstadisticasConfiguraciones
);

// Obtener información completa de tipo de evento con todas sus configuraciones
router.get('/tipos/:tipo_evento_id/completo', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  ClasificacionTipoEventoController.getInformacionCompletaTipoEvento
);

// Validar configuración de evento contra un tipo específico
router.post('/tipos/:tipo_evento_id/validar', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  ClasificacionTipoEventoController.validarConfiguracionEvento
);

// Obtener configuraciones por tipo de evento
router.get('/tipos/:tipo_evento_id/configuraciones', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  ClasificacionTipoEventoController.getConfiguracionesByTipo
);

// Obtener configuración específica por modalidad
router.get('/tipos/:tipo_evento_id/configuraciones/:modalidad', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  ClasificacionTipoEventoController.getConfiguracionByModalidad
);

// Crear configuración completa para un tipo de evento
router.post('/tipos/:tipo_evento_id/configuraciones', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  auditCreate,
  ClasificacionTipoEventoController.createConfiguracionCompleta
);

// Duplicar configuración existente
router.post('/configuraciones/:configuracion_id/duplicar', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  auditCreate,
  ClasificacionTipoEventoController.duplicarConfiguracion
);

// Actualizar configuración específica
router.put('/configuraciones/:configuracion_id', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  auditUpdate,
  ClasificacionTipoEventoController.updateConfiguracion
);

// Eliminar configuración específica
router.delete('/configuraciones/:configuracion_id', 
  authenticate, 
  authorize(['administrador']), 
  auditDelete,
  ClasificacionTipoEventoController.deleteConfiguracion
);

// ============================================================================
// RUTAS DE PLANTILLAS DE EVENTOS
// ============================================================================

// Obtener plantillas disponibles para un tipo de evento
router.get('/tipos/:tipo_evento_id/plantillas', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  ClasificacionTipoEventoController.getPlantillasDisponibles
);

// Aplicar plantilla a nuevo evento
router.post('/plantillas/:plantilla_id/aplicar', 
  authenticate, 
  authorize(['administrador', 'manager']), 
  ClasificacionTipoEventoController.aplicarPlantilla
);

module.exports = router;
