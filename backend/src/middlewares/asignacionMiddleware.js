const { SolicitudAsignacion, ConflictoAsignacion } = require('../models');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Middleware específico para el sistema de asignación de stands
 */

/**
 * Middleware para validar que una solicitud pertenece al usuario autenticado
 * (para endpoints que permiten a empresas gestionar sus propias solicitudes)
 */
const validateSolicitudOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_usuario;
    const userRoles = req.user.roles || [];

    // Los admins y managers pueden acceder a cualquier solicitud
    if (userRoles.includes('administrador') || userRoles.includes('manager')) {
      return next();
    }

    // Para otros usuarios, verificar que la solicitud les pertenece
    const solicitud = await SolicitudAsignacion.findByPk(id, {
      include: [{ association: 'empresa' }]
    });

    if (!solicitud) {
      return ApiResponse.notFound(res, 'Solicitud no encontrada');
    }

    // Verificar que el usuario está asociado con la empresa de la solicitud
    // (esto requeriría una tabla de relación usuario-empresa, por ahora solo admin/manager)
    if (!userRoles.includes('Editor')) {
      return ApiResponse.forbidden(res, 'No tiene permisos para acceder a esta solicitud');
    }

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Error validando propiedad de solicitud', 500);
  }
};

/**
 * Middleware para validar que un evento acepta nuevas solicitudes
 */
const validateEventoAceptaSolicitudes = async (req, res, next) => {
  try {
    const eventoId = req.body.id_evento || req.params.evento_id;
    
    if (!eventoId) {
      return ApiResponse.validation(res, [{ field: 'id_evento', message: 'ID de evento requerido' }]);
    }

    const { Evento } = require('../models');
    const evento = await Evento.findByPk(eventoId);

    if (!evento) {
      return ApiResponse.notFound(res, 'Evento no encontrado');
    }

    // Verificar que el evento no ha finalizado
    if (evento.isFinished()) {
      return ApiResponse.error(res, 'No se pueden crear solicitudes para eventos finalizados', 400);
    }

    // Verificar fecha límite de registro si existe
    if (!evento.canRegister()) {
      return ApiResponse.error(res, 'La fecha límite para registro ha expirado', 400);
    }

    // Verificar estado del evento
    if (!['publicado', 'activo'].includes(evento.estado)) {
      return ApiResponse.error(res, 'El evento no acepta solicitudes en su estado actual', 400);
    }

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Error validando estado del evento', 500);
  }
};

/**
 * Middleware para validar límites de solicitudes por empresa por evento
 */
const validateLimiteSolicitudesPorEmpresa = async (req, res, next) => {
  try {
    const { id_empresa, id_evento } = req.body;

    if (!id_empresa || !id_evento) {
      return next(); // Dejar que otras validaciones manejen estos errores
    }

    // Verificar si ya existe una solicitud activa para esta empresa en este evento
    const solicitudExistente = await SolicitudAsignacion.findOne({
      where: {
        id_empresa,
        id_evento,
        estado_solicitud: ['solicitada', 'en_revision', 'aprobada', 'asignada'],
        deleted_at: null
      }
    });

    if (solicitudExistente) {
      return ApiResponse.error(res, 'Ya existe una solicitud activa para esta empresa en este evento', 409);
    }

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Error validando límite de solicitudes', 500);
  }
};

/**
 * Middleware para registrar actividad de asignación automática
 */
