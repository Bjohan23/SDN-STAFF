const { Rol, Usuario, UsuarioRol } = require('../models');
const { Op } = require('sequelize');

/**
 * Servicio de Rol - Lógica de negocio
 */
class RolService {
  
  /**
   * Crear un nuevo rol
   */
  static async createRol(rolData) {
    try {
      const rol = await Rol.create({
        nombre_rol: rolData.nombre_rol,
        descripcion: rolData.descripcion || null
      });
      
      return rol;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los roles
   */
  static async getAllRoles(includeUsuarios = false) {
    try {
      const options = {
        order: [['nombre_rol', 'ASC']]
      };

      if (includeUsuarios) {
        options.include = [{
          model: Usuario,
          as: 'usuarios',
          attributes: ['id_usuario', 'correo', 'estado'],
          through: {
            attributes: ['fecha_asignacion']
          }
        }];
      }

      const roles = await Rol.findAll(options);
      return roles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener rol por ID
   */
  static async getRolById(id, includeUsuarios = false) {
    try {
      const options = {};

      if (includeUsuarios) {
        options.include = [{
          model: Usuario,
          as: 'usuarios',
          attributes: ['id_usuario', 'correo', 'estado'],
          through: {
            attributes: ['fecha_asignacion']
          }
        }];
      }

      const rol = await Rol.findByPk(id, options);

      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      return rol;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener rol por nombre
   */
  static async getRolByNombre(nombreRol) {
    try {
      const rol = await Rol.findOne({
        where: { nombre_rol: nombreRol }
      });

      return rol;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar rol
   */
  static async updateRol(id, updateData) {
    try {
      const rol = await Rol.findByPk(id);
      
      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      await rol.update(updateData);
      
      return await this.getRolById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar rol
   */
  static async deleteRol(id) {
    try {
      const rol = await Rol.findByPk(id);
      
      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      // Verificar si hay usuarios asignados a este rol
      const usuariosConRol = await UsuarioRol.count({
        where: { id_rol: id }
      });

      if (usuariosConRol > 0) {
        throw new Error(`No se puede eliminar el rol. Hay ${usuariosConRol} usuarios asignados a este rol`);
      }

      await rol.destroy();
      
      return { message: 'Rol eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuarios asignados a un rol
   */
  static async getUsuariosByRol(rolId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await UsuarioRol.findAndCountAll({
        where: { id_rol: rolId },
        include: [{
          model: Usuario,
          as: 'usuario',
          attributes: ['id_usuario', 'correo', 'estado', 'fecha_creacion', 'ultima_sesion']
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
  static async asignarRolAUsuario(rolId, usuarioId) {
    try {
      // Verificar que el rol existe
      const rol = await this.getRolById(rolId);
      if (!rol) {
        throw new Error('Rol no encontrado');
      }

      // Verificar que el usuario existe
      const { Usuario } = require('../models');
      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar si ya tiene asignado el rol
      const asignacionExistente = await UsuarioRol.findOne({
        where: {
          id_usuario: usuarioId,
          id_rol: rolId
        }
      });

      if (asignacionExistente) {
        throw new Error('El usuario ya tiene asignado este rol');
      }

      // Crear la asignación
      await UsuarioRol.create({
        id_usuario: usuarioId,
        id_rol: rolId,
        fecha_asignacion: new Date()
      });

      return { message: 'Rol asignado correctamente al usuario' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remover rol de usuario
   */
  static async removerRolDeUsuario(rolId, usuarioId) {
    try {
      const asignacion = await UsuarioRol.findOne({
        where: {
          id_usuario: usuarioId,
          id_rol: rolId
        }
      });

      if (!asignacion) {
        throw new Error('El usuario no tiene asignado este rol');
      }

      await asignacion.destroy();

      return { message: 'Rol removido correctamente del usuario' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de roles
   */
  static async getRolStats() {
    try {
      const totalRoles = await Rol.count();
      
      const rolesPorUsuario = await UsuarioRol.findAll({
        attributes: [
          'id_rol',
          [require('sequelize').fn('COUNT', 'id_usuario'), 'usuarios_count']
        ],
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['nombre_rol', 'descripcion']
        }],
        group: ['id_rol', 'rol.nombre_rol', 'rol.descripcion'],
        raw: false
      });

      return {
        totalRoles,
        rolesPorUsuario
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener roles sin usuarios asignados
   */
  static async getRolesSinUsuarios() {
    try {
      const roles = await Rol.findAll({
        include: [{
          model: UsuarioRol,
          as: 'usuarioRoles',
          required: false
        }],
        where: {
          '$usuarioRoles.id_rol$': null
        }
      });

      return roles;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = RolService;
