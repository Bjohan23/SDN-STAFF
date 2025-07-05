const express = require('express');
const router = express.Router();
const CategoriaComercialController = require('../controllers/CategoriaComercialController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// ==================== RUTAS PÚBLICAS ====================

// Obtener categorías públicas (para visitantes)
router.get('/publicas', CategoriaComercialController.getAllCategorias);

// Obtener árbol jerárquico público
router.get('/arbol', CategoriaComercialController.getArbolJerarquico);

// Obtener categorías destacadas
router.get('/destacadas', CategoriaComercialController.getCategoriasDestacadas);

// Buscar categorías (público)
router.get('/buscar', CategoriaComercialController.buscarCategorias);

// Obtener categoría específica (público)
router.get('/:id/publico', CategoriaComercialController.getCategoriaById);

// ==================== RUTAS PROTEGIDAS ====================

// Obtener todas las categorías (admin/manager)
router.get('/', authenticate, authorize(['administrador', 'manager']), CategoriaComercialController.getAllCategorias);

// Obtener estadísticas de categorías
router.get('/stats', authenticate, authorize(['administrador', 'manager']), CategoriaComercialController.getEstadisticasCategorias);

// Obtener categoría por ID
router.get('/:id', authenticate, authorize(['administrador', 'manager']), CategoriaComercialController.getCategoriaById);

// Crear nueva categoría
router.post('/', authenticate, authorize(['administrador']), auditCreate, CategoriaComercialController.createCategoria);

// Actualizar categoría
router.put('/:id', authenticate, authorize(['administrador']), auditUpdate, CategoriaComercialController.updateCategoria);

// Eliminar categoría
router.delete('/:id', authenticate, authorize(['administrador']), auditDelete, CategoriaComercialController.deleteCategoria);

// Actualizar contadores de una categoría
router.post('/:id/actualizar-contadores', authenticate, authorize(['administrador']), CategoriaComercialController.actualizarContadores);

module.exports = router;
