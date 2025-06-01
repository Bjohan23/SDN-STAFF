const JWTUtils = require('../utils/JWTUtils');
const ApiResponse = require('../utils/ApiResponse');
const { Usuario } = require('../models');
const { Rol } = require('../models')
/**
 * Middleware de autenticación JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return ApiResponse.unauthorized(res, 'Token de acceso requerido');
    }

    // Verificar y decodificar el token
    let decoded;
    try {
      decoded = JWTUtils.verifyToken(token);
    } catch (error) {
      if (error.message === 'Token expirado') {
        return ApiResponse.unauthorized(res, 'Token expirado, inicia sesión nuevamente');
      } else if (error.message === 'Token inválido') {
        return ApiResponse.unauthorized(res, 'Token inválido');
      } else {
        return ApiResponse.unauthorized(res, 'Error de autenticación: ' + error.message);
      }
    }

    // Verificar que el usuario existe y está activo
    const usuario = await Usuario.findByPk(decoded.id_usuario, {
      include: [{
        model: require('../models').Rol,
        as: 'roles',
        attributes: ['id_rol', 'nombre_rol'],
        through: { attributes: [] }
      }]
    });

    if (!usuario) {
      return ApiResponse.unauthorized(res, 'Usuario no encontrado');
    }

    if (usuario.estado !== 'activo') {
      return ApiResponse.unauthorized(res, 'Usuario inactivo o suspendido');
    }

    // Agregar información del usuario a la request
    req.user = {
      id_usuario: usuario.id_usuario,
      correo: usuario.correo,
      estado: usuario.estado,
      roles: usuario.roles || [],
      tokenData: decoded
    };

    // Agregar información del token
    req.token = {
      value: token,
      expiresAt: new Date(decoded.exp * 1000),
      issuedAt: new Date(decoded.iat * 1000),
      remainingTime: JWTUtils.getTokenRemainingTime(token)
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return ApiResponse.error(res, 'Error interno de autenticación', 500);
  }
};

/**
 * Middleware de autorización por roles
 */
const authorize = (allowedRoles = []) => {
  return async (req, res, next) => {  // <-- async aquí
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Autenticación requerida');
      }

      const usuario = await Usuario.findByPk(req.user.id_usuario, {
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['nombre_rol'],
          through: { attributes: [] }
        }],
        logging: false  // <- solo esta consulta no imprime
      });

      if (!usuario) {
        return ApiResponse.error(res, 'Usuario no encontrado', 404);
      }

      const userRoles = usuario.roles.map(r => r.nombre_rol);

      const hasPermission = allowedRoles.some(role => userRoles.includes(role));

      if (!hasPermission) {
        return ApiResponse.error(res, 'Permisos insuficientes para esta operación', 403, {
          requiredRoles: allowedRoles,
          userRoles: userRoles
        });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de autorización:', error);
      return ApiResponse.error(res, 'Error interno de autorización', 500);
    }
  };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      req.token = null;
      return next();
    }

    try {
      const decoded = JWTUtils.verifyToken(token);
      const usuario = await Usuario.findByPk(decoded.id_usuario, {
        include: [{
          model: require('../models').Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol'],
          through: { attributes: [] }
        }]
      });

      if (usuario && usuario.estado === 'activo') {
        req.user = {
          id_usuario: usuario.id_usuario,
          correo: usuario.correo,
          estado: usuario.estado,
          roles: usuario.roles || [],
          tokenData: decoded
        };

        req.token = {
          value: token,
          expiresAt: new Date(decoded.exp * 1000),
          issuedAt: new Date(decoded.iat * 1000),
          remainingTime: JWTUtils.getTokenRemainingTime(token)
        };
      } else {
        req.user = null;
        req.token = null;
      }
    } catch (error) {
      // Si hay error en el token, continuar sin usuario
      req.user = null;
      req.token = null;
    }

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    req.user = null;
    req.token = null;
    next();
  }
};

/**
 * Middleware para verificar si el usuario puede acceder a sus propios datos
 */
const verifySelfOrAdmin = (req, res, next) => {
  try {
    const requestedUserId = parseInt(req.params.id);
    const currentUserId = req.user.id_usuario;
    const userRoles = req.user.roles.map(role => role.nombre_rol);

    // Permitir si es admin o si es el mismo usuario
    if (userRoles.includes('Administrador') || currentUserId === requestedUserId) {
      return next();
    }

    return ApiResponse.error(res, 'Solo puedes acceder a tus propios datos', 403);
  } catch (error) {
    console.error('Error en middleware verifySelfOrAdmin:', error);
    return ApiResponse.error(res, 'Error de autorización', 500);
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  verifySelfOrAdmin
};
