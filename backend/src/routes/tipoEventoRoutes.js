const express = require('express');
const router = express.Router();
const TipoEventoController = require('../controllers/TipoEventoController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// Obtener todos los tipos de evento
router.get('/', authenticate, authorize(['administrador', 'manager']), TipoEventoController.getAllTiposEvento);

// Obtener estadísticas de tipos de evento
router.get('/stats', authenticate, authorize(['administrador']), TipoEventoController.getTipoEventoStats);

// Obtener tipos sin eventos
router.get('/sin-eventos', authenticate, authorize(['administrador']), TipoEventoController.getTiposSinEventos);

// Obtener tipos eliminados
router.get('/eliminados', authenticate, authorize(['administrador']), TipoEventoController.getTiposEliminados);

// Restaurar tipo eliminado
router.post('/:id/restore', authenticate, authorize(['administrador']), TipoEventoController.restoreTipoEvento);

// Obtener tipo de evento por ID
router.get('/:id', authenticate, authorize(['administrador', 'manager']), TipoEventoController.getTipoEventoById);

// Obtener tipo de evento por nombre
router.get('/nombre/:nombre', authenticate, authorize(['administrador', 'manager']), TipoEventoController.getTipoEventoByNombre);

// Obtener eventos por tipo
router.get('/:id/eventos', authenticate, authorize(['administrador', 'manager']), TipoEventoController.getEventosByTipo);

// Crear nuevo tipo de evento
router.post('/', authenticate, authorize(['administrador']), auditCreate, TipoEventoController.createTipoEvento);

// Actualizar tipo de evento
router.put('/:id', authenticate, authorize(['administrador']), auditUpdate, TipoEventoController.updateTipoEvento);

// Eliminar tipo de evento
router.delete('/:id', authenticate, authorize(['administrador']), auditDelete, TipoEventoController.deleteTipoEvento);

module.exports = router;
