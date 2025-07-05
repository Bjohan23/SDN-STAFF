const ConflictoAsignacionService = require('../services/ConflictoAsignacionService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Conflictos de Asignación
 */
class ConflictoAsignacionController {

  /**
   * Obtener todos los conflictos
   */
  static async getAllConflictos(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const includeDeleted = req.query.include_deleted === 'true';
      
      const filters = {
        estado_conflicto: req.query.estado_conflicto || '',
        tipo_conflicto: req.query.tipo_conflicto || '',
        prioridad_resolucion: req.query.prioridad_resolucion || '',
        id_evento: req.query.id_evento || '',
        asignado_a: req.query.asignado_a || '',
        fecha_desde: req.query.fecha_desde || '',
        fecha_hasta: req.query.fecha_hasta || '',
        vencidos: req.query.vencidos || ''
      };

      const result = await ConflictoAsignacionService.getAllConflictos(page, limit, filters, includeDeleted);

      return ApiResponse.paginated(
        res, 
        result.conflictos, 
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Conflictos de asignación obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener conflicto por ID
   */
  static async getConflictoById(req, res, next) {
    try {
      const { id } = req.params;
      const includeDetails = req.query.include_details === 'true';
      const includeDeleted = req.query.include_deleted === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const conflicto = await ConflictoAsignacionService.getConflictoById(id, includeDetails, includeDeleted);
      
      return ApiResponse.success(res, conflicto, 'Conflicto obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Conflicto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Crear conflicto manualmente
   */
  static async createConflicto(req, res, next) {
    try {
      const userId = req.user ? req.user.id_usuario : null;
      const conflictoData = req.body;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      // Validaciones básicas
      if (!ValidationUtils.isValidId(conflictoData.id_evento)) {
        return ApiResponse.validation(res, [{ field: 'id_evento', message: 'ID de evento inválido' }]);
      }

      if (!ValidationUtils.isValidId(conflictoData.id_stand)) {
        return ApiResponse.validation(res, [{ field: 'id_stand', message: 'ID de stand inválido' }]);
      }

      // Validar tipo de conflicto
      const tiposValidos = ['multiple_solicitudes', 'cambio_requerido', 'incompatibilidad', 'overbooking', 'conflicto_horario', 'otro'];
      if (!tiposValidos.includes(conflictoData.tipo_conflicto)) {
        return ApiResponse.validation(res, [{ field: 'tipo_conflicto', message: 'Tipo de conflicto inválido' }]);
      }

      // Validar prioridad de resolución
      const prioridadesValidas = ['baja', 'media', 'alta', 'critica'];
      if (conflictoData.prioridad_resolucion && !prioridadesValidas.includes(conflictoData.prioridad_resolucion)) {
        return ApiResponse.validation(res, [{ field: 'prioridad_resolucion', message: 'Prioridad de resolución inválida' }]);
      }

      if (!ValidationUtils.isNotEmpty(conflictoData.descripcion_conflicto)) {
        return ApiResponse.validation(res, [{ field: 'descripcion_conflicto', message: 'La descripción del conflicto es requerida' }]);
      }

      // Sanitizar descripción
      conflictoData.descripcion_conflicto = ValidationUtils.sanitizeString(conflictoData.descripcion_conflicto);

      const nuevoConflicto = await ConflictoAsignacionService.createConflicto(conflictoData, userId, metadatos);

      return ApiResponse.success(res, nuevoConflicto, 'Conflicto creado exitosamente', 201);
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('no existen')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Asignar conflicto a usuario para resolución
   */
  static async asignarConflicto(req, res, next) {
    try {
      const { id } = req.params;
      const { asignado_a, fecha_limite } = req.body;
      const asignadoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de conflicto inválido' }]);
      }

      if (!ValidationUtils.isValidId(asignado_a)) {
        return ApiResponse.validation(res, [{ field: 'asignado_a', message: 'ID de usuario asignado inválido' }]);
      }

      // Validar fecha límite si se proporciona
      let fechaLimiteDate = null;
      if (fecha_limite) {
        fechaLimiteDate = new Date(fecha_limite);
        if (isNaN(fechaLimiteDate.getTime())) {
          return ApiResponse.validation(res, [{ field: 'fecha_limite', message: 'Fecha límite inválida' }]);
        }
        if (fechaLimiteDate <= new Date()) {
          return ApiResponse.validation(res, [{ field: 'fecha_limite', message: 'La fecha límite debe ser futura' }]);
        }
      }

      const conflictoAsignado = await ConflictoAsignacionService.asignarConflicto(id, asignado_a, asignadoPor, fechaLimiteDate, metadatos);
      
      return ApiResponse.success(res, conflictoAsignado, 'Conflicto asignado exitosamente');
    } catch (error) {
      if (error.message === 'Conflicto no encontrado' || error.message === 'Usuario asignado no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('Solo se pueden asignar')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Resolver conflicto
   */
  static async resolverConflicto(req, res, next) {
    try {
      const { id } = req.params;
      const { empresa_asignada, criterio_aplicado, observaciones } = req.body;
      const resueltoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de conflicto inválido' }]);
      }

      if (!ValidationUtils.isValidId(empresa_asignada)) {
        return ApiResponse.validation(res, [{ field: 'empresa_asignada', message: 'ID de empresa asignada inválido' }]);
      }

      if (!ValidationUtils.isNotEmpty(criterio_aplicado)) {
        return ApiResponse.validation(res, [{ field: 'criterio_aplicado', message: 'El criterio aplicado es requerido' }]);
      }

      // Sanitizar textos
      const criterioSanitizado = ValidationUtils.sanitizeString(criterio_aplicado);
      const observacionesSanitizadas = observaciones ? ValidationUtils.sanitizeString(observaciones) : null;

      const conflictoResuelto = await ConflictoAsignacionService.resolverConflicto(
        id, 
        empresa_asignada, 
        criterioSanitizado, 
        observacionesSanitizadas, 
        resueltoPor, 
        metadatos
      );
      
      return ApiResponse.success(res, conflictoResuelto, 'Conflicto resuelto exitosamente');
    } catch (error) {
      if (error.message === 'Conflicto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('ya está resuelto') || error.message.includes('debe estar entre')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Escalar conflicto
   */
  static async escalarConflicto(req, res, next) {
    try {
      const { id } = req.params;
      const { escalado_a, motivo } = req.body;
      const escaladoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de conflicto inválido' }]);
      }

      if (!ValidationUtils.isValidId(escalado_a)) {
        return ApiResponse.validation(res, [{ field: 'escalado_a', message: 'ID de usuario de escalamiento inválido' }]);
      }

      if (!ValidationUtils.isNotEmpty(motivo)) {
        return ApiResponse.validation(res, [{ field: 'motivo', message: 'El motivo de escalamiento es requerido' }]);
      }

      const motivoSanitizado = ValidationUtils.sanitizeString(motivo);

      const conflictoEscalado = await ConflictoAsignacionService.escalarConflicto(id, escalado_a, motivoSanitizado, escaladoPor, metadatos);
      
      return ApiResponse.success(res, conflictoEscalado, 'Conflicto escalado exitosamente');
    } catch (error) {
      if (error.message === 'Conflicto no encontrado' || error.message === 'Usuario de escalamiento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('Solo se pueden escalar')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Detectar conflictos automáticamente para un evento
   */
  static async detectarConflictosEvento(req, res, next) {
    try {
      const { evento_id } = req.params;
      const { crear_automaticamente = true } = req.body;
      const detectadoPor = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      const resultado = await ConflictoAsignacionService.detectarConflictosEvento(evento_id, crear_automaticamente, detectadoPor);
      
      return ApiResponse.success(res, resultado, 'Detección de conflictos completada exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener conflictos vencidos
   */
  static async getConflictosVencidos(req, res, next) {
    try {
      const conflictosVencidos = await ConflictoAsignacionService.getConflictosVencidos();
      
      return ApiResponse.success(res, conflictosVencidos, 'Conflictos vencidos obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de conflictos
   */
  static async getEstadisticas(req, res, next) {
    try {
      const filtros = {
        id_evento: req.query.id_evento || '',
        fecha_desde: req.query.fecha_desde || '',
        fecha_hasta: req.query.fecha_hasta || ''
      };

      const estadisticas = await ConflictoAsignacionService.getEstadisticas(filtros);
      
      return ApiResponse.success(res, estadisticas, 'Estadísticas de conflictos obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Añadir comunicación a conflicto
   */
  static async addComunicacion(req, res, next) {
    try {
      const { id } = req.params;
      const { tipo_comunicacion, participante, mensaje, medio = 'email' } = req.body;
      const usuarioId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de conflicto inválido' }]);
      }

      if (!ValidationUtils.isNotEmpty(tipo_comunicacion)) {
        return ApiResponse.validation(res, [{ field: 'tipo_comunicacion', message: 'El tipo de comunicación es requerido' }]);
      }

      if (!ValidationUtils.isNotEmpty(participante)) {
        return ApiResponse.validation(res, [{ field: 'participante', message: 'El participante es requerido' }]);
      }

      if (!ValidationUtils.isNotEmpty(mensaje)) {
        return ApiResponse.validation(res, [{ field: 'mensaje', message: 'El mensaje es requerido' }]);
      }

      // Sanitizar textos
      const tipoSanitizado = ValidationUtils.sanitizeString(tipo_comunicacion);
      const participanteSanitizado = ValidationUtils.sanitizeString(participante);
      const mensajeSanitizado = ValidationUtils.sanitizeString(mensaje);

      const conflictoActualizado = await ConflictoAsignacionService.addComunicacion(
        id, 
        tipoSanitizado, 
        participanteSanitizado, 
        mensajeSanitizado, 
        medio, 
        usuarioId
      );
      
      return ApiResponse.success(res, conflictoActualizado, 'Comunicación añadida exitosamente');
    } catch (error) {
      if (error.message === 'Conflicto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Cancelar conflicto
   */
  static async cancelarConflicto(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const canceladoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de conflicto inválido' }]);
      }

      if (!ValidationUtils.isNotEmpty(motivo)) {
        return ApiResponse.validation(res, [{ field: 'motivo', message: 'El motivo de cancelación es requerido' }]);
      }

      const motivoSanitizado = ValidationUtils.sanitizeString(motivo);

      const conflictoCancelado = await ConflictoAsignacionService.cancelarConflicto(id, motivoSanitizado, canceladoPor, metadatos);
      
      return ApiResponse.success(res, conflictoCancelado, 'Conflicto cancelado exitosamente');
    } catch (error) {
      if (error.message === 'Conflicto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('Solo se pueden cancelar')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Eliminar conflicto
   */
  static async deleteConflicto(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await ConflictoAsignacionService.deleteConflicto(id, userId);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Conflicto no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener conflictos asignados a un usuario
   */
  static async getConflictosAsignadosUsuario(req, res, next) {
    try {
      const { usuario_id } = req.params;
      const estado = req.query.estado || '';

      if (!ValidationUtils.isValidId(usuario_id)) {
        return ApiResponse.validation(res, [{ field: 'usuario_id', message: 'ID de usuario inválido' }]);
      }

      const filters = {
        asignado_a: usuario_id,
        estado_conflicto: estado
      };

      const result = await ConflictoAsignacionService.getAllConflictos(1, 100, filters, false);
      
      return ApiResponse.success(res, result.conflictos, 'Conflictos asignados obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener resumen de conflictos para dashboard
   */
  static async getResumenDashboard(req, res, next) {
    try {
      const { id_evento } = req.query;

      // Obtener conflictos activos
      const filtrosActivos = { estado_conflicto: 'detectado,en_revision,en_resolucion' };
      if (id_evento) filtrosActivos.id_evento = id_evento;

      const activos = await ConflictoAsignacionService.getAllConflictos(1, 1000, filtrosActivos, false);

      // Obtener conflictos vencidos
      const vencidos = await ConflictoAsignacionService.getConflictosVencidos();

      // Estadísticas generales
      const estadisticas = await ConflictoAsignacionService.getEstadisticas({ id_evento });

      const resumen = {
        conflictos_activos: activos.pagination.totalItems,
        conflictos_vencidos: vencidos.length,
        conflictos_criticos: activos.conflictos.filter(c => c.prioridad_resolucion === 'critica').length,
        tasa_resolucion: estadisticas.tasa_resolucion,
        tiempo_promedio_resolucion: estadisticas.detalle_estadisticas.find(e => e.tiempo_promedio_resolucion)?.tiempo_promedio_resolucion || 0,
        distribucion_por_tipo: estadisticas.detalle_estadisticas.reduce((acc, item) => {
          if (!acc[item.tipo_conflicto]) acc[item.tipo_conflicto] = 0;
          acc[item.tipo_conflicto] += parseInt(item.total);
          return acc;
        }, {}),
        conflictos_recientes: activos.conflictos.slice(0, 5)
      };
      
      return ApiResponse.success(res, resumen, 'Resumen de conflictos obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ConflictoAsignacionController;
