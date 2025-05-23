const jwt = require('jsonwebtoken');

/**
 * Utilidades para manejo de JWT
 */
class JWTUtils {
  
  /**
   * Generar un token JWT
   */
  static generateToken(payload) {
    try {
      const secret = process.env.JWT_SECRET || 'sdn-staff-super-secret-key-2025';
      const expiresIn = process.env.JWT_EXPIRES_IN || '6h'; // 6 horas por defecto
      
      const token = jwt.sign(
        {
          ...payload,
          iat: Math.floor(Date.now() / 1000), // Issued at
          iss: 'sdn-staff-api' // Issuer
        },
        secret,
        { 
          expiresIn,
          algorithm: 'HS256'
        }
      );
      
      return token;
    } catch (error) {
      throw new Error('Error al generar token JWT: ' + error.message);
    }
  }

  /**
   * Verificar y decodificar un token JWT
   */
  static verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'sdn-staff-super-secret-key-2025';
      
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256']
      });
      
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Token no válido aún');
      } else {
        throw new Error('Error al verificar token: ' + error.message);
      }
    }
  }

  /**
   * Extraer token del header Authorization
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      return null;
    }

    // Formato esperado: "Bearer <token>"
    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Generar token de refresh (opcional, para futuro)
   */
  static generateRefreshToken(payload) {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || 'sdn-staff-refresh-secret-key-2025';
      
      const token = jwt.sign(
        {
          ...payload,
          type: 'refresh',
          iat: Math.floor(Date.now() / 1000)
        },
        secret,
        { 
          expiresIn: '7d', // 7 días para refresh token
          algorithm: 'HS256'
        }
      );
      
      return token;
    } catch (error) {
      throw new Error('Error al generar refresh token: ' + error.message);
    }
  }

  /**
   * Verificar refresh token
   */
  static verifyRefreshToken(token) {
    try {
      const secret = process.env.JWT_REFRESH_SECRET || 'sdn-staff-refresh-secret-key-2025';
      
      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256']
      });
      
      // Verificar que sea un refresh token
      if (decoded.type !== 'refresh') {
        throw new Error('Token inválido');
      }
      
      return decoded;
    } catch (error) {
      throw new Error('Refresh token inválido: ' + error.message);
    }
  }

  /**
   * Decodificar token sin verificar (para debugging)
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar si un token está expirado
   */
  static isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Obtener tiempo restante del token en segundos
   */
  static getTokenRemainingTime(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return 0;
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      const remainingTime = decoded.exp - currentTime;
      
      return Math.max(0, remainingTime);
    } catch (error) {
      return 0;
    }
  }
}

module.exports = JWTUtils;
