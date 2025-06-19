const express = require('express');
const router = express.Router();
const ServicioAdicionalController = require('../controllers/ServicioAdicionalController');
const { authenticate, authorize } = require('../middlewares/auth');

// Rutas públicas (catálogo de servicios)
router.get('/', ServicioAdicionalController.getAllServiciosAdicionales);
router.get('/stats', ServicioAdicionalController.getServiciosStats);
router.get('/populares', ServicioAdicionalController.getServiciosPopulares);
router.get('/categoria/:categoria', ServicioAdicionalController.getServiciosPorCategoria);
router.get('/compatibles/:tipo_stand', ServicioAdicionalController.getServiciosCompatibles);
router.get('/:id', ServicioAdicionalController.getServicioAdicionalById);
router.get('/:id/calcular-precio', ServicioAdicionalController.calcularPrecioServicio);

// Rutas de contrataciones
router.get('/contratacion/:id', ServicioAdicionalController.getContratacionServicio);
router.get('/stand/:stand_id/evento/:evento_id', ServicioAdicionalController.getServiciosContratadosStandEvento);

// Rutas protegidas - Contratación de servicios (empresas)
router.post('/:id/contratar', 
  authenticate, 
  authorize(['administrador', 'editor', 'usuario']), 
  ServicioAdicionalController.contratarServicio
);

router.put('/contratacion/:id/estado', 
  authenticate, 
  authorize(['administrador', 'editor']), 
  ServicioAdicionalController.actualizarEstadoContratacion
);

// Rutas protegidas - Solo admin y organizadores
router.post('/', 
  authenticate, 
  authorize(['administrador', 'editor']), 
  ServicioAdicionalController.createServicioAdicional
);

router.put('/:id', 
  authenticate, 
  authorize(['administrador', 'editor']), 
  ServicioAdicionalController.updateServicioAdicional
);

router.delete('/:id', 
  authenticate, 
  authorize(['administrador']), 
  ServicioAdicionalController.deleteServicioAdicional
);

// Rutas administrativas
router.post('/:id/restore', 
  authenticate, 
  authorize(['administrador']), 
  ServicioAdicionalController.restoreServicioAdicional
);

module.exports = router;