const logAsignacionAutomatica = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log de la actividad de asignación automática
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const { evento_id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;
      const action = req.path.includes('simular') ? 'simulacion' : 'ejecucion';
      
      console.log(`[ASIGNACION_AUTOMATICA] ${action.toUpperCase()} - Evento: ${evento_id}, Usuario: ${userId}, Timestamp: ${new Date().toISOString()}`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para validar conflictos críticos antes de operaciones
 */
const validateConflictosCriticos = async (req, res, next) => {
  try {
    const eventoId = req.body.id_evento || req.params.evento_id;
    
    if (!eventoId) {
      return next();
    }

    // Verificar conflictos críticos no resueltos
    const conflictosCriticos = await ConflictoAsignacion.count({
      where: {
        id_evento: eventoId,
        prioridad_resolucion: 'critica',
        estado_conflicto: ['detectado', 'en_revision', 'en_resolucion'],
        deleted_at: null
      }
    });

    if (conflictosCriticos > 0) {
      req.conflictosCriticos = conflictosCriticos;
      // No bloquear, pero advertir
      console.warn(`⚠️ ADVERTENCIA: ${conflictosCriticos} conflictos críticos sin resolver en evento ${eventoId}`);
    }

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Error validando conflictos críticos', 500);
  }
};

/**
 * Middleware para validar que un stand está disponible para asignación
 */
const validateStandDisponible = async (req, res, next) => {
  try {
    const standId = req.body.id_stand || req.params.stand_id;
    const eventoId = req.body.id_evento || req.params.evento_id;

    if (!standId) {
      return next();
    }

    const { Stand, StandEvento } = require('../models');
    
    // Verificar que el stand existe y está activo
    const stand = await Stand.findByPk(standId);
    if (!stand || !stand.isActive() || !stand.isDisponible()) {
      return ApiResponse.error(res, 'El stand no está disponible para asignación', 409);
    }

    // Si hay evento, verificar disponibilidad específica
    if (eventoId) {
      const standEvento = await StandEvento.findOne({
        where: {
          id_stand: standId,
          id_evento: eventoId
        }
      });

      if (!standEvento || !standEvento.isDisponible()) {
        return ApiResponse.error(res, 'El stand no está disponible para este evento', 409);
      }
    }

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Error validando disponibilidad del stand', 500);
  }
};

/**
 * Middleware para rate limiting en asignaciones automáticas
 */
const rateLimitAsignacionAutomatica = (req, res, next) => {
  const cache = req.app.locals.asignacionCache || {};
  const userId = req.user.id_usuario;
  const now = Date.now();
  const cooldown = 5 * 60 * 1000; // 5 minutos

  const userKey = `asignacion_${userId}`;
  const lastExecution = cache[userKey];

  if (lastExecution && (now - lastExecution) < cooldown) {
    const remaining = Math.ceil((cooldown - (now - lastExecution)) / 1000 / 60);
    return ApiResponse.error(res, `Debe esperar ${remaining} minutos antes de ejecutar otra asignación automática`, 429);
  }

  // Solo aplicar rate limiting para ejecuciones reales, no simulaciones
  if (!req.path.includes('simular')) {
    cache[userKey] = now;
    req.app.locals.asignacionCache = cache;
  }

  next();
};

/**
 * Middleware para validar transiciones de estado válidas
 */
const validateTransicionEstado = (estadosValidos) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      
      // Determinar el modelo basado en la ruta
      let modelo, campoEstado;
      if (req.path.includes('solicitudes')) {
        modelo = SolicitudAsignacion;
        campoEstado = 'estado_solicitud';
      } else if (req.path.includes('conflictos')) {
        modelo = ConflictoAsignacion;
        campoEstado = 'estado_conflicto';
      } else {
        return next(); // No aplicar validación
      }

      const registro = await modelo.findByPk(id);
      if (!registro) {
        return ApiResponse.notFound(res, 'Registro no encontrado');
      }

      const estadoActual = registro[campoEstado];
      if (!estadosValidos.includes(estadoActual)) {
        return ApiResponse.error(res, `No se puede realizar esta acción desde el estado: ${estadoActual}`, 400);
      }

      req.registroActual = registro;
      next();
    } catch (error) {
      return ApiResponse.error(res, 'Error validando transición de estado', 500);
    }
  };
};

module.exports = {
  validateSolicitudOwnership,
  validateEventoAceptaSolicitudes,
  validateLimiteSolicitudesPorEmpresa,
  logAsignacionAutomatica,
  validateConflictosCriticos,
  validateStandDisponible,
  rateLimitAsignacionAutomatica,
  validateTransicionEstado
};
