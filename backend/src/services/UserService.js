const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * Servicio de Usuario - Lógica de negocio
 */
class UserService {
  
  /**
   * Crear un nuevo usuario
   */
  static async createUser(userData) {
    try {
      // Encriptar password
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // Crear usuario
      const user = await User.create(userData);
      
      // Retornar usuario sin password
      const userResponse = user.toJSON();
      delete userResponse.password;
      
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios con paginación
   */
  static async getAllUsers(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const whereClause = {};

      // Aplicar filtros
      if (filters.search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${filters.search}%` } },
          { lastName: { [Op.like]: `%${filters.search}%` } },
          { email: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      if (filters.role) {
        whereClause.role = filters.role;
      }

      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['password'] }
      });

      return {
        users: rows,
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
  static async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   */
  static async getUserByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email },
        attributes: { exclude: ['password'] }
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  static async updateUser(id, updateData) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si se actualiza la password, encriptarla
      if (updateData.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(updateData.password, salt);
      }

      await user.update(updateData);
      
      // Retornar usuario actualizado sin password
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  static async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Soft delete - marcar como inactivo
      await user.update({ isActive: false });
      
      return { message: 'Usuario eliminado correctamente' };
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
   * Actualizar último login
   */
  static async updateLastLogin(id) {
    try {
      await User.update(
        { lastLogin: new Date() },
        { where: { id } }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getUserStats() {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { isActive: true } });
      const inactiveUsers = totalUsers - activeUsers;
      
      const usersByRole = await User.findAll({
        attributes: ['role', [require('sequelize').fn('COUNT', 'id'), 'count']],
        group: ['role'],
        raw: true
      });

      return {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: usersByRole
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;
