const { TipoStand, Stand, Usuario } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de TipoStand - Lógica de negocio
 */
class TipoStandService {
  
  /**
   * Crear un nuevo tipo de stand
   */
  static async createTipoStand(tipoData, userId = null) {
    try {
      const dataToCreate = {
        nombre_tipo: tipoData.nombre_tipo,
        descripcion: tipoData.descripcion || null,
        area_minima: tipoData.area_minima || null,
        area_maxima: tipoData.area_maxima || null,
        precio_base: tipoData.precio_base || 0.00,
        moneda: tipoData.moneda || 'PEN',
        equipamiento_incluido: tipoData.equipamiento_incluido || null,
        servicios_incluidos: tipoData.servicios_incluidos || null,
        caracteristicas_especiales: tipoData.caracteristicas_especiales || null,
        restricciones: tipoData.restricciones || null,
        permite_personalizacion: tipoData.permite_personalizacion !== false,
        requiere_aprobacion: tipoData.requiere_aprobacion || false,
        estado: tipoData.estado || 'activo',
        orden_visualizacion: tipoData.orden_visualizacion || null
      };
      
      const tipoStand = await AuditService.createWithAudit(TipoStand, dataToCreate, userId);
      
      return tipoStand;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los tipos de stand activos
   */
  static async getAllTiposStand(includeStands = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        where: includeDeleted ? {} : AuditService.getActiveWhereCondition(),
        order: [['orden_visualizacion', 'ASC'], ['nombre_tipo', 'ASC']],
        include: []
      };

      if (includeStands) {
        options.include.push({
          model: Stand,
          as: 'stands',
          attributes: ['id_stand', 'numero_stand', 'area', 'estado_fisico'],
          where: AuditService.getActiveWhereCondition(),
          required: false
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const tipos = await TipoStand.findAll(options);
      return tipos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener tipo de stand por ID
   */
  static async getTipoStandById(id, includeStands = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        include: []
      };

      if (includeStands) {
        options.include.push({
          model: Stand,
          as: 'stands',
          attributes: ['id_stand', 'numero_stand', 'area', 'ubicacion', 'estado_fisico', 'es_premium'],
          where: AuditService.getActiveWhereCondition(),
          required: false
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      let tipo;
      if (includeDeleted) {
        tipo = await TipoStand.findByPk(id, options);
      } else {
        tipo = await AuditService.findByPkWithAudit(TipoStand, id, options);
      }

      if (!tipo) {
        throw new Error('Tipo de stand no encontrado');
      }

      return tipo;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener tipo de stand por nombre
   */
  static async getTipoStandByNombre(nombreTipo, includeDeleted = false) {
    try {
      const whereCondition = {
        nombre_tipo: nombreTipo
      };

      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const tipo = await TipoStand.findOne({
        where: whereCondition
      });

      return tipo;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar tipo de stand
   */
  static async updateTipoStand(id, updateData, userId = null) {
    try {
      const tipo = await AuditService.findByPkWithAudit(TipoStand, id);
      
      if (!tipo) {
        throw new Error('Tipo de stand no encontrado');
      }

      await AuditService.updateWithAudit(tipo, updateData, userId);
      
      return await this.getTipoStandById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar tipo de stand (eliminación lógica)
   */
  static async deleteTipoStand(id, userId = null) {
    try {
      const tipo = await AuditService.findByPkWithAudit(TipoStand, id);
      
      if (!tipo) {
        throw new Error('Tipo de stand no encontrado');
      }

      // Verificar si hay stands activos con este tipo
      const standsActivos = await Stand.count({
        where: AuditService.combineWhereWithActive({ id_tipo_stand: id })
      });

      if (standsActivos > 0) {
        throw new Error(`No se puede eliminar el tipo de stand. Hay ${standsActivos} stands activos con este tipo`);
      }

      // Eliminación lógica del tipo de stand
      await AuditService.softDelete(tipo, userId);
      
      return { message: 'Tipo de stand eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restaurar tipo de stand eliminado
   */
  static async restoreTipoStand(id) {
    try {
      const tipo = await TipoStand.findByPk(id);
      
      if (!tipo) {
        throw new Error('Tipo de stand no encontrado');
      }

      if (!AuditService.isDeleted(tipo)) {
        throw new Error('El tipo de stand no está eliminado');
      }

      await AuditService.restore(tipo);
      
      return { message: 'Tipo de stand restaurado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener stands por tipo
   */
  static async getStandsByTipo(tipoId, page = 1, limit = 10, includeDeleted = false) {
    try {
      const offset = (page - 1) * limit;

      const whereCondition = { id_tipo_stand: tipoId };
      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const { count, rows } = await Stand.findAndCountAll({
        where: whereCondition,
        include: [{
          model: TipoStand,
          as: 'tipoStand',
          attributes: ['nombre_tipo', 'descripcion', 'precio_base']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['numero_stand', 'ASC']]
      });

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
   * Obtener estadísticas de tipos de stand
   */
  static async getTipoStandStats(includeDeleted = false) {
    try {
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();
      
      const [totalTipos, activeTipos, deletedTipos] = await Promise.all([
        TipoStand.count(),
        TipoStand.count({ where: { ...AuditService.getActiveWhereCondition(), estado: 'activo' } }),
        TipoStand.count({ where: AuditService.getDeletedWhereCondition() })
      ]);
      
      const tiposPorStands = await Stand.findAll({
        attributes: [
          'id_tipo_stand',
          [require('sequelize').fn('COUNT', 'id_stand'), 'stands_count']
        ],
        include: [{
          model: TipoStand,
          as: 'tipoStand',
          attributes: ['nombre_tipo', 'descripcion', 'precio_base'],
          where: whereCondition,
          required: true
        }],
        where: whereCondition,
        group: ['id_tipo_stand', 'tipoStand.nombre_tipo', 'tipoStand.descripcion', 'tipoStand.precio_base'],
        raw: false
      });

      return {
        totalTipos,
        activeTipos,
        deletedTipos,
        deletionRate: totalTipos > 0 ? ((deletedTipos / totalTipos) * 100).toFixed(2) : 0,
        tiposPorStands
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener tipos sin stands asignados
   */
  static async getTiposSinStands() {
    try {
      const tipos = await TipoStand.findAll({
        include: [{
          model: Stand,
          as: 'stands',
          where: AuditService.getActiveWhereCondition(),
          required: false
        }],
        where: {
          ...AuditService.getActiveWhereCondition(),
          '$stands.id_stand$': null
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
      const tipos = await TipoStand.findAll({
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
   * Validar área según tipo de stand
   */
  static async validarAreaParaTipo(tipoId, area) {
    try {
      const tipo = await this.getTipoStandById(tipoId);
      
      if (!tipo.esAreaValida(area)) {
        let mensaje = 'Área inválida para este tipo de stand.';
        if (tipo.area_minima && area < tipo.area_minima) {
          mensaje = `El área mínima para ${tipo.nombre_tipo} es ${tipo.area_minima} m²`;
        }
        if (tipo.area_maxima && area > tipo.area_maxima) {
          mensaje = `El área máxima para ${tipo.nombre_tipo} es ${tipo.area_maxima} m²`;
        }
        throw new Error(mensaje);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calcular precio para área específica
   */
  static async calcularPrecio(tipoId, area) {
    try {
      const tipo = await this.getTipoStandById(tipoId);
      
      await this.validarAreaParaTipo(tipoId, area);
      
      return {
        precio_base_total: tipo.calcularPrecio(area),
        precio_por_metro: tipo.precio_base,
        area: area,
        moneda: tipo.moneda,
        tipo: tipo.nombre_tipo
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener tipos de stand disponibles para área específica
   */
  static async getTiposParaArea(area) {
    try {
      const tipos = await TipoStand.findAll({
        where: {
          ...AuditService.getActiveWhereCondition(),
          estado: 'activo',
          [Op.or]: [
            { area_minima: null },
            { area_minima: { [Op.lte]: area } }
          ]
        }
      });

      return tipos.filter(tipo => {
        if (tipo.area_maxima && area > tipo.area_maxima) {
          return false;
        }
        return true;
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TipoStandService;
