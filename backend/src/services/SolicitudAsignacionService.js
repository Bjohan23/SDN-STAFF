const { 
  SolicitudAsignacion, 
  EmpresaExpositora, 
  Evento, 
  Stand, 
  Usuario,
  HistoricoAsignacion,
  ConflictoAsignacion,
  StandEvento
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

/**
 * Servicio para gestión de solicitudes de asignación de stands
 */
class SolicitudAsignacionService {

  /**
   * Crear nueva solicitud de asignación
   */
  static async createSolicitud(solicitudData, userId = null, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      // Validar que la empresa existe y está aprobada
      const empresa = await EmpresaExpositora.findByPk(solicitudData.id_empresa, {
        transaction
      });

      if (!empresa) {
        throw new Error('Empresa expositora no encontrada');
      }

      if (!empresa.isApproved()) {
        throw new Error('Solo las empresas aprobadas pueden solicitar asignación de stands');
      }

      // Validar que el evento existe y acepta solicitudes
      const evento = await Evento.findByPk(solicitudData.id_evento, {
        transaction
      });

      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      // Verificar si ya existe una solicitud para esta empresa en este evento
      const solicitudExistente = await SolicitudAsignacion.findOne({
        where: {
          id_empresa: solicitudData.id_empresa,
          id_evento: solicitudData.id_evento,
          deleted_at: null
        },
        transaction
      });

      if (solicitudExistente) {
        throw new Error('Ya existe una solicitud de asignación para esta empresa en este evento');
      }

      // Si se especifica un stand, validar que existe y está disponible
      if (solicitudData.id_stand_solicitado) {
        const stand = await Stand.findByPk(solicitudData.id_stand_solicitado, {
          transaction
        });

        if (!stand) {
          throw new Error('Stand solicitado no encontrado');
        }

        if (!stand.isActive() || !stand.isDisponible()) {
          throw new Error('El stand solicitado no está disponible');
        }

        // Verificar que el stand está disponible para el evento
        const standEvento = await StandEvento.findOne({
          where: {
            id_stand: solicitudData.id_stand_solicitado,
            id_evento: solicitudData.id_evento
          },
          transaction
        });

        if (!standEvento || !standEvento.isDisponible()) {
          throw new Error('El stand no está disponible para este evento');
        }
      }

      // Calcular score de prioridad
      const prioridadScore = await this.calcularPrioridadScore(empresa);

      // Preparar datos de la solicitud
      const datosSolicitud = {
        ...solicitudData,
        prioridad_score: prioridadScore,
        fecha_solicitud: new Date(),
        created_by: userId
      };

      // Crear la solicitud
      const nuevaSolicitud = await SolicitudAsignacion.create(datosSolicitud, {
        transaction
      });

      // Cargar datos completos
      const solicitudCompleta = await SolicitudAsignacion.findByPk(nuevaSolicitud.id_solicitud, {
        include: [
          { association: 'empresa' },
          { association: 'evento' },
          { association: 'standSolicitado' }
        ],
        transaction
      });

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: solicitudData.id_empresa,
        id_evento: solicitudData.id_evento,
        id_solicitud: nuevaSolicitud.id_solicitud,
        tipo_cambio: 'asignacion_inicial',
        estado_nuevo: 'solicitada',
        motivo_cambio: 'Solicitud inicial de asignación de stand',
        descripcion_detallada: solicitudData.motivo_solicitud || 'Nueva solicitud de asignación',
        datos_adicionales: {
          modalidad: solicitudData.modalidad_asignacion,
          stand_solicitado: solicitudData.id_stand_solicitado,
          criterios: solicitudData.criterios_automaticos
        }
      }, userId, metadatos);

      // Detectar conflictos automáticamente si se solicita un stand específico
      if (solicitudData.id_stand_solicitado) {
        await this.detectarYCrearConflictos(solicitudData.id_evento, solicitudData.id_stand_solicitado, userId);
      }

      await transaction.commit();
      return solicitudCompleta;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Obtener todas las solicitudes con filtros
   */
  static async getAllSolicitudes(page = 1, limit = 10, filters = {}, includeDeleted = false) {
    const offset = (page - 1) * limit;
    
    // Construir condiciones WHERE
    const whereConditions = {};
    
    if (!includeDeleted) {
      whereConditions.deleted_at = null;
    }

    if (filters.estado_solicitud) {
      whereConditions.estado_solicitud = filters.estado_solicitud;
    }

    if (filters.modalidad_asignacion) {
      whereConditions.modalidad_asignacion = filters.modalidad_asignacion;
    }

    if (filters.id_evento) {
      whereConditions.id_evento = filters.id_evento;
    }

    if (filters.id_empresa) {
      whereConditions.id_empresa = filters.id_empresa;
    }

    if (filters.fecha_desde && filters.fecha_hasta) {
      whereConditions.fecha_solicitud = {
        [Op.between]: [new Date(filters.fecha_desde), new Date(filters.fecha_hasta)]
      };
    }

    if (filters.prioridad_min) {
      whereConditions.prioridad_score = {
        [Op.gte]: parseFloat(filters.prioridad_min)
      };
    }

    // Incluir asociaciones
    const include = [
      {
        association: 'empresa',
        attributes: ['id_empresa', 'nombre_empresa', 'email_contacto', 'estado']
      },
      {
        association: 'evento',
        attributes: ['id_evento', 'nombre_evento', 'fecha_inicio', 'fecha_fin']
      },
      {
        association: 'standSolicitado',
        required: false,
        attributes: ['id_stand', 'numero_stand', 'area', 'ubicacion']
      },
      {
        association: 'standAsignado',
        required: false,
        attributes: ['id_stand', 'numero_stand', 'area', 'ubicacion']
      }
    ];

    // Buscar texto en empresa si se proporciona
    if (filters.search) {
      include[0].where = {
        [Op.or]: [
          { nombre_empresa: { [Op.like]: `%${filters.search}%` } },
          { email_contacto: { [Op.like]: `%${filters.search}%` } }
        ]
      };
    }

    const { count, rows } = await SolicitudAsignacion.findAndCountAll({
      where: whereConditions,
      include,
      limit,
      offset,
      order: [
        ['prioridad_score', 'DESC'],
        ['fecha_solicitud', 'ASC']
      ],
      distinct: true
    });

    return {
      solicitudes: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Obtener solicitud por ID
   */
  static async getSolicitudById(id, includeDetails = true, includeDeleted = false) {
    const whereConditions = { id_solicitud: id };
    
    if (!includeDeleted) {
      whereConditions.deleted_at = null;
    }

    const include = [
      { association: 'empresa' },
      { association: 'evento' },
      { association: 'standSolicitado' },
      { association: 'standAsignado' }
    ];

    if (includeDetails) {
      include.push(
        { association: 'revisadoPorUsuario', attributes: ['id_usuario', 'nombre', 'email'] },
        { association: 'asignadoPorUsuario', attributes: ['id_usuario', 'nombre', 'email'] }
      );
    }

    const solicitud = await SolicitudAsignacion.findOne({
      where: whereConditions,
      include
    });

    if (!solicitud) {
      throw new Error('Solicitud de asignación no encontrada');
    }

    return solicitud;
  }

  /**
   * Aprobar solicitud
   */
  static async aprobarSolicitud(id, revisadoPor, observaciones = null, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      const solicitud = await this.getSolicitudById(id, true, false);

      if (!solicitud.isPendiente()) {
        throw new Error('Solo se pueden aprobar solicitudes pendientes');
      }

      const estadoAnterior = solicitud.estado_solicitud;

      // Aprobar la solicitud
      await solicitud.aprobar(revisadoPor, observaciones);

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: solicitud.id_empresa,
        id_evento: solicitud.id_evento,
        id_solicitud: solicitud.id_solicitud,
        tipo_cambio: 'confirmacion',
        estado_anterior: estadoAnterior,
        estado_nuevo: 'aprobada',
        motivo_cambio: 'Solicitud aprobada por revisor',
        descripcion_detallada: observaciones || 'Solicitud aprobada sin observaciones',
        datos_adicionales: {
          revisor: revisadoPor,
          observaciones: observaciones
        }
      }, revisadoPor, metadatos);

      await transaction.commit();

      return await this.getSolicitudById(id, true, false);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Rechazar solicitud
   */
  static async rechazarSolicitud(id, motivo, revisadoPor, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      const solicitud = await this.getSolicitudById(id, true, false);

      if (!solicitud.isPendiente()) {
        throw new Error('Solo se pueden rechazar solicitudes pendientes');
      }

      const estadoAnterior = solicitud.estado_solicitud;

      // Rechazar la solicitud
      await solicitud.rechazar(motivo, revisadoPor);

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: solicitud.id_empresa,
        id_evento: solicitud.id_evento,
        id_solicitud: solicitud.id_solicitud,
        tipo_cambio: 'cancelacion',
        estado_anterior: estadoAnterior,
        estado_nuevo: 'rechazada',
        motivo_cambio: 'Solicitud rechazada',
        descripcion_detallada: motivo,
        datos_adicionales: {
          revisor: revisadoPor,
          motivo_rechazo: motivo
        }
      }, revisadoPor, metadatos);

      await transaction.commit();

      return await this.getSolicitudById(id, true, false);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Asignar stand a solicitud aprobada
   */
  static async asignarStand(id, idStand, asignadoPor, precio = null, descuento = null, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      const solicitud = await this.getSolicitudById(id, true, false);

      if (!solicitud.isAprobada()) {
        throw new Error('Solo se pueden asignar stands a solicitudes aprobadas');
      }

      // Validar que el stand existe y está disponible
      const stand = await Stand.findByPk(idStand, { transaction });
      if (!stand) {
        throw new Error('Stand no encontrado');
      }

      if (!stand.isActive() || !stand.isDisponible()) {
        throw new Error('El stand no está disponible');
      }

      // Verificar disponibilidad en el evento
      const standEvento = await StandEvento.findOne({
        where: {
          id_stand: idStand,
          id_evento: solicitud.id_evento
        },
        transaction
      });

      if (!standEvento || !standEvento.isDisponible()) {
        throw new Error('El stand no está disponible para este evento');
      }

      const estadoAnterior = solicitud.estado_solicitud;
      const standAnterior = solicitud.id_stand_asignado;

      // Asignar el stand
      await solicitud.asignarStand(idStand, asignadoPor, precio, descuento);

      // Actualizar el estado del stand en el evento a reservado
      await standEvento.reservar();

      // Actualizar EmpresaEvento con el stand asignado
      const { EmpresaEvento } = require('../models');
      await EmpresaEvento.update(
        { id_stand: idStand },
        { 
          where: { 
            id_empresa: solicitud.id_empresa, 
            id_evento: solicitud.id_evento 
          },
          transaction 
        }
      );

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: solicitud.id_empresa,
        id_evento: solicitud.id_evento,
        id_solicitud: solicitud.id_solicitud,
        id_stand_anterior: standAnterior,
        id_stand_nuevo: idStand,
        tipo_cambio: standAnterior ? 'reasignacion' : 'asignacion_inicial',
        estado_anterior: estadoAnterior,
        estado_nuevo: 'asignada',
        motivo_cambio: 'Stand asignado a solicitud aprobada',
        descripcion_detallada: `Stand ${stand.numero_stand} asignado a ${solicitud.empresa.nombre_empresa}`,
        impacto_economico: precio || 0,
        datos_adicionales: {
          stand_numero: stand.numero_stand,
          precio_ofertado: precio,
          descuento_aplicado: descuento,
          asignado_por: asignadoPor
        }
      }, asignadoPor, metadatos);

      await transaction.commit();

      return await this.getSolicitudById(id, true, false);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Calcular score de prioridad para una empresa
   */
  static async calcularPrioridadScore(empresa) {
    let score = 0;
    
    // Puntos por número de participaciones anteriores (máximo 25 puntos)
    score += Math.min(empresa.numero_participaciones * 5, 25);
    
    // Puntos por calificación promedio (máximo 50 puntos)
    if (empresa.calificacion_promedio) {
      score += empresa.calificacion_promedio * 10;
    }
    
    // Puntos por antigüedad (máximo 20 puntos)
    const añosAntiguedad = new Date().getFullYear() - new Date(empresa.created_at).getFullYear();
    score += Math.min(añosAntiguedad * 2, 20);
    
    // Bonificación por estado aprobado (5 puntos)
    if (empresa.isApproved()) {
      score += 5;
    }
    
    return Math.min(score, 100);
  }

  /**
   * Detectar y crear conflictos automáticamente
   */
  static async detectarYCrearConflictos(idEvento, idStand = null, detectadoPor = null) {
    const conflictosDetectados = await ConflictoAsignacion.detectarConflictos(idEvento, idStand);
    
    const conflictosCreados = [];
    
    for (const conflicto of conflictosDetectados) {
      // Verificar si ya existe un conflicto para este stand en este evento
      const conflictoExistente = await ConflictoAsignacion.findOne({
        where: {
          id_evento: idEvento,
          id_stand: conflicto.id_stand,
          estado_conflicto: ['detectado', 'en_revision', 'en_resolucion'],
          deleted_at: null
        }
      });

      if (!conflictoExistente) {
        const nuevoConflicto = await ConflictoAsignacion.create({
          id_evento: idEvento,
          id_stand: conflicto.id_stand,
          tipo_conflicto: 'multiple_solicitudes',
          empresas_en_conflicto: conflicto.empresas,
          solicitudes_relacionadas: conflicto.solicitudes.map(s => s.id_solicitud),
          descripcion_conflicto: `Múltiples solicitudes detectadas para el stand ${conflicto.solicitudes[0].standSolicitado?.numero_stand || conflicto.id_stand}`,
          estado_conflicto: 'detectado',
          prioridad_resolucion: conflicto.empresas.length > 3 ? 'alta' : 'media',
          detectado_por: detectadoPor,
          metodo_deteccion: 'automatico',
          empresas_afectadas_total: conflicto.empresas.length,
          impacto_estimado: conflicto.empresas.length > 3 ? 'alto' : 'medio',
          created_by: detectadoPor
        });

        conflictosCreados.push(nuevoConflicto);
      }
    }
    
    return conflictosCreados;
  }

  /**
   * Obtener solicitudes pendientes de un evento
   */
  static async getSolicitudesPendientesEvento(idEvento) {
    return await SolicitudAsignacion.findAll({
      where: {
        id_evento: idEvento,
        estado_solicitud: ['solicitada', 'en_revision'],
        deleted_at: null
      },
      include: [
        { association: 'empresa' },
        { association: 'standSolicitado' }
      ],
      order: [
        ['prioridad_score', 'DESC'],
        ['fecha_solicitud', 'ASC']
      ]
    });
  }

  /**
   * Obtener estadísticas de solicitudes
   */
  static async getEstadisticas(filtros = {}) {
    const whereConditions = { deleted_at: null };

    if (filtros.id_evento) {
      whereConditions.id_evento = filtros.id_evento;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      whereConditions.fecha_solicitud = {
        [Op.between]: [new Date(filtros.fecha_desde), new Date(filtros.fecha_hasta)]
      };
    }

    const estadisticas = await SolicitudAsignacion.findAll({
      where: whereConditions,
      attributes: [
        'estado_solicitud',
        'modalidad_asignacion',
        [sequelize.fn('COUNT', sequelize.col('id_solicitud')), 'total'],
        [sequelize.fn('AVG', sequelize.col('prioridad_score')), 'prioridad_promedio']
      ],
      group: ['estado_solicitud', 'modalidad_asignacion'],
      raw: true
    });

    const totalSolicitudes = await SolicitudAsignacion.count({
      where: whereConditions
    });

    const promedioTiempoRespuesta = await SolicitudAsignacion.findAll({
      where: {
        ...whereConditions,
        fecha_revision: { [Op.ne]: null }
      },
      attributes: [
        [sequelize.fn('AVG', 
          sequelize.literal('TIMESTAMPDIFF(HOUR, fecha_solicitud, fecha_revision)')
        ), 'horas_promedio']
      ],
      raw: true
    });

    return {
      total_solicitudes: totalSolicitudes,
      tiempo_respuesta_promedio_horas: promedioTiempoRespuesta[0]?.horas_promedio || 0,
      detalle_por_estado: estadisticas,
      fecha_consulta: new Date()
    };
  }

  /**
   * Cancelar solicitud
   */
  static async cancelarSolicitud(id, motivoCancelacion, canceladoPor, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      const solicitud = await this.getSolicitudById(id, true, false);

      if (solicitud.estado_solicitud === 'cancelada') {
        throw new Error('La solicitud ya está cancelada');
      }

      if (solicitud.estado_solicitud === 'asignada') {
        throw new Error('No se puede cancelar una solicitud ya asignada. Use reasignación en su lugar');
      }

      const estadoAnterior = solicitud.estado_solicitud;

      // Cancelar la solicitud
      await solicitud.update({
        estado_solicitud: 'cancelada',
        motivo_rechazo: motivoCancelacion,
        updated_by: canceladoPor
      }, { transaction });

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: solicitud.id_empresa,
        id_evento: solicitud.id_evento,
        id_solicitud: solicitud.id_solicitud,
        tipo_cambio: 'cancelacion',
        estado_anterior: estadoAnterior,
        estado_nuevo: 'cancelada',
        motivo_cambio: 'Solicitud cancelada',
        descripcion_detallada: motivoCancelacion,
        datos_adicionales: {
          cancelado_por: canceladoPor
        }
      }, canceladoPor, metadatos);

      await transaction.commit();

      return await this.getSolicitudById(id, true, false);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Eliminar solicitud (soft delete)
   */
  static async deleteSolicitud(id, deletedBy = null) {
    const solicitud = await this.getSolicitudById(id, false, false);

    if (solicitud.estado_solicitud === 'asignada') {
      throw new Error('No se puede eliminar una solicitud asignada');
    }

    await solicitud.softDelete(deletedBy);

    return { message: 'Solicitud eliminada exitosamente' };
  }

  /**
   * Restaurar solicitud eliminada
   */
  static async restoreSolicitud(id) {
    const solicitud = await SolicitudAsignacion.findByPk(id);

    if (!solicitud) {
      throw new Error('Solicitud no encontrada');
    }

    if (!solicitud.isDeleted()) {
      throw new Error('La solicitud no está eliminada');
    }

    await solicitud.restore();

    return { message: 'Solicitud restaurada exitosamente' };
  }
}

module.exports = SolicitudAsignacionService;
