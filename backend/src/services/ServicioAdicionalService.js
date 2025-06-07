const { ServicioAdicional, StandServicio, Stand, Evento, Usuario } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de ServicioAdicional - Lógica de negocio
 */
class ServicioAdicionalService {
  
  /**
   * Crear un nuevo servicio adicional
   */
  static async createServicioAdicional(servicioData, userId = null) {
    try {
      const dataToCreate = {
        nombre_servicio: servicioData.nombre_servicio,
        descripcion: servicioData.descripcion || null,
        categoria: servicioData.categoria,
        tipo_precio: servicioData.tipo_precio || 'fijo',
        precio: servicioData.precio || 0.00,
        moneda: servicioData.moneda || 'PEN',
        unidad_medida: servicioData.unidad_medida || null,
        cantidad_minima: servicioData.cantidad_minima || 1,
        cantidad_maxima: servicioData.cantidad_maxima || null,
        requiere_instalacion: servicioData.requiere_instalacion || false,
        tiempo_instalacion_horas: servicioData.tiempo_instalacion_horas || null,
        disponible_tipos_stand: servicioData.disponible_tipos_stand || null,
        restricciones: servicioData.restricciones || null,
        incluye_mantenimiento: servicioData.incluye_mantenimiento || false,
        proveedor_externo: servicioData.proveedor_externo || null,
        contacto_proveedor: servicioData.contacto_proveedor || null,
        estado: servicioData.estado || 'disponible',
        orden_visualizacion: servicioData.orden_visualizacion || null,
        es_popular: servicioData.es_popular || false
      };
      
      const servicio = await AuditService.createWithAudit(ServicioAdicional, dataToCreate, userId);
      
      return servicio;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los servicios adicionales
   */
  static async getAllServiciosAdicionales(includeStats = false, includeAudit = false, includeDeleted = false, filtros = {}) {
    try {
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();

      // Aplicar filtros
      if (filtros.categoria) {
        whereCondition.categoria = filtros.categoria;
      }

      if (filtros.estado) {
        whereCondition.estado = filtros.estado;
      }

      if (filtros.es_popular) {
        whereCondition.es_popular = filtros.es_popular === 'true';
      }

      if (filtros.search) {
        whereCondition[Op.or] = [
          { nombre_servicio: { [Op.like]: `%${filtros.search}%` } },
          { descripcion: { [Op.like]: `%${filtros.search}%` } }
        ];
      }

      const options = {
        where: whereCondition,
        order: [
          ['es_popular', 'DESC'],
          ['orden_visualizacion', 'ASC'],
          ['categoria', 'ASC'],
          ['nombre_servicio', 'ASC']
        ],
        include: []
      };

      if (includeStats) {
        options.include.push({
          model: StandServicio,
          as: 'contrataciones',
          attributes: ['estado_servicio'],
          where: AuditService.getActiveWhereCondition(),
          required: false
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const servicios = await ServicioAdicional.findAll(options);
      return servicios;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener servicio adicional por ID
   */
  static async getServicioAdicionalById(id, includeStats = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        include: []
      };

      if (includeStats) {
        options.include.push({
          model: StandServicio,
          as: 'contrataciones',
          include: [
            {
              model: Stand,
              as: 'stand',
              attributes: ['numero_stand']
            },
            {
              model: Evento,
              as: 'evento',
              attributes: ['nombre_evento']
            }
          ],
          where: AuditService.getActiveWhereCondition(),
          required: false
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      let servicio;
      if (includeDeleted) {
        servicio = await ServicioAdicional.findByPk(id, options);
      } else {
        servicio = await AuditService.findByPkWithAudit(ServicioAdicional, id, options);
      }

      if (!servicio) {
        throw new Error('Servicio adicional no encontrado');
      }

      return servicio;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar servicio adicional
   */
  static async updateServicioAdicional(id, updateData, userId = null) {
    try {
      const servicio = await AuditService.findByPkWithAudit(ServicioAdicional, id);
      
      if (!servicio) {
        throw new Error('Servicio adicional no encontrado');
      }

      await AuditService.updateWithAudit(servicio, updateData, userId);
      
      return await this.getServicioAdicionalById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar servicio adicional (eliminación lógica)
   */
  static async deleteServicioAdicional(id, userId = null) {
    try {
      const servicio = await AuditService.findByPkWithAudit(ServicioAdicional, id);
      
      if (!servicio) {
        throw new Error('Servicio adicional no encontrado');
      }

      // Verificar si hay contrataciones activas
      const contratacionesActivas = await StandServicio.count({
        where: AuditService.combineWhereWithActive({
          id_servicio: id,
          estado_servicio: ['solicitado', 'confirmado', 'instalado', 'activo']
        })
      });

      if (contratacionesActivas > 0) {
        throw new Error(`No se puede eliminar el servicio. Hay ${contratacionesActivas} contrataciones activas`);
      }

      // Eliminación lógica del servicio
      await AuditService.softDelete(servicio, userId);
      
      return { message: 'Servicio adicional eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener servicios por categoría
   */
  static async getServiciosPorCategoria(categoria, includeDeleted = false) {
    try {
      const whereCondition = {
        categoria: categoria
      };

      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
        whereCondition.estado = 'disponible';
      }

      const servicios = await ServicioAdicional.findAll({
        where: whereCondition,
        order: [
          ['es_popular', 'DESC'],
          ['orden_visualizacion', 'ASC'],
          ['nombre_servicio', 'ASC']
        ]
      });

      return servicios;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener servicios populares
   */
  static async getServiciosPopulares(limit = 10) {
    try {
      const servicios = await ServicioAdicional.scope('popular').findAll({
        limit: parseInt(limit),
        order: [['orden_visualizacion', 'ASC'], ['nombre_servicio', 'ASC']]
      });

      return servicios;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Contratar servicio para stand en evento
   */
  static async contratarServicio(contratacionData, userId = null) {
    try {
      const {
        id_stand,
        id_evento,
        id_servicio,
        id_empresa,
        cantidad,
        especificaciones_adicionales,
        fecha_instalacion_programada,
        es_urgente
      } = contratacionData;

      // Verificar que el servicio existe y está disponible
      const servicio = await this.getServicioAdicionalById(id_servicio);
      if (!servicio.isDisponible()) {
        throw new Error('El servicio no está disponible');
      }

      // Verificar que la cantidad es válida
      if (!servicio.esCantidadValida(cantidad)) {
        throw new Error(`Cantidad inválida. Mín: ${servicio.cantidad_minima}, Máx: ${servicio.cantidad_maxima || 'Sin límite'}`);
      }

      // Verificar compatibilidad con tipo de stand si aplica
      if (servicio.disponible_tipos_stand) {
        const StandService = require('./StandService');
        const stand = await StandService.getStandById(id_stand, true);
        
        if (!servicio.esCompatibleConTipoStand(stand.tipoStand.nombre_tipo)) {
          throw new Error(`El servicio no es compatible con stands de tipo ${stand.tipoStand.nombre_tipo}`);
        }
      }

      // Verificar si ya existe contratación del mismo servicio
      const contratacionExistente = await StandServicio.findOne({
        where: AuditService.combineWhereWithActive({
          id_stand,
          id_evento,
          id_servicio,
          estado_servicio: ['solicitado', 'confirmado', 'instalado', 'activo']
        })
      });

      if (contratacionExistente) {
        throw new Error('Este servicio ya está contratado para este stand en este evento');
      }

      // Calcular precios
      const precioUnitario = parseFloat(servicio.precio);
      const precioTotal = servicio.calcularPrecio(cantidad);

      const datosContratacion = {
        id_stand,
        id_evento,
        id_servicio,
        id_empresa: id_empresa || null,
        cantidad: parseInt(cantidad),
        precio_unitario: precioUnitario,
        descuento_aplicado: 0.00,
        precio_total: precioTotal,
        estado_servicio: 'solicitado',
        fecha_solicitud: new Date(),
        fecha_instalacion_programada: fecha_instalacion_programada || null,
        especificaciones_adicionales: especificaciones_adicionales || null,
        requiere_supervision: servicio.requiere_instalacion,
        es_urgente: es_urgente || false
      };

      const contratacion = await AuditService.createWithAudit(StandServicio, datosContratacion, userId);

      return await this.getContratacionServicio(contratacion.id_stand_servicio);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener contratación de servicio por ID
   */
  static async getContratacionServicio(id) {
    try {
      const contratacion = await StandServicio.findOne({
        where: AuditService.combineWhereWithActive({
          id_stand_servicio: id
        }),
        include: [
          {
            model: ServicioAdicional,
            as: 'servicio',
            attributes: ['nombre_servicio', 'categoria', 'unidad_medida']
          },
          {
            model: Stand,
            as: 'stand',
            attributes: ['numero_stand', 'ubicacion']
          },
          {
            model: Evento,
            as: 'evento',
            attributes: ['nombre_evento', 'fecha_inicio', 'fecha_fin']
          },
          {
            model: require('../models').EmpresaExpositora,
            as: 'empresa',
            attributes: ['nombre_empresa', 'email_contacto'],
            required: false
          }
        ]
      });

      if (!contratacion) {
        throw new Error('Contratación de servicio no encontrada');
      }

      return contratacion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar estado de contratación
   */
  static async actualizarEstadoContratacion(id, nuevoEstado, datos = {}, userId = null) {
    try {
      const contratacion = await AuditService.findByPkWithAudit(StandServicio, id);
      
      if (!contratacion) {
        throw new Error('Contratación no encontrada');
      }

      const updateData = {
        estado_servicio: nuevoEstado,
        ...datos
      };

      // Actualizar fechas según el estado
      const ahora = new Date();
      switch (nuevoEstado) {
        case 'confirmado':
          // No se actualiza fecha automáticamente
          break;
        case 'instalado':
          updateData.fecha_instalacion_real = ahora;
          break;
        case 'activo':
          if (!contratacion.fecha_instalacion_real) {
            updateData.fecha_instalacion_real = ahora;
          }
          break;
        case 'finalizado':
          updateData.fecha_retiro_real = ahora;
          break;
      }

      await AuditService.updateWithAudit(contratacion, updateData, userId);
      
      return await this.getContratacionServicio(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener servicios contratados para un stand en evento
   */
  static async getServiciosContratadosStandEvento(standId, eventoId) {
    try {
      const servicios = await StandServicio.findAll({
        where: AuditService.combineWhereWithActive({
          id_stand: standId,
          id_evento: eventoId
        }),
        include: [{
          model: ServicioAdicional,
          as: 'servicio',
          attributes: ['nombre_servicio', 'categoria', 'unidad_medida']
        }],
        order: [['fecha_solicitud', 'ASC']]
      });

      return servicios;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de servicios adicionales
   */
  static async getServiciosStats(includeDeleted = false) {
    try {
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();
      
      const [total, disponibles, populares, eliminados] = await Promise.all([
        ServicioAdicional.count(),
        ServicioAdicional.count({ where: { ...whereCondition, estado: 'disponible' } }),
        ServicioAdicional.count({ where: { ...whereCondition, es_popular: true } }),
        ServicioAdicional.count({ where: AuditService.getDeletedWhereCondition() })
      ]);

      const serviciosPorCategoria = await ServicioAdicional.findAll({
        attributes: [
          'categoria',
          [require('sequelize').fn('COUNT', 'id_servicio'), 'servicios_count'],
          [require('sequelize').fn('AVG', 'precio'), 'precio_promedio']
        ],
        where: whereCondition,
        group: ['categoria'],
        order: [['categoria', 'ASC']],
        raw: true
      });

      const contratacionesPorServicio = await StandServicio.findAll({
        attributes: [
          'id_servicio',
          [require('sequelize').fn('COUNT', 'id_stand_servicio'), 'contrataciones_count'],
          [require('sequelize').fn('SUM', 'precio_total'), 'ingresos_total']
        ],
        include: [{
          model: ServicioAdicional,
          as: 'servicio',
          attributes: ['nombre_servicio', 'categoria'],
          where: whereCondition,
          required: true
        }],
        where: AuditService.getActiveWhereCondition(),
        group: ['id_servicio', 'servicio.nombre_servicio', 'servicio.categoria'],
        order: [[require('sequelize').literal('contrataciones_count'), 'DESC']],
        limit: 10,
        raw: false
      });

      return {
        total,
        disponibles,
        populares,
        eliminados,
        serviciosPorCategoria,
        serviciosMasContratados: contratacionesPorServicio
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restaurar servicio eliminado
   */
  static async restoreServicioAdicional(id) {
    try {
      const servicio = await ServicioAdicional.findByPk(id);
      
      if (!servicio) {
        throw new Error('Servicio adicional no encontrado');
      }

      if (!AuditService.isDeleted(servicio)) {
        throw new Error('El servicio no está eliminado');
      }

      await AuditService.restore(servicio);
      
      return { message: 'Servicio adicional restaurado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener servicios compatibles con tipo de stand
   */
  static async getServiciosCompatibles(tipoStand, categoria = null) {
    try {
      const whereCondition = {
        ...AuditService.getActiveWhereCondition(),
        estado: 'disponible'
      };

      if (categoria) {
        whereCondition.categoria = categoria;
      }

      const servicios = await ServicioAdicional.findAll({
        where: whereCondition,
        order: [
          ['es_popular', 'DESC'],
          ['categoria', 'ASC'],
          ['nombre_servicio', 'ASC']
        ]
      });

      // Filtrar servicios compatibles
      return servicios.filter(servicio => servicio.esCompatibleConTipoStand(tipoStand));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ServicioAdicionalService;
