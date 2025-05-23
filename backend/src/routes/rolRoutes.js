const express = require('express');
const router = express.Router();
const RolController = require('../controllers/RolController');

/**
 * Rutas de Rol
 * Base URL: /api/roles
 */

// GET /api/roles - Obtener todos los roles
router.get('/', RolController.getAllRoles);

// GET /api/roles/stats - Obtener estadísticas de roles
router.get('/stats', RolController.getRolStats);

// GET /api/roles/sin-usuarios - Obtener roles sin usuarios asignados
router.get('/sin-usuarios', RolController.getRolesSinUsuarios);

// GET /api/roles/:id - Obtener rol por ID
router.get('/:id', RolController.getRolById);

// GET /api/roles/nombre/:nombre - Obtener rol por nombre
router.get('/nombre/:nombre', RolController.getRolByNombre);

// GET /api/roles/:id/usuarios - Obtener usuarios asignados a un rol
router.get('/:id/usuarios', RolController.getUsuariosByRol);

// POST /api/roles - Crear nuevo rol
router.post('/', RolController.createRol);

// PUT /api/roles/:id - Actualizar rol
router.put('/:id', RolController.updateRol);

// POST /api/roles/:id/asignar - Asignar rol a usuario
router.post('/:id/asignar', RolController.asignarRolAUsuario);

// DELETE /api/roles/:id/remover - Remover rol de usuario
router.delete('/:id/remover', RolController.removerRolDeUsuario);

// DELETE /api/roles/:id - Eliminar rol
router.delete('/:id', RolController.deleteRol);

module.exports = router;
