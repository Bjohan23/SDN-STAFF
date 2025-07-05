const express = require('express');
const router = express.Router();
const ClasificacionExpositorController = require('../controllers/ClasificacionExpositorController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// ==================== GESTIÓN DE CATEGORÍAS DE EMPRESAS ====================

// Obtener categorías de una empresa
router.get('/empresas/:empresaId/categorias', authenticate, authorize(['administrador', 'manager', 'editor']), ClasificacionExpositorController.getCategoriasEmpresa);

// Asignar categorías a una empresa
router.post('/empresas/:empresaId/categorias', authenticate, authorize(['administrador', 'manager']), auditCreate, ClasificacionExpositorController.asignarCategorias);

// Establecer categoría principal de una empresa
router.post('/empresas/:empresaId/categorias/:categoriaId/principal', authenticate, authorize(['administrador', 'manager']), auditUpdate, ClasificacionExpositorController.establecerCategoriaPrincipal);

// Remover categoría de una empresa
router.delete('/empresas/:empresaId/categorias/:categoriaId', authenticate, authorize(['administrador', 'manager']), auditDelete, ClasificacionExpositorController.removerCategoriaEmpresa);

// ==================== GESTIÓN DE ETIQUETAS DE EMPRESAS ====================

// Obtener etiquetas de una empresa
router.get('/empresas/:empresaId/etiquetas', authenticate, authorize(['administrador', 'manager', 'editor']), ClasificacionExpositorController.getEtiquetasEmpresa);

// Asignar etiquetas a una empresa
router.post('/empresas/:empresaId/etiquetas', authenticate, authorize(['administrador', 'manager']), auditCreate, ClasificacionExpositorController.asignarEtiquetas);

// Remover etiqueta de una empresa
router.delete('/empresas/:empresaId/etiquetas/:etiquetaId', authenticate, authorize(['administrador', 'manager']), auditDelete, ClasificacionExpositorController.removerEtiquetaEmpresa);

// ==================== BÚSQUEDA Y FILTRADO ====================

// Buscar empresas por categorías
router.get('/buscar/categorias', authenticate, authorize(['administrador', 'manager', 'editor']), ClasificacionExpositorController.buscarEmpresasPorCategorias);

// Buscar empresas por etiquetas
router.get('/buscar/etiquetas', authenticate, authorize(['administrador', 'manager', 'editor']), ClasificacionExpositorController.buscarEmpresasPorEtiquetas);

// ==================== BÚSQUEDA PÚBLICA ====================

// Buscar empresas por categorías (público)
router.get('/publico/buscar/categorias', ClasificacionExpositorController.buscarEmpresasPorCategorias);

// Buscar empresas por etiquetas (público)
router.get('/publico/buscar/etiquetas', ClasificacionExpositorController.buscarEmpresasPorEtiquetas);

// ==================== DIRECTORIOS Y REPORTES ====================

// Generar directorio temático por categoría
router.get('/directorio/categoria/:categoriaId', authenticate, authorize(['administrador', 'manager', 'editor']), ClasificacionExpositorController.generarDirectorioTematico);

// Generar directorio temático público
router.get('/publico/directorio/categoria/:categoriaId', ClasificacionExpositorController.generarDirectorioTematico);

// Obtener estadísticas de clasificación
router.get('/stats', authenticate, authorize(['administrador', 'manager']), ClasificacionExpositorController.getEstadisticasClasificacion);

module.exports = router;
