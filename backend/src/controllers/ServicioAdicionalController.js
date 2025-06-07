const ServicioAdicionalService = require('../services/ServicioAdicionalService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de ServicioAdicional
 */
class ServicioAdicionalController {

  /**
   * Crear nuevo servicio adicional
   */
  static async createServicioAdicional(req, res, next) {
    try {
      const userId = req.user ? req.user.id_usuario : null;
      const servicioData = req.body;

      // Validaciones básicas
      if (!ValidationUtils.isNotEmpty(servicioData.nombre_servicio)) {
        return ApiResponse.validation(res, [{ field: 'nombre_servicio', message: 'El nombre del servicio es requerido' }]);
      }

      if (!ValidationUtils.isValidLength(servicioData.nombre_servicio, 2, 100)) {
        return ApiResponse.validation(res, [{ field: 'nombre_servicio', message: 'El nombre del servicio debe tener entre 2 y 100 caracteres' }]);
      }

      // Validar categoría
      const categoriasValidas = ['electricidad', 'conectividad', 'mobiliario', 'audiovisual', 'limpieza', 'seguridad', 'catering', 'decoracion', 'logistica', 'otros'];
      if (!categoriasValidas.includes(servicioData.categoria)) {
        return ApiResponse.validation(res, [{ field: 'categoria', message: 'Categoría inválida' }]);
      }

      // Validar tipo de precio
      const tiposPrecioValidos = ['fijo', 'por_metro', 'por_dia', 'por_evento', 'por_unidad'];
      if (servicioData.tipo_precio && !tiposPrecioValidos.includes(servicioData.tipo_precio)) {
        return ApiResponse.validation(res, [{ field: 'tipo_precio', message: 'Tipo de precio inválido' }]);
      }

      // Validar precio
      if (servicioData.precio && servicioData.precio < 0) {
        return ApiResponse.validation(res, [{ field: 'precio', message: 'El precio no puede ser negativo' }]);
      }

      // Validar cantidades
      if (servicioData.cantidad_minima && servicioData.cantidad_minima < 1) {
        return ApiResponse.validation(res, [{ field: 'cantidad_minima', message: 'La cantidad mínima debe ser al menos 1' }]);
      }

      if (servicioData.cantidad_maxima && servicioData.cantidad_minima && servicioData.cantidad_maxima < servicioData.cantidad_minima) {
        return ApiResponse.validation(res, [{ field: 'cantidad_maxima', message: 'La cantidad máxima debe ser mayor a la cantidad mínima' }]);
      }

      // Validar tiempo de instalación
      if (servicioData.tiempo_instalacion_horas && servicioData.tiempo_instalacion_horas < 0) {
        return ApiResponse.validation(res, [{ field: 'tiempo_instalacion_horas', message: 'El tiempo de instalación no puede ser negativo' }]);
      }

      // Sanitizar datos
      servicioData.nombre_servicio = ValidationUtils.sanitizeString(servicioData.nombre_servicio);
      if (servicioData.descripcion) {
        servicioData.descripcion = ValidationUtils.sanitizeString(servicioData.descripcion);
      }
      if (servicioData.proveedor_externo) {
        servicioData.proveedor_externo = ValidationUtils.sanitizeString(servicioData.proveedor_externo);
      }

      // Crear servicio
      const nuevoServicio = await ServicioAdicionalService.createServicioAdicional(servicioData, userId);

      return ApiResponse.success(res, nuevoServicio, 'Servicio adicional creado exitosamente', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener todos los servicios adicionales
   */
  static async getAllServiciosAdicionales(req, res, next) {
    try {
      const includeStats = req.query.include_stats === 'true';
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';
      
      const filtros = {
        categoria: req.query.categoria || '',
        estado: req.query.estado || '',
        es_popular: req.query.es_popular || '',
        search: req.query.search || ''
      };

      const servicios = await ServicioAdicionalService.getAllServiciosAdicionales(includeStats, includeAudit, includeDeleted, filtros);

      return ApiResponse.success(res, servicios, 'Servicios adicionales obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener servicio adicional por ID
   */
  static async getServicioAdicionalById(req, res, next) {
    try {
      const { id } = req.params;
      const includeStats = req.query.include_stats === 'true';
      const includeAudit = req.query.include_audit === 'true';
      const includeDeleted = req.query.include_deleted === 'true';

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const servicio = await ServicioAdicionalService.getServicioAdicionalById(id, includeStats, includeAudit, includeDeleted);
      
      return ApiResponse.success(res, servicio, 'Servicio adicional obtenido exitosamente');
    } catch (error) {
      if (error.message === 'Servicio adicional no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Actualizar servicio adicional
   */
  static async updateServicioAdicional(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      // Validaciones opcionales para campos que se están actualizando
      if (updateData.nombre_servicio && !ValidationUtils.isValidLength(updateData.nombre_servicio, 2, 100)) {
        return ApiResponse.validation(res, [{ field: 'nombre_servicio', message: 'El nombre del servicio debe tener entre 2 y 100 caracteres' }]);
      }

      if (updateData.categoria) {
        const categoriasValidas = ['electricidad', 'conectividad', 'mobiliario', 'audiovisual', 'limpieza', 'seguridad', 'catering', 'decoracion', 'logistica', 'otros'];
        if (!categoriasValidas.includes(updateData.categoria)) {
          return ApiResponse.validation(res, [{ field: 'categoria', message: 'Categoría inválida' }]);
        }
      }

      if (updateData.tipo_precio) {
        const tiposPrecioValidos = ['fijo', 'por_metro', 'por_dia', 'por_evento', 'por_unidad'];
        if (!tiposPrecioValidos.includes(updateData.tipo_precio)) {
          return ApiResponse.validation(res, [{ field: 'tipo_precio', message: 'Tipo de precio inválido' }]);
        }
      }

      if (updateData.precio && updateData.precio < 0) {
        return ApiResponse.validation(res, [{ field: 'precio', message: 'El precio no puede ser negativo' }]);
      }

      if (updateData.cantidad_minima && updateData.cantidad_minima < 1) {
        return ApiResponse.validation(res, [{ field: 'cantidad_minima', message: 'La cantidad mínima debe ser al menos 1' }]);
      }

      // Sanitizar strings
      if (updateData.nombre_servicio) {
        updateData.nombre_servicio = ValidationUtils.sanitizeString(updateData.nombre_servicio);
      }
      if (updateData.descripcion) {
        updateData.descripcion = ValidationUtils.sanitizeString(updateData.descripcion);
      }
      if (updateData.proveedor_externo) {
        updateData.proveedor_externo = ValidationUtils.sanitizeString(updateData.proveedor_externo);
      }

      const servicioActualizado = await ServicioAdicionalService.updateServicioAdicional(id, updateData, userId);
      
      return ApiResponse.success(res, servicioActualizado, 'Servicio adicional actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Servicio adicional no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Eliminar servicio adicional
   */
  static async deleteServicioAdicional(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await ServicioAdicionalService.deleteServicioAdicional(id, userId);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Servicio adicional no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message.includes('No se puede eliminar')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener servicios por categoría
   */
  static async getServiciosPorCategoria(req, res, next) {
    try {
      const { categoria } = req.params;

      const categoriasValidas = ['electricidad', 'conectividad', 'mobiliario', 'audiovisual', 'limpieza', 'seguridad', 'catering', 'decoracion', 'logistica', 'otros'];
      if (!categoriasValidas.includes(categoria)) {
        return ApiResponse.validation(res, [{ field: 'categoria', message: 'Categoría inválida' }]);
      }

      const servicios = await ServicioAdicionalService.getServiciosPorCategoria(categoria);
      
      return ApiResponse.success(res, servicios, `Servicios de categoría ${categoria} obtenidos exitosamente`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener servicios populares
   */
  static async getServiciosPopulares(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const servicios = await ServicioAdicionalService.getServiciosPopulares(limit);
      
      return ApiResponse.success(res, servicios, 'Servicios populares obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Contratar servicio para stand en evento
   */
  static async contratarServicio(req, res, next) {
    try {
      const { id } = req.params; // ID del servicio
      const {
        id_stand,
        id_evento,
        id_empresa,
        cantidad,
        especificaciones_adicionales,
        fecha_instalacion_programada,
        es_urgente
      } = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID de servicio inválido' }]);
      }

      if (!ValidationUtils.isValidId(id_stand)) {
        return ApiResponse.validation(res, [{ field: 'id_stand', message: 'ID de stand inválido' }]);
      }

      if (!ValidationUtils.isValidId(id_evento)) {
        return ApiResponse.validation(res, [{ field: 'id_evento', message: 'ID de evento inválido' }]);
      }

      if (!cantidad || cantidad < 1) {
        return ApiResponse.validation(res, [{ field: 'cantidad', message: 'La cantidad debe ser al menos 1' }]);
      }

      if (fecha_instalacion_programada && !ValidationUtils.isValidDate(fecha_instalacion_programada)) {
        return ApiResponse.validation(res, [{ field: 'fecha_instalacion_programada', message: 'Fecha de instalación inválida' }]);
      }

      const contratacionData = {
        id_stand,
        id_evento,
        id_servicio: id,
        id_empresa: id_empresa || null,
        cantidad: parseInt(cantidad),
        especificaciones_adicionales: especificaciones_adicionales || null,
        fecha_instalacion_programada: fecha_instalacion_programada || null,
        es_urgente: es_urgente || false
      };

      const contratacion = await ServicioAdicionalService.contratarServicio(contratacionData, userId);
      
      return ApiResponse.success(res, contratacion, 'Servicio contratado exitosamente', 201);
    } catch (error) {
      if (error.message.includes('no está disponible') || 
          error.message.includes('inválida') || 
          error.message.includes('compatible') ||
          error.message.includes('ya está contratado')) {
        return ApiResponse.error(res, error.message, 409);
      }
      next(error);
    }
  }

  /**
   * Obtener contratación de servicio por ID
   */
  static async getContratacionServicio(req, res, next) {
    try {
      const { id } = req.params; // ID de la contratación

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const contratacion = await ServicioAdicionalService.getContratacionServicio(id);
      
      return ApiResponse.success(res, contratacion, 'Contratación obtenida exitosamente');
    } catch (error) {
      if (error.message === 'Contratación de servicio no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Actualizar estado de contratación
   */
  static async actualizarEstadoContratacion(req, res, next) {
    try {
      const { id } = req.params; // ID de la contratación
      const { estado_servicio, observaciones, fecha_instalacion_real, fecha_retiro_real } = req.body;
      const userId = req.user ? req.user.id_usuario : null;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const estadosValidos = ['solicitado', 'confirmado', 'instalado', 'activo', 'finalizado', 'cancelado'];
      if (!estadosValidos.includes(estado_servicio)) {
        return ApiResponse.validation(res, [{ field: 'estado_servicio', message: 'Estado de servicio inválido' }]);
      }

      const datos = {};
      if (observaciones) datos.observaciones = observaciones;
      if (fecha_instalacion_real) datos.fecha_instalacion_real = fecha_instalacion_real;
      if (fecha_retiro_real) datos.fecha_retiro_real = fecha_retiro_real;

      const contratacion = await ServicioAdicionalService.actualizarEstadoContratacion(id, estado_servicio, datos, userId);
      
      return ApiResponse.success(res, contratacion, 'Estado de contratación actualizado exitosamente');
    } catch (error) {
      if (error.message === 'Contratación no encontrada') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener servicios contratados para stand en evento
   */
  static async getServiciosContratadosStandEvento(req, res, next) {
    try {
      const { stand_id, evento_id } = req.params;

      if (!ValidationUtils.isValidId(stand_id)) {
        return ApiResponse.validation(res, [{ field: 'stand_id', message: 'ID de stand inválido' }]);
      }

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      const servicios = await ServicioAdicionalService.getServiciosContratadosStandEvento(stand_id, evento_id);
      
      return ApiResponse.success(res, servicios, 'Servicios contratados obtenidos exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener estadísticas de servicios adicionales
   */
  static async getServiciosStats(req, res, next) {
    try {
      const includeDeleted = req.query.include_deleted === 'true';
      const stats = await ServicioAdicionalService.getServiciosStats(includeDeleted);
      
      return ApiResponse.success(res, stats, 'Estadísticas de servicios obtenidas exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restaurar servicio eliminado
   */
  static async restoreServicioAdicional(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      const result = await ServicioAdicionalService.restoreServicioAdicional(id);
      
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      if (error.message === 'Servicio adicional no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      if (error.message === 'El servicio no está eliminado') {
        return ApiResponse.error(res, error.message, 400);
      }
      next(error);
    }
  }

  /**
   * Obtener servicios compatibles con tipo de stand
   */
  static async getServiciosCompatibles(req, res, next) {
    try {
      const { tipo_stand } = req.params;
      const { categoria } = req.query;

      if (!ValidationUtils.isNotEmpty(tipo_stand)) {
        return ApiResponse.validation(res, [{ field: 'tipo_stand', message: 'Tipo de stand requerido' }]);
      }

      const servicios = await ServicioAdicionalService.getServiciosCompatibles(tipo_stand, categoria);
      
      return ApiResponse.success(res, servicios, `Servicios compatibles con ${tipo_stand} obtenidos exitosamente`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calcular precio de servicio
   */
  static async calcularPrecioServicio(req, res, next) {
    try {
      const { id } = req.params;
      const { cantidad, area, dias } = req.query;

      if (!ValidationUtils.isValidId(id)) {
        return ApiResponse.validation(res, [{ field: 'id', message: 'ID inválido' }]);
      }

      if (!cantidad || cantidad < 1) {
        return ApiResponse.validation(res, [{ field: 'cantidad', message: 'Cantidad válida requerida' }]);
      }

      const servicio = await ServicioAdicionalService.getServicioAdicionalById(id);
      
      try {
        const precioCalculado = servicio.calcularPrecio(
          parseInt(cantidad),
          area ? parseFloat(area) : null,
          dias ? parseInt(dias) : null
        );

        return ApiResponse.success(res, {
          precio_total: precioCalculado,
          precio_unitario: servicio.precio,
          cantidad: parseInt(cantidad),
          tipo_precio: servicio.tipo_precio,
          moneda: servicio.moneda,
          servicio: servicio.nombre_servicio
        }, 'Precio calculado exitosamente');
      } catch (calcError) {
        return ApiResponse.error(res, calcError.message, 400);
      }
    } catch (error) {
      if (error.message === 'Servicio adicional no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }
}

module.exports = ServicioAdicionalController;
