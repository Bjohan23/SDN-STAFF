const express = require('express');
const router = express.Router();
const RolController = require('../controllers/RolController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

router.get('/', authenticate, authorize(['administrador', 'manager']), RolController.getAllRoles);

router.get('/stats', authenticate, authorize(['administrador']), RolController.getRolStats);

router.get('/sin-usuarios', authenticate, authorize(['administrador']), RolController.getRolesSinUsuarios);

// Nuevas rutas para auditoría y funcionalidad extendida
router.get('/eliminados', authenticate, authorize(['administrador']), RolController.getRolesEliminados);
router.post('/:id/restore', authenticate, authorize(['administrador']), RolController.restoreRol);

router.get('/:id', authenticate, authorize(['administrador', 'manager']), RolController.getRolById);

router.get('/nombre/:nombre', authenticate, authorize(['administrador']), RolController.getRolByNombre);
router.get('/:id/usuarios', authenticate, authorize(['administrador']), RolController.getUsuariosByRol);

router.post('/', authenticate, authorize(['administrador']), auditCreate, RolController.createRol);

router.put('/:id', authenticate, authorize(['administrador']), auditUpdate, RolController.updateRol);
router.post('/:id/asignar', authenticate, authorize(['administrador']), auditCreate, RolController.asignarRolAUsuario);
router.delete('/:id/remover', authenticate, authorize(['administrador']), auditDelete, RolController.removerRolDeUsuario);
router.delete('/:id', authenticate, authorize(['administrador']), auditDelete, RolController.deleteRol);

// Nuevas rutas para gestión de múltiples roles
router.post('/usuarios/:id/asignar-multiples', authenticate, authorize(['administrador']), auditCreate, RolController.asignarMultiplesRoles);
router.get('/usuarios/:id/roles', authenticate, authorize(['administrador', 'manager']), RolController.getRolesByUsuario);

module.exports = router;
