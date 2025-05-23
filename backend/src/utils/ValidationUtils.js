/**
 * Utilidades de validación
 */

class ValidationUtils {
  /**
   * Valida si un email es válido
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida si una contraseña cumple con los requisitos mínimos
   */
  static isValidPassword(password) {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Valida si un teléfono es válido (formato internacional)
   */
  static isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{8,15}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Sanitiza un string removiendo caracteres especiales
   */
  static sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/[<>]/g, '');
  }

  /**
   * Valida si una fecha está en formato válido
   */
  static isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Valida si un ID es un número válido
   */
  static isValidId(id) {
    return !isNaN(id) && parseInt(id) > 0;
  }

  /**
   * Valida si un string no está vacío después de sanitizar
   */
  static isNotEmpty(str) {
    return typeof str === 'string' && str.trim().length > 0;
  }

  /**
   * Valida longitud mínima y máxima de un string
   */
  static isValidLength(str, min = 0, max = Infinity) {
    if (typeof str !== 'string') return false;
    const length = str.trim().length;
    return length >= min && length <= max;
  }
}

module.exports = ValidationUtils;
