const express = require('express');
const router = express.Router();
const StandController = require('../controllers/StandController');
const { authenticate, authorize } = require('../middlewares/auth');

// Rutas públicas (consultas básicas)
router.get('/', StandController.getAllStands);
router.get('/stats', StandController.getStandStats);
router.get('/mantenimiento', StandController.getStandsMantenimiento);
router.get('/:id', StandController.getStandById);
router.get('/numero/:numero', StandController.getStandByNumero);
router.get('/numero/:numero/disponible', StandController.verificarNumeroDisponible);

// Rutas específicas de eventos
router.get('/evento/:evento_id/disponibles', StandController.getStandsDisponiblesParaEvento);
router.get('/:id/evento/:evento_id/asignacion', StandController.getAsignacionEvento);

// Rutas protegidas - Solo admin y organizadores
router.post('/', 
  authenticate, 
  authorize(['Administrador', 'Editor']), 
  StandController.createStand
);

router.put('/:id', 
  authenticate, 
  authorize(['Administrador', 'Editor']), 
  StandController.updateStand
);

router.delete('/:id', 
  authenticate, 
  authorize(['Administrador']), 
  StandController.deleteStand
);

router.patch('/:id/estado-fisico', 
  authenticate, 
  authorize(['Administrador', 'Editor']), 
  StandController.cambiarEstadoFisico
);

router.post('/:id/asignar-evento', 
  authenticate, 
  authorize(['Administrador', 'Editor']), 
  StandController.asignarAEvento
);

// Rutas administrativas
router.post('/carga-masiva', 
  authenticate, 
  authorize(['Administrador']), 
  StandController.cargaMasivaCSV
);

router.post('/:id/restore', 
  authenticate, 
  authorize(['Administrador']), 
  StandController.restoreStand
);

module.exports = router;
