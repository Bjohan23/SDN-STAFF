const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

/**
 * Rutas de Usuario
 * Base URL: /api/users
 */

// GET /api/users - Obtener todos los usuarios
router.get('/', UserController.getAllUsers);

// GET /api/users/stats - Obtener estadísticas de usuarios
router.get('/stats', UserController.getUserStats);

// GET /api/users/profile - Obtener perfil del usuario autenticado
router.get('/profile', UserController.getProfile);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', UserController.getUserById);

// POST /api/users - Crear nuevo usuario
router.post('/', UserController.createUser);

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', UserController.updateUser);

// DELETE /api/users/:id - Eliminar usuario (soft delete)
router.delete('/:id', UserController.deleteUser);

module.exports = router;
