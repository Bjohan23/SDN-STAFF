const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticate, authorize } = require('../middlewares/auth');

/**
 * Rutas de Usuario (Modelo anterior - Compatibilidad)
 * Base URL: /api/users
 * NOTA: Todas las rutas están protegidas con JWT
 */

// GET /api/users - Obtener todos los usuarios (Solo Admin/Manager)
router.get('/', authenticate, authorize(['Administrador', 'Manager']), UserController.getAllUsers);

// GET /api/users/stats - Obtener estadísticas de usuarios (Solo Admin)
router.get('/stats', authenticate, authorize(['Administrador']), UserController.getUserStats);

// GET /api/users/profile - Obtener perfil del usuario autenticado
router.get('/profile', authenticate, UserController.getProfile);

// GET /api/users/:id - Obtener usuario por ID (Self/Admin)
router.get('/:id', authenticate, UserController.getUserById);

// POST /api/users - Crear nuevo usuario (Solo Admin)
router.post('/', authenticate, authorize(['Administrador']), UserController.createUser);

// PUT /api/users/:id - Actualizar usuario (Self/Admin) 
router.put('/:id', authenticate, UserController.updateUser);

// DELETE /api/users/:id - Eliminar usuario (Solo Admin)
router.delete('/:id', authenticate, authorize(['Administrador']), UserController.deleteUser);

module.exports = router;
