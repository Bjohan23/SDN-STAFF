const AuthService = require('../services/AuthService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');
const JWTUtils = require('../utils/JWTUtils');
const nodemailer = require('nodemailer');
const { setResetCode, getResetData, clearResetCode } = require('../services/PasswordResetService');
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Controlador de Autenticación
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const resetRequestTimestamps = {};

class AuthController {
  static async forgotPassword(req, res, next) {
    try {
      const { correo } = req.body;
      if (!correo) return res.status(400).json({ message: 'Correo requerido' });

      // Limitar generación de código a 1 cada 4 minutos
      const now = Date.now();
      const lastRequest = resetRequestTimestamps[correo];
      if (lastRequest && now - lastRequest < 4 * 60 * 1000) {
        const secondsLeft = Math.ceil((4 * 60 * 1000 - (now - lastRequest)) / 1000);
        return res.status(429).json({ message: `Debes esperar ${secondsLeft} segundos antes de solicitar un nuevo código.` });
      }

      const user = await Usuario.findOne({ where: { correo } });
      if (!user) {
        // Por seguridad, siempre respondemos igual
        return res.json({ message: 'Si el correo existe, se ha enviado un código de recuperación.' });
      }

      // Guardar timestamp de solicitud
      resetRequestTimestamps[correo] = now;

      // Generar código con expiración de 4 minutos
      const code = setResetCode(correo, user.id_usuario, 4 * 60 * 1000);

      // Enviar correo
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: correo,
        subject: 'Código de recuperación de contraseña',
        text: `Tu código de recuperación es: ${code}`,
      });

      return res.json({ message: 'Si el correo existe, se ha enviado un código de recuperación.' });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { correo, code, newPassword } = req.body;
      if (!correo || !code || !newPassword) {
        return res.status(400).json({ message: 'Datos incompletos' });
      }

      const resetData = getResetData(correo);
      if (!resetData || resetData.code !== code || resetData.expiresAt < Date.now()) {
        return res.status(400).json({ message: 'Código inválido o expirado' });
      }

      const user = await Usuario.findByPk(resetData.userId);
      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

      const password_hash = await bcrypt.hash(newPassword, 10);
      await user.update({ password_hash });

      clearResetCode(correo);

