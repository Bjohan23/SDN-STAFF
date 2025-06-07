const express = require('express');
const router = express.Router();
const EventoController = require('../controllers/EventoController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

// Rutas públicas (sin autenticación)
// Obtener evento por URL amigable (público para vista de evento)
router.get('/public/url/:url', EventoController.getEventoByUrl);

// Verificar disponibilidad de URL amigable
router.get('/check-url/:url', authenticate, EventoController.verificarUrlAmigable);

// Obtener todos los eventos
router.get('/', authenticate, authorize(['administrador', 'manager']), EventoController.getAllEventos);

// Obtener estadísticas de eventos
router.get('/stats', authenticate, authorize(['administrador']), EventoController.getEventoStats);

// Obtener eventos próximos
router.get('/proximos', authenticate, authorize(['administrador', 'manager']), EventoController.getEventosProximos);

// Obtener eventos activos
router.get('/activos', authenticate, authorize(['administrador', 'manager']), EventoController.getEventosActivos);

// Vista previa del evento
router.get('/:id/preview', authenticate, authorize(['administrador', 'manager']), EventoController.previewEvento);

// Duplicar evento
router.post('/:id/duplicate', authenticate, authorize(['administrador', 'manager']), auditCreate, EventoController.duplicarEvento);

// Restaurar evento eliminado
router.post('/:id/restore', authenticate, authorize(['administrador']), EventoController.restoreEvento);

// Obtener evento por ID
router.get('/:id', authenticate, authorize(['administrador', 'manager']), EventoController.getEventoById);

// Crear nuevo evento
router.post('/', authenticate, authorize(['administrador', 'manager']), auditCreate, EventoController.createEvento);

// Actualizar evento
router.put('/:id', authenticate, authorize(['administrador', 'manager']), auditUpdate, EventoController.updateEvento);

// Cambiar estado del evento
router.patch('/:id/estado', authenticate, authorize(['administrador', 'manager']), auditUpdate, EventoController.cambiarEstado);

// Eliminar evento
router.delete('/:id', authenticate, authorize(['administrador']), auditDelete, EventoController.deleteEvento);

module.exports = router;
