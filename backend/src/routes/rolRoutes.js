const express = require('express');
const router = express.Router();
const RolController = require('../controllers/RolController');
const { authenticate, authorize } = require('../middlewares/auth');
const { auditCreate, auditUpdate, auditDelete } = require('../middlewares/audit');

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: include_usuarios
 *         in: query
 *         description: Incluir usuarios asignados
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Lista de roles obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Rol'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', authenticate, authorize(['Administrador', 'Manager']), RolController.getAllRoles);

/**
 * @swagger
 * /api/roles/stats:
 *   get:
 *     summary: Obtener estadísticas de roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/stats', authenticate, authorize(['Administrador']), RolController.getRolStats);

router.get('/sin-usuarios', authenticate, authorize(['Administrador']), RolController.getRolesSinUsuarios);

// Nuevas rutas para auditoría y funcionalidad extendida
router.get('/eliminados', authenticate, authorize(['Administrador']), RolController.getRolesEliminados);
router.post('/:id/restore', authenticate, authorize(['Administrador']), RolController.restoreRol);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Obtener rol por ID
 *     tags: [Roles]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del rol
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: include_usuarios
 *         in: query
 *         description: Incluir usuarios asignados
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Rol obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Rol'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, authorize(['Administrador', 'Manager']), RolController.getRolById);

router.get('/nombre/:nombre', authenticate, authorize(['Administrador']), RolController.getRolByNombre);
router.get('/:id/usuarios', authenticate, authorize(['Administrador']), RolController.getUsuariosByRol);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear nuevo rol
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_rol
 *             properties:
 *               nombre_rol:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: Desarrollador
 *               descripcion:
 *                 type: string
 *                 example: Desarrollador de software con acceso completo
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Rol'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: El nombre del rol ya existe
 */
router.post('/', authenticate, authorize(['Administrador']), auditCreate, RolController.createRol);

router.put('/:id', authenticate, authorize(['Administrador']), auditUpdate, RolController.updateRol);
router.post('/:id/asignar', authenticate, authorize(['Administrador']), auditCreate, RolController.asignarRolAUsuario);
router.delete('/:id/remover', authenticate, authorize(['Administrador']), auditDelete, RolController.removerRolDeUsuario);
router.delete('/:id', authenticate, authorize(['Administrador']), auditDelete, RolController.deleteRol);

// Nuevas rutas para gestión de múltiples roles
router.post('/usuarios/:id/asignar-multiples', authenticate, authorize(['administrador']), auditCreate, RolController.asignarMultiplesRoles);
router.get('/usuarios/:id/roles', authenticate, authorize(['Administrador', 'Manager']), RolController.getRolesByUsuario);

module.exports = router;
