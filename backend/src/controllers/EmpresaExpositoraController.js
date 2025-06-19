const EmpresaExpositoraService = require('../services/EmpresaExpositoraService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de EmpresaExpositora
 */
class EmpresaExpositoraController {

  /**
   * Crear nueva empresa expositora
   */
  static async createEmpresaExpositora(req, res, next) {
    try {
      const userId = req.user ? req.user.id_usuario : null;
      const empresaData = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(empresaData.nombre_empresa)) {
        return ApiResponse.validation(res, [{ field: 'nombre_empresa', message: 'El nombre de la empresa es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(empresaData.nombre_empresa, 2, 150)) {
        return ApiResponse.validation(res, [{ field: 'nombre_empresa', message: 'El nombre de la empresa debe tener entre 2 y 150 caracteres' }]);
      }

      if (!ValidationUtils.isValidEmail(empresaData.email_contacto)) {
        return ApiResponse.validation(res, [{ field: 'email_contacto', message: 'El email de contacto debe ser válido' }]);
      }

      // Validar RUC si se proporciona
      if (empresaData.ruc) {
        if (empresaData.ruc.length !== 11 || !/^\d+$/.test(empresaData.ruc)) {
          return ApiResponse.validation(res, [{ field: 'ruc', message: 'El RUC debe tener exactamente 11 dígitos' }]);
        }
      }

      // // Validar sitio web si se proporciona
      // if (empresaData.sitio_web && empresaData.sitio_web.trim() !== '') {
      //   try {
      //     new URL(empresaData.sitio_web);
      //   } catch {
      //     return ApiResponse.validation(res, [{ field: 'sitio_web', message: 'El sitio web debe ser una URL válida' }]);
      //   }
      // }

      // Validar tamaño de empresa
      if (empresaData.tamaño_empresa) {
        const tamañosValidos = ['micro', 'pequeña', 'mediana', 'grande'];
        if (!tamañosValidos.includes(empresaData.tamaño_empresa)) {
          return ApiResponse.validation(res, [{ field: 'tamaño_empresa', message: 'El tamaño debe ser: micro, pequeña, mediana o grande' }]);
        }
      }

      // Sanitizar datos
      empresaData.nombre_empresa = ValidationUtils.sanitizeString(empresaData.nombre_empresa);
      if (empresaData.razon_social) {
        empresaData.razon_social = ValidationUtils.sanitizeString(empresaData.razon_social);
      }
      if (empresaData.descripcion) {
        empresaData.descripcion = ValidationUtils.sanitizeString(empresaData.descripcion);
      }

      // Crear empresa
      const nuevaEmpresa = await EmpresaExpositoraService.createEmpresaExpositora(empresaData, userId);

      return ApiResponse.success(res, nuevaEmpresa, 'Empresa expositora creada exitosamente', 201);
    } catch (error) {
      if (error.message.includes('ya está en uso') || error.message.includes('ya está registrado')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener todas las empresas expositoras
   */
  static async getAllEmpresasExpositoras(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';
      
      const filters = {
        search: req.query.search || '',
        estado: req.query.estado || '',
        sector: req.query.sector || '',
        tamaño_empresa: req.query.tamaño_empresa || '',
        ciudad: req.query.ciudad || '',
        pais: req.query.pais || ''
      };

      const result = await EmpresaExpositoraService.getAllEmpresasExpositoras(page, limit, filters, includeAudit, includeDeleted);

      return ApiResponse.paginated(
        res, 
        result.empresas, 
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Empresas expositoras obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener empresa expositora por ID
   */
  static async getEmpresaExpositoraById(req, res, next) {
    try {
      const { id } = req.params;
      const includeEventos = req.query.include_eventos === 'true';
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const empresa = await EmpresaExpositoraService.getEmpresaExpositoraById(id, includeEventos, includeAudit, includeDeleted);
      
      return ApiResponse.success(res, empresa, 'Empresa expositora obtenida exitosamente');
    } catch (error) {
      if (error.message === 'Empresa expositora no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener empresa por RUC
   */
  static async getEmpresaByRuc(req, res, next) {
    try {
      const { ruc } = req.params;

      if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
        return ApiResponse.validation(res, [{ field: 'ruc', message: 'RUC debe tener exactamente 11 dígitos' }]);
      }

      const empresa = await EmpresaExpositoraService.getEmpresaByRuc(ruc);
      
      if (!empresa) {
        return ApiResponse.notFound(res, 'Empresa no encontrada con este RUC');
      }
      
      return ApiResponse.success(res, empresa, 'Empresa obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener empresa por email
   */
  static async getEmpresaByEmail(req, res, next) {
    try {
      const { email } = req.params;

      if (!ValidationUtils.isValidEmail(email)) {
        return ApiResponse.validation(res, [{ field: 'email', message: 'Email inválido' }]);
      }

      const empresa = await EmpresaExpositoraService.getEmpresaByEmail(email);
      
      if (!empresa) {
        return ApiResponse.notFound(res, 'Empresa no encontrada con este email');
      }
      
      return ApiResponse.success(res, empresa, 'Empresa obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar empresa expositora
   */
  static async updateEmpresaExpositora(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validaciones opcionales para campos que se están actualizando
      if (updateData.nombre_empresa && !ValidationUtils.isValidLength(updateData.nombre_empresa, 2, 150)) {
        return ApiResponse.validation(res, [{ field: 'nombre_empresa', message: 'El nombre de la empresa debe tener entre 2 y 150 caracteres' }]);
      }

      if (updateData.email_contacto && !ValidationUtils.isValidEmail(updateData.email_contacto)) {
        return ApiResponse.validation(res, [{ field: 'email_contacto', message: 'El email de contacto debe ser válido' }]);
      }

      if (updateData.ruc && (updateData.ruc.length !== 11 || !/^\d+$/.test(updateData.ruc))) {
        return ApiResponse.validation(res, [{ field: 'ruc', message: 'El RUC debe tener exactamente 11 dígitos' }]);
      }

      if (updateData.sitio_web && updateData.sitio_web.trim() !== '') {
        try {
          new URL(updateData.sitio_web);
        } catch {
          return ApiResponse.validation(res, [{ field: 'sitio_web', message: 'El sitio web debe ser una URL válida' }]);
        }
      }

      if (updateData.tamaño_empresa) {
        const tamañosValidos = ['micro', 'pequeña', 'mediana', 'grande'];
        if (!tamañosValidos.includes(updateData.tamaño_empresa)) {
          return ApiResponse.validation(res, [{ field: 'tamaño_empresa', message: 'El tamaño debe ser: micro, pequeña, mediana o grande' }]);
        }
      }

      // Sanitizar datos
      if (updateData.nombre_empresa) {
        updateData.nombre_empresa = ValidationUtils.sanitizeString(updateData.nombre_empresa);
      }
      if (updateData.razon_social) {
        updateData.razon_social = ValidationUtils.sanitizeString(updateData.razon_social);
      }
      if (updateData.descripcion) {
        updateData.descripcion = ValidationUtils.sanitizeString(updateData.descripcion);
      }

      const empresaActualizada = await EmpresaExpositoraService.updateEmpresaExpositora(id, updateData, userId);
      
      return ApiResponse.success(res, empresaActualizada, 'Empresa expositora actualizada exitosamente');
    } catch (error) {
      if (error.message === 'Empresa expositora no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('ya está en uso') || error.message.includes('ya está registrado')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Eliminar empresa expositora
   */
  static async deleteEmpresaExpositora(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await EmpresaExpositoraService.deleteEmpresaExpositora(id, userId);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Empresa expositora no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Aprobar empresa expositora
   */
  static async aprobarEmpresa(req, res, next) {
    try {
      const { id } = req.params;
      const { comentarios } = req.body;
      const aprobadaPor = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const empresa = await EmpresaExpositoraService.aprobarEmpresa(id, aprobadaPor, comentarios);
      
      return ApiResponse.success(res, empresa, 'Empresa aprobada exitosamente');
    } catch (error) {
      if (error.message === 'Empresa expositora no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('ya está aprobada')) {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Rechazar empresa expositora
   */
  static async rechazarEmpresa(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const rechazadaPor = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!ValidationUtils.isNotEmpty(motivo)) {
        return ApiResponse.validation(res, [{ field: 'motivo', message: 'El motivo de rechazo es requerido' }]);
      }

      const empresa = await EmpresaExpositoraService.rechazarEmpresa(id, motivo, rechazadaPor);
      
      return ApiResponse.success(res, empresa, 'Empresa rechazada exitosamente');
    } catch (error) {
      if (error.message === 'Empresa expositora no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Suspender empresa expositora
   */
  static async suspenderEmpresa(req, res, next) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const suspendidaPor = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const empresa = await EmpresaExpositoraService.suspenderEmpresa(id, motivo, suspendidaPor);
      
      return ApiResponse.success(res, empresa, 'Empresa suspendida exitosamente');
    } catch (error) {
      if (error.message === 'Empresa expositora no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Registrar empresa en evento
   */
  static async registrarEnEvento(req, res, next) {
    try {
      const { id } = req.params; // ID de la empresa
      const { evento_id, ...datosRegistro } = req.body;
      const registradoPor = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de empresa inválido' }]);
      }

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      // Validar email de contacto del evento si se proporciona
      if (datosRegistro.email_contacto_evento && !ValidationUtils.isValidEmail(datosRegistro.email_contacto_evento)) {
        return ApiResponse.validation(res, [{ field: 'email_contacto_evento', message: 'El email de contacto debe ser válido' }]);
      }

      const participacion = await EmpresaExpositoraService.registrarEnEvento(id, evento_id, datosRegistro, registradoPor);
      
      return ApiResponse.success(res, participacion, 'Empresa registrada en evento exitosamente', 201);
    } catch (error) {
      if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('ya está registrada') || error.message.includes('no acepta registros') || error.message.includes('Solo las empresas aprobadas')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener participación en evento específico
   */
  static async getParticipacionEnEvento(req, res, next) {
    try {
      const { id, evento_id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de empresa inválido' }]);
      }

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      const participacion = await EmpresaExpositoraService.getParticipacionEnEvento(id, evento_id);
      
      return ApiResponse.success(res, participacion, 'Participación obtenida exitosamente');
    } catch (error) {
      if (error.message === 'Participación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener estadísticas de empresas expositoras
   */
  static async getEmpresasStats(req, res, next) {
    try {
      const includeDeleted = req.query.include_deleted === 'true';
      const stats = await EmpresaExpositoraService.getEmpresasStats(includeDeleted);
      
      return ApiResponse.success(res, stats, 'Estadísticas de empresas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener empresas con documentos próximos a vencer
   */
  static async getEmpresasConDocumentosProximosAVencer(req, res, next) {
    try {
      const dias = parseInt(req.query.dias) || 30;
      const empresas = await EmpresaExpositoraService.getEmpresasConDocumentosProximosAVencer(dias);
      
      return ApiResponse.success(res, empresas, `Empresas con documentos que vencen en ${dias} días obtenidas exitosamente`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurar empresa eliminada
   */
  static async restoreEmpresa(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await EmpresaExpositoraService.restoreEmpresa(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Empresa expositora no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message === 'La empresa no está eliminada') {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Carga masiva desde CSV
   */
  static async cargaMasivaCSV(req, res, next) {
    try {
      const csvData = req.body.data; // Esperamos que el CSV ya esté parseado
      const userId = req.user ? req.user.id_usuario : null;

      if (!Array.isArray(csvData) || csvData.length === 0) {
        return ApiResponse.validation(res, [{ field: 'data', message: 'Datos CSV requeridos como array' }]);
      }

      const result = await EmpresaExpositoraService.cargaMasivaDesdeCSV(csvData, userId);
      
      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener empresas pendientes de aprobación
   */
  static async getEmpresasPendientes(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const filters = { estado: 'pendiente' };
      
      const result = await EmpresaExpositoraService.getAllEmpresasExpositoras(page, limit, filters);

      return ApiResponse.paginated(
        res, 
        result.empresas, 
        {
          page,
          limit,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        },
        'Empresas pendientes de aprobación obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar disponibilidad de RUC
   */
  static async verificarRuc(req, res, next) {
    try {
      const { ruc } = req.params;
      const { empresa_id } = req.query; // Para excluir en actualizaciones

      if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
        return ApiResponse.validation(res, [{ field: 'ruc', message: 'RUC debe tener exactamente 11 dígitos' }]);
      }

      const empresaExistente = await EmpresaExpositoraService.getEmpresaByRuc(ruc);
      
      let disponible = !empresaExistente;
      
      // Si existe pero es la misma empresa que se está editando, está disponible
      if (empresaExistente && empresa_id && empresaExistente.id_empresa == empresa_id) {
        disponible = true;
      }
      
      return ApiResponse.success(res, { 
        disponible,
        ruc,
        empresa_existente: empresaExistente ? {
          id: empresaExistente.id_empresa,
          nombre: empresaExistente.nombre_empresa
        } : null
      }, disponible ? 'RUC disponible' : 'RUC no disponible');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = EmpresaExpositoraController;
