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

      // --- CAPA DE COMPATIBILIDAD Y LIMPIEZA DEFINITIVA ---
      if (standData.precio_base !== undefined && standData.precio_base !== null && standData.precio_base !== '') {
        standData.precio_personalizado = standData.precio_base;
        delete standData.precio_base;
      }

      // Manejo mejorado del precio_personalizado
      if (standData.precio_personalizado !== undefined && standData.precio_personalizado !== null && standData.precio_personalizado !== '') {
        const precio = parseFloat(standData.precio_personalizado);
        if (isNaN(precio)) {
          delete standData.precio_personalizado; // Eliminar si no es un número válido
        } else if (precio < 0) {
          return ApiResponse.validation(res, [{ field: 'precio_personalizado', message: 'El precio personalizado no puede ser negativo' }]);
        } else {
          standData.precio_personalizado = precio; // Asegurar que sea número
        }
      } else {
        // Si el precio está vacío, undefined o null, establecerlo como null explícitamente
        standData.precio_personalizado = null;
      }

      // Convertir campos numéricos que pueden venir como strings
      if (standData.area !== undefined && standData.area !== null && standData.area !== '') {
        const area = parseFloat(standData.area);
        if (isNaN(area) || area <= 0) {
          return ApiResponse.validation(res, [{ field: 'area', message: 'El área del stand es requerida y debe ser mayor a 0' }]);
        }
        standData.area = area;
      }

      if (standData.coordenadas_x !== undefined && standData.coordenadas_x !== null && standData.coordenadas_x !== '') {
        const coordX = parseFloat(standData.coordenadas_x);
        if (!isNaN(coordX)) {
          standData.coordenadas_x = coordX;
        } else {
          delete standData.coordenadas_x;
        }
      }

      if (standData.coordenadas_y !== undefined && standData.coordenadas_y !== null && standData.coordenadas_y !== '') {
        const coordY = parseFloat(standData.coordenadas_y);
        if (!isNaN(coordY)) {
          standData.coordenadas_y = coordY;
        } else {
          delete standData.coordenadas_y;
        }
      }

      if (standData.capacidad_maxima_personas !== undefined && standData.capacidad_maxima_personas !== null && standData.capacidad_maxima_personas !== '') {
        const capacidad = parseInt(standData.capacidad_maxima_personas);
        if (!isNaN(capacidad) && capacidad > 0) {
          standData.capacidad_maxima_personas = capacidad;
        } else {
          delete standData.capacidad_maxima_personas;
        }
      }

      // Mapea campos de un formulario antiguo a los campos del modelo nuevo
      if (standData.nombre_stand && !standData.codigo_stand) {
        standData.codigo_stand = standData.nombre_stand;
      }
      if (standData.estado && !standData.estado_fisico) {
        standData.estado_fisico = standData.estado === 'reservado' ? 'ocupado' : standData.estado;
      }
      
      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(standData.numero_stand)) {
        return ApiResponse.validation(res, [{ field: 'numero_stand', message: 'El número del stand es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(standData.numero_stand, 1, 50)) {
        return ApiResponse.validation(res, [{ field: 'numero_stand', message: 'El número del stand debe tener entre 1 y 50 caracteres' }]);
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

      // Sanitizar datos de texto
      standData.numero_stand = ValidationUtils.sanitizeString(standData.numero_stand);
      if (standData.nombre_stand) {
        standData.nombre_stand = ValidationUtils.sanitizeString(standData.nombre_stand);
      }
      if (standData.ubicacion) {
        standData.ubicacion = ValidationUtils.sanitizeString(standData.ubicacion);
      }
      if (standData.observaciones) {
        standData.observaciones = ValidationUtils.sanitizeString(standData.observaciones);
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

      // --- CAPA DE COMPATIBILIDAD Y LIMPIEZA DEFINITIVA ---
      if (updateData.precio_base !== undefined && updateData.precio_base !== null && updateData.precio_base !== '') {
        updateData.precio_personalizado = updateData.precio_base;
        delete updateData.precio_base;
      }
      
      // Manejo mejorado del precio_personalizado
      if (updateData.precio_personalizado !== undefined && updateData.precio_personalizado !== null && updateData.precio_personalizado !== '') {
        const precio = parseFloat(updateData.precio_personalizado);
        if (isNaN(precio)) {
          delete updateData.precio_personalizado; // Eliminar si no es un número válido
        } else if (precio < 0) {
          return ApiResponse.validation(res, [{ field: 'precio_personalizado', message: 'El precio personalizado no puede ser negativo' }]);
        } else {
          updateData.precio_personalizado = precio; // Asegurar que sea número
        }
      } else {
        // Si el precio está vacío, undefined o null, establecerlo como null explícitamente
        updateData.precio_personalizado = null;
      }

      // Convertir campos numéricos que pueden venir como strings
      if (updateData.area !== undefined && updateData.area !== null && updateData.area !== '') {
        const area = parseFloat(updateData.area);
        if (isNaN(area) || area <= 0) {
          return ApiResponse.validation(res, [{ field: 'area', message: 'El área debe ser mayor a 0' }]);
        }
        updateData.area = area;
      }

      if (updateData.coordenadas_x !== undefined && updateData.coordenadas_x !== null && updateData.coordenadas_x !== '') {
        const coordX = parseFloat(updateData.coordenadas_x);
        if (!isNaN(coordX)) {
          updateData.coordenadas_x = coordX;
        } else {
          delete updateData.coordenadas_x;
        }
      }

      if (updateData.coordenadas_y !== undefined && updateData.coordenadas_y !== null && updateData.coordenadas_y !== '') {
        const coordY = parseFloat(updateData.coordenadas_y);
        if (!isNaN(coordY)) {
          updateData.coordenadas_y = coordY;
        } else {
          delete updateData.coordenadas_y;
        }
      }

      if (updateData.capacidad_maxima_personas !== undefined && updateData.capacidad_maxima_personas !== null && updateData.capacidad_maxima_personas !== '') {
        const capacidad = parseInt(updateData.capacidad_maxima_personas);
        if (!isNaN(capacidad) && capacidad > 0) {
          updateData.capacidad_maxima_personas = capacidad;
        } else {
          delete updateData.capacidad_maxima_personas;
        }
      }

      // Mapea campos de un formulario antiguo a los campos del modelo nuevo
      if (updateData.nombre_stand && !updateData.codigo_stand) {
        updateData.codigo_stand = updateData.nombre_stand;
      }
      if (updateData.estado && !updateData.estado_fisico) {
        updateData.estado_fisico = updateData.estado === 'reservado' ? 'ocupado' : updateData.estado;
      }

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validaciones opcionales para campos que se están actualizando
      if (updateData.codigo_stand && !ValidationUtils.isValidLength(updateData.codigo_stand, 1, 50)) {
        return ApiResponse.validation(res, [{ field: 'codigo_stand', message: 'El código del stand debe tener entre 1 y 50 caracteres' }]);
      }

      const estadosFisicosValidos = ['disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio'];
      if (updateData.estado_fisico && !estadosFisicosValidos.includes(updateData.estado_fisico)) {
        return ApiResponse.validation(res, [{ field: 'estado_fisico', message: 'Estado físico inválido' }]);
      }

      // Sanitizar datos de texto
      if (updateData.codigo_stand) {
        updateData.codigo_stand = ValidationUtils.sanitizeString(updateData.codigo_stand);
      }
      if (updateData.nombre_stand) {
        updateData.nombre_stand = ValidationUtils.sanitizeString(updateData.nombre_stand);
      }
      if (updateData.ubicacion) {
        updateData.ubicacion = ValidationUtils.sanitizeString(updateData.ubicacion);
      }
      if (updateData.observaciones) {
        updateData.observaciones = ValidationUtils.sanitizeString(updateData.observaciones);
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
