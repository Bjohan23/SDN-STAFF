const TipoEventoService = require('../services/TipoEventoService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de TipoEvento
 */
class TipoEventoController {

  /**
   * Crear nuevo tipo de evento
   */
  static async createTipoEvento(req, res, next) {
    try {
      const { nombre_tipo, descripcion, configuracion_especifica } = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(nombre_tipo)) {
        return ApiResponse.validation(res, [{ field: 'nombre_tipo', message: 'El nombre del tipo de evento es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(nombre_tipo, 2, 50)) {
        return ApiResponse.validation(res, [{ field: 'nombre_tipo', message: 'El nombre del tipo debe tener entre 2 y 50 caracteres' }]);
      }

      // Validar que sea un tipo válido
      const tiposValidos = ['presencial', 'virtual', 'hibrido'];
      if (!tiposValidos.includes(nombre_tipo)) {
        return ApiResponse.validation(res, [{ field: 'nombre_tipo', message: 'El tipo debe ser: presencial, virtual o hibrido' }]);
      }

      // Verificar si el tipo ya existe
      const existingTipo = await TipoEventoService.getTipoEventoByNombre(nombre_tipo);
      if (existingTipo) {
        return ApiResponse.error(res, 'Este tipo de evento ya existe', 409);
      }

      // Crear tipo de evento
      const nuevoTipo = await TipoEventoService.createTipoEvento({
        nombre_tipo: ValidationUtils.sanitizeString(nombre_tipo),
        descripcion: descripcion ? ValidationUtils.sanitizeString(descripcion) : null,
        configuracion_especifica: configuracion_especifica || null
      }, userId);

      return ApiResponse.success(res, nuevoTipo, 'Tipo de evento creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los tipos de evento
   */
  static async getAllTiposEvento(req, res, next) {
    try {
      const includeEventos = req.query.include_eventos === 'true';
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';
      
      const tipos = await TipoEventoService.getAllTiposEvento(includeEventos, includeAudit, includeDeleted);

      return ApiResponse.success(res, tipos, 'Tipos de evento obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener tipo de evento por ID
   */
  static async getTipoEventoById(req, res, next) {
    try {
      const { id } = req.params;
      const includeEventos = req.query.include_eventos === 'true';
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const tipo = await TipoEventoService.getTipoEventoById(id, includeEventos, includeAudit, includeDeleted);
      
      return ApiResponse.success(res, tipo, 'Tipo de evento obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Tipo de evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener tipo de evento por nombre
   */
  static async getTipoEventoByNombre(req, res, next) {
    try {
      const { nombre } = req.params;

      if (!ValidationUtils.isNotEmpty(nombre)) {
        return ApiResponse.validation(res, [{ field: 'nombre', message: 'Nombre de tipo requerido' }]);
      }

      const tipo = await TipoEventoService.getTipoEventoByNombre(nombre);
      
      if (!tipo) {
        return ApiResponse.notFound(res, 'Tipo de evento no encontrado');
      }
      
      return ApiResponse.success(res, tipo, 'Tipo de evento obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar tipo de evento
   */
  static async updateTipoEvento(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validar nombre_tipo si se está actualizando
      if (updateData.nombre_tipo) {
        if (!ValidationUtils.isValidLength(updateData.nombre_tipo, 2, 50)) {
          return ApiResponse.validation(res, [{ field: 'nombre_tipo', message: 'El nombre del tipo debe tener entre 2 y 50 caracteres' }]);
        }

        const tiposValidos = ['presencial', 'virtual', 'hibrido'];
        if (!tiposValidos.includes(updateData.nombre_tipo)) {
          return ApiResponse.validation(res, [{ field: 'nombre_tipo', message: 'El tipo debe ser: presencial, virtual o hibrido' }]);
        }
      }

      // Sanitizar strings
      if (updateData.nombre_tipo) {
        updateData.nombre_tipo = ValidationUtils.sanitizeString(updateData.nombre_tipo);
      }
      if (updateData.descripcion) {
        updateData.descripcion = ValidationUtils.sanitizeString(updateData.descripcion);
      }

      const tipoActualizado = await TipoEventoService.updateTipoEvento(id, updateData, userId);
      
      return ApiResponse.success(res, tipoActualizado, 'Tipo de evento actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Tipo de evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Eliminar tipo de evento
   */
  static async deleteTipoEvento(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await TipoEventoService.deleteTipoEvento(id, userId);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Tipo de evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener eventos por tipo
   */
  static async getEventosByTipo(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await TipoEventoService.getEventosByTipo(id, page, limit);

      return ApiResponse.paginated(
        res,
        result.eventos,
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Eventos del tipo obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de tipos de evento
   */
  static async getTipoEventoStats(req, res, next) {
    try {
      const stats = await TipoEventoService.getTipoEventoStats();
      
      return ApiResponse.success(res, stats, 'Estadísticas de tipos de evento obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener tipos sin eventos
   */
  static async getTiposSinEventos(req, res, next) {
    try {
      const tipos = await TipoEventoService.getTiposSinEventos();
      
      return ApiResponse.success(res, tipos, 'Tipos sin eventos obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurar tipo eliminado
   */
  static async restoreTipoEvento(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await TipoEventoService.restoreTipoEvento(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Tipo de evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message === 'El tipo de evento no está eliminado') {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Obtener tipos eliminados
   */
  static async getTiposEliminados(req, res, next) {
    try {
      const tipos = await TipoEventoService.getTiposEliminados();
      
      return ApiResponse.success(res, tipos, 'Tipos eliminados obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TipoEventoController;
