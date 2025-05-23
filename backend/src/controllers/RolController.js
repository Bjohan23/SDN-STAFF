const RolService = require('../services/RolService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Rol
 */
class RolController {

  /**
   * Crear nuevo rol
   */
  static async createRol(req, res, next) {
    try {
      const { nombre_rol, descripcion } = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(nombre_rol)) {
        return ApiResponse.validation(res, [{ field: 'nombre_rol', message: 'El nombre del rol es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(nombre_rol, 2, 50)) {
        return ApiResponse.validation(res, [{ field: 'nombre_rol', message: 'El nombre del rol debe tener entre 2 y 50 caracteres' }]);
      }

      // Verificar si el nombre del rol ya existe
      const existingRol = await RolService.getRolByNombre(nombre_rol);
      if (existingRol) {
        return ApiResponse.error(res, 'El nombre del rol ya existe', 409);
      }

      // Crear rol
      const nuevoRol = await RolService.createRol({
        nombre_rol: ValidationUtils.sanitizeString(nombre_rol),
        descripcion: descripcion ? ValidationUtils.sanitizeString(descripcion) : null
      });

      return ApiResponse.success(res, nuevoRol, 'Rol creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los roles
   */
  static async getAllRoles(req, res, next) {
    try {
      const includeUsuarios = req.query.include_usuarios === 'true';
      
      const roles = await RolService.getAllRoles(includeUsuarios);

      return ApiResponse.success(res, roles, 'Roles obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener rol por ID
   */
  static async getRolById(req, res, next) {
    try {
      const { id } = req.params;
      const includeUsuarios = req.query.include_usuarios === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const rol = await RolService.getRolById(id, includeUsuarios);
      
      return ApiResponse.success(res, rol, 'Rol obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Rol no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener rol por nombre
   */
  static async getRolByNombre(req, res, next) {
    try {
      const { nombre } = req.params;

      if (!ValidationUtils.isNotEmpty(nombre)) {
        return ApiResponse.validation(res, [{ field: 'nombre', message: 'Nombre de rol requerido' }]);
      }

      const rol = await RolService.getRolByNombre(nombre);
      
      if (!rol) {
        return ApiResponse.notFound(res, 'Rol no encontrado');
      }
      
      return ApiResponse.success(res, rol, 'Rol obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar rol
   */
  static async updateRol(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validar nombre_rol si se está actualizando
      if (updateData.nombre_rol && !ValidationUtils.isValidLength(updateData.nombre_rol, 2, 50)) {
        return ApiResponse.validation(res, [{ field: 'nombre_rol', message: 'El nombre del rol debe tener entre 2 y 50 caracteres' }]);
      }

      // Sanitizar strings
      if (updateData.nombre_rol) {
        updateData.nombre_rol = ValidationUtils.sanitizeString(updateData.nombre_rol);
      }
      if (updateData.descripcion) {
        updateData.descripcion = ValidationUtils.sanitizeString(updateData.descripcion);
      }

      const rolActualizado = await RolService.updateRol(id, updateData);
      
      return ApiResponse.success(res, rolActualizado, 'Rol actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Rol no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Eliminar rol
   */
  static async deleteRol(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await RolService.deleteRol(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Rol no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar el rol')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener usuarios asignados a un rol
   */
  static async getUsuariosByRol(req, res, next) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await RolService.getUsuariosByRol(id, page, limit);

      return ApiResponse.paginated(
        res,
        result.asignaciones,
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Usuarios del rol obtenidos exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Asignar rol a usuario
   */
  static async asignarRolAUsuario(req, res, next) {
    try {
      const { id } = req.params; // ID del rol
      const { usuario_id } = req.body;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de rol inválido' }]);
      }

      if (!ValidationUtils.isValidId(usuario_id)) {
        return ApiResponse.validation(res, [{ field: 'usuario_id', message: 'ID de usuario inválido' }]);
      }

      const result = await RolService.asignarRolAUsuario(id, usuario_id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('ya tiene asignado')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Remover rol de usuario
   */
  static async removerRolDeUsuario(req, res, next) {
    try {
      const { id } = req.params; // ID del rol
      const { usuario_id } = req.body;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de rol inválido' }]);
      }

      if (!ValidationUtils.isValidId(usuario_id)) {
        return ApiResponse.validation(res, [{ field: 'usuario_id', message: 'ID de usuario inválido' }]);
      }

      const result = await RolService.removerRolDeUsuario(id, usuario_id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message.includes('no tiene asignado')) {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener estadísticas de roles
   */
  static async getRolStats(req, res, next) {
    try {
      const stats = await RolService.getRolStats();
      
      return ApiResponse.success(res, stats, 'Estadísticas de roles obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener roles sin usuarios asignados
   */
  static async getRolesSinUsuarios(req, res, next) {
    try {
      const roles = await RolService.getRolesSinUsuarios();
      
      return ApiResponse.success(res, roles, 'Roles sin usuarios obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RolController;
