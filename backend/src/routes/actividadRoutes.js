const express = require('express');
const router = express.Router();
const ActividadController = require('../controllers/ActividadController');

// Listar actividades con filtros
router.get('/', ActividadController.listar);

// Obtener actividad por ID
router.get('/:id', ActividadController.obtenerPorId);

// Crear nueva actividad
router.post('/', ActividadController.crear);

// Actualizar actividad existente
router.put('/:id', ActividadController.actualizar);

// Eliminar (soft delete) actividad
router.delete('/:id', ActividadController.eliminar);

module.exports = router;
