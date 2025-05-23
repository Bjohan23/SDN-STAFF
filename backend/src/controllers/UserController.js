const UserService = require('../services/UserService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Usuario
 */
class UserController {

  /**
   * Crear nuevo usuario
   */
  static async createUser(req, res, next) {
    try {
      const { firstName, lastName, email, password, phone, role } = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(firstName)) {
        return ApiResponse.validation(res, [{ field: 'firstName', message: 'El nombre es requerido' }]);
      }

      if (!ValidationUtils.isNotEmpty(lastName)) {
        return ApiResponse.validation(res, [{ field: 'lastName', message: 'El apellido es requerido' }]);
      }

      if (!ValidationUtils.isValidEmail(email)) {
        return ApiResponse.validation(res, [{ field: 'email', message: 'El email no es válido' }]);
      }

      if (!ValidationUtils.isValidLength(password, 6)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }]);
      }

      // Verificar si el email ya existe
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return ApiResponse.error(res, 'El email ya está registrado', 409);
      }

      // Crear usuario
      const newUser = await UserService.createUser({
        firstName: ValidationUtils.sanitizeString(firstName),
        lastName: ValidationUtils.sanitizeString(lastName),
        email: email.toLowerCase().trim(),
        password,
        phone: phone ? ValidationUtils.sanitizeString(phone) : null,
        role: role || 'employee'
      });

      return ApiResponse.success(res, newUser, 'Usuario creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los usuarios
   */
  static async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        search: req.query.search || '',
        role: req.query.role || '',
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined
      };

      const result = await UserService.getAllUsers(page, limit, filters);

      return ApiResponse.paginated(
        res, 
        result.users, 
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Usuarios obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener usuario por ID
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const user = await UserService.getUserById(id);
      
      return ApiResponse.success(res, user, 'Usuario obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Actualizar usuario
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validar email si se está actualizando
      if (updateData.email && !ValidationUtils.isValidEmail(updateData.email)) {
        return ApiResponse.validation(res, [{ field: 'email', message: 'El email no es válido' }]);
      }

      // Validar password si se está actualizando
      if (updateData.password && !ValidationUtils.isValidLength(updateData.password, 6)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }]);
      }

      // Sanitizar strings
      if (updateData.firstName) {
        updateData.firstName = ValidationUtils.sanitizeString(updateData.firstName);
      }
      if (updateData.lastName) {
        updateData.lastName = ValidationUtils.sanitizeString(updateData.lastName);
      }
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase().trim();
      }
      if (updateData.phone) {
        updateData.phone = ValidationUtils.sanitizeString(updateData.phone);
      }

      const updatedUser = await UserService.updateUser(id, updateData);
      
      return ApiResponse.success(res, updatedUser, 'Usuario actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Eliminar usuario
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await UserService.deleteUser(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getUserStats(req, res, next) {
    try {
      const stats = await UserService.getUserStats();
      
      return ApiResponse.success(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  static async getProfile(req, res, next) {
    try {
      // Este método requiere middleware de autenticación
      // const userId = req.user.id; // Del token JWT
      // const user = await UserService.getUserById(userId);
      // return ApiResponse.success(res, user, 'Perfil obtenido exitosamente');
      
      return ApiResponse.error(res, 'Funcionalidad pendiente de implementar - requiere autenticación', 501);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
