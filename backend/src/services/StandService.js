const { Stand, TipoStand, Evento, Usuario, StandEvento, EmpresaEvento, StandServicio } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de Stand - Lógica de negocio
 */
class StandService {
  
  /**
   * Crear un nuevo stand
   */
  static async createStand(standData, userId = null) {
    try {
      // Validar que el tipo de stand existe
      const tipoStand = await TipoStand.findByPk(standData.id_tipo_stand);
      if (!tipoStand || !tipoStand.isActive()) {
        throw new Error('Tipo de stand no encontrado o inactivo');
      }

      // Validar área según el tipo
      if (!tipoStand.esAreaValida(standData.area)) {
        throw new Error(`Área inválida para el tipo ${tipoStand.nombre_tipo}`);
      }

      // Verificar que el número de stand no exista
      const existingStand = await Stand.findOne({
        where: {
          numero_stand: standData.numero_stand,
          ...AuditService.getActiveWhereCondition()
        }
      });

      if (existingStand) {
        throw new Error('El número de stand ya existe');
      }

      const dataToCreate = {
        numero_stand: standData.numero_stand,
        nombre_stand: standData.nombre_stand || null,
        id_tipo_stand: standData.id_tipo_stand,
        area: standData.area,
        ubicacion: standData.ubicacion || null,
        coordenadas_x: standData.coordenadas_x || null,
        coordenadas_y: standData.coordenadas_y || null,
        estado_fisico: standData.estado_fisico || 'disponible',
        caracteristicas_fisicas: standData.caracteristicas_fisicas || null,
        equipamiento_fijo: standData.equipamiento_fijo || null,
        servicios_disponibles: standData.servicios_disponibles || null,
        precio_personalizado: standData.precio_personalizado || null,
        observaciones: standData.observaciones || null,
        fecha_ultima_inspeccion: standData.fecha_ultima_inspeccion || null,
        fecha_proximo_mantenimiento: standData.fecha_proximo_mantenimiento || null,
        estado: standData.estado || 'activo',
        es_premium: standData.es_premium || false,
        permite_subdivision: standData.permite_subdivision || false,
        capacidad_maxima_personas: standData.capacidad_maxima_personas || null
      };
      
      const stand = await AuditService.createWithAudit(Stand, dataToCreate, userId);
      
      return await this.getStandById(stand.id_stand, true);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los stands
   */
  static async getAllStands(page = 1, limit = 10, filters = {}, includeAudit = false, includeDeleted = false) {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();

      // Aplicar filtros
      if (filters.search) {
        whereCondition[Op.or] = [
          { numero_stand: { [Op.like]: `%${filters.search}%` } },
          { nombre_stand: { [Op.like]: `%${filters.search}%` } },
          { ubicacion: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      if (filters.estado_fisico) {
        whereCondition.estado_fisico = filters.estado_fisico;
      }

      if (filters.id_tipo_stand) {
        whereCondition.id_tipo_stand = filters.id_tipo_stand;
      }

      if (filters.es_premium) {
        whereCondition.es_premium = filters.es_premium === 'true';
      }

      if (filters.area_min) {
        whereCondition.area = { [Op.gte]: filters.area_min };
      }

      if (filters.area_max) {
        whereCondition.area = {
          ...whereCondition.area,
          [Op.lte]: filters.area_max
        };
      }

      const options = {
        where: whereCondition,
        include: [{
          model: TipoStand,
          as: 'tipoStand',
          attributes: ['nombre_tipo', 'descripcion', 'precio_base', 'moneda']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['numero_stand', 'ASC']],
        distinct: true
      };

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const { count, rows } = await Stand.findAndCountAll(options);

      return {
        stands: rows,
        pagination: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener stand por ID
   */
  static async getStandById(id, includeDetails = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        include: [{
          model: TipoStand,
          as: 'tipoStand',
          attributes: ['nombre_tipo', 'descripcion', 'precio_base', 'moneda', 'equipamiento_incluido', 'servicios_incluidos']
        }]
      };

      if (includeDetails) {
        options.include.push(
          {
            model: StandEvento,
            as: 'standEventos',
            include: [{
              model: Evento,
              as: 'evento',
              attributes: ['nombre_evento', 'fecha_inicio', 'fecha_fin', 'estado']
            }],
            where: AuditService.getActiveWhereCondition(),
            required: false
          },
          {
            model: EmpresaEvento,
            as: 'participaciones',
            include: [{
              model: require('../models').EmpresaExpositora,
              as: 'empresa',
              attributes: ['nombre_empresa', 'email_contacto']
            }],
            where: AuditService.getActiveWhereCondition(),
            required: false
          }
        );
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      let stand;
      if (includeDeleted) {
        stand = await Stand.findByPk(id, options);
      } else {
        stand = await AuditService.findByPkWithAudit(Stand, id, options);
      }

      if (!stand) {
        throw new Error('Stand no encontrado');
      }

      return stand;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener stand por número
   */
  static async getStandByNumero(numeroStand, includeDeleted = false) {
    try {
      const whereCondition = {
        numero_stand: numeroStand
      };

      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const stand = await Stand.findOne({
        where: whereCondition,
        include: [{
          model: TipoStand,
          as: 'tipoStand',
          attributes: ['nombre_tipo', 'precio_base', 'moneda']
        }]
      });

      return stand;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar stand
   */
  static async updateStand(id, updateData, userId = null) {
    try {
      const stand = await AuditService.findByPkWithAudit(Stand, id);
      
      if (!stand) {
        throw new Error('Stand no encontrado');
      }

      // Si se cambia el tipo de stand, validar área
      if (updateData.id_tipo_stand || updateData.area) {
        const tipoId = updateData.id_tipo_stand || stand.id_tipo_stand;
        const area = updateData.area || stand.area;
        
        const tipoStand = await TipoStand.findByPk(tipoId);
        if (!tipoStand || !tipoStand.esAreaValida(area)) {
          throw new Error('Área inválida para el tipo de stand seleccionado');
        }
      }

      // Validar número único si se está cambiando
      if (updateData.numero_stand && updateData.numero_stand !== stand.numero_stand) {
        const existingStand = await this.getStandByNumero(updateData.numero_stand);
        if (existingStand && existingStand.id_stand !== id) {
          throw new Error('El número de stand ya existe');
        }
      }

      await AuditService.updateWithAudit(stand, updateData, userId);
      
      return await this.getStandById(id, true);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar stand (eliminación lógica)
   */
  static async deleteStand(id, userId = null) {
    try {
      const stand = await AuditService.findByPkWithAudit(Stand, id);
      
      if (!stand) {
        throw new Error('Stand no encontrado');
      }

      // Verificar si tiene participaciones activas
      const participacionesActivas = await EmpresaEvento.count({
        where: AuditService.combineWhereWithActive({
          id_stand: id,
          estado_participacion: ['registrada', 'pendiente_aprobacion', 'aprobada', 'confirmada']
        })
      });

      if (participacionesActivas > 0) {
        throw new Error(`No se puede eliminar el stand. Tiene ${participacionesActivas} participaciones activas`);
      }

      // Eliminar las asignaciones en eventos
      await StandEvento.update(
        { deleted_at: new Date(), deleted_by: userId },
        { where: { id_stand: id } }
      );

      // Eliminación lógica del stand
      await AuditService.softDelete(stand, userId);
      
      return { message: 'Stand eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar estado físico del stand
   */
  static async cambiarEstadoFisico(id, nuevoEstado, observaciones = null, userId = null) {
    try {
      const stand = await AuditService.findByPkWithAudit(Stand, id);
      
      if (!stand) {
        throw new Error('Stand no encontrado');
      }

      await stand.cambiarEstadoFisico(nuevoEstado, observaciones);
      
      if (userId) {
        await AuditService.updateWithAudit(stand, {}, userId);
      }

      return await this.getStandById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asignar stand a evento
   */
  static async asignarAEvento(standId, eventoId, configuracion = {}, userId = null) {
    try {
      // Verificar que el stand existe y está disponible
      const stand = await this.getStandById(standId);
      if (!stand.isDisponible()) {
        throw new Error('El stand no está disponible');
      }

      // Verificar que el evento existe
      const EventoService = require('./EventoService');
      const evento = await EventoService.getEventoById(eventoId);

      // Verificar si ya está asignado al evento
      const asignacionExistente = await StandEvento.findOne({
        where: AuditService.combineWhereWithActive({
          id_stand: standId,
          id_evento: eventoId
        })
      });

      if (asignacionExistente) {
        throw new Error('El stand ya está asignado a este evento');
      }

      // Calcular precio final
      const precioBase = await stand.calcularPrecio();
      const precioEvento = configuracion.precio_evento || precioBase;
      const descuento = configuracion.descuento_porcentaje || 0;
      const precioFinal = precioEvento - (precioEvento * (descuento / 100));

      const datosAsignacion = {
        id_stand: standId,
        id_evento: eventoId,
        estado_disponibilidad: 'disponible',
        precio_evento: precioEvento,
        descuento_porcentaje: descuento,
        precio_final: precioFinal,
        configuracion_especial: configuracion.configuracion_especial || null,
        servicios_incluidos_evento: configuracion.servicios_incluidos_evento || null,
        restricciones_evento: configuracion.restricciones_evento || null,
        horario_montaje: configuracion.horario_montaje || null,
        horario_desmontaje: configuracion.horario_desmontaje || null,
        observaciones: configuracion.observaciones || null,
        prioridad: configuracion.prioridad || 0,
        es_destacado: configuracion.es_destacado || false,
        maximo_dias_reserva: configuracion.maximo_dias_reserva || 7
      };

      const asignacion = await AuditService.createWithAudit(StandEvento, datosAsignacion, userId);

      return await this.getAsignacionEvento(standId, eventoId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener asignación de stand en evento específico
   */
  static async getAsignacionEvento(standId, eventoId) {
    try {
      const asignacion = await StandEvento.findOne({
        where: AuditService.combineWhereWithActive({
          id_stand: standId,
          id_evento: eventoId
        }),
        include: [
          {
            model: Stand,
            as: 'stand',
            include: [{
              model: TipoStand,
              as: 'tipoStand',
              attributes: ['nombre_tipo', 'precio_base']
            }]
          },
          {
            model: Evento,
            as: 'evento',
            attributes: ['nombre_evento', 'fecha_inicio', 'fecha_fin']
          }
        ]
      });

      if (!asignacion) {
        throw new Error('Asignación no encontrada');
      }

      return asignacion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener stands disponibles para un evento
   */
  static async getStandsDisponiblesParaEvento(eventoId, filtros = {}) {
    try {
      const whereCondition = {
        ...AuditService.getActiveWhereCondition(),
        estado: 'activo',
        estado_fisico: 'disponible'
      };

      // Aplicar filtros adicionales
      if (filtros.id_tipo_stand) {
        whereCondition.id_tipo_stand = filtros.id_tipo_stand;
      }

      if (filtros.area_min) {
        whereCondition.area = { [Op.gte]: filtros.area_min };
      }

      if (filtros.area_max) {
        whereCondition.area = {
          ...whereCondition.area,
          [Op.lte]: filtros.area_max
        };
      }

      const stands = await Stand.findAll({
        where: whereCondition,
        include: [
          {
            model: TipoStand,
            as: 'tipoStand',
            attributes: ['nombre_tipo', 'precio_base', 'moneda']
          },
          {
            model: StandEvento,
            as: 'standEventos',
            where: {
              id_evento: eventoId,
              estado_disponibilidad: 'disponible',
              ...AuditService.getActiveWhereCondition()
            },
            required: false
          }
        ],
        order: [['numero_stand', 'ASC']]
      });

      // Filtrar stands que no estén asignados al evento o que estén disponibles
      return stands.filter(stand => {
        return stand.standEventos.length === 0 || 
               stand.standEventos.some(se => se.estado_disponibilidad === 'disponible');
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de stands
   */
  static async getStandStats(includeDeleted = false) {
    try {
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();
      
      const [total, activos, disponibles, ocupados, mantenimiento, premium, eliminados] = await Promise.all([
        Stand.count(),
        Stand.count({ where: { ...whereCondition, estado: 'activo' } }),
        Stand.count({ where: { ...whereCondition, estado_fisico: 'disponible' } }),
        Stand.count({ where: { ...whereCondition, estado_fisico: 'ocupado' } }),
        Stand.count({ where: { ...whereCondition, estado_fisico: 'mantenimiento' } }),
        Stand.count({ where: { ...whereCondition, es_premium: true } }),
        Stand.count({ where: AuditService.getDeletedWhereCondition() })
      ]);

      const standsPorTipo = await Stand.findAll({
        attributes: [
          'id_tipo_stand',
          [require('sequelize').fn('COUNT', 'id_stand'), 'stands_count'],
          [require('sequelize').fn('AVG', 'area'), 'area_promedio'],
          [require('sequelize').fn('SUM', 'area'), 'area_total']
        ],
        include: [{
          model: TipoStand,
          as: 'tipoStand',
          attributes: ['nombre_tipo', 'precio_base'],
          where: whereCondition,
          required: true
        }],
        where: whereCondition,
        group: ['id_tipo_stand', 'tipoStand.nombre_tipo', 'tipoStand.precio_base'],
        raw: false
      });

      return {
        total,
        activos,
        disponibles,
        ocupados,
        mantenimiento,
        premium,
        eliminados,
        porcentajeDisponibles: activos > 0 ? ((disponibles / activos) * 100).toFixed(2) : 0,
        porcentajePremium: activos > 0 ? ((premium / activos) * 100).toFixed(2) : 0,
        standsPorTipo
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener stands que requieren mantenimiento
   */
  static async getStandsMantenimiento() {
    try {
      const stands = await Stand.findAll({
        where: {
          ...AuditService.getActiveWhereCondition(),
          [Op.or]: [
            { estado_fisico: 'mantenimiento' },
            { fecha_proximo_mantenimiento: { [Op.lte]: new Date() } }
          ]
        },
        include: [{
          model: TipoStand,
          as: 'tipoStand',
          attributes: ['nombre_tipo']
        }],
        order: [['fecha_proximo_mantenimiento', 'ASC']]
      });

      return stands;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restaurar stand eliminado
   */
  static async restoreStand(id) {
    try {
      const stand = await Stand.findByPk(id);
      
      if (!stand) {
        throw new Error('Stand no encontrado');
      }

      if (!AuditService.isDeleted(stand)) {
        throw new Error('El stand no está eliminado');
      }

      await AuditService.restore(stand);
      
      return { message: 'Stand restaurado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Carga masiva de stands desde CSV
   */
  static async cargaMasivaDesdeCSV(csvData, userId = null) {
    try {
      const resultados = [];
      const errores = [];

      for (const fila of csvData) {
        try {
          const stand = await this.createStand(fila, userId);
          resultados.push({
            success: true,
            stand: stand.numero_stand,
            id: stand.id_stand
          });
        } catch (error) {
          errores.push({
            success: false,
            stand: fila.numero_stand || 'N/A',
            error: error.message
          });
        }
      }

      return {
        message: `Carga masiva completada. ${resultados.length} stands creados, ${errores.length} errores`,
        resultados,
        errores,
        totalProcesados: csvData.length,
        exitosos: resultados.length,
        fallidos: errores.length
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = StandService;
