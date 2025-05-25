const bcrypt = require('bcryptjs');
const { Usuario, Rol } = require('../models');
const JWTUtils = require('../utils/JWTUtils');

/**
 * Servicio de Autenticación
 */
class AuthService {
  
  /**
   * Iniciar sesión de usuario
   */
  static async login(credentials) {
    try {
      const { correo, password } = credentials;

      // Validar que se proporcionen las credenciales
      if (!correo || !password) {
        throw new Error('correo y password son requeridos');
      }

      // Buscar usuario con password incluido
      const usuario = await Usuario.findOne({
        where: { correo },
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol', 'descripcion'],
          through: { attributes: ['fecha_asignacion'] }
        }]
      });

      if (!usuario) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar estado del usuario
      if (usuario.estado !== 'activo') {
        throw new Error(`Usuario ${usuario.estado}. Contacta al administrador`);
      }

      // Verificar password
      const passwordValido = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordValido) {
        throw new Error('Credenciales inválidas');
      }

      // Generar payload para el token
      const tokenPayload = {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        estado: usuario.estado,
        roles: usuario.roles.map(rol => ({
          id_rol: rol.id_rol,
          nombre_rol: rol.nombre_rol
        }))
      };

      // Generar tokens
      const accessToken = JWTUtils.generateToken(tokenPayload);
      const refreshToken = JWTUtils.generateRefreshToken({
        id_usuario: usuario.id_usuario,
        correo: usuario.correo
      });

      // Actualizar última sesión
      const now = new Date();
      usuario.ultima_sesion = now;
      await usuario.save();

      // Preparar respuesta del usuario (sin password)
      const usuarioResponse = {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        estado: usuario.estado,
        fecha_creacion: usuario.fecha_creacion,
        ultima_sesion: now,
        roles: usuario.roles.map(rol => ({
          id_rol: rol.id_rol,
          nombre_rol: rol.nombre_rol,
          descripcion: rol.descripcion,
          fecha_asignacion: rol.UsuarioRol?.fecha_asignacion
        }))
      };

      return {
        user: usuarioResponse,
        accessToken,
        refreshToken,
        tokenInfo: {
          type: 'Bearer',
          expiresIn: process.env.JWT_EXPIRES_IN || '6h',
          expiresAt: new Date(Date.now() + (6 * 60 * 60 * 1000)), // 6 horas
          issuedAt: new Date()
        }
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Renovar token de acceso usando refresh token
   */
  static async refreshToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error('Refresh token requerido');
      }

      // Verificar refresh token
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);

      // Buscar usuario actualizado
      const usuario = await Usuario.findByPk(decoded.id_usuario, {
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol'],
          through: { attributes: [] }
        }]
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      if (usuario.estado !== 'activo') {
        throw new Error('Usuario inactivo');
      }

      // Generar nuevo access token
      const tokenPayload = {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo,
        estado: usuario.estado,
        roles: usuario.roles.map(rol => ({
          id_rol: rol.id_rol,
          nombre_rol: rol.nombre_rol
        }))
      };

      const newAccessToken = JWTUtils.generateToken(tokenPayload);

      return {
        accessToken: newAccessToken,
        tokenInfo: {
          type: 'Bearer',
          expiresIn: process.env.JWT_EXPIRES_IN || '6h',
          expiresAt: new Date(Date.now() + (6 * 60 * 60 * 1000)),
          issuedAt: new Date()
        }
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Cerrar sesión (invalidar token - para futuro con blacklist)
   */
  static async logout(token) {
    try {
      // Por ahora solo verificamos que el token sea válido
      // En el futuro se podría implementar una blacklist de tokens
      JWTUtils.verifyToken(token);

      return {
        message: 'Sesión cerrada exitosamente',
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  /**
   * Verificar si un token es válido
   */
  static async verifyToken(token) {
    try {
      const decoded = JWTUtils.verifyToken(token);

      // Verificar que el usuario aún existe y está activo
      const usuario = await Usuario.findByPk(decoded.id_usuario);

      if (!usuario || usuario.estado !== 'activo') {
        throw new Error('Usuario no válido');
      }

      return {
        valid: true,
        user: {
          id_usuario: decoded.id_usuario,
          correo: decoded.correo,
          roles: decoded.roles
        },
        tokenInfo: {
          issuedAt: new Date(decoded.iat * 1000),
          expiresAt: new Date(decoded.exp * 1000),
          remainingTime: JWTUtils.getTokenRemainingTime(token)
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener información del usuario actual desde el token
   */
  static async getCurrentUser(token) {
    try {
      const decoded = JWTUtils.verifyToken(token);

      const usuario = await Usuario.findByPk(decoded.id_usuario, {
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol', 'descripcion'],
          through: { attributes: ['fecha_asignacion'] }
        }]
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Retornar usuario sin password
      const usuarioResponse = usuario.toJSON();
      delete usuarioResponse.password_hash;

      return usuarioResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar permisos de usuario
   */
  static async hasPermission(userId, requiredRoles = []) {
    try {
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      const usuario = await Usuario.findByPk(userId, {
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['nombre_rol'],
          through: { attributes: [] }
        }]
      });

      if (!usuario) {
        return false;
      }

      const userRoles = usuario.roles.map(rol => rol.nombre_rol);
      return requiredRoles.some(role => userRoles.includes(role));
    } catch (error) {
      return false;
    }
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  static async changePassword(userId, currentPassword, newPassword) {
    try {
      const usuario = await Usuario.findByPk(userId);

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const passwordValido = await bcrypt.compare(currentPassword, usuario.password_hash);
      if (!passwordValido) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Encriptar nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // Actualizar contraseña
      await usuario.update({ password_hash: newPasswordHash });

      return {
        message: 'Contraseña actualizada exitosamente',
        timestamp: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   */
  static async register(userData) {
    try {
      const { correo, password, estado = 'activo' } = userData;

      // Verificar si el correo ya existe
      const existingUser = await Usuario.findOne({
        where: {
          correo: correo.toLowerCase().trim()
        }
      });

      if (existingUser) {
        throw new Error('El correo ya está en uso');
      }

      // Encriptar password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Crear usuario
      const usuario = await Usuario.create({
        correo: correo.toLowerCase().trim(),
        password_hash,
        estado,
        fecha_creacion: new Date()
      });

      // Asignar rol de visitante (ID 4)
      const rolVisitante = await Rol.findByPk(4);
      if (!rolVisitante) {
        throw new Error('Error al asignar rol de visitante');
      }

      await usuario.setRoles([rolVisitante]);

      // Obtener usuario con roles
      const usuarioConRoles = await Usuario.findByPk(usuario.id_usuario, {
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol', 'descripcion'],
          through: { attributes: ['fecha_asignacion'] }
        }]
      });

      // Preparar respuesta (sin password)
      const usuarioResponse = usuarioConRoles.toJSON();
      delete usuarioResponse.password_hash;

      return usuarioResponse;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
