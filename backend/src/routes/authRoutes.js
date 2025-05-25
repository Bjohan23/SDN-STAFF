const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate, optionalAuth } = require('../middlewares/auth');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtenido del endpoint de login
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Nombre de usuario
 *                 example: admin
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/Usuario'
 *                     accessToken:
 *                       type: string
 *                       description: Token JWT de acceso
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     refreshToken:
 *                       type: string
 *                       description: Token de renovación
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     tokenInfo:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: Bearer
 *                         expiresIn:
 *                           type: string
 *                           example: 6h
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         issuedAt:
 *                           type: string
 *                           format: date-time
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Credenciales inválidas o usuario inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token de acceso
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Token de renovación obtenido en el login
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token renovado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token renovado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: Nuevo token JWT de acceso
 *                     tokenInfo:
 *                       type: object
 *                       properties:
 *                         type:
 *                           type: string
 *                           example: Bearer
 *                         expiresIn:
 *                           type: string
 *                           example: 6h
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         issuedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/logout', authenticate, AuthController.logout);
/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar validez del token
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token válido
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         id_usuario:
 *                           type: integer
 *                         correo:
 *                           type: string
 *                         roles:
 *                           type: array
 *                           items:
 *                             type: object
 *                     tokenInfo:
 *                       type: object
 *                       properties:
 *                         issuedAt:
 *                           type: string
 *                           format: date-time
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                         remainingTime:
 *                           type: integer
 *                           description: Tiempo restante en segundos
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/verify', AuthController.verifyToken);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
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
 *                         id_usuario:
 *                           type: integer
 *                         correo:
 *                           type: string
 *                         estado:
 *                           type: string
 *                         roles:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Rol'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/me', authenticate, AuthController.getCurrentUser);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil completo del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
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
 */
router.get('/profile', authenticate, AuthController.getProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Cambiar contraseña del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual
 *                 example: admin123
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña
 *                 minLength: 6
 *                 example: newpassword123
 *               confirmPassword:
 *                 type: string
 *                 description: Confirmación de nueva contraseña
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Error de validación o contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/change-password', authenticate, AuthController.changePassword);

/**
 * @swagger
 * /api/auth/token-info:
 *   get:
 *     summary: Obtener información del token actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del token obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Información del token obtenida exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de expiración del token
 *                     issuedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de emisión del token
 *                     remainingTime:
 *                       type: integer
 *                       description: Tiempo restante en segundos
 *                     remainingTimeFormatted:
 *                       type: string
 *                       description: Tiempo restante en formato legible
 *                       example: "5h 30m 45s"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/token-info', authenticate, AuthController.getTokenInfo);

/**
 * @swagger
 * /api/auth/public:
 *   get:
 *     summary: Endpoint público de prueba
 *     tags: [Público]
 *     description: Este endpoint no requiere autenticación y muestra el estado de la API
 *     responses:
 *       200:
 *         description: API funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API funcionando correctamente - Endpoint público
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 🚀 API SDN-STAFF corriendo correctamente
 *                     status:
 *                       type: string
 *                       example: online
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     public:
 *                       type: boolean
 *                       example: true
 *                     authentication:
 *                       type: string
 *                       example: Este endpoint es público y no requiere autenticación
 *                     documentation:
 *                       type: string
 *                       example: http://localhost:8000/api-docs
 *                     endpoints:
 *                       type: object
 *                       properties:
 *                         login:
 *                           type: string
 *                           example: POST /api/auth/login
 *                         register:
 *                           type: string
 *                           example: POST /api/usuarios
 *                         protected:
 *                           type: string
 *                           example: Todos los demás endpoints requieren Bearer token
 *                         health:
 *                           type: string
 *                           example: GET /health (público)
 */
router.get('/public', AuthController.publicEndpoint);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - password
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Correo del usuario
 *                 example: usuario@ejemplo.com
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario (mínimo 6 caracteres)
 *                 example: password123
 *               estado:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *                 default: activo
 *                 description: Estado del usuario
 *               roles:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array de IDs de roles
 *                 example: [1]
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Usuario registrado exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
module.exports = router;
