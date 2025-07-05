const express = require('express');
const router = express.Router();
const EtiquetaLibreController = require('../controllers/EtiquetaLibreController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// ==================== RUTAS PÚBLICAS ====================

// Obtener etiquetas públicas (para visitantes)
router.get('/publicas', EtiquetaLibreController.getAllEtiquetas);

// Obtener etiquetas por tipo
router.get('/tipo/:tipo', EtiquetaLibreController.getEtiquetasPorTipo);

// Obtener etiquetas destacadas
router.get('/destacadas', EtiquetaLibreController.getEtiquetasDestacadas);

// Buscar etiquetas (público)
router.get('/buscar', EtiquetaLibreController.buscarEtiquetas);

// Obtener tipos de etiqueta disponibles
router.get('/tipos', EtiquetaLibreController.getTiposEtiqueta);

// Obtener etiqueta específica (público)
router.get('/:id/publico', EtiquetaLibreController.getEtiquetaById);

// ==================== RUTAS PROTEGIDAS ====================

// Obtener todas las etiquetas (admin/manager)
router.get('/', authenticate, authorize(['administrador', 'manager']), EtiquetaLibreController.getAllEtiquetas);

// Obtener estadísticas de etiquetas
router.get('/stats', authenticate, authorize(['administrador', 'manager']), EtiquetaLibreController.getEstadisticasEtiquetas);

// Obtener sugerencias para una empresa
router.get('/sugerencias/:empresaId', authenticate, authorize(['administrador', 'manager', 'editor']), EtiquetaLibreController.getSugerenciasParaEmpresa);

// Obtener etiqueta por ID
router.get('/:id', authenticate, authorize(['administrador', 'manager']), EtiquetaLibreController.getEtiquetaById);

// Crear nueva etiqueta
router.post('/', authenticate, authorize(['administrador']), auditCreate, EtiquetaLibreController.createEtiqueta);

// Actualizar etiqueta
router.put('/:id', authenticate, authorize(['administrador']), auditUpdate, EtiquetaLibreController.updateEtiqueta);

// Eliminar etiqueta
router.delete('/:id', authenticate, authorize(['administrador']), auditDelete, EtiquetaLibreController.deleteEtiqueta);

// Actualizar contadores de una etiqueta
router.post('/:id/actualizar-contadores', authenticate, authorize(['administrador']), EtiquetaLibreController.actualizarContadores);

module.exports = router;
