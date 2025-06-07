const { Evento, TipoEvento, Usuario } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de Evento - Lógica de negocio
 */
class EventoService {
  
  /**
   * Crear un nuevo evento
   */
  static async createEvento(eventoData, userId = null) {
    try {
      // Validar que el tipo de evento existe
      const tipoEvento = await TipoEvento.findByPk(eventoData.id_tipo_evento);
      if (!tipoEvento) {
        throw new Error('Tipo de evento no encontrado');
      }

      // Validar fechas
      if (new Date(eventoData.fecha_fin) <= new Date(eventoData.fecha_inicio)) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }

      // Generar URL amigable si no se proporciona
      if (!eventoData.url_amigable && eventoData.nombre_evento) {
        eventoData.url_amigable = this.generateUrlAmigable(eventoData.nombre_evento);
      }

      // Validar configuración específica según tipo
      if (eventoData.configuracion_especifica) {
        await this.validateConfiguracionByTipo(tipoEvento.nombre_tipo, eventoData);
      }

      const dataToCreate = {
        nombre_evento: eventoData.nombre_evento,
        descripcion: eventoData.descripcion || null,
        fecha_inicio: eventoData.fecha_inicio,
        fecha_fin: eventoData.fecha_fin,
        ubicacion: eventoData.ubicacion || null,
        url_virtual: eventoData.url_virtual || null,
        id_tipo_evento: eventoData.id_tipo_evento,
        estado: eventoData.estado || 'borrador',
        imagen_logo: eventoData.imagen_logo || null,
        configuracion_especifica: eventoData.configuracion_especifica || null,
        url_amigable: eventoData.url_amigable || null,
        capacidad_maxima: eventoData.capacidad_maxima || null,
        precio_entrada: eventoData.precio_entrada || 0.00,
        moneda: eventoData.moneda || 'PEN',
        requiere_aprobacion: eventoData.requiere_aprobacion || false,
        fecha_limite_registro: eventoData.fecha_limite_registro || null
      };
      
      const evento = await AuditService.createWithAudit(Evento, dataToCreate, userId);
      
      // Retornar evento con relaciones
      return await this.getEventoById(evento.id_evento);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los eventos activos
   */
  static async getAllEventos(page = 1, limit = 10, filters = {}, includeAudit = false, includeDeleted = false) {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();

      // Aplicar filtros
      if (filters.search) {
        whereCondition[Op.or] = [
          { nombre_evento: { [Op.like]: `%${filters.search}%` } },
          { descripcion: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      if (filters.estado) {
        whereCondition.estado = filters.estado;
      }

      if (filters.tipo_evento) {
        whereCondition.id_tipo_evento = filters.tipo_evento;
      }

      if (filters.fecha_desde) {
        whereCondition.fecha_inicio = { [Op.gte]: filters.fecha_desde };
      }

      if (filters.fecha_hasta) {
        whereCondition.fecha_fin = { [Op.lte]: filters.fecha_hasta };
      }

      const options = {
        where: whereCondition,
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['id_tipo_evento', 'nombre_tipo', 'descripcion']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_inicio', 'DESC']],
        distinct: true
      };

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const { count, rows } = await Evento.findAndCountAll(options);

      return {
        eventos: rows,
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
   * Obtener evento por ID
   */
  static async getEventoById(id, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['id_tipo_evento', 'nombre_tipo', 'descripcion', 'configuracion_especifica']
        }]
      };

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      let evento;
      if (includeDeleted) {
        evento = await Evento.findByPk(id, options);
      } else {
        evento = await AuditService.findByPkWithAudit(Evento, id, options);
      }

      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      return evento;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener evento por URL amigable
   */
  static async getEventoByUrlAmigable(urlAmigable, includeDeleted = false) {
    try {
      const whereCondition = {
        url_amigable: urlAmigable
      };

      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const evento = await Evento.findOne({
        where: whereCondition,
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['id_tipo_evento', 'nombre_tipo', 'descripcion']
        }]
      });

      return evento;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar evento
   */
  static async updateEvento(id, updateData, userId = null) {
    try {
      const evento = await AuditService.findByPkWithAudit(Evento, id);
      
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      // Validar fechas si se están actualizando
      if (updateData.fecha_inicio || updateData.fecha_fin) {
        const fechaInicio = updateData.fecha_inicio || evento.fecha_inicio;
        const fechaFin = updateData.fecha_fin || evento.fecha_fin;
        
        if (new Date(fechaFin) <= new Date(fechaInicio)) {
          throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
        }
      }

      // Validar tipo de evento si se está cambiando
      if (updateData.id_tipo_evento) {
        const tipoEvento = await TipoEvento.findByPk(updateData.id_tipo_evento);
        if (!tipoEvento) {
          throw new Error('Tipo de evento no encontrado');
        }
      }

      await AuditService.updateWithAudit(evento, updateData, userId);
      
      return await this.getEventoById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar evento (eliminación lógica)
   */
  static async deleteEvento(id, userId = null) {
    try {
      const evento = await AuditService.findByPkWithAudit(Evento, id);
      
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      // Verificar si el evento ya está activo o finalizado
      if (evento.estado === 'activo' || evento.estado === 'finalizado') {
        throw new Error('No se puede eliminar un evento activo o finalizado');
      }

      // Eliminación lógica del evento
      await AuditService.softDelete(evento, userId);
      
      return { message: 'Evento eliminado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cambiar estado del evento
   */
  static async cambiarEstadoEvento(id, nuevoEstado, userId = null) {
    try {
      const evento = await AuditService.findByPkWithAudit(Evento, id);
      
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      // Validar transición de estado
      if (!this.isValidStateTransition(evento.estado, nuevoEstado)) {
        throw new Error(`No se puede cambiar de ${evento.estado} a ${nuevoEstado}`);
      }

      await AuditService.updateWithAudit(evento, { estado: nuevoEstado }, userId);
      
      return await this.getEventoById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Duplicar evento existente
   */
  static async duplicarEvento(id, nuevosNombres = {}, userId = null) {
    try {
      const eventoOriginal = await this.getEventoById(id);
      
      if (!eventoOriginal) {
        throw new Error('Evento original no encontrado');
      }

      const nuevoNombre = nuevosNombres.nombre_evento || `${eventoOriginal.nombre_evento} - Copia`;
      const nuevaUrlAmigable = nuevosNombres.url_amigable || this.generateUrlAmigable(nuevoNombre);

      const datosNuevoEvento = {
        nombre_evento: nuevoNombre,
        descripcion: eventoOriginal.descripcion,
        fecha_inicio: nuevosNombres.fecha_inicio || eventoOriginal.fecha_inicio,
        fecha_fin: nuevosNombres.fecha_fin || eventoOriginal.fecha_fin,
        ubicacion: eventoOriginal.ubicacion,
        url_virtual: eventoOriginal.url_virtual,
        id_tipo_evento: eventoOriginal.id_tipo_evento,
        estado: 'borrador',
        imagen_logo: eventoOriginal.imagen_logo,
        configuracion_especifica: eventoOriginal.configuracion_especifica,
        url_amigable: nuevaUrlAmigable,
        capacidad_maxima: eventoOriginal.capacidad_maxima,
        precio_entrada: eventoOriginal.precio_entrada,
        moneda: eventoOriginal.moneda,
        requiere_aprobacion: eventoOriginal.requiere_aprobacion,
        fecha_limite_registro: nuevosNombres.fecha_limite_registro || null
      };

      return await this.createEvento(datosNuevoEvento, userId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener eventos próximos
   */
  static async getEventosProximos(limit = 5) {
    try {
      const eventos = await Evento.scope('upcoming').findAll({
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['nombre_tipo']
        }],
        limit: parseInt(limit),
        order: [['fecha_inicio', 'ASC']]
      });

      return eventos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener eventos activos
   */
  static async getEventosActivos() {
    try {
      const eventos = await Evento.scope('current').findAll({
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['nombre_tipo']
        }],
        order: [['fecha_inicio', 'ASC']]
      });

      return eventos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de eventos
   */
  static async getEventoStats(includeDeleted = false) {
    try {
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();
      
      const [total, activos, borradores, publicados, finalizados, eliminados] = await Promise.all([
        Evento.count(),
        Evento.count({ where: { ...whereCondition, estado: 'activo' } }),
        Evento.count({ where: { ...whereCondition, estado: 'borrador' } }),
        Evento.count({ where: { ...whereCondition, estado: 'publicado' } }),
        Evento.count({ where: { ...whereCondition, estado: 'finalizado' } }),
        Evento.count({ where: AuditService.getDeletedWhereCondition() })
      ]);

      const eventosPorTipo = await Evento.findAll({
        attributes: [
          'id_tipo_evento',
          [require('sequelize').fn('COUNT', 'id_evento'), 'count']
        ],
        include: [{
          model: TipoEvento,
          as: 'tipoEvento',
          attributes: ['nombre_tipo']
        }],
        where: whereCondition,
        group: ['id_tipo_evento', 'tipoEvento.nombre_tipo'],
        raw: false
      });

      return {
        total,
        activos,
        borradores,
        publicados,
        finalizados,
        eliminados,
        porTipo: eventosPorTipo
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restaurar evento eliminado
   */
  static async restoreEvento(id) {
    try {
      const evento = await Evento.findByPk(id);
      
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      if (!AuditService.isDeleted(evento)) {
        throw new Error('El evento no está eliminado');
      }

      await AuditService.restore(evento);
      
      return { message: 'Evento restaurado correctamente' };
    } catch (error) {
      throw error;
    }
  }

  // Métodos auxiliares privados

  /**
   * Generar URL amigable a partir del nombre
   */
  static generateUrlAmigable(nombreEvento) {
    return nombreEvento
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
      .substring(0, 100);
  }

  /**
   * Validar transición de estado
   */
  static isValidStateTransition(currentState, newState) {
    const validTransitions = {
      'borrador': ['publicado', 'archivado'],
      'publicado': ['activo', 'archivado'],
      'activo': ['finalizado', 'archivado'],
      'finalizado': ['archivado'],
      'archivado': ['borrador']
    };

    return validTransitions[currentState]?.includes(newState) || false;
  }

  /**
   * Validar configuración específica según tipo de evento
   */
  static async validateConfiguracionByTipo(tipoNombre, eventoData) {
    switch (tipoNombre) {
      case 'presencial':
        if (!eventoData.ubicacion) {
          throw new Error('Los eventos presenciales requieren ubicación física');
        }
        break;
      case 'virtual':
        if (!eventoData.url_virtual) {
          throw new Error('Los eventos virtuales requieren URL de plataforma virtual');
        }
        break;
      case 'hibrido':
        if (!eventoData.ubicacion || !eventoData.url_virtual) {
          throw new Error('Los eventos híbridos requieren ubicación física y URL virtual');
        }
        break;
    }
  }
}

module.exports = EventoService;
