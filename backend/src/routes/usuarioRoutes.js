const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');
const { authenticate, authorize, verifySelfOrAdmin } = require('../middlewares/auth');

router.get('/', authenticate, authorize(['administrador', 'Manager']), UsuarioController.getAllUsuarios);

router.get('/stats', authenticate, authorize(['administrador']), UsuarioController.getUsuarioStats);

router.get('/profile', authenticate, UsuarioController.getProfile);

router.put('/profile', authenticate, UsuarioController.updateProfile);

router.get('/:id', authenticate, verifySelfOrAdmin, UsuarioController.getUsuarioById);

router.get('/correo/:correo', authenticate, authorize(['administrador']), UsuarioController.getUsuarioBycorreo);

router.post('/', authenticate, authorize(['administrador']), UsuarioController.createUsuario);

router.put('/:id', authenticate, verifySelfOrAdmin, UsuarioController.updateUsuario);

router.patch('/:id/estado', authenticate, authorize(['administrador']), UsuarioController.cambiarEstado);

router.post('/:id/roles', authenticate, authorize(['administrador']), UsuarioController.assignRoles);

router.get('/:id/rol', authenticate, UsuarioController.verificarRol);
router.delete('/:id', authenticate, authorize(['administrador']), UsuarioController.deleteUsuario);

module.exports = router;
