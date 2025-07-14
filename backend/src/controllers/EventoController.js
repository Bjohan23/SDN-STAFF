const EventoService = require('../services/EventoService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Evento
 */
class EventoController {

  /**
   * Crear nuevo evento
   */
  static async createEvento(req, res, next) {
    try {
      const userId = req.user ? req.user.id_usuario : null;
      const eventoData = req.body;
      console.log(eventoData)
      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(eventoData.nombre_evento)) {
        return ApiResponse.validation(res, [{ field: 'nombre_evento', message: 'El nombre del evento es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(eventoData.nombre_evento, 3, 100)) {
        return ApiResponse.validation(res, [{ field: 'nombre_evento', message: 'El nombre del evento debe tener entre 3 y 100 caracteres' }]);
      }

      if (!eventoData.fecha_inicio) {
        return ApiResponse.validation(res, [{ field: 'fecha_inicio', message: 'La fecha de inicio es requerida' }]);
      }

      if (!eventoData.fecha_fin) {
        return ApiResponse.validation(res, [{ field: 'fecha_fin', message: 'La fecha de fin es requerida' }]);
      }

      if (!ValidationUtils.isValidDate(eventoData.fecha_inicio)) {
        return ApiResponse.validation(res, [{ field: 'fecha_inicio', message: 'Fecha de inicio inválida' }]);
      }

      if (!ValidationUtils.isValidDate(eventoData.fecha_fin)) {
        return ApiResponse.validation(res, [{ field: 'fecha_fin', message: 'Fecha de fin inválida' }]);
      }

      if (!eventoData.id_tipo_evento || !ValidationUtils.isValidId(eventoData.id_tipo_evento)) {
        return ApiResponse.validation(res, [{ field: 'id_tipo_evento', message: 'El tipo de evento es requerido y debe ser válido' }]);
      }

      // Validar URL virtual si se proporciona
      // if (eventoData.url_virtual && eventoData.url_virtual.trim() !== '') {
      //   try {
      //     new URL(eventoData.url_virtual);
      //   } catch {
      //     return ApiResponse.validation(res, [{ field: 'url_virtual', message: 'La URL virtual debe ser válida' }]);
      //   }
      // }

      // Validar capacidad máxima
      if (eventoData.capacidad_maxima && eventoData.capacidad_maxima <= 0) {
        return ApiResponse.validation(res, [{ field: 'capacidad_maxima', message: 'La capacidad máxima debe ser mayor a 0' }]);
      }

      // Validar precio
      if (eventoData.precio_entrada && eventoData.precio_entrada < 0) {
        console.log('El precio no puede ser negativo');
        console.log(eventoData.precio_entrada);
        console.log(eventoData);
        return ApiResponse.validation(res, [{ field: 'precio_entrada', message: 'El precio no puede ser negativo' }]);
      }

      // Sanitizar datos
      eventoData.nombre_evento = ValidationUtils.sanitizeString(eventoData.nombre_evento);
      if (eventoData.descripcion) {
        eventoData.descripcion = ValidationUtils.sanitizeString(eventoData.descripcion);
      }
      if (eventoData.ubicacion) {
        eventoData.ubicacion = ValidationUtils.sanitizeString(eventoData.ubicacion);
      }

      // Crear evento
      const nuevoEvento = await EventoService.createEvento(eventoData, userId);

      return ApiResponse.success(res, nuevoEvento, 'Evento creado exitosamente', 201);
    } catch (error) {
      if (error.message.includes('ya existe') || error.message.includes('no encontrado')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener todos los eventos
   */
  static async getAllEventos(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';
      
      const filters = {
        search: req.query.search || '',
        estado: req.query.estado || '',
        tipo_evento: req.query.tipo_evento || '',
        fecha_desde: req.query.fecha_desde || '',
        fecha_hasta: req.query.fecha_hasta || ''
      };

      const result = await EventoService.getAllEventos(page, limit, filters, includeAudit, includeDeleted);

      return ApiResponse.paginated(
        res, 
        result.eventos, 
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Eventos obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener evento por ID
   */
  static async getEventoById(req, res, next) {
    try {
      const { id } = req.params;
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const evento = await EventoService.getEventoById(id, includeAudit, includeDeleted);
      
      return ApiResponse.success(res, evento, 'Evento obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener evento por URL amigable
   */
  static async getEventoByUrl(req, res, next) {
    try {
      const { url } = req.params;

      if (!ValidationUtils.isNotEmpty(url)) {
        return ApiResponse.validation(res, [{ field: 'url', message: 'URL amigable requerida' }]);
      }

      const evento = await EventoService.getEventoByUrlAmigable(url);
      
      if (!evento) {
        return ApiResponse.notFound(res, 'Evento no encontrado');
      }
      
      return ApiResponse.success(res, evento, 'Evento obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar evento
   */
  static async updateEvento(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validaciones opcionales para campos que se están actualizando
      if (updateData.nombre_evento && !ValidationUtils.isValidLength(updateData.nombre_evento, 3, 100)) {
        return ApiResponse.validation(res, [{ field: 'nombre_evento', message: 'El nombre del evento debe tener entre 3 y 100 caracteres' }]);
      }

      if (updateData.fecha_inicio && !ValidationUtils.isValidDate(updateData.fecha_inicio)) {
        return ApiResponse.validation(res, [{ field: 'fecha_inicio', message: 'Fecha de inicio inválida' }]);
      }

      if (updateData.fecha_fin && !ValidationUtils.isValidDate(updateData.fecha_fin)) {
        return ApiResponse.validation(res, [{ field: 'fecha_fin', message: 'Fecha de fin inválida' }]);
      }

      if (updateData.url_virtual && updateData.url_virtual.trim() !== '') {
        try {
          new URL(updateData.url_virtual);
        } catch {
          return ApiResponse.validation(res, [{ field: 'url_virtual', message: 'La URL virtual debe ser válida' }]);
        }
      }

      if (updateData.capacidad_maxima && updateData.capacidad_maxima <= 0) {
        return ApiResponse.validation(res, [{ field: 'capacidad_maxima', message: 'La capacidad máxima debe ser mayor a 0' }]);
      }

      if (updateData.precio_entrada && updateData.precio_entrada < 0) {
        return ApiResponse.validation(res, [{ field: 'precio_entrada', message: 'El precio no puede ser negativo' }]);
      }

      // Sanitizar datos
      if (updateData.nombre_evento) {
        updateData.nombre_evento = ValidationUtils.sanitizeString(updateData.nombre_evento);
      }
      if (updateData.descripcion) {
        updateData.descripcion = ValidationUtils.sanitizeString(updateData.descripcion);
      }
      if (updateData.ubicacion) {
        updateData.ubicacion = ValidationUtils.sanitizeString(updateData.ubicacion);
      }

      const eventoActualizado = await EventoService.updateEvento(id, updateData, userId);
      
      return ApiResponse.success(res, eventoActualizado, 'Evento actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Eliminar evento
   */
  static async deleteEvento(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await EventoService.deleteEvento(id, userId);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Cambiar estado del evento
   */
  static async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const estadosValidos = ['borrador', 'publicado', 'activo', 'finalizado', 'archivado'];
      if (!estadosValidos.includes(estado)) {
        return ApiResponse.validation(res, [{ field: 'estado', message: 'Estado debe ser: borrador, publicado, activo, finalizado o archivado' }]);
      }

      const evento = await EventoService.cambiarEstadoEvento(id, estado, userId);
      
      return ApiResponse.success(res, evento, 'Estado del evento actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede cambiar')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Duplicar evento
   */
  static async duplicarEvento(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre_evento, url_amigable, fecha_inicio, fecha_fin, fecha_limite_registro } = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const nuevosNombres = {};
      if (nombre_evento) nuevosNombres.nombre_evento = ValidationUtils.sanitizeString(nombre_evento);
      if (url_amigable) nuevosNombres.url_amigable = ValidationUtils.sanitizeString(url_amigable);
      if (fecha_inicio) nuevosNombres.fecha_inicio = fecha_inicio;
      if (fecha_fin) nuevosNombres.fecha_fin = fecha_fin;
      if (fecha_limite_registro) nuevosNombres.fecha_limite_registro = fecha_limite_registro;

      const eventoNuevo = await EventoService.duplicarEvento(id, nuevosNombres, userId);
      
      return ApiResponse.success(res, eventoNuevo, 'Evento duplicado exitosamente', 201);
    } catch (error) {
      if (error.message === 'Evento original no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener eventos próximos
   */
  static async getEventosProximos(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const eventos = await EventoService.getEventosProximos(limit);
      
      return ApiResponse.success(res, eventos, 'Eventos próximos obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener eventos activos
   */
  static async getEventosActivos(req, res, next) {
    try {
      const eventos = await EventoService.getEventosActivos();
      
      return ApiResponse.success(res, eventos, 'Eventos activos obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de eventos
   */
  static async getEventoStats(req, res, next) {
    try {
      const stats = await EventoService.getEventoStats();
      
      return ApiResponse.success(res, stats, 'Estadísticas de eventos obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurar evento eliminado
   */
  static async restoreEvento(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await EventoService.restoreEvento(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message === 'El evento no está eliminado') {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Verificar disponibilidad de URL amigable
   */
  static async verificarUrlAmigable(req, res, next) {
    try {
      const { url } = req.params;
      const { evento_id } = req.query; // Para excluir en actualizaciones

      if (!ValidationUtils.isNotEmpty(url)) {
        return ApiResponse.validation(res, [{ field: 'url', message: 'URL amigable requerida' }]);
      }

      const eventoExistente = await EventoService.getEventoByUrlAmigable(url);
      
      let disponible = !eventoExistente;
      
      // Si existe pero es el mismo evento que se está editando, está disponible
      if (eventoExistente && evento_id && eventoExistente.id_evento == evento_id) {
        disponible = true;
      }
      
      return ApiResponse.success(res, { 
        disponible,
        url_amigable: url,
        evento_existente: eventoExistente ? {
          id: eventoExistente.id_evento,
          nombre: eventoExistente.nombre_evento
        } : null
      }, disponible ? 'URL disponible' : 'URL no disponible');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Vista previa del evento (para previsualizacion)
   */
  static async previewEvento(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const evento = await EventoService.getEventoById(id);
      
      // Agregar información de estado para la vista previa
      const eventoConEstado = {
        ...evento.toJSON(),
        es_activo: evento.isActive(),
        es_proximo: evento.isUpcoming(),
        ha_finalizado: evento.isFinished(),
        puede_registrarse: evento.canRegister()
      };
      
      return ApiResponse.success(res, eventoConEstado, 'Vista previa del evento obtenida exitosamente');
    } catch (error) {
      if (error.message === 'Evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }
}

module.exports = EventoController;
