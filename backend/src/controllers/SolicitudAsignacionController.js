const SolicitudAsignacionService = require('../services/SolicitudAsignacionService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Solicitudes de Asignación
 */
class SolicitudAsignacionController {

  /**
   * Crear nueva solicitud de asignación
   */
  static async createSolicitud(req, res, next) {
    try {
      const userId = req.user ? req.user.id_usuario : null;
      const solicitudData = req.body;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      // Validaciones básicas
      if (!ValidationUtils.isValidId(solicitudData.id_empresa)) {
        return ApiResponse.validation(res, [{ field: 'id_empresa', message: 'ID de empresa inválido' }]);
      }

      if (!ValidationUtils.isValidId(solicitudData.id_evento)) {
        return ApiResponse.validation(res, [{ field: 'id_evento', message: 'ID de evento inválido' }]);
      }

      // Validar modalidad de asignación
      const modalidadesValidas = ['seleccion_directa', 'manual', 'automatica'];
      if (solicitudData.modalidad_asignacion && !modalidadesValidas.includes(solicitudData.modalidad_asignacion)) {
        return ApiResponse.validation(res, [{ field: 'modalidad_asignacion', message: 'Modalidad de asignación inválida' }]);
      }

      // Si se especifica un stand, validar que es un ID válido
      if (solicitudData.id_stand_solicitado && !ValidationUtils.isValidId(solicitudData.id_stand_solicitado)) {
        return ApiResponse.validation(res, [{ field: 'id_stand_solicitado', message: 'ID de stand solicitado inválido' }]);
      }

      // Sanitizar texto
      if (solicitudData.motivo_solicitud) {
        solicitudData.motivo_solicitud = ValidationUtils.sanitizeString(solicitudData.motivo_solicitud);
      }

      // Crear la solicitud
      const nuevaSolicitud = await SolicitudAsignacionService.createSolicitud(solicitudData, userId, metadatos);

      return ApiResponse.success(res, nuevaSolicitud, 'Solicitud de asignación creada exitosamente', 201);
    } catch (error) {
      if (error.message.includes('ya existe') || error.message.includes('no encontrad') || error.message.includes('Solo las empresas')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener todas las solicitudes
   */
  static async getAllSolicitudes(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const includeDeleted = req.query.include_deleted === 'true';
      
      const filters = {
        search: req.query.search || '',
        estado_solicitud: req.query.estado_solicitud || '',
        modalidad_asignacion: req.query.modalidad_asignacion || '',
        id_evento: req.query.id_evento || '',
        id_empresa: req.query.id_empresa || '',
        fecha_desde: req.query.fecha_desde || '',
        fecha_hasta: req.query.fecha_hasta || '',
        prioridad_min: req.query.prioridad_min || ''
      };

      const result = await SolicitudAsignacionService.getAllSolicitudes(page, limit, filters, includeDeleted);

      return ApiResponse.paginated(
        res, 
        result.solicitudes, 
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Solicitudes de asignación obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener solicitud por ID
   */
  static async getSolicitudById(req, res, next) {
    try {
      const { id } = req.params;
      const includeDetails = req.query.include_details === 'true';
      const includeDeleted = req.query.include_deleted === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const solicitud = await SolicitudAsignacionService.getSolicitudById(id, includeDetails, includeDeleted);
      
      return ApiResponse.success(res, solicitud, 'Solicitud de asignación obtenida exitosamente');
    } catch (error) {
      if (error.message === 'Solicitud de asignación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Aprobar solicitud
   */
  static async aprobarSolicitud(req, res, next) {
    try {
      const { id } = req.params;
      const { observaciones } = req.body;
      const revisadoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const solicitudAprobada = await SolicitudAsignacionService.aprobarSolicitud(id, revisadoPor, observaciones, metadatos);
      
      return ApiResponse.success(res, solicitudAprobada, 'Solicitud aprobada exitosamente');
    } catch (error) {
      if (error.message === 'Solicitud de asignación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('Solo se pueden aprobar')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Rechazar solicitud
   */
  static async rechazarSolicitud(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const revisadoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!ValidationUtils.isNotEmpty(motivo)) {
        return ApiResponse.validation(res, [{ field: 'motivo', message: 'El motivo de rechazo es requerido' }]);
      }

      const solicitudRechazada = await SolicitudAsignacionService.rechazarSolicitud(id, motivo, revisadoPor, metadatos);
      
      return ApiResponse.success(res, solicitudRechazada, 'Solicitud rechazada exitosamente');
    } catch (error) {
      if (error.message === 'Solicitud de asignación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('Solo se pueden rechazar')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Asignar stand a solicitud
   */
  static async asignarStand(req, res, next) {
    try {
      const { id } = req.params;
      const { id_stand, precio, descuento } = req.body;
      const asignadoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de solicitud inválido' }]);
      }

      if (!ValidationUtils.isValidId(id_stand)) {
        return ApiResponse.validation(res, [{ field: 'id_stand', message: 'ID de stand inválido' }]);
      }

      // Validar precio si se proporciona
      if (precio !== undefined && precio !== null && (isNaN(precio) || precio < 0)) {
        return ApiResponse.validation(res, [{ field: 'precio', message: 'El precio debe ser un número válido mayor o igual a 0' }]);
      }

      // Validar descuento si se proporciona
      if (descuento !== undefined && descuento !== null && (isNaN(descuento) || descuento < 0 || descuento > 100)) {
        return ApiResponse.validation(res, [{ field: 'descuento', message: 'El descuento debe ser un número entre 0 y 100' }]);
      }

      const solicitudAsignada = await SolicitudAsignacionService.asignarStand(id, id_stand, asignadoPor, precio, descuento, metadatos);
      
      return ApiResponse.success(res, solicitudAsignada, 'Stand asignado exitosamente');
    } catch (error) {
      if (error.message === 'Solicitud de asignación no encontrada' || error.message === 'Stand no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('Solo se pueden asignar') || error.message.includes('no está disponible')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Cancelar solicitud
   */
  static async cancelarSolicitud(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo_cancelacion } = req.body;
      const canceladoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!ValidationUtils.isNotEmpty(motivo_cancelacion)) {
        return ApiResponse.validation(res, [{ field: 'motivo_cancelacion', message: 'El motivo de cancelación es requerido' }]);
      }

      const solicitudCancelada = await SolicitudAsignacionService.cancelarSolicitud(id, motivo_cancelacion, canceladoPor, metadatos);
      
      return ApiResponse.success(res, solicitudCancelada, 'Solicitud cancelada exitosamente');
    } catch (error) {
      if (error.message === 'Solicitud de asignación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('ya está cancelada') || error.message.includes('No se puede cancelar')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Obtener solicitudes pendientes de un evento
   */
  static async getSolicitudesPendientesEvento(req, res, next) {
    try {
      const { evento_id } = req.params;

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      const solicitudesPendientes = await SolicitudAsignacionService.getSolicitudesPendientesEvento(evento_id);
      
      return ApiResponse.success(res, solicitudesPendientes, 'Solicitudes pendientes obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  static async getEstadisticas(req, res, next) {
    try {
      const filtros = {
        id_evento: req.query.id_evento || '',
        fecha_desde: req.query.fecha_desde || '',
        fecha_hasta: req.query.fecha_hasta || ''
      };

      const estadisticas = await SolicitudAsignacionService.getEstadisticas(filtros);
      
      return ApiResponse.success(res, estadisticas, 'Estadísticas de solicitudes obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar solicitud
   */
  static async updateSolicitud(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Obtener solicitud actual
      const solicitudActual = await SolicitudAsignacionService.getSolicitudById(id, false, false);

      // Solo permitir actualizar ciertos campos según el estado
      const camposPermitidos = ['criterios_automaticos', 'preferencias_empresa', 'motivo_solicitud'];
      
      if (solicitudActual.isPendiente()) {
        camposPermitidos.push('id_stand_solicitado', 'modalidad_asignacion');
      }

      // Filtrar solo campos permitidos
      const datosActualizacion = {};
      for (const campo of camposPermitidos) {
        if (updateData[campo] !== undefined) {
          datosActualizacion[campo] = updateData[campo];
        }
      }

      // Sanitizar texto si existe
      if (datosActualizacion.motivo_solicitud) {
        datosActualizacion.motivo_solicitud = ValidationUtils.sanitizeString(datosActualizacion.motivo_solicitud);
      }

      // Actualizar campos básicos
      datosActualizacion.updated_by = userId;
      datosActualizacion.updated_at = new Date();

      await solicitudActual.update(datosActualizacion);

      const solicitudActualizada = await SolicitudAsignacionService.getSolicitudById(id, true, false);
      
      return ApiResponse.success(res, solicitudActualizada, 'Solicitud actualizada exitosamente');
    } catch (error) {
      if (error.message === 'Solicitud de asignación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Eliminar solicitud
   */
  static async deleteSolicitud(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await SolicitudAsignacionService.deleteSolicitud(id, userId);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Solicitud de asignación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Restaurar solicitud eliminada
   */
  static async restoreSolicitud(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await SolicitudAsignacionService.restoreSolicitud(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Solicitud no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message === 'La solicitud no está eliminada') {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Obtener historial de una solicitud específica
   */
  static async getHistorialSolicitud(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Verificar que la solicitud existe
      await SolicitudAsignacionService.getSolicitudById(id, false, false);

      const { HistoricoAsignacion } = require('../models');
      const historial = await HistoricoAsignacion.findAll({
        where: { id_solicitud: id },
        include: [
          { association: 'realizadoPorUsuario', attributes: ['id_usuario', 'nombre', 'email'] },
          { association: 'standAnterior', attributes: ['numero_stand', 'ubicacion'] },
          { association: 'standNuevo', attributes: ['numero_stand', 'ubicacion'] }
        ],
        order: [['fecha_cambio', 'DESC']]
      });
      
      return ApiResponse.success(res, historial, 'Historial de solicitud obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Solicitud de asignación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }
}

module.exports = SolicitudAsignacionController;
