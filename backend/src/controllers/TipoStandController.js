const TipoStandService = require('../services/TipoStandService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de TipoStand
 */
class TipoStandController {

  /**
   * Crear nuevo tipo de stand
   */
  static async createTipoStand(req, res, next) {
    try {
      const userId = req.user ? req.user.id_usuario : null;
      const tipoData = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(tipoData.nombre_tipo)) {
        return ApiResponse.validation(res, [{ field: 'nombre_tipo', message: 'El nombre del tipo de stand es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(tipoData.nombre_tipo, 2, 50)) {
        return ApiResponse.validation(res, [{ field: 'nombre_tipo', message: 'El nombre del tipo debe tener entre 2 y 50 caracteres' }]);
      }

      // Validar áreas
      if (tipoData.area_minima && tipoData.area_minima < 0) {
        return ApiResponse.validation(res, [{ field: 'area_minima', message: 'El área mínima no puede ser negativa' }]);
      }

      if (tipoData.area_maxima && tipoData.area_maxima < 0) {
        return ApiResponse.validation(res, [{ field: 'area_maxima', message: 'El área máxima no puede ser negativa' }]);
      }

      if (tipoData.area_minima && tipoData.area_maxima && tipoData.area_maxima < tipoData.area_minima) {
        return ApiResponse.validation(res, [{ field: 'area_maxima', message: 'El área máxima debe ser mayor al área mínima' }]);
      }

      // Validar precio
      if (tipoData.precio_base && tipoData.precio_base < 0) {
        return ApiResponse.validation(res, [{ field: 'precio_base', message: 'El precio base no puede ser negativo' }]);
      }

      // Verificar si el nombre ya existe
      const existingTipo = await TipoStandService.getTipoStandByNombre(tipoData.nombre_tipo);
      if (existingTipo) {
        return ApiResponse.error(res, 'El nombre del tipo de stand ya existe', 409);
      }

      // Sanitizar datos
      tipoData.nombre_tipo = ValidationUtils.sanitizeString(tipoData.nombre_tipo);
      if (tipoData.descripcion) {
        tipoData.descripcion = ValidationUtils.sanitizeString(tipoData.descripcion);
      }

      // Crear tipo de stand
      const nuevoTipo = await TipoStandService.createTipoStand(tipoData, userId);

      return ApiResponse.success(res, nuevoTipo, 'Tipo de stand creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los tipos de stand
   */
  static async getAllTiposStand(req, res, next) {
    try {
      const includeStands = req.query.include_stands === 'true';
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';
      
      const tipos = await TipoStandService.getAllTiposStand(includeStands, includeAudit, includeDeleted);

      return ApiResponse.success(res, tipos, 'Tipos de stand obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener tipo de stand por ID
   */
  static async getTipoStandById(req, res, next) {
    try {
      const { id } = req.params;
      const includeStands = req.query.include_stands === 'true';
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const tipo = await TipoStandService.getTipoStandById(id, includeStands, includeAudit, includeDeleted);
      
      return ApiResponse.success(res, tipo, 'Tipo de stand obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Tipo de stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener tipo de stand por nombre
   */
  static async getTipoStandByNombre(req, res, next) {
    try {
      const { nombre } = req.params;

      if (!ValidationUtils.isNotEmpty(nombre)) {
        return ApiResponse.validation(res, [{ field: 'nombre', message: 'Nombre de tipo requerido' }]);
      }

      const tipo = await TipoStandService.getTipoStandByNombre(nombre);
      
      if (!tipo) {
        return ApiResponse.notFound(res, 'Tipo de stand no encontrado');
      }
      
      return ApiResponse.success(res, tipo, 'Tipo de stand obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar tipo de stand
   */
  static async updateTipoStand(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validaciones opcionales para campos que se están actualizando
      if (updateData.nombre_tipo && !ValidationUtils.isValidLength(updateData.nombre_tipo, 2, 50)) {
        return ApiResponse.validation(res, [{ field: 'nombre_tipo', message: 'El nombre del tipo debe tener entre 2 y 50 caracteres' }]);
      }

      if (updateData.area_minima && updateData.area_minima < 0) {
        return ApiResponse.validation(res, [{ field: 'area_minima', message: 'El área mínima no puede ser negativa' }]);
      }

      if (updateData.area_maxima && updateData.area_maxima < 0) {
        return ApiResponse.validation(res, [{ field: 'area_maxima', message: 'El área máxima no puede ser negativa' }]);
      }

      if (updateData.precio_base && updateData.precio_base < 0) {
        return ApiResponse.validation(res, [{ field: 'precio_base', message: 'El precio base no puede ser negativo' }]);
      }

      // Sanitizar strings
      if (updateData.nombre_tipo) {
        updateData.nombre_tipo = ValidationUtils.sanitizeString(updateData.nombre_tipo);
      }
      if (updateData.descripcion) {
        updateData.descripcion = ValidationUtils.sanitizeString(updateData.descripcion);
      }

      const tipoActualizado = await TipoStandService.updateTipoStand(id, updateData, userId);
      
      return ApiResponse.success(res, tipoActualizado, 'Tipo de stand actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Tipo de stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Eliminar tipo de stand
   */
  static async deleteTipoStand(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await TipoStandService.deleteTipoStand(id, userId);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Tipo de stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Restaurar tipo de stand eliminado
   */
  static async restoreTipoStand(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await TipoStandService.restoreTipoStand(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Tipo de stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message === 'El tipo de stand no está eliminado') {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Obtener stands por tipo
   */
  static async getStandsByTipo(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await TipoStandService.getStandsByTipo(id, page, limit);

      return ApiResponse.paginated(
        res,
        result.stands,
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Stands del tipo obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de tipos de stand
   */
  static async getTipoStandStats(req, res, next) {
    try {
      const stats = await TipoStandService.getTipoStandStats();
      
      return ApiResponse.success(res, stats, 'Estadísticas de tipos de stand obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener tipos sin stands
   */
  static async getTiposSinStands(req, res, next) {
    try {
      const tipos = await TipoStandService.getTiposSinStands();
      
      return ApiResponse.success(res, tipos, 'Tipos sin stands obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener tipos eliminados
   */
  static async getTiposEliminados(req, res, next) {
    try {
      const tipos = await TipoStandService.getTiposEliminados();
      
      return ApiResponse.success(res, tipos, 'Tipos eliminados obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validar área para tipo de stand
   */
  static async validarAreaParaTipo(req, res, next) {
    try {
      const { id } = req.params;
      const { area } = req.query;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!area || isNaN(area) || area <= 0) {
        return ApiResponse.validation(res, [{ field: 'area', message: 'Área válida requerida' }]);
      }

      const esValida = await TipoStandService.validarAreaParaTipo(id, parseFloat(area));
      
      return ApiResponse.success(res, { valida: esValida }, 'Validación de área completada');
    } catch (error) {
      if (error.message === 'Tipo de stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('Área inválida') || error.message.includes('área')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Calcular precio para área específica
   */
  static async calcularPrecio(req, res, next) {
    try {
      const { id } = req.params;
      const { area } = req.query;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!area || isNaN(area) || area <= 0) {
        return ApiResponse.validation(res, [{ field: 'area', message: 'Área válida requerida' }]);
      }

      const calculoPrecio = await TipoStandService.calcularPrecio(id, parseFloat(area));
      
      return ApiResponse.success(res, calculoPrecio, 'Precio calculado exitosamente');
    } catch (error) {
      if (error.message === 'Tipo de stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('Área inválida') || error.message.includes('área')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Obtener tipos disponibles para área específica
   */
  static async getTiposParaArea(req, res, next) {
    try {
      const { area } = req.query;

      if (!area || isNaN(area) || area <= 0) {
        return ApiResponse.validation(res, [{ field: 'area', message: 'Área válida requerida' }]);
      }

      const tipos = await TipoStandService.getTiposParaArea(parseFloat(area));
      
      return ApiResponse.success(res, tipos, 'Tipos de stand compatibles obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TipoStandController;
