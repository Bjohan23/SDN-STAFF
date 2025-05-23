const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

/**
 * Rutas de Usuario - Nuevo modelo Usuario
 * Base URL: /api/usuarios
 */

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', UsuarioController.getAllUsuarios);

// GET /api/usuarios/stats - Obtener estadísticas de usuarios
router.get('/stats', UsuarioController.getUsuarioStats);

// POST /api/usuarios/login - Login de usuario
router.post('/login', UsuarioController.login);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', UsuarioController.getUsuarioById);

// GET /api/usuarios/username/:username - Obtener usuario por username
router.get('/username/:username', UsuarioController.getUsuarioByUsername);

// POST /api/usuarios - Crear nuevo usuario
router.post('/', UsuarioController.createUsuario);

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', UsuarioController.updateUsuario);

// PATCH /api/usuarios/:id/estado - Cambiar estado de usuario
router.patch('/:id/estado', UsuarioController.cambiarEstado);

// POST /api/usuarios/:id/roles - Asignar roles a usuario
router.post('/:id/roles', UsuarioController.assignRoles);

// GET /api/usuarios/:id/rol - Verificar si usuario tiene rol específico
router.get('/:id/rol', UsuarioController.verificarRol);

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', UsuarioController.deleteUsuario);

module.exports = router;
