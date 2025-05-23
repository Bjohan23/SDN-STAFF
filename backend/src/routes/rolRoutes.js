const express = require('express');
const router = express.Router();
const RolController = require('../controllers/RolController');

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
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
 */
router.get('/', RolController.getAllRoles);

/**
 * @swagger
 * /api/roles/stats:
 *   get:
 *     summary: Obtener estadísticas de roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/stats', RolController.getRolStats);

router.get('/sin-usuarios', RolController.getRolesSinUsuarios);

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
router.get('/:id', RolController.getRolById);

router.get('/nombre/:nombre', RolController.getRolByNombre);
router.get('/:id/usuarios', RolController.getUsuariosByRol);

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
router.post('/', RolController.createRol);

router.put('/:id', RolController.updateRol);
router.post('/:id/asignar', RolController.asignarRolAUsuario);
router.delete('/:id/remover', RolController.removerRolDeUsuario);
router.delete('/:id', RolController.deleteRol);

module.exports = router;
