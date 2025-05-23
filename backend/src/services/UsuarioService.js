const bcrypt = require('bcryptjs');
const { Usuario, Rol, UsuarioRol } = require('../models');
const { Op } = require('sequelize');

/**
 * Servicio de Usuario - Lógica de negocio para el nuevo modelo Usuario
 */
class UsuarioService {
  
  /**
   * Crear un nuevo usuario
   */
  static async createUsuario(userData) {
    try {
      // Encriptar password
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password_hash = await bcrypt.hash(userData.password, salt);
        delete userData.password; // Remover password plano
      }

      // Crear usuario
      const usuario = await Usuario.create({
        username: userData.username,
        password_hash: userData.password_hash,
        estado: userData.estado || 'activo',
        fecha_creacion: new Date()
      });
      
      // Si se proporcionan roles, asignarlos
      if (userData.roles && Array.isArray(userData.roles)) {
        await this.assignRoles(usuario.id_usuario, userData.roles);
      }
      
      // Retornar usuario con roles
      const usuarioCompleto = await this.getUsuarioById(usuario.id_usuario);
      return usuarioCompleto;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con paginación
   */
  static async getAllUsuarios(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Aplicar filtros
      if (filters.search) {
        whereClause.username = { [Op.like]: `%${filters.search}%` };
      }

      if (filters.estado) {
        whereClause.estado = filters.estado;
      }

      const { count, rows } = await Usuario.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_creacion', 'DESC']],
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol', 'descripcion'],
          through: {
            attributes: ['fecha_asignacion']
          }
        }],
        distinct: true // Para contar correctamente con includes
      });

      return {
        usuarios: rows,
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
   * Obtener usuario por ID
   */
  static async getUsuarioById(id) {
    try {
      const usuario = await Usuario.findByPk(id, {
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol', 'descripcion'],
          through: {
            attributes: ['fecha_asignacion']
          }
        }]
      });

      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      return usuario;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario por username
   */
  static async getUsuarioByUsername(username) {
    try {
      const usuario = await Usuario.findOne({
        where: { username },
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol', 'descripcion'],
          through: {
            attributes: ['fecha_asignacion']
          }
        }]
      });

      return usuario;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario con password para autenticación
   */
  static async getUsuarioForAuth(username) {
    try {
      const usuario = await Usuario.findOne({
        where: { username },
        attributes: ['id_usuario', 'username', 'password_hash', 'estado'],
        include: [{
          model: Rol,
          as: 'roles',
          attributes: ['id_rol', 'nombre_rol']
        }]
      });

      return usuario;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  static async updateUsuario(id, updateData) {
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Si se actualiza la password, encriptarla
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(updateData.password, salt);
        delete updateData.password;
      }

      await usuario.update(updateData);
      
      // Si se actualizan roles, reasignarlos
      if (updateData.roles && Array.isArray(updateData.roles)) {
        await this.assignRoles(id, updateData.roles);
      }
      
      // Retornar usuario actualizado
      const usuarioActualizado = await this.getUsuarioById(id);
      return usuarioActualizado;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUsuario(id) {
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      // Eliminar físicamente el usuario (las relaciones se eliminan por CASCADE)
      await usuario.destroy();
      
      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar estado de usuario
   */
  static async cambiarEstado(id, nuevoEstado) {
    try {
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }

      await usuario.update({ estado: nuevoEstado });
      
      return await this.getUsuarioById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Asignar roles a usuario
   */
  static async assignRoles(usuarioId, rolesIds) {
    try {
      // Primero eliminar roles existentes
      await UsuarioRol.destroy({
        where: { id_usuario: usuarioId }
      });

      // Crear nuevas asignaciones
      const asignaciones = rolesIds.map(rolId => ({
        id_usuario: usuarioId,
        id_rol: rolId,
        fecha_asignacion: new Date()
      }));

      await UsuarioRol.bulkCreate(asignaciones);
      
      return { message: 'Roles asignados correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validar password
   */
  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar última sesión
   */
  static async updateUltimaSesion(id) {
    try {
      await Usuario.update(
        { ultima_sesion: new Date() },
        { where: { id_usuario: id } }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getUsuarioStats() {
    try {
      const totalUsuarios = await Usuario.count();
      const usuariosActivos = await Usuario.count({ where: { estado: 'activo' } });
      const usuariosInactivos = await Usuario.count({ where: { estado: 'inactivo' } });
      const usuariosSuspendidos = await Usuario.count({ where: { estado: 'suspendido' } });
      
      // Estadísticas por rol
      const usuariosPorRol = await UsuarioRol.findAll({
        attributes: [
          'id_rol',
          [require('sequelize').fn('COUNT', 'id_usuario'), 'count']
        ],
        include: [{
          model: Rol,
          as: 'rol',
          attributes: ['nombre_rol']
        }],
        group: ['id_rol', 'rol.nombre_rol'],
        raw: false
      });

      return {
        total: totalUsuarios,
        activos: usuariosActivos,
        inactivos: usuariosInactivos,
        suspendidos: usuariosSuspendidos,
        porRol: usuariosPorRol
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar si usuario tiene rol específico
   */
  static async usuarioTieneRol(usuarioId, nombreRol) {
    try {
      const asignacion = await UsuarioRol.findOne({
        where: { id_usuario: usuarioId },
        include: [{
          model: Rol,
          as: 'rol',
          where: { nombre_rol: nombreRol }
        }]
      });

      return !!asignacion;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UsuarioService;
