const { EmpresaExpositora, Evento, Usuario, EmpresaEvento } = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./AuditService');

/**
 * Servicio de EmpresaExpositora - Lógica de negocio
 */
class EmpresaExpositoraService {
  
  /**
   * Crear una nueva empresa expositora
   */
  static async createEmpresaExpositora(empresaData, userId = null) {
    try {
      // Validar que el email no esté en uso
      if (empresaData.email_contacto) {
        const existingEmpresa = await EmpresaExpositora.findOne({
          where: { 
            email_contacto: empresaData.email_contacto.toLowerCase(),
            ...AuditService.getActiveWhereCondition()
          }
        });
        
        if (existingEmpresa) {
          throw new Error('El email de contacto ya está en uso por otra empresa');
        }
      }

      // Validar RUC si se proporciona
      if (empresaData.ruc) {
        const existingRuc = await EmpresaExpositora.findOne({
          where: { 
            ruc: empresaData.ruc,
            ...AuditService.getActiveWhereCondition()
          }
        });
        
        if (existingRuc) {
          throw new Error('El RUC ya está registrado');
        }
      }

      // Validar campos numéricos si se proporcionan
      if (empresaData.numero_participaciones !== undefined && empresaData.numero_participaciones < 0) {
        throw new Error('El número de participaciones no puede ser negativo');
      }

      if (empresaData.calificacion_promedio !== undefined) {
        const calificacion = parseFloat(empresaData.calificacion_promedio);
        if (calificacion < 0 || calificacion > 5) {
          throw new Error('La calificación debe estar entre 0 y 5');
        }
      }

      const dataToCreate = {
        nombre_empresa: empresaData.nombre_empresa,
        razon_social: empresaData.razon_social || null,
        ruc: empresaData.ruc || null,
        descripcion: empresaData.descripcion || null,
        sector: empresaData.sector || null,
        tamaño_empresa: empresaData.tamaño_empresa || null,
        logo_url: empresaData.logo_url || null,
        sitio_web: empresaData.sitio_web || null,
        email_contacto: empresaData.email_contacto.toLowerCase(),
        telefono_contacto: empresaData.telefono_contacto || null,
        nombre_contacto: empresaData.nombre_contacto || null,
        cargo_contacto: empresaData.cargo_contacto || null,
        direccion: empresaData.direccion || null,
        ciudad: empresaData.ciudad || null,
        pais: empresaData.pais || 'Perú',
        estado: empresaData.estado || 'pendiente',
        documentos_legales: empresaData.documentos_legales || null,
        fecha_vencimiento_documentos: empresaData.fecha_vencimiento_documentos || null,
        redes_sociales: empresaData.redes_sociales || null,
        productos_servicios: empresaData.productos_servicios || null,
        experiencia_ferias: empresaData.experiencia_ferias || null,
        configuracion_especifica: empresaData.configuracion_especifica || null,
        // Campos numéricos con valores por defecto explícitos
        numero_participaciones: empresaData.numero_participaciones || 0,
        calificacion_promedio: empresaData.calificacion_promedio || null
      };
      
      const empresa = await AuditService.createWithAudit(EmpresaExpositora, dataToCreate, userId);
      
      return await this.getEmpresaExpositoraById(empresa.id_empresa);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las empresas expositoras
   */
  static async getAllEmpresasExpositoras(page = 1, limit = 10, filters = {}, includeAudit = false, includeDeleted = false) {
    try {
      const offset = (page - 1) * limit;
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();

      // Aplicar filtros
      if (filters.search) {
        whereCondition[Op.or] = [
          { nombre_empresa: { [Op.like]: `%${filters.search}%` } },
          { razon_social: { [Op.like]: `%${filters.search}%` } },
          { ruc: { [Op.like]: `%${filters.search}%` } },
          { email_contacto: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      if (filters.estado) {
        whereCondition.estado = filters.estado;
      }

      if (filters.sector) {
        whereCondition.sector = { [Op.like]: `%${filters.sector}%` };
      }

      if (filters.tamaño_empresa) {
        whereCondition.tamaño_empresa = filters.tamaño_empresa;
      }

      if (filters.ciudad) {
        whereCondition.ciudad = { [Op.like]: `%${filters.ciudad}%` };
      }

      if (filters.pais) {
        whereCondition.pais = filters.pais;
      }

      const options = {
        where: whereCondition,
        include: [{
          model: Usuario,
          as: 'aprobadaPorUsuario',
          attributes: ['id_usuario', 'correo'],
          required: false
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']],
        distinct: true
      };

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      const { count, rows } = await EmpresaExpositora.findAndCountAll(options);

      return {
        empresas: rows,
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
   * Obtener empresa expositora por ID
   */
  static async getEmpresaExpositoraById(id, includeEventos = false, includeAudit = false, includeDeleted = false) {
    try {
      const options = {
        include: [{
          model: Usuario,
          as: 'aprobadaPorUsuario',
          attributes: ['id_usuario', 'correo'],
          required: false
        }]
      };

      if (includeEventos) {
        options.include.push({
          model: EmpresaEvento,
          as: 'participaciones',
          include: [{
            model: Evento,
            as: 'evento',
            attributes: ['id_evento', 'nombre_evento', 'fecha_inicio', 'fecha_fin', 'estado'],
            where: AuditService.getActiveWhereCondition(),
            required: false
          }],
          where: AuditService.getActiveWhereCondition(),
          required: false
        });
      }

      if (includeAudit) {
        const models = require('../models');
        options.include.push(...AuditService.getAuditIncludeOptions(models));
      }

      let empresa;
      if (includeDeleted) {
        empresa = await EmpresaExpositora.findByPk(id, options);
      } else {
        empresa = await AuditService.findByPkWithAudit(EmpresaExpositora, id, options);
      }

      if (!empresa) {
        throw new Error('Empresa expositora no encontrada');
      }

      return empresa;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener empresa por RUC
   */
  static async getEmpresaByRuc(ruc, includeDeleted = false) {
    try {
      const whereCondition = { ruc };
      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const empresa = await EmpresaExpositora.findOne({
        where: whereCondition
      });

      return empresa;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener empresa por email
   */
  static async getEmpresaByEmail(email, includeDeleted = false) {
    try {
      const whereCondition = { email_contacto: email.toLowerCase() };
      if (!includeDeleted) {
        Object.assign(whereCondition, AuditService.getActiveWhereCondition());
      }

      const empresa = await EmpresaExpositora.findOne({
        where: whereCondition
      });

      return empresa;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar empresa expositora
   */
  static async updateEmpresaExpositora(id, updateData, userId = null) {
    try {
      const empresa = await AuditService.findByPkWithAudit(EmpresaExpositora, id);
      
      if (!empresa) {
        throw new Error('Empresa expositora no encontrada');
      }

      // Validar email único si se está actualizando
      if (updateData.email_contacto && updateData.email_contacto !== empresa.email_contacto) {
        const existingEmpresa = await this.getEmpresaByEmail(updateData.email_contacto);
        if (existingEmpresa && existingEmpresa.id_empresa !== id) {
          throw new Error('El email de contacto ya está en uso por otra empresa');
        }
        updateData.email_contacto = updateData.email_contacto.toLowerCase();
      }

      // Validar RUC único si se está actualizando
      if (updateData.ruc && updateData.ruc !== empresa.ruc) {
        const existingRuc = await this.getEmpresaByRuc(updateData.ruc);
        if (existingRuc && existingRuc.id_empresa !== id) {
          throw new Error('El RUC ya está registrado');
        }
      }

      // Validar campos numéricos si se están actualizando
      if (updateData.numero_participaciones !== undefined && updateData.numero_participaciones < 0) {
        throw new Error('El número de participaciones no puede ser negativo');
      }

      if (updateData.calificacion_promedio !== undefined) {
        const calificacion = parseFloat(updateData.calificacion_promedio);
        if (calificacion < 0 || calificacion > 5) {
          throw new Error('La calificación debe estar entre 0 y 5');
        }
      }

      await AuditService.updateWithAudit(empresa, updateData, userId);
      
      return await this.getEmpresaExpositoraById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Eliminar empresa expositora (eliminación lógica)
   */
  static async deleteEmpresaExpositora(id, userId = null) {
    try {
      const empresa = await AuditService.findByPkWithAudit(EmpresaExpositora, id);
      
      if (!empresa) {
        throw new Error('Empresa expositora no encontrada');
      }

      // Verificar si tiene participaciones activas en eventos
      const participacionesActivas = await EmpresaEvento.count({
        where: AuditService.combineWhereWithActive({
          id_empresa: id,
          estado_participacion: ['registrada', 'pendiente_aprobacion', 'aprobada', 'confirmada']
        })
      });

      if (participacionesActivas > 0) {
        throw new Error(`No se puede eliminar la empresa. Tiene ${participacionesActivas} participaciones activas en eventos`);
      }

      // Eliminación lógica de la empresa
      await AuditService.softDelete(empresa, userId);
      
      return { message: 'Empresa expositora eliminada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Aprobar empresa expositora
   */
  static async aprobarEmpresa(id, aprobadaPor = null, comentarios = null) {
    try {
      const empresa = await AuditService.findByPkWithAudit(EmpresaExpositora, id);
      
      if (!empresa) {
        throw new Error('Empresa expositora no encontrada');
      }

      if (empresa.estado === 'aprobada') {
        throw new Error('La empresa ya está aprobada');
      }

      await empresa.aprobar(aprobadaPor);

      return await this.getEmpresaExpositoraById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Rechazar empresa expositora
   */
  static async rechazarEmpresa(id, motivo, rechazadaPor = null) {
    try {
      const empresa = await AuditService.findByPkWithAudit(EmpresaExpositora, id);
      
      if (!empresa) {
        throw new Error('Empresa expositora no encontrada');
      }

      if (!motivo || motivo.trim() === '') {
        throw new Error('El motivo de rechazo es requerido');
      }

      await empresa.rechazar(motivo, rechazadaPor);

      return await this.getEmpresaExpositoraById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Suspender empresa expositora
   */
  static async suspenderEmpresa(id, motivo = null, suspendidaPor = null) {
    try {
      const empresa = await AuditService.findByPkWithAudit(EmpresaExpositora, id);
      
      if (!empresa) {
        throw new Error('Empresa expositora no encontrada');
      }

      await AuditService.updateWithAudit(empresa, {
        estado: 'suspendida',
        motivo_rechazo: motivo
      }, suspendidaPor);

      return await this.getEmpresaExpositoraById(id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registrar empresa en evento
   */
  static async registrarEnEvento(empresaId, eventoId, datosRegistro = {}, registradoPor = null) {
    try {
      // Verificar que la empresa existe y está aprobada
      const empresa = await this.getEmpresaExpositoraById(empresaId);
      if (empresa.estado !== 'aprobada') {
        throw new Error('Solo las empresas aprobadas pueden registrarse en eventos');
      }

      // Verificar que el evento existe y acepta registros
      const EventoService = require('./EventoService');
      const evento = await EventoService.getEventoById(eventoId);
      
      if (!evento.canRegister()) {
        throw new Error('El evento no acepta registros en este momento');
      }

      // Verificar si ya está registrada
      const registroExistente = await EmpresaEvento.findOne({
        where: AuditService.combineWhereWithActive({
          id_empresa: empresaId,
          id_evento: eventoId
        })
      });

      if (registroExistente) {
        throw new Error('La empresa ya está registrada en este evento');
      }

      // Determinar estado inicial según configuración del evento
      const estadoInicial = evento.requiere_aprobacion ? 'pendiente_aprobacion' : 'registrada';

      const datosParticipacion = {
        id_empresa: empresaId,
        id_evento: eventoId,
        fecha_registro: new Date(),
        estado_participacion: estadoInicial,
        productos_a_exponer: datosRegistro.productos_a_exponer || null,
        objetivos_participacion: datosRegistro.objetivos_participacion || null,
        contacto_evento: datosRegistro.contacto_evento || null,
        telefono_contacto_evento: datosRegistro.telefono_contacto_evento || null,
        email_contacto_evento: datosRegistro.email_contacto_evento || null,
        servicios_adicionales: datosRegistro.servicios_adicionales || null,
        requiere_montaje_especial: datosRegistro.requiere_montaje_especial || false,
        configuracion_participacion: datosRegistro.configuracion_participacion || null
      };

      const participacion = await AuditService.createWithAudit(EmpresaEvento, datosParticipacion, registradoPor);

      // Incrementar contador de participaciones de la empresa
      await empresa.increment('numero_participaciones');

      return await this.getParticipacionEnEvento(empresaId, eventoId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener participación específica en evento
   */
  static async getParticipacionEnEvento(empresaId, eventoId) {
    try {
      const participacion = await EmpresaEvento.findOne({
        where: AuditService.combineWhereWithActive({
          id_empresa: empresaId,
          id_evento: eventoId
        }),
        include: [
          {
            model: EmpresaExpositora,
            as: 'empresa',
            attributes: ['id_empresa', 'nombre_empresa', 'email_contacto']
          },
          {
            model: Evento,
            as: 'evento',
            attributes: ['id_evento', 'nombre_evento', 'fecha_inicio', 'fecha_fin']
          }
        ]
      });

      if (!participacion) {
        throw new Error('Participación no encontrada');
      }

      return participacion;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener estadísticas de empresas expositoras
   */
  static async getEmpresasStats(includeDeleted = false) {
    try {
      const whereCondition = includeDeleted ? {} : AuditService.getActiveWhereCondition();
      
      const [total, activas, pendientes, aprobadas, rechazadas, suspendidas, eliminadas] = await Promise.all([
        EmpresaExpositora.count(),
        EmpresaExpositora.count({ where: { ...whereCondition, estado: 'aprobada' } }),
        EmpresaExpositora.count({ where: { ...whereCondition, estado: 'pendiente' } }),
        EmpresaExpositora.count({ where: { ...whereCondition, estado: 'aprobada' } }),
        EmpresaExpositora.count({ where: { ...whereCondition, estado: 'rechazada' } }),
        EmpresaExpositora.count({ where: { ...whereCondition, estado: 'suspendida' } }),
        EmpresaExpositora.count({ where: AuditService.getDeletedWhereCondition() })
      ]);

      const empresasPorSector = await EmpresaExpositora.findAll({
        attributes: [
          'sector',
          [require('sequelize').fn('COUNT', 'id_empresa'), 'count']
        ],
        where: whereCondition,
        group: ['sector'],
        having: require('sequelize').literal('COUNT(id_empresa) > 0'),
        order: [[require('sequelize').literal('count'), 'DESC']],
        raw: true
      });

      const empresasPorTamaño = await EmpresaExpositora.findAll({
        attributes: [
          'tamaño_empresa',
          [require('sequelize').fn('COUNT', 'id_empresa'), 'count']
        ],
        where: whereCondition,
        group: ['tamaño_empresa'],
        having: require('sequelize').literal('COUNT(id_empresa) > 0'),
        raw: true
      });

      return {
        total,
        activas,
        pendientes,
        aprobadas,
        rechazadas,
        suspendidas,
        eliminadas,
        porSector: empresasPorSector,
        porTamaño: empresasPorTamaño
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener empresas con documentos próximos a vencer
   */
  static async getEmpresasConDocumentosProximosAVencer(dias = 30) {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + dias);

      const empresas = await EmpresaExpositora.findAll({
        where: AuditService.combineWhereWithActive({
          fecha_vencimiento_documentos: {
            [Op.lte]: fechaLimite,
            [Op.gte]: new Date()
          }
        }),
        order: [['fecha_vencimiento_documentos', 'ASC']]
      });

      return empresas;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Restaurar empresa eliminada
   */
  static async restoreEmpresa(id) {
    try {
      const empresa = await EmpresaExpositora.findByPk(id);
      
      if (!empresa) {
        throw new Error('Empresa expositora no encontrada');
      }

      if (!AuditService.isDeleted(empresa)) {
        throw new Error('La empresa no está eliminada');
      }

      await AuditService.restore(empresa);
      
      return { message: 'Empresa expositora restaurada correctamente' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Carga masiva de empresas desde CSV
   */
  static async cargaMasivaDesdeCSV(csvData, userId = null) {
    try {
      const resultados = [];
      const errores = [];

      for (const fila of csvData) {
        try {
          const empresa = await this.createEmpresaExpositora(fila, userId);
          resultados.push({
            success: true,
            empresa: empresa.nombre_empresa,
            id: empresa.id_empresa
          });
        } catch (error) {
          errores.push({
            success: false,
            empresa: fila.nombre_empresa || 'N/A',
            error: error.message
          });
        }
      }

      return {
        message: `Carga masiva completada. ${resultados.length} empresas creadas, ${errores.length} errores`,
        resultados,
        errores,
        totalProcesadas: csvData.length,
        exitosas: resultados.length,
        fallidas: errores.length
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmpresaExpositoraService;
