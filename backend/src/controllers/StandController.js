const StandService = require('../services/StandService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Stand
 */
class StandController {

  /**
   * Crear nuevo stand
   */
  static async createStand(req, res, next) {
    try {
      const userId = req.user ? req.user.id_usuario : null;
      const standData = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(standData.numero_stand)) {
        return ApiResponse.validation(res, [{ field: 'numero_stand', message: 'El número del stand es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(standData.numero_stand, 1, 20)) {
        return ApiResponse.validation(res, [{ field: 'numero_stand', message: 'El número del stand debe tener entre 1 y 20 caracteres' }]);
      }

      if (!ValidationUtils.isValidId(standData.id_tipo_stand)) {
        return ApiResponse.validation(res, [{ field: 'id_tipo_stand', message: 'El tipo de stand es requerido y debe ser válido' }]);
      }

      if (!standData.area || isNaN(standData.area) || standData.area <= 0) {
        return ApiResponse.validation(res, [{ field: 'area', message: 'El área del stand es requerida y debe ser mayor a 0' }]);
      }

      // Validar estado físico
      const estadosFisicosValidos = ['disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio'];
      if (standData.estado_fisico && !estadosFisicosValidos.includes(standData.estado_fisico)) {
        return ApiResponse.validation(res, [{ field: 'estado_fisico', message: 'Estado físico inválido' }]);
      }

      // Validar precio personalizado
      if (standData.precio_personalizado && standData.precio_personalizado < 0) {
        return ApiResponse.validation(res, [{ field: 'precio_personalizado', message: 'El precio personalizado no puede ser negativo' }]);
      }

      // Sanitizar datos
      standData.numero_stand = ValidationUtils.sanitizeString(standData.numero_stand);
      if (standData.nombre_stand) {
        standData.nombre_stand = ValidationUtils.sanitizeString(standData.nombre_stand);
      }
      if (standData.ubicacion) {
        standData.ubicacion = ValidationUtils.sanitizeString(standData.ubicacion);
      }

      // Crear stand
      const nuevoStand = await StandService.createStand(standData, userId);

      return ApiResponse.success(res, nuevoStand, 'Stand creado exitosamente', 201);
    } catch (error) {
      if (error.message.includes('ya existe') || error.message.includes('no encontrado') || error.message.includes('inválida')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener todos los stands
   */
  static async getAllStands(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';
      
      const filters = {
        search: req.query.search || '',
        estado_fisico: req.query.estado_fisico || '',
        id_tipo_stand: req.query.id_tipo_stand || '',
        es_premium: req.query.es_premium || '',
        area_min: req.query.area_min || '',
        area_max: req.query.area_max || ''
      };

      const result = await StandService.getAllStands(page, limit, filters, includeAudit, includeDeleted);

      return ApiResponse.paginated(
        res, 
        result.stands, 
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Stands obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener stand por ID
   */
  static async getStandById(req, res, next) {
    try {
      const { id } = req.params;
      const includeDetails = req.query.include_details === 'true';
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const stand = await StandService.getStandById(id, includeDetails, includeAudit, includeDeleted);
      
      return ApiResponse.success(res, stand, 'Stand obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener stand por número
   */
  static async getStandByNumero(req, res, next) {
    try {
      const { numero } = req.params;

      if (!ValidationUtils.isNotEmpty(numero)) {
        return ApiResponse.validation(res, [{ field: 'numero', message: 'Número de stand requerido' }]);
      }

      const stand = await StandService.getStandByNumero(numero);
      
      if (!stand) {
        return ApiResponse.notFound(res, 'Stand no encontrado');
      }
      
      return ApiResponse.success(res, stand, 'Stand obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar stand
   */
  static async updateStand(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validaciones opcionales para campos que se están actualizando
      if (updateData.numero_stand && !ValidationUtils.isValidLength(updateData.numero_stand, 1, 20)) {
        return ApiResponse.validation(res, [{ field: 'numero_stand', message: 'El número del stand debe tener entre 1 y 20 caracteres' }]);
      }

      if (updateData.area && (isNaN(updateData.area) || updateData.area <= 0)) {
        return ApiResponse.validation(res, [{ field: 'area', message: 'El área debe ser mayor a 0' }]);
      }

      if (updateData.precio_personalizado && updateData.precio_personalizado < 0) {
        return ApiResponse.validation(res, [{ field: 'precio_personalizado', message: 'El precio personalizado no puede ser negativo' }]);
      }

      const estadosFisicosValidos = ['disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio'];
      if (updateData.estado_fisico && !estadosFisicosValidos.includes(updateData.estado_fisico)) {
        return ApiResponse.validation(res, [{ field: 'estado_fisico', message: 'Estado físico inválido' }]);
      }

      // Sanitizar datos
      if (updateData.numero_stand) {
        updateData.numero_stand = ValidationUtils.sanitizeString(updateData.numero_stand);
      }
      if (updateData.nombre_stand) {
        updateData.nombre_stand = ValidationUtils.sanitizeString(updateData.nombre_stand);
      }
      if (updateData.ubicacion) {
        updateData.ubicacion = ValidationUtils.sanitizeString(updateData.ubicacion);
      }

      const standActualizado = await StandService.updateStand(id, updateData, userId);
      
      return ApiResponse.success(res, standActualizado, 'Stand actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('ya existe') || error.message.includes('inválida')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Eliminar stand
   */
  static async deleteStand(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await StandService.deleteStand(id, userId);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Cambiar estado físico del stand
   */
  static async cambiarEstadoFisico(req, res, next) {
    try {
      const { id } = req.params;
      const { estado_fisico, observaciones } = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const estadosValidos = ['disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio'];
      if (!estadosValidos.includes(estado_fisico)) {
        return ApiResponse.validation(res, [{ field: 'estado_fisico', message: 'Estado físico debe ser: disponible, ocupado, mantenimiento o fuera_de_servicio' }]);
      }

      const stand = await StandService.cambiarEstadoFisico(id, estado_fisico, observaciones, userId);
      
      return ApiResponse.success(res, stand, 'Estado físico del stand actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Asignar stand a evento
   */
  static async asignarAEvento(req, res, next) {
    try {
      const { id } = req.params; // ID del stand
      const { id_evento, configuracion } = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de stand inválido' }]);
      }

      if (!ValidationUtils.isValidId(id_evento)) {
        return ApiResponse.validation(res, [{ field: 'id_evento', message: 'ID de evento inválido' }]);
      }

      // Validar configuración si se proporciona
      if (configuracion) {
        if (configuracion.precio_evento && configuracion.precio_evento < 0) {
          return ApiResponse.validation(res, [{ field: 'precio_evento', message: 'El precio del evento no puede ser negativo' }]);
        }

        if (configuracion.descuento_porcentaje && (configuracion.descuento_porcentaje < 0 || configuracion.descuento_porcentaje > 100)) {
          return ApiResponse.validation(res, [{ field: 'descuento_porcentaje', message: 'El descuento debe estar entre 0 y 100' }]);
        }
      }

      const asignacion = await StandService.asignarAEvento(id, id_evento, configuracion || {}, userId);
      
      return ApiResponse.success(res, asignacion, 'Stand asignado al evento exitosamente', 201);
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('no está disponible') || error.message.includes('ya está asignado')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener asignación de stand en evento
   */
  static async getAsignacionEvento(req, res, next) {
    try {
      const { id, evento_id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de stand inválido' }]);
      }

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      const asignacion = await StandService.getAsignacionEvento(id, evento_id);
      
      return ApiResponse.success(res, asignacion, 'Asignación obtenida exitosamente');
    } catch (error) {
      if (error.message === 'Asignación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener stands disponibles para evento
   */
  static async getStandsDisponiblesParaEvento(req, res, next) {
    try {
      const { evento_id } = req.params;
      const filtros = {
        id_tipo_stand: req.query.id_tipo_stand || '',
        area_min: req.query.area_min || '',
        area_max: req.query.area_max || ''
      };

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      const stands = await StandService.getStandsDisponiblesParaEvento(evento_id, filtros);
      
      return ApiResponse.success(res, stands, 'Stands disponibles obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de stands
   */
  static async getStandStats(req, res, next) {
    try {
      const includeDeleted = req.query.include_deleted === 'true';
      const stats = await StandService.getStandStats(includeDeleted);
      
      return ApiResponse.success(res, stats, 'Estadísticas de stands obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener stands que requieren mantenimiento
   */
  static async getStandsMantenimiento(req, res, next) {
    try {
      const stands = await StandService.getStandsMantenimiento();
      
      return ApiResponse.success(res, stands, 'Stands que requieren mantenimiento obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurar stand eliminado
   */
  static async restoreStand(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await StandService.restoreStand(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message === 'El stand no está eliminado') {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Carga masiva desde CSV
   */
  static async cargaMasivaCSV(req, res, next) {
    try {
      const csvData = req.body.data; // Esperamos que el CSV ya esté parseado
      const userId = req.user ? req.user.id_usuario : null;

      if (!Array.isArray(csvData) || csvData.length === 0) {
        return ApiResponse.validation(res, [{ field: 'data', message: 'Datos CSV requeridos como array' }]);
      }

      const result = await StandService.cargaMasivaDesdeCSV(csvData, userId);
      
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar disponibilidad de número de stand
   */
  static async verificarNumeroDisponible(req, res, next) {
    try {
      const { numero } = req.params;
      const { stand_id } = req.query; // Para excluir en actualizaciones

      if (!ValidationUtils.isNotEmpty(numero)) {
        return ApiResponse.validation(res, [{ field: 'numero', message: 'Número de stand requerido' }]);
      }

      const standExistente = await StandService.getStandByNumero(numero);
      
      let disponible = !standExistente;
      
      // Si existe pero es el mismo stand que se está editando, está disponible
      if (standExistente && stand_id && standExistente.id_stand == stand_id) {
        disponible = true;
      }
      
      return ApiResponse.success(res, { 
        disponible,
        numero_stand: numero,
        stand_existente: standExistente ? {
          id: standExistente.id_stand,
          nombre: standExistente.nombre_stand || standExistente.numero_stand
        } : null
      }, disponible ? 'Número disponible' : 'Número no disponible');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StandController;