      return res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Iniciar sesión
   */
  static async login(req, res, next) {
    try {
      const { correo, password } = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(correo)) {
        return ApiResponse.validation(res, [{ field: 'correo', message: 'El nombre de correo es requerido' }]);
      }

      if (!ValidationUtils.isNotEmpty(password)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña es requerida' }]);
      }

      // Intentar login
      const result = await AuthService.login({ correo, password });

      return ApiResponse.success(res, result, 'Login exitoso', 200);
    } catch (error) {
      if (error.message.includes('Credenciales inválidas') ||
        error.message.includes('Usuario inactivo') ||
        error.message.includes('Usuario suspendido')) {
        return ApiResponse.unauthorized(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Renovar token de acceso
   */
  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ApiResponse.validation(res, [{ field: 'refreshToken', message: 'Refresh token es requerido' }]);
      }

      const result = await AuthService.refreshToken(refreshToken);

      return ApiResponse.success(res, result, 'Token renovado exitosamente');
    } catch (error) {
      if (error.message.includes('inválido') || error.message.includes('expirado')) {
        return ApiResponse.unauthorized(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Cerrar sesión
   */
  static async logout(req, res, next) {
    try {
      const token = req.token?.value;

      if (!token) {
        return ApiResponse.validation(res, [{ field: 'token', message: 'Token requerido' }]);
      }

      const result = await AuthService.logout(token);

      return ApiResponse.success(res, result, 'Sesión cerrada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar token
   */
  static async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = JWTUtils.extractTokenFromHeader(authHeader);

      if (!token) {
        return ApiResponse.validation(res, [{ field: 'token', message: 'Token requerido en el header Authorization' }]);
      }

      const result = await AuthService.verifyToken(token);

      if (result.valid) {
        return ApiResponse.success(res, result, 'Token válido');
      } else {
        return ApiResponse.unauthorized(res, result.error);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener información del usuario actual
   */
  static async getCurrentUser(req, res, next) {
    try {
      // El middleware de autenticación ya validó el token y agregó req.user
      const user = req.user;

      return ApiResponse.success(res, user, 'Información del usuario obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener perfil completo del usuario actual
   */
  static async getProfile(req, res, next) {
    try {
      const token = req.token?.value;
      const userProfile = await AuthService.getCurrentUser(token);

      return ApiResponse.success(res, userProfile, 'Perfil obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.user.id_usuario;

      // Validaciones
      if (!ValidationUtils.isNotEmpty(currentPassword)) {
        return ApiResponse.validation(res, [{ field: 'currentPassword', message: 'La contraseña actual es requerida' }]);
      }

      if (!ValidationUtils.isValidLength(newPassword, 6)) {
        return ApiResponse.validation(res, [{ field: 'newPassword', message: 'La nueva contraseña debe tener al menos 6 caracteres' }]);
      }

      if (newPassword !== confirmPassword) {
        return ApiResponse.validation(res, [{ field: 'confirmPassword', message: 'Las contraseñas no coinciden' }]);
      }

      const result = await AuthService.changePassword(userId, currentPassword, newPassword);

      return ApiResponse.success(res, result, 'Contraseña actualizada exitosamente');
    } catch (error) {
      if (error.message === 'Contraseña actual incorrecta') {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Obtener información del token actual
   */
  static async getTokenInfo(req, res, next) {
    try {
      const tokenInfo = req.token;

      if (!tokenInfo) {
        return ApiResponse.error(res, 'Información del token no disponible', 400);
      }

      return ApiResponse.success(res, {
        expiresAt: tokenInfo.expiresAt,
        issuedAt: tokenInfo.issuedAt,
        remainingTime: tokenInfo.remainingTime,
        remainingTimeFormatted: this.formatRemainingTime(tokenInfo.remainingTime)
      }, 'Información del token obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Formatear tiempo restante en formato legible
   */
  static formatRemainingTime(seconds) {
    if (seconds <= 0) return 'Expirado';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }

  /**
   * Endpoint público de prueba
   */
  static async publicEndpoint(req, res) {
    return ApiResponse.success(res, {
      message: '🚀 API SDN-STAFF corriendo correctamente',
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      public: true,
      authentication: 'Este endpoint es público y no requiere autenticación',
      documentation: `${req.protocol}://${req.get('host')}/api-docs`,
      endpoints: {
        login: 'POST /api/auth/login',
        register: 'POST /api/usuarios',
        protected: 'Todos los demás endpoints requieren Bearer token',
        health: 'GET /health (público)'
      }
    }, 'API funcionando correctamente - Endpoint público');
  }

  /**
   * Registrar nuevo usuario
   */
  static async register(req, res, next) {
    try {
      const { correo, password } = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(correo)) {
        return ApiResponse.validation(res, [{ field: 'correo', message: 'El correo es requerido' }]);
      }

      if (!ValidationUtils.isValidEmail(correo)) {
        return ApiResponse.validation(res, [{ field: 'correo', message: 'El correo no es válido' }]);
      }

      if (!ValidationUtils.isNotEmpty(password)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña es requerida' }]);
      }

      if (!ValidationUtils.isValidLength(password, 6)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }]);
      }

      // Registrar usuario como visitante
      const result = await AuthService.register({
        correo: correo.toLowerCase().trim(),
        password,
        estado: 'activo'
      });

      return ApiResponse.success(res, result, 'Usuario registrado exitosamente como visitante', 201);
    } catch (error) {
      if (error.message.includes('ya está en uso')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }
}

module.exports = AuthController;
