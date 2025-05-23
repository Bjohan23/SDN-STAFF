const UsuarioService = require('../services/UsuarioService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Usuario - Para el nuevo modelo Usuario
 */
class UsuarioController {

  /**
   * Crear nuevo usuario
   */
  static async createUsuario(req, res, next) {
    try {
      const { username, password, estado, roles } = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(username)) {
        return ApiResponse.validation(res, [{ field: 'username', message: 'El nombre de usuario es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(username, 3, 50)) {
        return ApiResponse.validation(res, [{ field: 'username', message: 'El nombre de usuario debe tener entre 3 y 50 caracteres' }]);
      }

      if (!ValidationUtils.isValidLength(password, 6)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }]);
      }

      // Verificar si el username ya existe
      const existingUsuario = await UsuarioService.getUsuarioByUsername(username);
      if (existingUsuario) {
        return ApiResponse.error(res, 'El nombre de usuario ya está en uso', 409);
      }

      // Crear usuario
      const nuevoUsuario = await UsuarioService.createUsuario({
        username: ValidationUtils.sanitizeString(username),
        password,
        estado: estado || 'activo',
        roles: roles || []
      });

      return ApiResponse.success(res, nuevoUsuario, 'Usuario creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los usuarios
   */
  static async getAllUsuarios(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        search: req.query.search || '',
        estado: req.query.estado || ''
      };

      const result = await UsuarioService.getAllUsuarios(page, limit, filters);

      return ApiResponse.paginated(
        res, 
        result.usuarios, 
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
  static async getUsuarioById(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const usuario = await UsuarioService.getUsuarioById(id);
      
      return ApiResponse.success(res, usuario, 'Usuario obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener usuario por username
   */
  static async getUsuarioByUsername(req, res, next) {
    try {
      const { username } = req.params;

      if (!ValidationUtils.isNotEmpty(username)) {
        return ApiResponse.validation(res, [{ field: 'username', message: 'Username requerido' }]);
      }

      const usuario = await UsuarioService.getUsuarioByUsername(username);
      
      if (!usuario) {
        return ApiResponse.notFound(res, 'Usuario no encontrado');
      }
      
      return ApiResponse.success(res, usuario, 'Usuario obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar usuario
   */
  static async updateUsuario(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validar username si se está actualizando
      if (updateData.username && !ValidationUtils.isValidLength(updateData.username, 3, 50)) {
        return ApiResponse.validation(res, [{ field: 'username', message: 'El username debe tener entre 3 y 50 caracteres' }]);
      }

      // Validar password si se está actualizando
      if (updateData.password && !ValidationUtils.isValidLength(updateData.password, 6)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }]);
      }

      // Sanitizar strings
      if (updateData.username) {
        updateData.username = ValidationUtils.sanitizeString(updateData.username);
      }

      const usuarioActualizado = await UsuarioService.updateUsuario(id, updateData);
      
      return ApiResponse.success(res, usuarioActualizado, 'Usuario actualizado exitosamente');
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
  static async deleteUsuario(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await UsuarioService.deleteUsuario(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Cambiar estado de usuario
   */
  static async cambiarEstado(req, res, next) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!['activo', 'inactivo', 'suspendido'].includes(estado)) {
        return ApiResponse.validation(res, [{ field: 'estado', message: 'Estado debe ser: activo, inactivo o suspendido' }]);
      }

      const usuario = await UsuarioService.cambiarEstado(id, estado);
      
      return ApiResponse.success(res, usuario, 'Estado del usuario actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Asignar roles a usuario
   */
  static async assignRoles(req, res, next) {
    try {
      const { id } = req.params;
      const { roles } = req.body;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!Array.isArray(roles)) {
        return ApiResponse.validation(res, [{ field: 'roles', message: 'Roles debe ser un array' }]);
      }

      const result = await UsuarioService.assignRoles(id, roles);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  static async getUsuarioStats(req, res, next) {
    try {
      const stats = await UsuarioService.getUsuarioStats();
      
      return ApiResponse.success(res, stats, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar si usuario tiene rol específico
   */
  static async verificarRol(req, res, next) {
    try {
      const { id } = req.params;
      const { rol } = req.query;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!ValidationUtils.isNotEmpty(rol)) {
        return ApiResponse.validation(res, [{ field: 'rol', message: 'Nombre de rol requerido' }]);
      }

      const tieneRol = await UsuarioService.usuarioTieneRol(id, rol);
      
      return ApiResponse.success(res, { tieneRol }, 'Verificación de rol completada');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login de usuario (básico)
   */
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!ValidationUtils.isNotEmpty(username) || !ValidationUtils.isNotEmpty(password)) {
        return ApiResponse.validation(res, [{ field: 'credentials', message: 'Username y password son requeridos' }]);
      }

      // Obtener usuario con password
      const usuario = await UsuarioService.getUsuarioForAuth(username);
      
      if (!usuario) {
        return ApiResponse.unauthorized(res, 'Credenciales inválidas');
      }

      if (usuario.estado !== 'activo') {
        return ApiResponse.unauthorized(res, 'Usuario inactivo o suspendido');
      }

      // Validar password
      const passwordValido = await UsuarioService.validatePassword(password, usuario.password_hash);
      
      if (!passwordValido) {
        return ApiResponse.unauthorized(res, 'Credenciales inválidas');
      }

      // Actualizar última sesión
      await UsuarioService.updateUltimaSesion(usuario.id_usuario);

      // Preparar respuesta (sin password)
      const usuarioResponse = usuario.toJSON();
      delete usuarioResponse.password_hash;

      return ApiResponse.success(res, usuarioResponse, 'Login exitoso');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsuarioController;
