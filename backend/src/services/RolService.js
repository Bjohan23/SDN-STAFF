const { Rol, Usuario, UsuarioRol } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de Rol - Lógica de negocio
 */
class RolService {
  
  /**
   * Crear un nuevo rol
   */
  static async createRol(rolData, userId = null) {
    try {
      const dataToCreate = {
        nombre_rol: rolData.nombre_rol,
        descripcion: rolData.descripcion || null
      };
      
      const rol = await AuditService.createWithAudit(Rol, dataToCreate, userId);
      
      return rol;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los roles activos (no eliminados)
   */
  static async getAllRoles(includeUsuarios = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        where: includeDeleted ? {} : AuditService.getActiveWhereCondition(),
        order: [['nombre_rol', 'ASC']],
        include: []
      };

      if (includeUsuarios) {
        options.include.push({
          model: Usuario,
          as: 'usuarios',
          attributes: ['id_usuario', 'correo', 'estado'],
          where: AuditService.getActiveWhereCondition(),
          required: false,
          through: {
            attributes: ['fecha_asignacion'],
            where: AuditService.getActiveWhereCondition()
          }
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const roles = await Rol.findAll(options);
      return roles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener rol por ID (solo activos por defecto)
   */
  static async getRolById(id, includeUsuarios = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        include: []
      };

      if (includeUsuarios) {
        options.include.push({
          model: Usuario,
          as: 'usuarios',
          attributes: ['id_usuario', 'correo', 'estado'],
          where: AuditService.getActiveWhereCondition(),
          required: false,
          through: {
            attributes: ['fecha_asignacion'],
            where: AuditService.getActiveWhereCondition()
          }
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      let rol;
      if (includeDeleted) {
        rol = await Rol.findByPk(id, options);
      } else {
        rol = await AuditService.findByPkWithAudit(Rol, id, options);
      }

      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      return rol;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener rol por nombre (solo activos por defecto)
   */
  static async getRolByNombre(nombreRol, includeDeleted = false) {
    try {
      const whereCondition = {
        nombre_rol: nombreRol
      };

      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const rol = await Rol.findOne({
        where: whereCondition
      });

      return rol;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar rol
   */
  static async updateRol(id, updateData, userId = null) {
    try {
      const rol = await AuditService.findByPkWithAudit(Rol, id);
      
      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      await AuditService.updateWithAudit(rol, updateData, userId);
      
      return await this.getRolById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar rol (eliminación lógica)
   */
  static async deleteRol(id, userId = null) {
    try {
      const rol = await AuditService.findByPkWithAudit(Rol, id);
      
      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      // Verificar si hay usuarios activos asignados a este rol
      const usuariosConRol = await UsuarioRol.count({
        where: AuditService.combineWhereWithActive({ id_rol: id })
      });

      if (usuariosConRol > 0) {
        throw new Error(`No se puede eliminar el rol. Hay ${usuariosConRol} usuarios asignados a este rol`);
      }

      // Eliminación lógica del rol
      await AuditService.softDelete(rol, userId);
      
      return { message: 'Rol eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restaurar rol eliminado
   */
  static async restoreRol(id) {
    try {
      const rol = await Rol.findByPk(id);
      
      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      if (!AuditService.isDeleted(rol)) {
        throw new Error('El rol no está eliminado');
      }

      await AuditService.restore(rol);
      
      return { message: 'Rol restaurado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuarios asignados a un rol (solo activos)
   */
  static async getUsuariosByRol(rolId, page = 1, limit = 10, includeDeleted = false) {
    try {
      const offset = (page - 1) * limit;

      const whereCondition = { id_rol: rolId };
      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const { count, rows } = await UsuarioRol.findAndCountAll({
        where: whereCondition,
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id_usuario', 'correo', 'estado', 'fecha_creacion', 'ultima_sesion'],
          where: includeDeleted ? {} : AuditService.getActiveWhereCondition(),
          required: true
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_asignacion', 'DESC']]
      });

      return {
        asignaciones: rows,
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
   * Asignar rol a usuario
   */
  static async asignarRolAUsuario(rolId, usuarioId, assignedBy = null) {
    try {
      // Verificar que el rol existe y está activo
      const rol = await this.getRolById(rolId);
      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      // Verificar que el usuario existe y está activo
      const usuario = await AuditService.findByPkWithAudit(Usuario, usuarioId);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si ya tiene asignado el rol (incluir eliminados lógicamente)
      const asignacionExistente = await UsuarioRol.findOne({
        where: {
          id_usuario: usuarioId,
          id_rol: rolId
        }
      });

      if (asignacionExistente && !AuditService.isDeleted(asignacionExistente)) {
        throw new Error('El usuario ya tiene asignado este rol');
      }

      // Si existe pero está eliminado, restaurarlo
      if (asignacionExistente && AuditService.isDeleted(asignacionExistente)) {
        await AuditService.restore(asignacionExistente);
        return { message: 'Rol reasignado correctamente al usuario' };
      }

      // Crear la asignación con auditoría
      const asignacionData = {
        id_usuario: usuarioId,
        id_rol: rolId,
        fecha_asignacion: new Date()
      };

      await AuditService.createWithAudit(UsuarioRol, asignacionData, assignedBy);

      return { message: 'Rol asignado correctamente al usuario' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remover rol de usuario (eliminación lógica)
   */
  static async removerRolDeUsuario(rolId, usuarioId, removedBy = null) {
    try {
      const asignacion = await UsuarioRol.findOne({
        where: AuditService.combineWhereWithActive({
          id_usuario: usuarioId,
          id_rol: rolId
        })
      });

      if (!asignacion) {
        throw new Error('El usuario no tiene asignado este rol');
      }

      // Eliminación lógica de la asignación
      await AuditService.softDelete(asignacion, removedBy);

      return { message: 'Rol removido correctamente del usuario' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asignar múltiples roles a un usuario
   */
  static async asignarMultiplesRoles(usuarioId, rolesIds, assignedBy = null) {
    try {
      // Verificar que el usuario existe y está activo
      const usuario = await AuditService.findByPkWithAudit(Usuario, usuarioId);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar que todos los roles existen y están activos
      const roles = await Rol.findAll({
        where: AuditService.combineWhereWithActive({
          id_rol: { [Op.in]: rolesIds }
        })
      });

      if (roles.length !== rolesIds.length) {
        throw new Error('Algunos roles no fueron encontrados o están inactivos');
      }

      const resultados = [];
      const errores = [];

      // Procesar cada rol
      for (const rolId of rolesIds) {
        try {
          const resultado = await this.asignarRolAUsuario(rolId, usuarioId, assignedBy);
          resultados.push({
            rolId,
            success: true,
            message: resultado.message
          });
        } catch (error) {
          errores.push({
            rolId,
            success: false,
            error: error.message
          });
        }
      }

      return {
        message: `Procesamiento completado. ${resultados.length} roles asignados, ${errores.length} errores`,
        resultados,
        errores,
        totalProcesados: rolesIds.length,
        exitosos: resultados.length,
        fallidos: errores.length
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de roles (solo activos)
   */
  static async getRolStats(includeDeleted = false) {
    try {
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();
      
      const [totalRoles, activeRoles, deletedRoles] = await Promise.all([
        Rol.count(),
        Rol.count({ where: AuditService.getActiveWhereCondition() }),
        Rol.count({ where: AuditService.getDeletedWhereCondition() })
      ]);
      
      const rolesPorUsuario = await UsuarioRol.findAll({
        attributes: [
          'id_rol',
          [require('sequelize').fn('COUNT', 'id_usuario'), 'usuarios_count']
        ],
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['nombre_rol', 'descripcion'],
          where: whereCondition,
          required: true
        }],
        where: whereCondition,
        group: ['id_rol', 'rol.nombre_rol', 'rol.descripcion'],
        raw: false
      });

      return {
        totalRoles,
        activeRoles,
        deletedRoles,
        deletionRate: totalRoles > 0 ? ((deletedRoles / totalRoles) * 100).toFixed(2) : 0,
        rolesPorUsuario
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener roles activos sin usuarios asignados
   */
  static async getRolesSinUsuarios() {
    try {
      const roles = await Rol.findAll({
        include: [{
          model: UsuarioRol,
          as: 'usuarioRoles',
          where: AuditService.getActiveWhereCondition(),
          required: false
        }],
        where: {
          ...AuditService.getActiveWhereCondition(),
          '$usuarioRoles.id_rol$': null
        }
      });

      return roles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener roles eliminados
   */
  static async getRolesEliminados() {
    try {
      const roles = await Rol.findAll({
        where: AuditService.getDeletedWhereCondition(),
        include: AuditService.getAuditIncludeOptions(require('../models')),
        order: [['deleted_at', 'DESC']]
      });

      return roles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener roles de un usuario
   */
  static async getRolesByUsuario(usuarioId, includeDeleted = false) {
    try {
      const usuario = await Usuario.findByPk(usuarioId, {
        include: [{
          model: Rol,
          as: 'roles',
          where: includeDeleted ? {} : AuditService.getActiveWhereCondition(),
          required: false,
          through: {
            attributes: ['fecha_asignacion', 'created_by', 'updated_by', 'deleted_by', 'deleted_at'],
            where: includeDeleted ? {} : AuditService.getActiveWhereCondition()
          }
        }]
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      return usuario.roles || [];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RolService;
