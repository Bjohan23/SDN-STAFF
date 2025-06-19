const ClasificacionTipoEventoService = require('../services/ClasificacionTipoEventoService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Clasificación por Tipo de Evento
 */
class ClasificacionTipoEventoController {

  /**
   * Crear configuración completa para un tipo de evento
   */
  static async createConfiguracionCompleta(req, res, next) {
    try {
      const { tipo_evento_id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;
      const configuracionData = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isValidId(tipo_evento_id)) {
        return ApiResponse.validation(res, [{ field: 'tipo_evento_id', message: 'ID de tipo de evento inválido' }]);
      }

      if (!configuracionData.modalidad) {
        return ApiResponse.validation(res, [{ field: 'modalidad', message: 'La modalidad es requerida' }]);
      }

      const modalidadesValidas = ['presencial', 'virtual', 'hibrido'];
      if (!modalidadesValidas.includes(configuracionData.modalidad)) {
        return ApiResponse.validation(res, [{ field: 'modalidad', message: 'La modalidad debe ser: presencial, virtual o híbrido' }]);
      }

      // Validaciones numéricas opcionales
      if (configuracionData.capacidad_minima && configuracionData.capacidad_minima <= 0) {
        return ApiResponse.validation(res, [{ field: 'capacidad_minima', message: 'La capacidad mínima debe ser mayor a 0' }]);
      }

      if (configuracionData.capacidad_maxima && configuracionData.capacidad_maxima <= 0) {
        return ApiResponse.validation(res, [{ field: 'capacidad_maxima', message: 'La capacidad máxima debe ser mayor a 0' }]);
      }

      if (configuracionData.precio_base_entrada && configuracionData.precio_base_entrada < 0) {
        return ApiResponse.validation(res, [{ field: 'precio_base_entrada', message: 'El precio no puede ser negativo' }]);
      }

      // Crear configuración
      const configuracion = await ClasificacionTipoEventoService.createConfiguracionCompleta(
        tipo_evento_id, 
        configuracionData, 
        userId
      );

      return ApiResponse.success(res, configuracion, 'Configuración creada exitosamente', 201);
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('ya existe')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener configuraciones por tipo de evento
   */
  static async getConfiguracionesByTipo(req, res, next) {
    try {
      const { tipo_evento_id } = req.params;
      const includeValidaciones = req.query.include_validaciones === 'true';
      const includeAudit = req.query.include_audit === 'true';

      if (!ValidationUtils.isValidId(tipo_evento_id)) {
        return ApiResponse.validation(res, [{ field: 'tipo_evento_id', message: 'ID de tipo de evento inválido' }]);
      }

      const configuraciones = await ClasificacionTipoEventoService.getConfiguracionesByTipo(
        tipo_evento_id, 
        includeValidaciones, 
        includeAudit
      );

      return ApiResponse.success(res, configuraciones, 'Configuraciones obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener configuración específica por modalidad
   */
  static async getConfiguracionByModalidad(req, res, next) {
    try {
      const { tipo_evento_id, modalidad } = req.params;
      const includeValidaciones = req.query.include_validaciones === 'true';
      const includeAudit = req.query.include_audit === 'true';

      if (!ValidationUtils.isValidId(tipo_evento_id)) {
        return ApiResponse.validation(res, [{ field: 'tipo_evento_id', message: 'ID de tipo de evento inválido' }]);
      }

      const modalidadesValidas = ['presencial', 'virtual', 'hibrido'];
      if (!modalidadesValidas.includes(modalidad)) {
        return ApiResponse.validation(res, [{ field: 'modalidad', message: 'Modalidad inválida' }]);
      }

      const configuracion = await ClasificacionTipoEventoService.getConfiguracionByModalidad(
        tipo_evento_id, 
        modalidad, 
        includeValidaciones, 
        includeAudit
      );

      if (!configuracion) {
        return ApiResponse.notFound(res, 'Configuración no encontrada para la modalidad especificada');
      }

      return ApiResponse.success(res, configuracion, 'Configuración obtenida exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validar configuración de evento
   */
  static async validarConfiguracionEvento(req, res, next) {
    try {
      const { tipo_evento_id } = req.params;
      const datosEvento = req.body;

      if (!ValidationUtils.isValidId(tipo_evento_id)) {
        return ApiResponse.validation(res, [{ field: 'tipo_evento_id', message: 'ID de tipo de evento inválido' }]);
      }

      if (!datosEvento.modalidad) {
        return ApiResponse.validation(res, [{ field: 'modalidad', message: 'La modalidad es requerida para la validación' }]);
      }

      const resultados = await ClasificacionTipoEventoService.validarConfiguracionEvento(
        tipo_evento_id, 
        datosEvento
      );

      return ApiResponse.success(res, resultados, 'Validación completada');
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener plantillas disponibles para un tipo de evento
   */
  static async getPlantillasDisponibles(req, res, next) {
    try {
      const { tipo_evento_id } = req.params;
      const modalidad = req.query.modalidad || null;
      const nivelComplejidad = req.query.nivel_complejidad || null;
      const includeAudit = req.query.include_audit === 'true';

      if (!ValidationUtils.isValidId(tipo_evento_id)) {
        return ApiResponse.validation(res, [{ field: 'tipo_evento_id', message: 'ID de tipo de evento inválido' }]);
      }

      if (modalidad) {
        const modalidadesValidas = ['presencial', 'virtual', 'hibrido'];
        if (!modalidadesValidas.includes(modalidad)) {
          return ApiResponse.validation(res, [{ field: 'modalidad', message: 'Modalidad inválida' }]);
        }
      }

      if (nivelComplejidad) {
        const nivelesValidos = ['basico', 'intermedio', 'avanzado', 'experto'];
        if (!nivelesValidos.includes(nivelComplejidad)) {
          return ApiResponse.validation(res, [{ field: 'nivel_complejidad', message: 'Nivel de complejidad inválido' }]);
        }
      }

      const plantillas = await ClasificacionTipoEventoService.getPlantillasDisponibles(
        tipo_evento_id, 
        modalidad, 
        nivelComplejidad, 
        includeAudit
      );

      return ApiResponse.success(res, plantillas, 'Plantillas obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aplicar plantilla a nuevo evento
   */
  static async aplicarPlantilla(req, res, next) {
    try {
      const { plantilla_id } = req.params;
      const datosPersonalizados = req.body;

      if (!ValidationUtils.isValidId(plantilla_id)) {
        return ApiResponse.validation(res, [{ field: 'plantilla_id', message: 'ID de plantilla inválido' }]);
      }

      // Validar datos personalizados si se proporcionan
      if (datosPersonalizados.modalidad) {
        const modalidadesValidas = ['presencial', 'virtual', 'hibrido'];
        if (!modalidadesValidas.includes(datosPersonalizados.modalidad)) {
          return ApiResponse.validation(res, [{ field: 'modalidad', message: 'Modalidad inválida' }]);
        }
      }

      if (datosPersonalizados.capacidad_maxima && datosPersonalizados.capacidad_maxima <= 0) {
        return ApiResponse.validation(res, [{ field: 'capacidad_maxima', message: 'La capacidad máxima debe ser mayor a 0' }]);
      }

      if (datosPersonalizados.precio_entrada && datosPersonalizados.precio_entrada < 0) {
        return ApiResponse.validation(res, [{ field: 'precio_entrada', message: 'El precio no puede ser negativo' }]);
      }

      // Sanitizar datos de texto
      if (datosPersonalizados.nombre_evento) {
        datosPersonalizados.nombre_evento = ValidationUtils.sanitizeString(datosPersonalizados.nombre_evento);
      }
      if (datosPersonalizados.descripcion) {
        datosPersonalizados.descripcion = ValidationUtils.sanitizeString(datosPersonalizados.descripcion);
      }

      const configuracionEvento = await ClasificacionTipoEventoService.aplicarPlantilla(
        plantilla_id, 
        datosPersonalizados
      );

      return ApiResponse.success(res, configuracionEvento, 'Plantilla aplicada exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('inactiva')) {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Duplicar configuración de tipo de evento
   */
  static async duplicarConfiguracion(req, res, next) {
    try {
      const { configuracion_id } = req.params;
      const { nueva_modalidad } = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(configuracion_id)) {
        return ApiResponse.validation(res, [{ field: 'configuracion_id', message: 'ID de configuración inválido' }]);
      }

      if (!nueva_modalidad) {
        return ApiResponse.validation(res, [{ field: 'nueva_modalidad', message: 'La nueva modalidad es requerida' }]);
      }

      const modalidadesValidas = ['presencial', 'virtual', 'hibrido'];
      if (!modalidadesValidas.includes(nueva_modalidad)) {
        return ApiResponse.validation(res, [{ field: 'nueva_modalidad', message: 'La modalidad debe ser: presencial, virtual o híbrido' }]);
      }

      const nuevaConfiguracion = await ClasificacionTipoEventoService.duplicarConfiguracion(
        configuracion_id, 
        nueva_modalidad, 
        userId
      );

      return ApiResponse.success(res, nuevaConfiguracion, 'Configuración duplicada exitosamente', 201);
    } catch (error) {
      if (error.message.includes('no encontrado') || error.message.includes('ya existe')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener información completa de tipo de evento con todas sus configuraciones
   */
  static async getInformacionCompletaTipoEvento(req, res, next) {
    try {
      const { tipo_evento_id } = req.params;
      const includeValidaciones = req.query.include_validaciones === 'true';
      const includePlantillas = req.query.include_plantillas === 'true';

      if (!ValidationUtils.isValidId(tipo_evento_id)) {
        return ApiResponse.validation(res, [{ field: 'tipo_evento_id', message: 'ID de tipo de evento inválido' }]);
      }

      const informacionCompleta = await ClasificacionTipoEventoService.getInformacionCompletaTipoEvento(
        tipo_evento_id, 
        includeValidaciones, 
        includePlantillas
      );

      return ApiResponse.success(res, informacionCompleta, 'Información completa obtenida exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Actualizar configuración de tipo de evento
   */
  static async updateConfiguracion(req, res, next) {
    try {
      const { configuracion_id } = req.params;
      const updateData = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(configuracion_id)) {
        return ApiResponse.validation(res, [{ field: 'configuracion_id', message: 'ID de configuración inválido' }]);
      }

      // Validaciones opcionales para campos que se están actualizando
      if (updateData.modalidad) {
        const modalidadesValidas = ['presencial', 'virtual', 'hibrido'];
        if (!modalidadesValidas.includes(updateData.modalidad)) {
          return ApiResponse.validation(res, [{ field: 'modalidad', message: 'La modalidad debe ser: presencial, virtual o híbrido' }]);
        }
      }

      if (updateData.capacidad_minima && updateData.capacidad_minima <= 0) {
        return ApiResponse.validation(res, [{ field: 'capacidad_minima', message: 'La capacidad mínima debe ser mayor a 0' }]);
      }

      if (updateData.capacidad_maxima && updateData.capacidad_maxima <= 0) {
        return ApiResponse.validation(res, [{ field: 'capacidad_maxima', message: 'La capacidad máxima debe ser mayor a 0' }]);
      }

      if (updateData.precio_base_entrada && updateData.precio_base_entrada < 0) {
        return ApiResponse.validation(res, [{ field: 'precio_base_entrada', message: 'El precio no puede ser negativo' }]);
      }

      const configuracionActualizada = await ClasificacionTipoEventoService.updateConfiguracion(
        configuracion_id, 
        updateData, 
        userId
      );

      return ApiResponse.success(res, configuracionActualizada, 'Configuración actualizada exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Eliminar configuración de tipo de evento
   */
  static async deleteConfiguracion(req, res, next) {
    try {
      const { configuracion_id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(configuracion_id)) {
        return ApiResponse.validation(res, [{ field: 'configuracion_id', message: 'ID de configuración inválido' }]);
      }

      const result = await ClasificacionTipoEventoService.deleteConfiguracion(configuracion_id, userId);

      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener configuraciones activas por modalidad
   */
  static async getConfiguracionesByModalidad(req, res, next) {
    try {
      const { modalidad } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const includeAudit = req.query.include_audit === 'true';

      const modalidadesValidas = ['presencial', 'virtual', 'hibrido'];
      if (!modalidadesValidas.includes(modalidad)) {
        return ApiResponse.validation(res, [{ field: 'modalidad', message: 'Modalidad inválida' }]);
      }

      const configuraciones = await ClasificacionTipoEventoService.getConfiguracionesByModalidad(
        modalidad, 
        page, 
        limit, 
        includeAudit
      );

      return ApiResponse.paginated(
        res,
        configuraciones.rows,
        {
          page,
          limit,
          totalPages: Math.ceil(configuraciones.count / limit),
          totalItems: configuraciones.count
        },
        'Configuraciones obtenidas exitosamente'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de configuraciones por tipo de evento
   */
  static async getEstadisticasConfiguraciones(req, res, next) {
    try {
      const { tipo_evento_id } = req.params;

      if (!ValidationUtils.isValidId(tipo_evento_id)) {
        return ApiResponse.validation(res, [{ field: 'tipo_evento_id', message: 'ID de tipo de evento inválido' }]);
      }

      const estadisticas = await ClasificacionTipoEventoService.getEstadisticasConfiguraciones(tipo_evento_id);

      return ApiResponse.success(res, estadisticas, 'Estadísticas obtenidas exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrado')) {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }
}

module.exports = ClasificacionTipoEventoController;
