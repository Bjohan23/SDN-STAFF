const { 
  ConflictoAsignacion, 
  SolicitudAsignacion,
  EmpresaExpositora, 
  Evento, 
  Stand, 
  Usuario,
  HistoricoAsignacion
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

/**
 * Servicio para gestión de conflictos de asignación
 */
class ConflictoAsignacionService {

  /**
   * Obtener todos los conflictos con filtros
   */
  static async getAllConflictos(page = 1, limit = 10, filters = {}, includeDeleted = false) {
    const offset = (page - 1) * limit;
    
    const whereConditions = {};
    
    if (!includeDeleted) {
      whereConditions.deleted_at = null;
    }

    if (filters.estado_conflicto) {
      whereConditions.estado_conflicto = filters.estado_conflicto;
    }

    if (filters.tipo_conflicto) {
      whereConditions.tipo_conflicto = filters.tipo_conflicto;
    }

    if (filters.prioridad_resolucion) {
      whereConditions.prioridad_resolucion = filters.prioridad_resolucion;
    }

    if (filters.id_evento) {
      whereConditions.id_evento = filters.id_evento;
    }

    if (filters.asignado_a) {
      whereConditions.asignado_a = filters.asignado_a;
    }

    if (filters.fecha_desde && filters.fecha_hasta) {
      whereConditions.fecha_deteccion = {
        [Op.between]: [new Date(filters.fecha_desde), new Date(filters.fecha_hasta)]
      };
    }

    // Solo conflictos vencidos
    if (filters.vencidos === 'true') {
      whereConditions.fecha_limite_resolucion = {
        [Op.lt]: new Date()
      };
      whereConditions.estado_conflicto = ['detectado', 'en_revision', 'en_resolucion'];
    }

    const include = [
      {
        association: 'evento',
        attributes: ['id_evento', 'nombre_evento', 'fecha_inicio', 'fecha_fin']
      },
      {
        association: 'stand',
        attributes: ['id_stand', 'numero_stand', 'area', 'ubicacion']
      },
      {
        association: 'empresaAsignada',
        required: false,
        attributes: ['id_empresa', 'nombre_empresa']
      },
      {
        association: 'asignadoAUsuario',
        required: false,
        attributes: ['id_usuario', 'nombre', 'email']
      }
    ];

    const { count, rows } = await ConflictoAsignacion.findAndCountAll({
      where: whereConditions,
      include,
      limit,
      offset,
      order: [
        ['prioridad_resolucion', 'DESC'],
        ['fecha_deteccion', 'ASC']
      ],
      distinct: true
    });

    return {
      conflictos: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    };
  }

  /**
   * Obtener conflicto por ID
   */
  static async getConflictoById(id, includeDetails = true, includeDeleted = false) {
    const whereConditions = { id_conflicto: id };
    
    if (!includeDeleted) {
      whereConditions.deleted_at = null;
    }

    const include = [
      { association: 'evento' },
      { association: 'stand' },
      { association: 'empresaAsignada' }
    ];

    if (includeDetails) {
      include.push(
        { association: 'detectadoPorUsuario', attributes: ['id_usuario', 'nombre', 'email'] },
        { association: 'asignadoAUsuario', attributes: ['id_usuario', 'nombre', 'email'] },
        { association: 'resueltoPorUsuario', attributes: ['id_usuario', 'nombre', 'email'] },
        { association: 'escaladoAUsuario', attributes: ['id_usuario', 'nombre', 'email'] }
      );
    }

    const conflicto = await ConflictoAsignacion.findOne({
      where: whereConditions,
      include
    });

    if (!conflicto) {
      throw new Error('Conflicto no encontrado');
    }

    return conflicto;
  }

  /**
   * Crear conflicto manualmente
   */
  static async createConflicto(conflictoData, creadoPor = null, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      // Validar que el evento existe
      const evento = await Evento.findByPk(conflictoData.id_evento, { transaction });
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      // Validar que el stand existe
      const stand = await Stand.findByPk(conflictoData.id_stand, { transaction });
      if (!stand) {
        throw new Error('Stand no encontrado');
      }

      // Validar empresas en conflicto
      if (!Array.isArray(conflictoData.empresas_en_conflicto) || conflictoData.empresas_en_conflicto.length === 0) {
        throw new Error('Debe especificar al menos una empresa en conflicto');
      }

      // Verificar que las empresas existen
      const empresasIds = conflictoData.empresas_en_conflicto.map(e => e.id_empresa);
      const empresasExistentes = await EmpresaExpositora.findAll({
        where: { id_empresa: { [Op.in]: empresasIds } },
        attributes: ['id_empresa', 'nombre_empresa'],
        transaction
      });

      if (empresasExistentes.length !== empresasIds.length) {
        throw new Error('Una o más empresas especificadas no existen');
      }

      // Preparar datos del conflicto
      const datosConflicto = {
        ...conflictoData,
        fecha_deteccion: new Date(),
        detectado_por: creadoPor,
        metodo_deteccion: 'manual',
        empresas_afectadas_total: conflictoData.empresas_en_conflicto.length,
        impacto_estimado: this.calcularImpactoEstimado(conflictoData.empresas_en_conflicto.length, conflictoData.prioridad_resolucion),
        created_by: creadoPor
      };

      // Crear el conflicto
      const nuevoConflicto = await ConflictoAsignacion.create(datosConflicto, { transaction });

      // Cargar datos completos
      const conflictoCompleto = await ConflictoAsignacion.findByPk(nuevoConflicto.id_conflicto, {
        include: [
          { association: 'evento' },
          { association: 'stand' },
          { association: 'detectadoPorUsuario' }
        ],
        transaction
      });

      await transaction.commit();
      return conflictoCompleto;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Asignar conflicto a un usuario para resolución
   */
  static async asignarConflicto(id, asignadoA, asignadoPor = null, fechaLimite = null, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      const conflicto = await this.getConflictoById(id, false, false);

      if (!conflicto.isActivo()) {
        throw new Error('Solo se pueden asignar conflictos activos');
      }

      // Validar que el usuario existe
      const usuario = await Usuario.findByPk(asignadoA, { transaction });
      if (!usuario) {
        throw new Error('Usuario asignado no encontrado');
      }

      const estadoAnterior = conflicto.estado_conflicto;

      // Actualizar el conflicto
      await conflicto.update({
        estado_conflicto: 'en_resolucion',
        asignado_a: asignadoA,
        fecha_inicio_resolucion: new Date(),
        fecha_limite_resolucion: fechaLimite,
        updated_by: asignadoPor
      }, { transaction });

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: conflicto.empresas_en_conflicto[0]?.id_empresa,
        id_evento: conflicto.id_evento,
        id_stand_nuevo: conflicto.id_stand,
        tipo_cambio: 'confirmacion',
        estado_anterior: estadoAnterior,
        estado_nuevo: 'en_resolucion',
        motivo_cambio: 'Conflicto asignado para resolución',
        descripcion_detallada: `Conflicto asignado a ${usuario.nombre} para resolución`,
        datos_adicionales: {
          conflicto_id: conflicto.id_conflicto,
          asignado_a: asignadoA,
          fecha_limite: fechaLimite
        }
      }, asignadoPor, metadatos);

      await transaction.commit();

      return await this.getConflictoById(id, true, false);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Resolver conflicto
   */
  static async resolverConflicto(id, empresaAsignada, criterioAplicado, observaciones, resueltoPor, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      const conflicto = await this.getConflictoById(id, true, false);

      if (conflicto.estado_conflicto === 'resuelto') {
        throw new Error('El conflicto ya está resuelto');
      }

      // Validar que la empresa asignada está en el conflicto
      const empresaEnConflicto = conflicto.empresas_en_conflicto.find(e => e.id_empresa === empresaAsignada);
      if (!empresaEnConflicto) {
        throw new Error('La empresa asignada debe estar entre las empresas en conflicto');
      }

      // Calcular empresas compensadas (las que no obtuvieron el stand)
      const empresasCompensadas = conflicto.empresas_en_conflicto
        .filter(e => e.id_empresa !== empresaAsignada)
        .map(e => ({
          id_empresa: e.id_empresa,
          nombre_empresa: e.nombre_empresa,
          compensacion_ofrecida: null,
          alternativa_sugerida: null
        }));

      const estadoAnterior = conflicto.estado_conflicto;

      // Resolver el conflicto
      await conflicto.resolver(empresaAsignada, criterioAplicado, resueltoPor, observaciones);

      // Actualizar empresas compensadas
      await conflicto.update({
        empresas_compensadas: empresasCompensadas
      }, { transaction });

      // Actualizar solicitudes relacionadas
      if (conflicto.solicitudes_relacionadas && Array.isArray(conflicto.solicitudes_relacionadas)) {
        for (const solicitudId of conflicto.solicitudes_relacionadas) {
          const solicitud = await SolicitudAsignacion.findByPk(solicitudId, { transaction });
          if (solicitud) {
            if (solicitud.id_empresa === empresaAsignada) {
              // La empresa ganadora: aprobar su solicitud si no está aprobada
              if (solicitud.estado_solicitud === 'solicitada' || solicitud.estado_solicitud === 'en_revision') {
                await solicitud.update({
                  estado_solicitud: 'aprobada',
                  revisado_por: resueltoPor,
                  fecha_revision: new Date(),
                  observaciones_internas: `Aprobada por resolución de conflicto: ${criterioAplicado}`
                }, { transaction });
              }
            } else {
              // Empresas perdedoras: rechazar sus solicitudes si están pendientes
              if (solicitud.estado_solicitud === 'solicitada' || solicitud.estado_solicitud === 'en_revision') {
                await solicitud.update({
                  estado_solicitud: 'rechazada',
                  motivo_rechazo: `Stand asignado a otra empresa por resolución de conflicto. Criterio aplicado: ${criterioAplicado}`,
                  revisado_por: resueltoPor,
                  fecha_revision: new Date()
                }, { transaction });
              }
            }
          }
        }
      }

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: empresaAsignada,
        id_evento: conflicto.id_evento,
        id_stand_nuevo: conflicto.id_stand,
        tipo_cambio: 'asignacion_inicial',
        estado_anterior: estadoAnterior,
        estado_nuevo: 'resuelto',
        motivo_cambio: 'Conflicto resuelto',
        descripcion_detallada: `Conflicto resuelto. Stand asignado a empresa ${empresaEnConflicto.nombre_empresa}. Criterio: ${criterioAplicado}`,
        datos_adicionales: {
          conflicto_id: conflicto.id_conflicto,
          empresa_asignada: empresaAsignada,
          criterio_aplicado: criterioAplicado,
          empresas_compensadas: empresasCompensadas,
          observaciones: observaciones
        }
      }, resueltoPor, metadatos);

      await transaction.commit();

      return await this.getConflictoById(id, true, false);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Escalar conflicto
   */
  static async escalarConflicto(id, escaladoA, motivo, escaladoPor = null, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      const conflicto = await this.getConflictoById(id, false, false);

      if (!conflicto.isActivo()) {
        throw new Error('Solo se pueden escalar conflictos activos');
      }

      // Validar que el usuario de escalamiento existe
      const usuario = await Usuario.findByPk(escaladoA, { transaction });
      if (!usuario) {
        throw new Error('Usuario de escalamiento no encontrado');
      }

      const estadoAnterior = conflicto.estado_conflicto;

      // Escalar el conflicto
      await conflicto.escalar(escaladoA, motivo, escaladoPor);

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: conflicto.empresas_en_conflicto[0]?.id_empresa,
        id_evento: conflicto.id_evento,
        id_stand_nuevo: conflicto.id_stand,
        tipo_cambio: 'confirmacion',
        estado_anterior: estadoAnterior,
        estado_nuevo: 'escalado',
        motivo_cambio: 'Conflicto escalado',
        descripcion_detallada: `Conflicto escalado a ${usuario.nombre}. Motivo: ${motivo}`,
        datos_adicionales: {
          conflicto_id: conflicto.id_conflicto,
          escalado_a: escaladoA,
          motivo_escalamiento: motivo
        }
      }, escaladoPor, metadatos);

      await transaction.commit();

      return await this.getConflictoById(id, true, false);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Detectar conflictos automáticamente para un evento
   */
  static async detectarConflictosEvento(idEvento, crearAutomaticamente = true, detectadoPor = null) {
    const conflictosDetectados = await ConflictoAsignacion.detectarConflictos(idEvento);
    
    if (!crearAutomaticamente) {
      return conflictosDetectados;
    }

    const conflictosCreados = [];
    
    for (const conflicto of conflictosDetectados) {
      // Verificar si ya existe un conflicto activo para este stand
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
          descripcion_conflicto: `Múltiples solicitudes detectadas para el stand ${conflicto.solicitudes[0].standSolicitado?.numero_stand || conflicto.id_stand}. ${conflicto.empresas.length} empresas en conflicto.`,
          estado_conflicto: 'detectado',
          prioridad_resolucion: this.calcularPrioridadResolucion(conflicto.empresas.length, conflicto.empresas),
          detectado_por: detectadoPor,
          metodo_deteccion: 'automatico',
          empresas_afectadas_total: conflicto.empresas.length,
          impacto_estimado: this.calcularImpactoEstimado(conflicto.empresas.length),
          created_by: detectadoPor
        });

        conflictosCreados.push(nuevoConflicto);
      }
    }
    
    return {
      conflictos_detectados: conflictosDetectados.length,
      conflictos_creados: conflictosCreados.length,
      conflictos: conflictosCreados
    };
  }

  /**
   * Obtener conflictos vencidos
   */
  static async getConflictosVencidos() {
    return await ConflictoAsignacion.scope('vencidos').findAll({
      include: [
        { association: 'evento', attributes: ['nombre_evento'] },
        { association: 'stand', attributes: ['numero_stand'] },
        { association: 'asignadoAUsuario', attributes: ['nombre', 'email'] }
      ]
    });
  }

  /**
   * Obtener estadísticas de conflictos
   */
  static async getEstadisticas(filtros = {}) {
    const whereConditions = { deleted_at: null };

    if (filtros.id_evento) {
      whereConditions.id_evento = filtros.id_evento;
    }

    if (filtros.fecha_desde && filtros.fecha_hasta) {
      whereConditions.fecha_deteccion = {
        [Op.between]: [new Date(filtros.fecha_desde), new Date(filtros.fecha_hasta)]
      };
    }

    const estadisticas = await ConflictoAsignacion.findAll({
      where: whereConditions,
      attributes: [
        'estado_conflicto',
        'tipo_conflicto',
        'prioridad_resolucion',
        [sequelize.fn('COUNT', sequelize.col('id_conflicto')), 'total'],
        [sequelize.fn('AVG', sequelize.col('tiempo_resolucion_horas')), 'tiempo_promedio_resolucion'],
        [sequelize.fn('AVG', sequelize.col('empresas_afectadas_total')), 'empresas_promedio_afectadas']
      ],
      group: ['estado_conflicto', 'tipo_conflicto', 'prioridad_resolucion'],
      raw: true
    });

    const totalConflictos = await ConflictoAsignacion.count({
      where: whereConditions
    });

    const conflictosVencidos = await ConflictoAsignacion.count({
      where: {
        ...whereConditions,
        fecha_limite_resolucion: { [Op.lt]: new Date() },
        estado_conflicto: ['detectado', 'en_revision', 'en_resolucion']
      }
    });

    const conflictosActivos = await ConflictoAsignacion.count({
      where: {
        ...whereConditions,
        estado_conflicto: ['detectado', 'en_revision', 'en_resolucion']
      }
    });

    return {
      total_conflictos: totalConflictos,
      conflictos_activos: conflictosActivos,
      conflictos_vencidos: conflictosVencidos,
      tasa_resolucion: totalConflictos > 0 ? ((totalConflictos - conflictosActivos) / totalConflictos * 100) : 0,
      detalle_estadisticas: estadisticas,
      fecha_consulta: new Date()
    };
  }

  /**
   * Calcular prioridad de resolución basada en número de empresas y sus características
   */
  static calcularPrioridadResolucion(numeroEmpresas, empresas = []) {
    if (numeroEmpresas > 5) return 'critica';
    
    // Verificar si hay empresas con alta prioridad
    const tieneEmpresasVIP = empresas.some(e => e.prioridad_score > 80);
    if (tieneEmpresasVIP && numeroEmpresas > 2) return 'alta';
    
    if (numeroEmpresas > 3) return 'alta';
    if (numeroEmpresas > 1) return 'media';
    
    return 'baja';
  }

  /**
   * Calcular impacto estimado
   */
  static calcularImpactoEstimado(numeroEmpresas, prioridad = 'media') {
    if (prioridad === 'critica' || numeroEmpresas > 5) return 'critico';
    if (prioridad === 'alta' || numeroEmpresas > 3) return 'alto';
    if (numeroEmpresas > 1) return 'medio';
    return 'bajo';
  }

  /**
   * Añadir comunicación a un conflicto
   */
  static async addComunicacion(id, tipoComunicacion, participante, mensaje, medio = 'email', usuarioId = null) {
    const conflicto = await this.getConflictoById(id, false, false);
    
    await conflicto.addComunicacion(tipoComunicacion, participante, mensaje, medio);
    
    return await this.getConflictoById(id, true, false);
  }

  /**
   * Eliminar conflicto (soft delete)
   */
  static async deleteConflicto(id, deletedBy = null) {
    const conflicto = await this.getConflictoById(id, false, false);

    if (conflicto.isActivo()) {
      throw new Error('No se puede eliminar un conflicto activo. Resuélvalo o cancélelo primero');
    }

    await conflicto.softDelete(deletedBy);

    return { message: 'Conflicto eliminado exitosamente' };
  }

  /**
   * Cancelar conflicto
   */
  static async cancelarConflicto(id, motivo, canceladoPor = null, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      const conflicto = await this.getConflictoById(id, false, false);

      if (!conflicto.isActivo()) {
        throw new Error('Solo se pueden cancelar conflictos activos');
      }

      const estadoAnterior = conflicto.estado_conflicto;

      await conflicto.update({
        estado_conflicto: 'cancelado',
        observaciones_resolucion: motivo,
        fecha_resolucion: new Date(),
        resuelto_por: canceladoPor,
        updated_by: canceladoPor
      }, { transaction });

      // Crear entrada en histórico
      await HistoricoAsignacion.crearEntrada({
        id_empresa: conflicto.empresas_en_conflicto[0]?.id_empresa,
        id_evento: conflicto.id_evento,
        id_stand_nuevo: conflicto.id_stand,
        tipo_cambio: 'cancelacion',
        estado_anterior: estadoAnterior,
        estado_nuevo: 'cancelado',
        motivo_cambio: 'Conflicto cancelado',
        descripcion_detallada: motivo,
        datos_adicionales: {
          conflicto_id: conflicto.id_conflicto,
          motivo_cancelacion: motivo
        }
      }, canceladoPor, metadatos);

      await transaction.commit();

      return await this.getConflictoById(id, true, false);

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = ConflictoAsignacionService;
