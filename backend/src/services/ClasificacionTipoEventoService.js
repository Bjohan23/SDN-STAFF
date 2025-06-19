const { TipoEvento, ConfiguracionTipoEvento, PlantillaEvento, ValidacionTipoEvento, Evento, Usuario } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de ClasificacionTipoEvento - Lógica de negocio avanzada
 */
class ClasificacionTipoEventoService {
  
  /**
   * Crear configuración completa para un tipo de evento
   */
  static async createConfiguracionCompleta(tipoEventoId, configuracionData, userId = null) {
    try {
      // Verificar que el tipo de evento existe
      const tipoEvento = await TipoEvento.findByPk(tipoEventoId);
      if (!tipoEvento || tipoEvento.isDeleted()) {
        throw new Error('Tipo de evento no encontrado');
      }

      // Crear configuración principal
      const configuracion = await AuditService.createWithAudit(
        ConfiguracionTipoEvento, 
        {
          id_tipo_evento: tipoEventoId,
          ...configuracionData
        }, 
        userId
      );

      return configuracion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener configuraciones por tipo de evento
   */
  static async getConfiguracionesByTipo(tipoEventoId, includeValidaciones = false, includeAudit = false) {
    try {
      const options = {
        where: {
          id_tipo_evento: tipoEventoId,
          ...AuditService.getActiveWhereCondition()
        },
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['nombre_tipo', 'descripcion']
        }],
        order: [['modalidad', 'ASC'], ['orden_visualizacion', 'ASC']]
      };

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const configuraciones = await ConfiguracionTipoEvento.findAll(options);
      
      // Si se requieren validaciones, hacer consulta separada
      if (includeValidaciones) {
        const validaciones = await ValidacionTipoEvento.findAll({
          where: {
            id_tipo_evento: tipoEventoId,
            ...AuditService.getActiveWhereCondition()
          },
          order: [['orden_ejecucion', 'ASC']]
        });
        
        // Agregar validaciones a cada configuración (para compatibilidad)
        return configuraciones.map(config => {
          const configData = config.toJSON();
          configData.validaciones = validaciones;
          return configData;
        });
      }
      
      return configuraciones;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener configuraciones por modalidad (con paginación)
   */
  static async getConfiguracionesByModalidad(modalidad, page = 1, limit = 10, includeAudit = false) {
    try {
      const offset = (page - 1) * limit;
      
      const options = {
        where: {
          modalidad: modalidad,
          ...AuditService.getActiveWhereCondition()
        },
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['id_tipo_evento', 'nombre_tipo', 'descripcion']
        }],
        order: [['id_tipo_evento', 'ASC'], ['orden_visualizacion', 'ASC']],
        limit: limit,
        offset: offset
      };

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const result = await ConfiguracionTipoEvento.findAndCountAll(options);
      
      return {
        rows: result.rows,
        count: result.count
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener configuración específica por modalidad
   */
  static async getConfiguracionByModalidad(tipoEventoId, modalidad, includeValidaciones = false, includeAudit = false) {
    try {
      const options = {
        where: {
          id_tipo_evento: tipoEventoId,
          modalidad: modalidad,
          ...AuditService.getActiveWhereCondition()
        },
        include: [{
          model: TipoEvento,
          as: 'tipoEvento'
        }]
      };

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const configuracion = await ConfiguracionTipoEvento.findOne(options);
      
      if (!configuracion) {
        return null;
      }
      
      // Si se requieren validaciones, hacer consulta separada
      if (includeValidaciones) {
        const validaciones = await ValidacionTipoEvento.findAll({
          where: {
            id_tipo_evento: tipoEventoId,
            ...AuditService.getActiveWhereCondition()
          },
          order: [['orden_ejecucion', 'ASC']]
        });
        
        // Agregar validaciones a la configuración
        const configData = configuracion.toJSON();
        configData.validaciones = validaciones;
        return configData;
      }

      return configuracion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de configuraciones para un tipo de evento
   */
  static async getEstadisticasConfiguraciones(tipoEventoId) {
    try {
      // Verificar que el tipo de evento existe
      const tipoEvento = await TipoEvento.findByPk(tipoEventoId);
      if (!tipoEvento || tipoEvento.isDeleted()) {
        throw new Error('Tipo de evento no encontrado');
      }

      // Contar configuraciones por modalidad
      const configuracionesPorModalidad = await ConfiguracionTipoEvento.findAll({
        attributes: [
          'modalidad',
          [require('sequelize').fn('COUNT', 'id_configuracion'), 'count']
        ],
        where: {
          id_tipo_evento: tipoEventoId,
          ...AuditService.getActiveWhereCondition()
        },
        group: ['modalidad'],
        raw: true
      });

      // Contar configuraciones totales y activas
      const [totalConfiguraciones, configuracionesActivas] = await Promise.all([
        ConfiguracionTipoEvento.count({
          where: {
            id_tipo_evento: tipoEventoId,
            ...AuditService.getActiveWhereCondition()
          }
        }),
        ConfiguracionTipoEvento.count({
          where: {
            id_tipo_evento: tipoEventoId,
            estado: 'activo',
            ...AuditService.getActiveWhereCondition()
          }
        })
      ]);

      // Contar plantillas disponibles
      const plantillasDisponibles = await PlantillaEvento.count({
        where: {
          id_tipo_evento: tipoEventoId,
          estado: 'activa',
          ...AuditService.getActiveWhereCondition()
        }
      });

      // Contar validaciones configuradas
      const validacionesConfiguradas = await ValidacionTipoEvento.count({
        where: {
          id_tipo_evento: tipoEventoId,
          estado: 'activa',
          ...AuditService.getActiveWhereCondition()
        }
      });

      // Convertir array a objeto para modalidades
      const porModalidad = {};
      configuracionesPorModalidad.forEach(item => {
        porModalidad[item.modalidad] = parseInt(item.count);
      });

      return {
        tipo_evento: {
          id_tipo_evento: tipoEvento.id_tipo_evento,
          nombre_tipo: tipoEvento.nombre_tipo
        },
        total_configuraciones: totalConfiguraciones,
        configuraciones_activas: configuracionesActivas,
        por_modalidad: porModalidad,
        plantillas_disponibles: plantillasDisponibles,
        validaciones_configuradas: validacionesConfiguradas,
        cobertura_modalidades: {
          presencial: porModalidad.presencial > 0,
          virtual: porModalidad.virtual > 0,
          hibrido: porModalidad.hibrido > 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener información completa de tipo de evento con todas sus configuraciones
   */
  static async getInformacionCompletaTipoEvento(tipoEventoId, includeValidaciones = false, includePlantillas = false) {
    try {
      const tipoEvento = await TipoEvento.findOne({
        where: {
          id_tipo_evento: tipoEventoId,
          ...AuditService.getActiveWhereCondition()
        }
      });

      if (!tipoEvento) {
        throw new Error('Tipo de evento no encontrado');
      }

      // Obtener todas las configuraciones
      const configuraciones = await this.getConfiguracionesByTipo(tipoEventoId, includeValidaciones, false);

      const resultado = {
        tipo_evento: tipoEvento,
        configuraciones: configuraciones
      };

      if (includeValidaciones) {
        resultado.validaciones = await ValidacionTipoEvento.findAll({
          where: {
            id_tipo_evento: tipoEventoId,
            ...AuditService.getActiveWhereCondition()
          },
          order: [['momento_validacion', 'ASC'], ['orden_ejecucion', 'ASC']]
        });
      }

      if (includePlantillas) {
        resultado.plantillas = await this.getPlantillasDisponibles(tipoEventoId);
      }

      return resultado;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validar configuración de evento
   */
  static async validarConfiguracionEvento(tipoEventoId, datosEvento) {
    try {
      const modalidad = datosEvento.modalidad;
      if (!modalidad) {
        throw new Error('La modalidad es requerida para la validación');
      }

      return await this.validarDatosEvento(tipoEventoId, modalidad, datosEvento, 'creacion');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validar datos de evento según su tipo y modalidad
   */
  static async validarDatosEvento(tipoEventoId, modalidad, datosEvento, momento = 'creacion') {
    try {
      const resultados = {
        valido: true,
        errores: [],
        advertencias: [],
        configuracion_aplicada: null
      };

      // Obtener configuración del tipo
      const configuracion = await this.getConfiguracionByModalidad(tipoEventoId, modalidad, false, false);
      if (!configuracion) {
        resultados.valido = false;
        resultados.errores.push({
          campo: 'modalidad',
          mensaje: `No existe configuración para modalidad ${modalidad} en este tipo de evento`
        });
        return resultados;
      }

      resultados.configuracion_aplicada = configuracion;

      // Validar con la configuración
      let erroresConfiguracion = [];
      if (configuracion && typeof configuracion.validarConfiguracionEvento === 'function') {
        erroresConfiguracion = configuracion.validarConfiguracionEvento(datosEvento);
      } else if (configuracion && configuracion.dataValues) {
        // Si es un objeto plano de la consulta con validaciones, crear instancia temporal
        const configTemp = await ConfiguracionTipoEvento.findByPk(configuracion.id_configuracion || configuracion.id);
        if (configTemp) {
          erroresConfiguracion = configTemp.validarConfiguracionEvento(datosEvento);
        }
      }
      resultados.errores.push(...erroresConfiguracion);

      // Obtener y ejecutar validaciones específicas
      const validaciones = await ValidacionTipoEvento.findAll({
        where: {
          id_tipo_evento: tipoEventoId,
          estado: 'activa',
          ...AuditService.getActiveWhereCondition()
        },
        order: [['orden_ejecucion', 'ASC']]
      });

      for (const validacion of validaciones) {
        if (!validacion.applicaAlMomento(momento)) continue;

        const valorCampo = this.extraerValorCampo(datosEvento, validacion.campo_objetivo);
        const resultadoValidacion = validacion.ejecutarValidacion(valorCampo, datosEvento);

        if (!resultadoValidacion.valido) {
          if (validacion.es_critica) {
            resultados.errores.push({
              campo: validacion.campo_objetivo,
              mensaje: resultadoValidacion.mensaje,
              validacion: validacion.nombre_validacion,
              critica: true
            });
          } else if (validacion.es_advertencia) {
            resultados.advertencias.push({
              campo: validacion.campo_objetivo,
              mensaje: resultadoValidacion.mensaje,
              validacion: validacion.nombre_validacion
            });
          }
        }
      }

      resultados.valido = resultados.errores.length === 0;
      return resultados;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener plantillas disponibles para un tipo de evento
   */
  static async getPlantillasDisponibles(tipoEventoId, modalidad = null, nivelComplejidad = null, includeAudit = false) {
    try {
      const whereCondition = {
        id_tipo_evento: tipoEventoId,
        estado: 'activa',
        ...AuditService.getActiveWhereCondition()
      };

      if (modalidad) {
        whereCondition.modalidad_predefinida = modalidad;
      }

      if (nivelComplejidad) {
        whereCondition.nivel_complejidad = nivelComplejidad;
      }

      const options = {
        where: whereCondition,
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['nombre_tipo', 'descripcion']
        }],
        order: [
          ['es_plantilla_base', 'DESC'],
          ['popularidad', 'DESC'],
          ['calificacion_promedio', 'DESC'],
          ['nombre_plantilla', 'ASC']
        ]
      };

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const plantillas = await PlantillaEvento.findAll(options);
      return plantillas;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Aplicar plantilla a nuevo evento
   */
  static async aplicarPlantilla(plantillaId, datosPersonalizados = {}) {
    try {
      const plantilla = await PlantillaEvento.findOne({
        where: {
          id_plantilla: plantillaId,
          ...AuditService.getActiveWhereCondition()
        },
        include: [{
          model: TipoEvento,
          as: 'tipoEvento'
        }]
      });

      if (!plantilla || !plantilla.isActive()) {
        throw new Error('Plantilla no encontrada o inactiva');
      }

      // Validar personalización
      const erroresPersonalizacion = plantilla.validarPersonalizacion(datosPersonalizados);
      if (erroresPersonalizacion.length > 0) {
        throw new Error(`Errores de personalización: ${erroresPersonalizacion.map(e => e.mensaje).join(', ')}`);
      }

      // Generar configuración del evento
      const configuracionEvento = plantilla.generarConfiguracionEvento(datosPersonalizados);

      // Incrementar popularidad
      await plantilla.incrementarPopularidad();

      return {
        configuracion_evento: configuracionEvento,
        plantilla_aplicada: plantilla,
        tareas_recomendadas: plantilla.obtenerTareasRecomendadas(90), // 90 días de anticipación
        personalizaciones_aplicadas: datosPersonalizados
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear plantilla personalizada
   */
  static async createPlantillaPersonalizada(plantillaData, userId = null) {
    try {
      // Validar que el tipo de evento existe
      const tipoEvento = await TipoEvento.findByPk(plantillaData.id_tipo_evento);
      if (!tipoEvento || tipoEvento.isDeleted()) {
        throw new Error('Tipo de evento no encontrado');
      }

      // Verificar unicidad del nombre
      const plantillaExistente = await PlantillaEvento.findOne({
        where: {
          nombre_plantilla: plantillaData.nombre_plantilla,
          id_tipo_evento: plantillaData.id_tipo_evento,
          ...AuditService.getActiveWhereCondition()
        }
      });

      if (plantillaExistente) {
        throw new Error('Ya existe una plantilla con ese nombre para este tipo de evento');
      }

      const plantilla = await AuditService.createWithAudit(PlantillaEvento, plantillaData, userId);
      return plantilla;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener modalidades disponibles para un tipo de evento
   */
  static async getModalidadesDisponibles(tipoEventoId) {
    try {
      const configuraciones = await ConfiguracionTipoEvento.findAll({
        where: {
          id_tipo_evento: tipoEventoId,
          estado: 'activo',
          ...AuditService.getActiveWhereCondition()
        },
        attributes: ['modalidad', 'permite_presencial', 'permite_virtual', 'permite_hibrido'],
        order: [['modalidad', 'ASC']]
      });

      const modalidadesDisponibles = [];
      
      for (const config of configuraciones) {
        const modalidades = config.getModalidadesPermitidas();
        modalidadesDisponibles.push({
          modalidad_base: config.modalidad,
          modalidades_permitidas: modalidades,
          configuracion_id: config.id_configuracion
        });
      }

      return modalidadesDisponibles;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de tipos de evento
   */
  static async getEstadisticasTiposEvento() {
    try {
      // Estadísticas generales
      const [totalTipos, configuracionesTotales, plantillasTotales, validacionesTotales] = await Promise.all([
        TipoEvento.count({ where: AuditService.getActiveWhereCondition() }),
        ConfiguracionTipoEvento.count({ where: AuditService.getActiveWhereCondition() }),
        PlantillaEvento.count({ where: AuditService.getActiveWhereCondition() }),
        ValidacionTipoEvento.count({ where: AuditService.getActiveWhereCondition() })
      ]);

      // Tipos con más eventos
      const tiposMasUsados = await TipoEvento.findAll({
        attributes: [
          'id_tipo_evento',
          'nombre_tipo',
          [require('sequelize').fn('COUNT', require('sequelize').col('eventos.id_evento')), 'eventos_count']
        ],
        include: [{
          model: Evento,
          as: 'eventos',
          attributes: [],
          where: AuditService.getActiveWhereCondition(),
          required: false
        }],
        where: AuditService.getActiveWhereCondition(),
        group: ['id_tipo_evento', 'nombre_tipo'],
        order: [[require('sequelize').literal('eventos_count'), 'DESC']],
        limit: 5,
        raw: false
      });

      // Plantillas más populares
      const plantillasMasPopulares = await PlantillaEvento.findAll({
        attributes: ['nombre_plantilla', 'popularidad', 'calificacion_promedio'],
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['nombre_tipo']
        }],
        where: {
          ...AuditService.getActiveWhereCondition(),
          estado: 'activa'
        },
        order: [['popularidad', 'DESC']],
        limit: 5
      });

      // Modalidades más configuradas
      const modalidadesPorTipo = await ConfiguracionTipoEvento.findAll({
        attributes: [
          'modalidad',
          [require('sequelize').fn('COUNT', 'id_configuracion'), 'configuraciones_count']
        ],
        where: AuditService.getActiveWhereCondition(),
        group: ['modalidad'],
        order: [[require('sequelize').literal('configuraciones_count'), 'DESC']],
        raw: true
      });

      return {
        resumen: {
          total_tipos: totalTipos,
          configuraciones_totales: configuracionesTotales,
          plantillas_totales: plantillasTotales,
          validaciones_totales: validacionesTotales
        },
        tipos_mas_usados: tiposMasUsados,
        plantillas_mas_populares: plantillasMasPopulares,
        modalidades_por_tipo: modalidadesPorTipo
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Crear validación personalizada para tipo de evento
   */
  static async createValidacionPersonalizada(validacionData, userId = null) {
    try {
      // Verificar que el tipo de evento existe
      const tipoEvento = await TipoEvento.findByPk(validacionData.id_tipo_evento);
      if (!tipoEvento || tipoEvento.isDeleted()) {
        throw new Error('Tipo de evento no encontrado');
      }

      const validacion = await AuditService.createWithAudit(ValidacionTipoEvento, validacionData, userId);
      return validacion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener configuración completa para tipo de evento
   */
  static async getConfiguracionCompleta(tipoEventoId, includeValidaciones = true, includePlantillas = true) {
    try {
      const tipoEvento = await TipoEvento.findOne({
        where: {
          id_tipo_evento: tipoEventoId,
          ...AuditService.getActiveWhereCondition()
        },
        include: [
          {
            model: ConfiguracionTipoEvento,
            as: 'configuraciones',
            where: AuditService.getActiveWhereCondition(),
            required: false,
            order: [['modalidad', 'ASC']]
          }
        ]
      });

      if (!tipoEvento) {
        throw new Error('Tipo de evento no encontrado');
      }

      const resultado = {
        tipo_evento: tipoEvento,
        configuraciones: tipoEvento.configuraciones || []
      };

      if (includeValidaciones) {
        resultado.validaciones = await ValidacionTipoEvento.findAll({
          where: {
            id_tipo_evento: tipoEventoId,
            ...AuditService.getActiveWhereCondition()
          },
          order: [['momento_validacion', 'ASC'], ['orden_ejecucion', 'ASC']]
        });
      }

      if (includePlantillas) {
        resultado.plantillas = await this.getPlantillasDisponibles(tipoEventoId);
      }

      return resultado;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Duplicar configuración de tipo de evento
   */
  static async duplicarConfiguracion(configuracionId, nuevaModalidad, userId = null) {
    try {
      const configuracionOriginal = await ConfiguracionTipoEvento.findByPk(configuracionId);
      if (!configuracionOriginal) {
        throw new Error('Configuración no encontrada');
      }

      // Verificar que no existe configuración para esa modalidad
      const existeConfiguracion = await ConfiguracionTipoEvento.findOne({
        where: {
          id_tipo_evento: configuracionOriginal.id_tipo_evento,
          modalidad: nuevaModalidad,
          ...AuditService.getActiveWhereCondition()
        }
      });

      if (existeConfiguracion) {
        throw new Error(`Ya existe configuración para modalidad ${nuevaModalidad}`);
      }

      // Crear copia
      const datosNuevaConfiguracion = {
        ...configuracionOriginal.dataValues,
        modalidad: nuevaModalidad
      };

      // Remover campos que no deben copiarse
      delete datosNuevaConfiguracion.id_configuracion;
      delete datosNuevaConfiguracion.created_at;
      delete datosNuevaConfiguracion.updated_at;
      delete datosNuevaConfiguracion.deleted_at;
      delete datosNuevaConfiguracion.created_by;
      delete datosNuevaConfiguracion.updated_by;
      delete datosNuevaConfiguracion.deleted_by;

      const nuevaConfiguracion = await AuditService.createWithAudit(
        ConfiguracionTipoEvento, 
        datosNuevaConfiguracion, 
        userId
      );

      return nuevaConfiguracion;
    } catch (error) {
      throw error;
    }
  }

  // Métodos auxiliares
  static extraerValorCampo(objeto, rutaCampo) {
    const rutas = rutaCampo.split('.');
    let valor = objeto;
    
    for (const ruta of rutas) {
      if (valor && typeof valor === 'object' && ruta in valor) {
        valor = valor[ruta];
      } else {
        return undefined;
      }
    }
    
    return valor;
  }

  /**
   * Actualizar configuración de tipo de evento
   */
  static async updateConfiguracion(configuracionId, updateData, userId = null) {
    try {
      const configuracion = await AuditService.findByPkWithAudit(ConfiguracionTipoEvento, configuracionId);
      
      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      await AuditService.updateWithAudit(configuracion, updateData, userId);
      
      return await ConfiguracionTipoEvento.findByPk(configuracionId, {
        include: [{
          model: TipoEvento,
          as: 'tipoEvento'
        }]
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar configuración de tipo de evento
   */
  static async deleteConfiguracion(configuracionId, userId = null) {
    try {
      const configuracion = await AuditService.findByPkWithAudit(ConfiguracionTipoEvento, configuracionId);
      
      if (!configuracion) {
        throw new Error('Configuración no encontrada');
      }

      // Verificar si hay eventos usando esta configuración
      const eventosUsandoTipo = await Evento.count({
        where: {
          id_tipo_evento: configuracion.id_tipo_evento,
          modalidad: configuracion.modalidad,
          ...AuditService.getActiveWhereCondition()
        }
      });

      if (eventosUsandoTipo > 0) {
        throw new Error(`No se puede eliminar la configuración. Hay ${eventosUsandoTipo} eventos usando esta configuración`);
      }

      await AuditService.softDelete(configuracion, userId);
      
      return { message: 'Configuración eliminada correctamente' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ClasificacionTipoEventoService;
