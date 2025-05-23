const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener lista de usuarios
 *     tags: [Usuarios]
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: estado
 *         in: query
 *         description: Filtrar por estado
 *         schema:
 *           type: string
 *           enum: [activo, inactivo, suspendido]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', UsuarioController.getAllUsuarios);

/**
 * @swagger
 * /api/usuarios/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/stats', UsuarioController.getUsuarioStats);

/**
 * @swagger
 * /api/usuarios/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/login', UsuarioController.login);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Usuario'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.get('/:id', UsuarioController.getUsuarioById);

/**
 * @swagger
 * /api/usuarios/username/{username}:
 *   get:
 *     summary: Obtener usuario por username
 *     tags: [Usuarios]
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: Nombre de usuario
 *         schema:
 *           type: string
 *           example: admin
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Usuario'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/username/:username', UsuarioController.getUsuarioByUsername);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: newuser
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *                 default: activo
 *               roles:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Usuario'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: El username ya existe
 */
router.post('/', UsuarioController.createUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               password:
 *                 type: string
 *                 minLength: 6
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *               roles:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Usuario'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.put('/:id', UsuarioController.updateUsuario);

/**
 * @swagger
 * /api/usuarios/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *                 example: suspendido
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/estado', UsuarioController.cambiarEstado);

/**
 * @swagger
 * /api/usuarios/{id}/roles:
 *   post:
 *     summary: Asignar roles a usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 */
router.post('/:id/roles', UsuarioController.assignRoles);

/**
 * @swagger
 * /api/usuarios/{id}/rol:
 *   get:
 *     summary: Verificar si usuario tiene rol específico
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *       - name: rol
 *         in: query
 *         required: true
 *         description: Nombre del rol a verificar
 *         schema:
 *           type: string
 *           example: Administrador
 *     responses:
 *       200:
 *         description: Verificación completada
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         tieneRol:
 *                           type: boolean
 *                           example: true
 */
router.get('/:id/rol', UsuarioController.verificarRol);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', UsuarioController.deleteUsuario);

module.exports = router;
