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
      const { correo, password, estado, roles } = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(correo)) {
        return ApiResponse.validation(res, [{ field: 'correo', message: 'El nombre de usuario es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(correo, 3, 50)) {
        return ApiResponse.validation(res, [{ field: 'correo', message: 'El nombre de usuario debe tener entre 3 y 50 caracteres' }]);
      }

      if (!ValidationUtils.isValidLength(password, 6)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }]);
      }

      // Verificar si el correo ya existe
      const existingUsuario = await UsuarioService.getUsuarioBycorreo(correo);
      if (existingUsuario) {
        return ApiResponse.error(res, 'El nombre de usuario ya está en uso', 409);
      }

      // Crear usuario
      const nuevoUsuario = await UsuarioService.createUsuario({
        correo: ValidationUtils.sanitizeString(correo),
        password,
        estado: estado || 'activo',
        roles: roles || []
      }, req.user ? req.user.id_usuario : null);

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
   * Obtener usuario por correo
   */
  static async getUsuarioBycorreo(req, res, next) {
    try {
      const { correo } = req.params;

      if (!ValidationUtils.isNotEmpty(correo)) {
        return ApiResponse.validation(res, [{ field: 'correo', message: 'correo requerido' }]);
      }

      const usuario = await UsuarioService.getUsuarioBycorreo(correo);
      
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

      // Validar correo si se está actualizando
      if (updateData.correo && !ValidationUtils.isValidLength(updateData.correo, 3, 50)) {
        return ApiResponse.validation(res, [{ field: 'correo', message: 'El correo debe tener entre 3 y 50 caracteres' }]);
      }

      // Validar password si se está actualizando
      if (updateData.password && !ValidationUtils.isValidLength(updateData.password, 6)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }]);
      }

      // Sanitizar strings
      if (updateData.correo) {
        updateData.correo = ValidationUtils.sanitizeString(updateData.correo);
      }

      const usuarioActualizado = await UsuarioService.updateUsuario(id, updateData, req.user ? req.user.id_usuario : null);
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

      const result = await UsuarioService.assignRoles(id, roles, req.user ? req.user.id_usuario : null);
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
   * Obtener perfil del usuario autenticado
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id_usuario;
      const user = await UsuarioService.getUsuarioById(userId);
      return ApiResponse.success(res, user, 'Perfil obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Actualizar perfil del usuario autenticado
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id_usuario;
      const updateData = req.body;
      
      // Debug: Log de los datos recibidos
      console.log('=== DEBUG UPDATE PROFILE ===');
      console.log('User ID:', userId);
      console.log('Update Data:', updateData);
      console.log('foto_url value:', updateData.foto_url);
      console.log('foto_url type:', typeof updateData.foto_url);
      console.log('===========================');

      // Validar campos personalizables obligatorios
      if (!updateData.nombre || !ValidationUtils.isNotEmpty(updateData.nombre)) {
        return ApiResponse.validation(res, [{ field: 'nombre', message: 'El nombre es requerido' }]);
      }
      if (!ValidationUtils.isValidLength(updateData.nombre, 1, 100)) {
        return ApiResponse.validation(res, [{ field: 'nombre', message: 'El nombre debe tener entre 1 y 100 caracteres' }]);
      }

      if (!updateData.bio || !ValidationUtils.isNotEmpty(updateData.bio)) {
        return ApiResponse.validation(res, [{ field: 'bio', message: 'La biografía es requerida' }]);
      }
      if (!ValidationUtils.isValidLength(updateData.bio, 1, 1000)) {
        return ApiResponse.validation(res, [{ field: 'bio', message: 'La bio debe tener entre 1 y 1000 caracteres' }]);
      }

      // Validar URL de foto obligatoria
      if (!updateData.foto_url || !ValidationUtils.isNotEmpty(updateData.foto_url)) {
        return ApiResponse.validation(res, [{ field: 'foto_url', message: 'La URL de la foto es requerida' }]);
      }
      if (!ValidationUtils.isValidLength(updateData.foto_url, 1, 2000)) {
        return ApiResponse.validation(res, [{ field: 'foto_url', message: 'La URL de la foto debe tener entre 1 y 2000 caracteres' }]);
      }
      // Validación de formato de URL
      if (!updateData.foto_url.startsWith('http://') && !updateData.foto_url.startsWith('https://')) {
        return ApiResponse.validation(res, [{ field: 'foto_url', message: 'La URL de la foto debe comenzar con http:// o https://' }]);
      }

      // Validar cambio de contraseña si se está actualizando
      if (updateData.password && !ValidationUtils.isValidLength(updateData.password, 6)) {
        return ApiResponse.validation(res, [{ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' }]);
      }

      // Si se está cambiando la contraseña, verificar la contraseña actual
      if (updateData.password && updateData.currentPassword) {
        const usuario = await UsuarioService.getUsuarioById(userId);
        const passwordValid = await UsuarioService.validatePassword(updateData.currentPassword, usuario.password_hash);
        if (!passwordValid) {
          return ApiResponse.validation(res, [{ field: 'currentPassword', message: 'La contraseña actual es incorrecta' }]);
        }
      }

      // Sanitizar strings
      if (updateData.nombre) {
        updateData.nombre = ValidationUtils.sanitizeString(updateData.nombre);
      }
      if (updateData.bio) {
        updateData.bio = ValidationUtils.sanitizeString(updateData.bio);
      }

      // Remover currentPassword del updateData ya que no es un campo de la base de datos
      delete updateData.currentPassword;

      const usuarioActualizado = await UsuarioService.updateUsuario(userId, updateData, userId);
      return ApiResponse.success(res, usuarioActualizado, 'Perfil actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }
}

module.exports = UsuarioController;
