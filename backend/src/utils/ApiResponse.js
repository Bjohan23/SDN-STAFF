/**
 * Utilidades de respuesta HTTP estandarizadas
 */

class ApiResponse {
  /**
   * Respuesta exitosa
   */
  static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Respuesta de error
   */
  static error(res, message = 'Error en el servidor', statusCode = 500, details = null) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Respuesta de validación
   */
  static validation(res, errors, message = 'Error de validación') {
    return res.status(400).json({
      success: false,
      error: message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Respuesta no autorizada
   */
  static unauthorized(res, message = 'No autorizado') {
    return res.status(401).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Respuesta no encontrado
   */
  static notFound(res, message = 'Recurso no encontrado') {
    return res.status(404).json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Respuesta con paginación
   */
  static paginated(res, data, pagination, message = 'Datos obtenidos exitosamente') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        currentPage: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.totalItems,
        itemsPerPage: pagination.limit,
        hasNextPage: pagination.page < pagination.totalPages,
        hasPrevPage: pagination.page > 1
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;
