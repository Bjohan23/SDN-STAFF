const { EtiquetaLibre, EmpresaEtiqueta, EmpresaExpositora, Usuario } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

class EtiquetaLibreController {
  // ==================== CRUD BÁSICO ====================

  // Obtener todas las etiquetas
  static async getAllEtiquetas(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        tipo = 'todos',
        estado = 'activa',
        soloPublicas = 'true',
        includeStats = 'false',
        ordenPor = 'popularidad_score',
        direccion = 'DESC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereCondition = {
        deleted_at: null
      };

      // Filtros
      if (estado !== 'todos') {
        whereCondition.estado = estado;
      }

      if (tipo !== 'todos') {
        whereCondition.tipo_etiqueta = tipo;
      }

      if (soloPublicas === 'true') {
        whereCondition.es_publica = true;
      }

      // Filtrar solo etiquetas vigentes
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            { es_temporal: false },
            {
              [Op.and]: [
                { es_temporal: true },
                {
                  [Op.or]: [
                    { fecha_inicio_vigencia: null },
                    { fecha_inicio_vigencia: { [Op.lte]: new Date() } }
                  ]
                },
                {
                  [Op.or]: [
                    { fecha_fin_vigencia: null },
                    { fecha_fin_vigencia: { [Op.gte]: new Date() } }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const includeOptions = [
        {
          model: Usuario,
          as: 'createdByUser',
          attributes: ['id_usuario', 'nombre', 'email']
        }
      ];

      if (includeStats === 'true') {
        includeOptions.push({
          model: EmpresaEtiqueta,
          as: 'asignacionesEmpresa',
          where: { deleted_at: null, estado: 'activa' },
          required: false,
          attributes: ['id_empresa_etiqueta', 'relevancia', 'fecha_asignacion']
        });
      }

      const etiquetas = await EtiquetaLibre.findAndCountAll({
        where: whereCondition,
        include: includeOptions,
        limit: parseInt(limit),
        offset: offset,
        order: [[ordenPor, direccion.toUpperCase()]],
        distinct: true
      });

      res.json({
        success: true,
        data: etiquetas.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(etiquetas.count / limit),
          totalItems: etiquetas.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener etiquetas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener etiqueta por ID
  static async getEtiquetaById(req, res) {
    try {
      const { id } = req.params;
      const { includeEmpresas = 'false' } = req.query;

      const includeOptions = [
        {
          model: Usuario,
          as: 'createdByUser',
          attributes: ['id_usuario', 'nombre', 'email']
        }
      ];

      if (includeEmpresas === 'true') {
        includeOptions.push({
          model: EmpresaEtiqueta,
          as: 'asignacionesEmpresa',
          where: { deleted_at: null, estado: 'activa' },
          required: false,
          include: [{
            model: EmpresaExpositora,
            as: 'empresaExpositora',
            attributes: ['id_empresa', 'nombre_empresa', 'sector', 'estado'],
            where: { deleted_at: null }
          }]
        });
      }

      const etiqueta = await EtiquetaLibre.findOne({
        where: {
          id_etiqueta: id,
          deleted_at: null
        },
        include: includeOptions
      });

      if (!etiqueta) {
        return res.status(404).json({
          success: false,
          message: 'Etiqueta no encontrada'
        });
      }

      res.json({
        success: true,
        data: etiqueta
      });
    } catch (error) {
      console.error('Error al obtener etiqueta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nueva etiqueta
  static async createEtiqueta(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array()
        });
      }

      const {
        nombre_etiqueta,
        descripcion,
        tipo_etiqueta = 'otros',
        color_hex,
        icono,
        es_destacada = false,
        es_publica = true,
        es_sugerible = true,
        es_temporal = false,
        fecha_inicio_vigencia,
        fecha_fin_vigencia,
        requiere_aprobacion = false,
        solo_admin = false,
        max_usos_empresa,
        palabras_clave,
        sinonimos,
        categorias_sugeridas,
        etiquetas_relacionadas,
        configuracion_especifica
      } = req.body;

      const userId = req.user.id_usuario;

      // Generar slug automáticamente
      const baseSlug = nombre_etiqueta
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = baseSlug;
      let counter = 1;

      // Verificar que el slug sea único
      while (await EtiquetaLibre.findOne({ where: { slug, deleted_at: null } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Validar fechas de vigencia para etiquetas temporales
      if (es_temporal) {
        if (fecha_inicio_vigencia && fecha_fin_vigencia) {
          if (new Date(fecha_inicio_vigencia) >= new Date(fecha_fin_vigencia)) {
            return res.status(400).json({
              success: false,
              message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
          }
        }
      }

      const nuevaEtiqueta = await EtiquetaLibre.create({
        nombre_etiqueta,
        slug,
        descripcion,
        tipo_etiqueta,
        color_hex,
        icono,
        es_destacada,
        es_publica,
        es_sugerible,
        es_temporal,
        fecha_inicio_vigencia: es_temporal ? fecha_inicio_vigencia : null,
        fecha_fin_vigencia: es_temporal ? fecha_fin_vigencia : null,
        requiere_aprobacion,
        solo_admin,
        max_usos_empresa,
        palabras_clave,
        sinonimos,
        categorias_sugeridas,
        etiquetas_relacionadas,
        configuracion_especifica,
        created_by: userId
      });

      res.status(201).json({
        success: true,
        message: 'Etiqueta creada exitosamente',
        data: nuevaEtiqueta
      });
    } catch (error) {
      console.error('Error al crear etiqueta:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una etiqueta con ese nombre o slug'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar etiqueta
  static async updateEtiqueta(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id_usuario;

      const etiqueta = await EtiquetaLibre.findOne({
        where: {
          id_etiqueta: id,
          deleted_at: null
        }
      });

      if (!etiqueta) {
        return res.status(404).json({
          success: false,
          message: 'Etiqueta no encontrada'
        });
      }

      const datosActualizacion = { ...req.body };
      delete datosActualizacion.id_etiqueta;
      delete datosActualizacion.slug; // El slug no se actualiza manualmente
      delete datosActualizacion.total_usos; // No se puede modificar manualmente
      delete datosActualizacion.total_empresas; // No se puede modificar manualmente
      delete datosActualizacion.popularidad_score; // Se calcula automáticamente
      datosActualizacion.updated_by = userId;

      // Si cambia el nombre, regenerar slug
      if (datosActualizacion.nombre_etiqueta && datosActualizacion.nombre_etiqueta !== etiqueta.nombre_etiqueta) {
        const baseSlug = datosActualizacion.nombre_etiqueta
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        let newSlug = baseSlug;
        let counter = 1;

        while (await EtiquetaLibre.findOne({ 
          where: { 
            slug: newSlug, 
            deleted_at: null,
            id_etiqueta: { [Op.ne]: id }
          } 
        })) {
          newSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        datosActualizacion.slug = newSlug;
      }

      // Validar fechas de vigencia para etiquetas temporales
      if (datosActualizacion.es_temporal || etiqueta.es_temporal) {
        if (datosActualizacion.fecha_inicio_vigencia && datosActualizacion.fecha_fin_vigencia) {
          if (new Date(datosActualizacion.fecha_inicio_vigencia) >= new Date(datosActualizacion.fecha_fin_vigencia)) {
            return res.status(400).json({
              success: false,
              message: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
          }
        }
      }

      await etiqueta.update(datosActualizacion);

      const etiquetaActualizada = await EtiquetaLibre.findByPk(id);

      res.json({
        success: true,
        message: 'Etiqueta actualizada exitosamente',
        data: etiquetaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar etiqueta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar etiqueta (soft delete)
  static async deleteEtiqueta(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id_usuario;

      const etiqueta = await EtiquetaLibre.findOne({
        where: {
          id_etiqueta: id,
          deleted_at: null
        }
      });

      if (!etiqueta) {
        return res.status(404).json({
          success: false,
          message: 'Etiqueta no encontrada'
        });
      }

      // Verificar si tiene empresas asignadas
      const empresasAsignadas = await EmpresaEtiqueta.count({
        where: {
          id_etiqueta: id,
          deleted_at: null,
          estado: 'activa'
        }
      });

      if (empresasAsignadas > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la etiqueta porque tiene empresas asignadas',
          empresasAsignadas
        });
      }

      await etiqueta.softDelete(userId);

      res.json({
        success: true,
        message: 'Etiqueta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar etiqueta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // ==================== FUNCIONES ESPECIALES ====================

  // Obtener etiquetas por tipo
  static async getEtiquetasPorTipo(req, res) {
    try {
      const { tipo } = req.params;
      const { limit = 20, soloDestacadas = 'false' } = req.query;

      const whereCondition = {
        deleted_at: null,
        estado: 'activa',
        es_publica: true,
        tipo_etiqueta: tipo
      };

      if (soloDestacadas === 'true') {
        whereCondition.es_destacada = true;
      }

      // Solo etiquetas vigentes
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            { es_temporal: false },
            {
              [Op.and]: [
                { es_temporal: true },
                {
                  [Op.or]: [
                    { fecha_inicio_vigencia: null },
                    { fecha_inicio_vigencia: { [Op.lte]: new Date() } }
                  ]
                },
                {
                  [Op.or]: [
                    { fecha_fin_vigencia: null },
                    { fecha_fin_vigencia: { [Op.gte]: new Date() } }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const etiquetas = await EtiquetaLibre.findAll({
        where: whereCondition,
        order: [
          ['popularidad_score', 'DESC'],
          ['total_usos', 'DESC'],
          ['nombre_etiqueta', 'ASC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: etiquetas
      });
    } catch (error) {
      console.error('Error al obtener etiquetas por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener etiquetas destacadas
  static async getEtiquetasDestacadas(req, res) {
    try {
      const { limit = 15 } = req.query;

      const etiquetas = await EtiquetaLibre.findAll({
        where: {
          deleted_at: null,
          estado: 'activa',
          es_publica: true,
          es_destacada: true,
          [Op.and]: [
            {
              [Op.or]: [
                { es_temporal: false },
                {
                  [Op.and]: [
                    { es_temporal: true },
                    {
                      [Op.or]: [
                        { fecha_inicio_vigencia: null },
                        { fecha_inicio_vigencia: { [Op.lte]: new Date() } }
                      ]
                    },
                    {
                      [Op.or]: [
                        { fecha_fin_vigencia: null },
                        { fecha_fin_vigencia: { [Op.gte]: new Date() } }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        order: [
          ['popularidad_score', 'DESC'],
          ['total_empresas', 'DESC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: etiquetas
      });
    } catch (error) {
      console.error('Error al obtener etiquetas destacadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Buscar etiquetas
  static async buscarEtiquetas(req, res) {
    try {
      const { 
        q,
        tipo = 'todos',
        limit = 20,
        soloSugeribles = 'false'
      } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El término de búsqueda debe tener al menos 2 caracteres'
        });
      }

      const whereCondition = {
        deleted_at: null,
        estado: 'activa',
        es_publica: true,
        [Op.or]: [
          { nombre_etiqueta: { [Op.like]: `%${q}%` } },
          { descripcion: { [Op.like]: `%${q}%` } },
          { palabras_clave: { [Op.like]: `%${q}%` } },
          { sinonimos: { [Op.like]: `%${q}%` } }
        ]
      };

      if (tipo !== 'todos') {
        whereCondition.tipo_etiqueta = tipo;
      }

      if (soloSugeribles === 'true') {
        whereCondition.es_sugerible = true;
      }

      // Solo etiquetas vigentes
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            { es_temporal: false },
            {
              [Op.and]: [
                { es_temporal: true },
                {
                  [Op.or]: [
                    { fecha_inicio_vigencia: null },
                    { fecha_inicio_vigencia: { [Op.lte]: new Date() } }
                  ]
                },
                {
                  [Op.or]: [
                    { fecha_fin_vigencia: null },
                    { fecha_fin_vigencia: { [Op.gte]: new Date() } }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const etiquetas = await EtiquetaLibre.findAll({
        where: whereCondition,
        order: [
          ['es_destacada', 'DESC'],
          ['popularidad_score', 'DESC'],
          ['nombre_etiqueta', 'ASC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: etiquetas,
        total: etiquetas.length
      });
    } catch (error) {
      console.error('Error al buscar etiquetas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener etiquetas sugeridas para una empresa
  static async getSugerenciasParaEmpresa(req, res) {
    try {
      const { empresaId } = req.params;
      const { limite = 10 } = req.query;

      // Verificar que la empresa existe
      const empresa = await EmpresaExpositora.findByPk(empresaId);
      if (!empresa) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      // Obtener etiquetas que ya tiene la empresa
      const etiquetasActuales = await EmpresaEtiqueta.findAll({
        where: {
          id_empresa: empresaId,
          deleted_at: null,
          estado: 'activa'
        },
        attributes: ['id_etiqueta']
      });

      const idsEtiquetasActuales = etiquetasActuales.map(e => e.id_etiqueta);

      // Buscar etiquetas sugeribles que no tenga la empresa
      const whereCondition = {
        deleted_at: null,
        estado: 'activa',
        es_publica: true,
        es_sugerible: true
      };

      if (idsEtiquetasActuales.length > 0) {
        whereCondition.id_etiqueta = { [Op.notIn]: idsEtiquetasActuales };
      }

      // Solo etiquetas vigentes
      whereCondition[Op.and] = [
        {
          [Op.or]: [
            { es_temporal: false },
            {
              [Op.and]: [
                { es_temporal: true },
                {
                  [Op.or]: [
                    { fecha_inicio_vigencia: null },
                    { fecha_inicio_vigencia: { [Op.lte]: new Date() } }
                  ]
                },
                {
                  [Op.or]: [
                    { fecha_fin_vigencia: null },
                    { fecha_fin_vigencia: { [Op.gte]: new Date() } }
                  ]
                }
              ]
            }
          ]
        }
      ];

      const sugerencias = await EtiquetaLibre.findAll({
        where: whereCondition,
        order: [
          ['popularidad_score', 'DESC'],
          ['total_empresas', 'DESC']
        ],
        limit: parseInt(limite)
      });

      res.json({
        success: true,
        data: sugerencias
      });
    } catch (error) {
      console.error('Error al obtener sugerencias de etiquetas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de etiquetas
  static async getEstadisticasEtiquetas(req, res) {
    try {
      const stats = {
        totalEtiquetas: await EtiquetaLibre.count({
          where: { deleted_at: null }
        }),
        etiquetasActivas: await EtiquetaLibre.count({
          where: { deleted_at: null, estado: 'activa' }
        }),
        etiquetasDestacadas: await EtiquetaLibre.count({
          where: { deleted_at: null, estado: 'activa', es_destacada: true }
        }),
        etiquetasTemporales: await EtiquetaLibre.count({
          where: { deleted_at: null, estado: 'activa', es_temporal: true }
        })
      };

      // Estadísticas por tipo
      const statsPorTipo = await EtiquetaLibre.findAll({
        where: { deleted_at: null, estado: 'activa' },
        attributes: [
          'tipo_etiqueta',
          [EtiquetaLibre.sequelize.fn('COUNT', EtiquetaLibre.sequelize.col('id_etiqueta')), 'cantidad']
        ],
        group: ['tipo_etiqueta'],
        raw: true
      });

      stats.porTipo = statsPorTipo;

      // Top 5 etiquetas más populares
      const topEtiquetas = await EtiquetaLibre.findAll({
        where: {
          deleted_at: null,
          estado: 'activa',
          total_empresas: { [Op.gt]: 0 }
        },
        order: [['popularidad_score', 'DESC']],
        limit: 5,
        attributes: ['id_etiqueta', 'nombre_etiqueta', 'total_empresas', 'popularidad_score']
      });

      stats.topEtiquetasPorPopularidad = topEtiquetas;

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar contadores de una etiqueta
  static async actualizarContadores(req, res) {
    try {
      const { id } = req.params;

      const etiqueta = await EtiquetaLibre.findOne({
        where: {
          id_etiqueta: id,
          deleted_at: null
        }
      });

      if (!etiqueta) {
        return res.status(404).json({
          success: false,
          message: 'Etiqueta no encontrada'
        });
      }

      await etiqueta.updateCounters();

      res.json({
        success: true,
        message: 'Contadores actualizados exitosamente',
        data: {
          id_etiqueta: etiqueta.id_etiqueta,
          total_usos: etiqueta.total_usos,
          total_empresas: etiqueta.total_empresas,
          popularidad_score: etiqueta.popularidad_score
        }
      });
    } catch (error) {
      console.error('Error al actualizar contadores:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener tipos de etiqueta disponibles
  static async getTiposEtiqueta(req, res) {
    try {
      const tipos = [
        { valor: 'producto', nombre: 'Producto', descripcion: 'Etiquetas relacionadas con productos' },
        { valor: 'servicio', nombre: 'Servicio', descripcion: 'Etiquetas relacionadas con servicios' },
        { valor: 'tecnologia', nombre: 'Tecnología', descripcion: 'Etiquetas relacionadas con tecnologías' },
        { valor: 'especialidad', nombre: 'Especialidad', descripcion: 'Etiquetas de especialización' },
        { valor: 'certificacion', nombre: 'Certificación', descripcion: 'Certificaciones y acreditaciones' },
        { valor: 'temporal', nombre: 'Temporal', descripcion: 'Etiquetas con vigencia limitada' },
        { valor: 'promocional', nombre: 'Promocional', descripcion: 'Etiquetas promocionales' },
        { valor: 'ubicacion', nombre: 'Ubicación', descripcion: 'Etiquetas de ubicación geográfica' },
        { valor: 'otros', nombre: 'Otros', descripcion: 'Otras etiquetas' }
      ];

      // Contar etiquetas por tipo
      for (let tipo of tipos) {
        const count = await EtiquetaLibre.count({
          where: {
            deleted_at: null,
            estado: 'activa',
            tipo_etiqueta: tipo.valor
          }
        });
        tipo.cantidad = count;
      }

      res.json({
        success: true,
        data: tipos
      });
    } catch (error) {
      console.error('Error al obtener tipos de etiqueta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = EtiquetaLibreController;
