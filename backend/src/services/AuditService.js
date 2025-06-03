const { Op } = require('sequelize');

/**
 * Servicio de Auditoría
 * Funciones utilitarias para manejar auditoría y eliminación lógica
 */
class AuditService {
  
  /**
   * Obtener condiciones WHERE para registros activos (no eliminados)
   */
  static getActiveWhereCondition() {
    return {
      deleted_at: null
    };
  }

  /**
   * Obtener condiciones WHERE para registros eliminados
   */
  static getDeletedWhereCondition() {
    return {
      deleted_at: { [Op.ne]: null }
    };
  }

  /**
   * Combinar condiciones WHERE con filtros de eliminación lógica
   */
  static combineWhereWithActive(whereConditions = {}) {
    return {
      ...whereConditions,
      ...this.getActiveWhereCondition()
    };
  }

  /**
   * Realizar eliminación lógica en un modelo
   */
  static async softDelete(instance, deletedBy = null) {
    if (!instance) {
      throw new Error('Instancia no proporcionada para eliminación lógica');
    }

    const updateData = {
      deleted_at: new Date()
    };

    if (deletedBy) {
      updateData.deleted_by = deletedBy;
    }

    return await instance.update(updateData);
  }

  /**
   * Restaurar un registro eliminado lógicamente
   */
  static async restore(instance) {
    if (!instance) {
      throw new Error('Instancia no proporcionada para restauración');
    }

    return await instance.update({
      deleted_at: null,
      deleted_by: null
    });
  }

  /**
   * Obtener opciones de include para información de auditoría
   */
  static getAuditIncludeOptions(models) {
    return [
      {
        model: models.Usuario,
        as: 'createdByUser',
        attributes: ['id_usuario', 'correo'],
        required: false
      },
      {
        model: models.Usuario,
        as: 'updatedByUser',
        attributes: ['id_usuario', 'correo'],
        required: false
      },
      {
        model: models.Usuario,
        as: 'deletedByUser',
        attributes: ['id_usuario', 'correo'],
        required: false
      }
    ];
  }

  /**
   * Preparar datos de creación con información de auditoría
   */
  static prepareCreateData(data, userId = null) {
    const auditData = {
      ...data
    };

    if (userId) {
      auditData.created_by = userId;
    }

    // Asegurar que created_at esté presente
    if (!auditData.created_at) {
      auditData.created_at = new Date();
    }

    return auditData;
  }

  /**
   * Preparar datos de actualización con información de auditoría
   */
  static prepareUpdateData(data, userId = null) {
    const auditData = {
      ...data,
      updated_at: new Date()
    };

    if (userId) {
      auditData.updated_by = userId;
    }

    return auditData;
  }

  /**
   * Obtener estadísticas de auditoría para un modelo
   */
  static async getModelAuditStats(Model, includeDeleted = false) {
    const whereCondition = includeDeleted ? {} : this.getActiveWhereCondition();

    const [total, active, deleted] = await Promise.all([
      Model.count(),
      Model.count({ where: this.getActiveWhereCondition() }),
      Model.count({ where: this.getDeletedWhereCondition() })
    ]);

    return {
      total,
      active,
      deleted,
      deletionRate: total > 0 ? ((deleted / total) * 100).toFixed(2) : 0
    };
  }

  /**
   * Buscar registros con opciones de auditoría
   */
  static async findWithAudit(Model, options = {}) {
    const defaultOptions = {
      where: this.getActiveWhereCondition(),
      include: [],
      order: [['created_at', 'DESC']]
    };

    // Combinar where conditions
    if (options.where) {
      defaultOptions.where = {
        ...defaultOptions.where,
        ...options.where
      };
    }

    // Si se solicita incluir información de auditoría
    if (options.includeAudit) {
      const models = require('../models');
      defaultOptions.include = [
        ...defaultOptions.include,
        ...this.getAuditIncludeOptions(models)
      ];
    }

    // Combinar con opciones proporcionadas
    const finalOptions = {
      ...defaultOptions,
      ...options,
      where: defaultOptions.where,
      include: [...defaultOptions.include, ...(options.include || [])]
    };

    return await Model.findAll(finalOptions);
  }

  /**
   * Buscar un registro por PK con opciones de auditoría
   */
  static async findByPkWithAudit(Model, pk, options = {}) {
    const defaultOptions = {
      where: this.getActiveWhereCondition(),
      include: []
    };

    // Si se solicita incluir información de auditoría
    if (options.includeAudit) {
      const models = require('../models');
      defaultOptions.include = [
        ...defaultOptions.include,
        ...this.getAuditIncludeOptions(models)
      ];
    }

    // Combinar with conditions con el PK
    const whereCondition = {
      [Model.primaryKeyAttribute]: pk,
      ...defaultOptions.where
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      where: whereCondition,
      include: [...defaultOptions.include, ...(options.include || [])]
    };

    return await Model.findOne(finalOptions);
  }

  /**
   * Crear registro con auditoría automática
   */
  static async createWithAudit(Model, data, userId = null, transaction = null) {
    const auditData = this.prepareCreateData(data, userId);
    
    const options = {};
    if (transaction) {
      options.transaction = transaction;
    }

    return await Model.create(auditData, options);
  }

  /**
   * Actualizar registro con auditoría automática
   */
  static async updateWithAudit(instance, data, userId = null, transaction = null) {
    const auditData = this.prepareUpdateData(data, userId);
    
    const options = {};
    if (transaction) {
      options.transaction = transaction;
    }

    return await instance.update(auditData, options);
  }

  /**
   * Verificar si un registro fue eliminado lógicamente
   */
  static isDeleted(instance) {
    return instance && instance.deleted_at !== null;
  }

  /**
   * Obtener información de auditoría formateada de una instancia
   */
  static getAuditInfo(instance) {
    if (!instance) return null;

    return {
      created: {
        at: instance.created_at || instance.fecha_creacion,
        by: instance.createdByUser ? {
          id: instance.createdByUser.id_usuario,
          correo: instance.createdByUser.correo
        } : null
      },
      updated: {
        at: instance.updated_at,
        by: instance.updatedByUser ? {
          id: instance.updatedByUser.id_usuario,
          correo: instance.updatedByUser.correo
        } : null
      },
      deleted: {
        at: instance.deleted_at,
        by: instance.deletedByUser ? {
          id: instance.deletedByUser.id_usuario,
          correo: instance.deletedByUser.correo
        } : null
      },
      isDeleted: this.isDeleted(instance)
    };
  }
}

module.exports = AuditService;
