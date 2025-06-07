const { TipoEvento, Evento, Usuario } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de TipoEvento - Lógica de negocio
 */
class TipoEventoService {
  
  /**
   * Crear un nuevo tipo de evento
   */
  static async createTipoEvento(tipoEventoData, userId = null) {
    try {
      const dataToCreate = {
        nombre_tipo: tipoEventoData.nombre_tipo,
        descripcion: tipoEventoData.descripcion || null,
        configuracion_especifica: tipoEventoData.configuracion_especifica || null
      };
      
      const tipoEvento = await AuditService.createWithAudit(TipoEvento, dataToCreate, userId);
      
      return tipoEvento;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los tipos de evento activos
   */
  static async getAllTiposEvento(includeEventos = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        where: includeDeleted ? {} : AuditService.getActiveWhereCondition(),
        order: [['nombre_tipo', 'ASC']],
        include: []
      };

      if (includeEventos) {
        options.include.push({
          model: Evento,
          as: 'eventos',
          attributes: ['id_evento', 'nombre_evento', 'estado', 'fecha_inicio', 'fecha_fin'],
          where: AuditService.getActiveWhereCondition(),
          required: false
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const tiposEvento = await TipoEvento.findAll(options);
      return tiposEvento;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener tipo de evento por ID
   */
  static async getTipoEventoById(id, includeEventos = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        include: []
      };

      if (includeEventos) {
        options.include.push({
          model: Evento,
          as: 'eventos',
          attributes: ['id_evento', 'nombre_evento', 'estado', 'fecha_inicio', 'fecha_fin'],
          where: AuditService.getActiveWhereCondition(),
          required: false
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      let tipoEvento;
      if (includeDeleted) {
        tipoEvento = await TipoEvento.findByPk(id, options);
      } else {
        tipoEvento = await AuditService.findByPkWithAudit(TipoEvento, id, options);
      }

      if (!tipoEvento) {
        throw new Error('Tipo de evento no encontrado');
      }

      return tipoEvento;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener tipo de evento por nombre
   */
  static async getTipoEventoByNombre(nombreTipo, includeDeleted = false) {
    try {
      const whereCondition = {
        nombre_tipo: nombreTipo
      };

      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const tipoEvento = await TipoEvento.findOne({
        where: whereCondition
      });

      return tipoEvento;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar tipo de evento
   */
  static async updateTipoEvento(id, updateData, userId = null) {
    try {
      const tipoEvento = await AuditService.findByPkWithAudit(TipoEvento, id);
      
      if (!tipoEvento) {
        throw new Error('Tipo de evento no encontrado');
      }

      await AuditService.updateWithAudit(tipoEvento, updateData, userId);
      
      return await this.getTipoEventoById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar tipo de evento (eliminación lógica)
   */
  static async deleteTipoEvento(id, userId = null) {
    try {
      const tipoEvento = await AuditService.findByPkWithAudit(TipoEvento, id);
      
      if (!tipoEvento) {
        throw new Error('Tipo de evento no encontrado');
      }

      // Verificar si hay eventos activos con este tipo
      const eventosActivos = await Evento.count({
        where: AuditService.combineWhereWithActive({ id_tipo_evento: id })
      });

      if (eventosActivos > 0) {
        throw new Error(`No se puede eliminar el tipo de evento. Hay ${eventosActivos} eventos activos con este tipo`);
      }

      // Eliminación lógica del tipo de evento
      await AuditService.softDelete(tipoEvento, userId);
      
      return { message: 'Tipo de evento eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restaurar tipo de evento eliminado
   */
  static async restoreTipoEvento(id) {
    try {
      const tipoEvento = await TipoEvento.findByPk(id);
      
      if (!tipoEvento) {
        throw new Error('Tipo de evento no encontrado');
      }

      if (!AuditService.isDeleted(tipoEvento)) {
        throw new Error('El tipo de evento no está eliminado');
      }

      await AuditService.restore(tipoEvento);
      
      return { message: 'Tipo de evento restaurado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener eventos por tipo
   */
  static async getEventosByTipo(tipoId, page = 1, limit = 10, includeDeleted = false) {
    try {
      const offset = (page - 1) * limit;

      const whereCondition = { id_tipo_evento: tipoId };
      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const { count, rows } = await Evento.findAndCountAll({
        where: whereCondition,
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['nombre_tipo', 'descripcion']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_inicio', 'DESC']]
      });

      return {
        eventos: rows,
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
   * Obtener estadísticas de tipos de evento
   */
  static async getTipoEventoStats(includeDeleted = false) {
    try {
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();
      
      const [totalTipos, activeTipos, deletedTipos] = await Promise.all([
        TipoEvento.count(),
        TipoEvento.count({ where: AuditService.getActiveWhereCondition() }),
        TipoEvento.count({ where: AuditService.getDeletedWhereCondition() })
      ]);
      
      const tiposPorEventos = await Evento.findAll({
        attributes: [
          'id_tipo_evento',
          [require('sequelize').fn('COUNT', 'id_evento'), 'eventos_count']
        ],
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['nombre_tipo', 'descripcion'],
          where: whereCondition,
          required: true
        }],
        where: whereCondition,
        group: ['id_tipo_evento', 'tipoEvento.nombre_tipo', 'tipoEvento.descripcion'],
        raw: false
      });

      return {
        totalTipos,
        activeTipos,
        deletedTipos,
        deletionRate: totalTipos > 0 ? ((deletedTipos / totalTipos) * 100).toFixed(2) : 0,
        tiposPorEventos
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener tipos de evento sin eventos asignados
   */
  static async getTiposSinEventos() {
    try {
      const tipos = await TipoEvento.findAll({
        include: [{
          model: Evento,
          as: 'eventos',
          where: AuditService.getActiveWhereCondition(),
          required: false
        }],
        where: {
          ...AuditService.getActiveWhereCondition(),
          '$eventos.id_evento$': null
        }
      });

      return tipos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener tipos eliminados
   */
  static async getTiposEliminados() {
    try {
      const tipos = await TipoEvento.findAll({
        where: AuditService.getDeletedWhereCondition(),
        include: AuditService.getAuditIncludeOptions(require('../models')),
        order: [['deleted_at', 'DESC']]
      });

      return tipos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validar configuración específica por tipo
   */
  static validateConfiguracion(tipoNombre, configuracion) {
    try {
      switch (tipoNombre) {
        case 'presencial':
          // Validar configuración para eventos presenciales
          if (configuracion && !configuracion.ubicacion_requerida) {
            throw new Error('Los eventos presenciales requieren ubicación');
          }
          break;
        case 'virtual':
          // Validar configuración para eventos virtuales
          if (configuracion && !configuracion.plataforma_virtual) {
            throw new Error('Los eventos virtuales requieren especificar la plataforma');
          }
          break;
        case 'hibrido':
          // Validar configuración para eventos híbridos
          if (configuracion && (!configuracion.ubicacion_requerida || !configuracion.plataforma_virtual)) {
            throw new Error('Los eventos híbridos requieren ubicación y plataforma virtual');
          }
          break;
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TipoEventoService;
