const { 
  EmpresaExpositora, 
  CategoriaComercial, 
  EtiquetaLibre, 
  EmpresaCategoria, 
  EmpresaEtiqueta, 
  Usuario,
  Evento
} = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

class ClasificacionExpositorController {
  // ==================== GESTIÓN DE CATEGORÍAS DE EMPRESAS ====================

  // Asignar categorías a una empresa
  static async asignarCategorias(req, res) {
    try {
      const { empresaId } = req.params;
      const { categorias, mantenerExistentes = false } = req.body;
      const userId = req.user.id_usuario;

      // Verificar que la empresa existe
      const empresa = await EmpresaExpositora.findByPk(empresaId);
      if (!empresa) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      if (!Array.isArray(categorias) || categorias.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos una categoría'
        });
      }

      // Si no se mantienen existentes, eliminar asignaciones actuales
      if (!mantenerExistentes) {
        await EmpresaCategoria.update(
          { 
            deleted_at: new Date(), 
            deleted_by: userId 
          },
          {
            where: {
              id_empresa: empresaId,
              deleted_at: null
            }
          }
        );
      }

      const asignacionesCreadas = [];
      let categoriaPrincipalAsignada = false;

      for (const categoriaData of categorias) {
        const {
          id_categoria,
          es_categoria_principal = false,
          prioridad = 1,
          porcentaje_actividad,
          descripcion_actividad,
          productos_principales,
          servicios_principales,
          experiencia_años,
          certificaciones,
          motivo_asignacion
        } = categoriaData;

        // Verificar que la categoría existe
        const categoria = await CategoriaComercial.findByPk(id_categoria);
        if (!categoria) {
          continue; // Saltar categorías que no existen
        }

        // Solo una categoría principal por empresa
        const esPrincipal = es_categoria_principal && !categoriaPrincipalAsignada;
        if (esPrincipal) {
          categoriaPrincipalAsignada = true;
          // Desmarcar otras categorías principales
          await EmpresaCategoria.update(
            { es_categoria_principal: false },
            {
              where: {
                id_empresa: empresaId,
                deleted_at: null
              }
            }
          );
        }

        // Verificar si ya existe esta asignación
        const [asignacion, creada] = await EmpresaCategoria.findOrCreate({
          where: {
            id_empresa: empresaId,
            id_categoria: id_categoria
          },
          defaults: {
            es_categoria_principal: esPrincipal,
            prioridad,
            porcentaje_actividad,
            descripcion_actividad,
            productos_principales,
            servicios_principales,
            experiencia_años,
            certificaciones: certificaciones ? JSON.stringify(certificaciones) : null,
            motivo_asignacion,
            estado: 'activa',
            created_by: userId
          }
        });

        if (!creada && asignacion.deleted_at) {
          // Restaurar si estaba eliminada
          await asignacion.update({
            deleted_at: null,
            deleted_by: null,
            es_categoria_principal: esPrincipal,
            prioridad,
            porcentaje_actividad,
            descripcion_actividad,
            productos_principales,
            servicios_principales,
            experiencia_años,
            certificaciones: certificaciones ? JSON.stringify(certificaciones) : null,
            motivo_asignacion,
            estado: 'activa',
            updated_by: userId
          });
        } else if (!creada) {
          // Actualizar existente
          await asignacion.update({
            es_categoria_principal: esPrincipal,
            prioridad,
            porcentaje_actividad,
            descripcion_actividad,
            productos_principales,
            servicios_principales,
            experiencia_años,
            certificaciones: certificaciones ? JSON.stringify(certificaciones) : null,
            motivo_asignacion,
            updated_by: userId
          });
        }

        asignacionesCreadas.push(asignacion);

        // Actualizar contadores de la categoría
        await categoria.updateCounters();
      }

      res.json({
        success: true,
        message: 'Categorías asignadas exitosamente',
        data: {
          empresa_id: empresaId,
          categorias_asignadas: asignacionesCreadas.length,
          asignaciones: asignacionesCreadas
        }
      });
    } catch (error) {
      console.error('Error al asignar categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener categorías de una empresa
  static async getCategoriasEmpresa(req, res) {
    try {
      const { empresaId } = req.params;
      const { includeSubcategorias = 'true' } = req.query;

      const empresa = await EmpresaExpositora.findByPk(empresaId);
      if (!empresa) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      const includeOptions = [
        {
          model: CategoriaComercial,
          as: 'categoriaComercial',
          include: []
        },
        {
          model: Usuario,
          as: 'validadaPorUsuario',
          attributes: ['id_usuario', 'nombre', 'correo']
        }
      ];

      if (includeSubcategorias === 'true') {
        includeOptions[0].include.push({
          model: CategoriaComercial,
          as: 'subcategorias',
          where: { deleted_at: null, estado: 'activa' },
          required: false
        });
      }

      const categorias = await EmpresaCategoria.findAll({
        where: {
          id_empresa: empresaId,
          deleted_at: null
        },
        include: includeOptions,
        order: [
          ['es_categoria_principal', 'DESC'],
          ['prioridad', 'ASC'],
          ['fecha_asignacion', 'DESC']
        ]
      });

      res.json({
        success: true,
        data: {
          empresa_id: empresaId,
          total_categorias: categorias.length,
          categorias
        }
      });
    } catch (error) {
      console.error('Error al obtener categorías de empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Establecer categoría principal
  static async establecerCategoriaPrincipal(req, res) {
    try {
      const { empresaId, categoriaId } = req.params;
      const userId = req.user.id_usuario;

      const asignacion = await EmpresaCategoria.findOne({
        where: {
          id_empresa: empresaId,
          id_categoria: categoriaId,
          deleted_at: null
        }
      });

      if (!asignacion) {
        return res.status(404).json({
          success: false,
          message: 'Asignación de categoría no encontrada'
        });
      }

      await asignacion.marcarComoPrincipal();

      res.json({
        success: true,
        message: 'Categoría principal establecida exitosamente',
        data: asignacion
      });
    } catch (error) {
      console.error('Error al establecer categoría principal:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Remover categoría de empresa
  static async removerCategoriaEmpresa(req, res) {
    try {
      const { empresaId, categoriaId } = req.params;
      const userId = req.user.id_usuario;

      const asignacion = await EmpresaCategoria.findOne({
        where: {
          id_empresa: empresaId,
          id_categoria: categoriaId,
          deleted_at: null
        }
      });

      if (!asignacion) {
        return res.status(404).json({
          success: false,
          message: 'Asignación de categoría no encontrada'
        });
      }

      await asignacion.softDelete(userId);

      // Actualizar contadores de la categoría
      const categoria = await CategoriaComercial.findByPk(categoriaId);
      if (categoria) {
        await categoria.updateCounters();
      }

      res.json({
        success: true,
        message: 'Categoría removida exitosamente'
      });
    } catch (error) {
      console.error('Error al remover categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // ==================== GESTIÓN DE ETIQUETAS DE EMPRESAS ====================

  // Asignar etiquetas a una empresa
  static async asignarEtiquetas(req, res) {
    try {
      const { empresaId } = req.params;
      const { etiquetas, mantenerExistentes = false, eventoId = null } = req.body;
      const userId = req.user.id_usuario;

      const empresa = await EmpresaExpositora.findByPk(empresaId);
      if (!empresa) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      if (!Array.isArray(etiquetas) || etiquetas.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar al menos una etiqueta'
        });
      }

      // Si no se mantienen existentes, eliminar asignaciones actuales
      if (!mantenerExistentes) {
        const whereCondition = {
          id_empresa: empresaId,
          deleted_at: null
        };

        if (eventoId) {
          whereCondition.id_evento_asignacion = eventoId;
        }

        await EmpresaEtiqueta.update(
          { 
            deleted_at: new Date(), 
            deleted_by: userId 
          },
          { where: whereCondition }
        );
      }

      const asignacionesCreadas = [];

      for (const etiquetaData of etiquetas) {
        const {
          id_etiqueta,
          contexto,
          relevancia = 3,
          origen_asignacion = 'manual',
          es_temporal = false,
          fecha_inicio_uso,
          fecha_fin_uso,
          es_solo_para_evento = false,
          metadatos_asignacion
        } = etiquetaData;

        // Verificar que la etiqueta existe y está vigente
        const etiqueta = await EtiquetaLibre.findByPk(id_etiqueta);
        if (!etiqueta || !etiqueta.isVigente()) {
          continue;
        }

        // Verificar permisos de uso
        const userRoles = req.user.roles ? req.user.roles.map(rol => rol.nombre_rol) : [];
        const esAdmin = userRoles.includes('administrador');
        if (!etiqueta.puedeSerUsadaPor(empresaId, esAdmin)) {
          continue;
        }

        // Verificar si ya existe esta asignación
        const whereAsignacion = {
          id_empresa: empresaId,
          id_etiqueta: id_etiqueta
        };

        if (eventoId && es_solo_para_evento) {
          whereAsignacion.id_evento_asignacion = eventoId;
        }

        const [asignacion, creada] = await EmpresaEtiqueta.findOrCreate({
          where: whereAsignacion,
          defaults: {
            contexto,
            relevancia,
            origen_asignacion,
            estado: etiqueta.requiere_aprobacion ? 'pendiente_revision' : 'activa',
            es_temporal,
            fecha_inicio_uso: es_temporal ? fecha_inicio_uso : null,
            fecha_fin_uso: es_temporal ? fecha_fin_uso : null,
            id_evento_asignacion: eventoId,
            es_solo_para_evento,
            metadatos_asignacion: metadatos_asignacion ? JSON.stringify(metadatos_asignacion) : null,
            created_by: userId
          }
        });

        if (!creada && asignacion.deleted_at) {
          // Restaurar si estaba eliminada
          await asignacion.update({
            deleted_at: null,
            deleted_by: null,
            contexto,
            relevancia,
            origen_asignacion,
            estado: etiqueta.requiere_aprobacion ? 'pendiente_revision' : 'activa',
            es_temporal,
            fecha_inicio_uso: es_temporal ? fecha_inicio_uso : null,
            fecha_fin_uso: es_temporal ? fecha_fin_uso : null,
            metadatos_asignacion: metadatos_asignacion ? JSON.stringify(metadatos_asignacion) : null,
            updated_by: userId
          });
        }

        asignacionesCreadas.push(asignacion);

        // Incrementar uso de la etiqueta
        await etiqueta.incrementarUso(empresaId);
      }

      res.json({
        success: true,
        message: 'Etiquetas asignadas exitosamente',
        data: {
          empresa_id: empresaId,
          etiquetas_asignadas: asignacionesCreadas.length,
          asignaciones: asignacionesCreadas
        }
      });
    } catch (error) {
      console.error('Error al asignar etiquetas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener etiquetas de una empresa
  static async getEtiquetasEmpresa(req, res) {
    try {
      const { empresaId } = req.params;
      const { 
        eventoId = null,
        soloVigentes = 'true',
        includeTemporales = 'true'
      } = req.query;

      const empresa = await EmpresaExpositora.findByPk(empresaId);
      if (!empresa) {
        return res.status(404).json({
          success: false,
          message: 'Empresa no encontrada'
        });
      }

      const whereCondition = {
        id_empresa: empresaId,
        deleted_at: null
      };

      if (eventoId) {
        whereCondition[Op.or] = [
          { id_evento_asignacion: eventoId },
          { es_solo_para_evento: false }
        ];
      }

      if (soloVigentes === 'true') {
        whereCondition.estado = 'activa';
      }

      const includeOptions = [
        {
          model: EtiquetaLibre,
          as: 'etiquetaLibre',
          where: includeTemporales === 'true' ? {} : { es_temporal: false }
        },
        {
          model: Usuario,
          as: 'validadaPorUsuario',
          attributes: ['id_usuario', 'nombre', 'correo']
        }
      ];

      if (eventoId) {
        includeOptions.push({
          model: Evento,
          as: 'eventoAsignacion',
          attributes: ['id_evento', 'nombre_evento'],
          required: false
        });
      }

      const etiquetas = await EmpresaEtiqueta.findAll({
        where: whereCondition,
        include: includeOptions,
        order: [
          ['relevancia', 'DESC'],
          ['fecha_asignacion', 'DESC']
        ]
      });

      // Filtrar solo etiquetas vigentes si se solicita
      const etiquetasFiltradas = soloVigentes === 'true' 
        ? etiquetas.filter(e => e.isVigente())
        : etiquetas;

      res.json({
        success: true,
        data: {
          empresa_id: empresaId,
          evento_id: eventoId,
          total_etiquetas: etiquetasFiltradas.length,
          etiquetas: etiquetasFiltradas
        }
      });
    } catch (error) {
      console.error('Error al obtener etiquetas de empresa:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Remover etiqueta de empresa
  static async removerEtiquetaEmpresa(req, res) {
    try {
      const { empresaId, etiquetaId } = req.params;
      const { eventoId = null } = req.query;
      const userId = req.user.id_usuario;

      const whereCondition = {
        id_empresa: empresaId,
        id_etiqueta: etiquetaId,
        deleted_at: null
      };

      if (eventoId) {
        whereCondition.id_evento_asignacion = eventoId;
      }

      const asignacion = await EmpresaEtiqueta.findOne({
        where: whereCondition
      });

      if (!asignacion) {
        return res.status(404).json({
          success: false,
          message: 'Asignación de etiqueta no encontrada'
        });
      }

      await asignacion.softDelete(userId);

      // Actualizar contadores de la etiqueta
      const etiqueta = await EtiquetaLibre.findByPk(etiquetaId);
      if (etiqueta) {
        await etiqueta.updateCounters();
      }

      res.json({
        success: true,
        message: 'Etiqueta removida exitosamente'
      });
    } catch (error) {
      console.error('Error al remover etiqueta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // ==================== BÚSQUEDA Y FILTRADO ====================

  // Buscar empresas por categorías
  static async buscarEmpresasPorCategorias(req, res) {
    try {
      const {
        categorias, // Array de IDs de categorías
        includeSubcategorias = 'true',
        operador = 'OR', // 'OR' | 'AND'
        page = 1,
        limit = 20,
        estado = 'aprobada'
      } = req.query;

      if (!categorias || !Array.isArray(JSON.parse(categorias))) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un array de categorías'
        });
      }

      const categoriasIds = JSON.parse(categorias);
      const offset = (page - 1) * limit;

      let empresaIds = [];

      if (operador === 'AND') {
        // Buscar empresas que tengan TODAS las categorías
        for (const categoriaId of categoriasIds) {
          const empresasConCategoria = await EmpresaCategoria.findAll({
            where: {
              id_categoria: categoriaId,
              deleted_at: null,
              estado: 'activa'
            },
            attributes: ['id_empresa']
          });

          const idsEmpresasConCategoria = empresasConCategoria.map(e => e.id_empresa);

          if (empresaIds.length === 0) {
            empresaIds = idsEmpresasConCategoria;
          } else {
            empresaIds = empresaIds.filter(id => idsEmpresasConCategoria.includes(id));
          }

          if (empresaIds.length === 0) break; // No hay empresas con todas las categorías
        }
      } else {
        // Buscar empresas que tengan CUALQUIERA de las categorías
        const empresasConCategorias = await EmpresaCategoria.findAll({
          where: {
            id_categoria: { [Op.in]: categoriasIds },
            deleted_at: null,
            estado: 'activa'
          },
          attributes: ['id_empresa']
        });

        empresaIds = [...new Set(empresasConCategorias.map(e => e.id_empresa))];
      }

      if (empresaIds.length === 0) {
        return res.json({
          success: true,
          data: {
            empresas: [],
            total: 0,
            pagination: {
              currentPage: parseInt(page),
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: parseInt(limit)
            }
          }
        });
      }

      // Obtener empresas con sus categorías
      const whereEmpresa = {
        id_empresa: { [Op.in]: empresaIds },
        deleted_at: null
      };

      if (estado !== 'todas') {
        whereEmpresa.estado = estado;
      }

      const empresas = await EmpresaExpositora.findAndCountAll({
        where: whereEmpresa,
        include: [
          {
            model: EmpresaCategoria,
            as: 'participaciones',
            where: { deleted_at: null },
            required: false,
            include: [{
              model: CategoriaComercial,
              as: 'categoriaComercial'
            }]
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      res.json({
        success: true,
        data: {
          empresas: empresas.rows,
          total: empresas.count,
          filtros_aplicados: {
            categorias: categoriasIds,
            operador,
            estado
          },
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(empresas.count / limit),
            totalItems: empresas.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error al buscar empresas por categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Buscar empresas por etiquetas
  static async buscarEmpresasPorEtiquetas(req, res) {
    try {
      const {
        etiquetas, // Array de IDs de etiquetas
        operador = 'OR', // 'OR' | 'AND'
        page = 1,
        limit = 20,
        estado = 'aprobada',
        eventoId = null
      } = req.query;

      if (!etiquetas || !Array.isArray(JSON.parse(etiquetas))) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un array de etiquetas'
        });
      }

      const etiquetasIds = JSON.parse(etiquetas);
      const offset = (page - 1) * limit;

      let empresaIds = [];
      const whereEtiqueta = {
        id_etiqueta: { [Op.in]: etiquetasIds },
        deleted_at: null,
        estado: 'activa'
      };

      if (eventoId) {
        whereEtiqueta[Op.or] = [
          { id_evento_asignacion: eventoId },
          { es_solo_para_evento: false }
        ];
      }

      if (operador === 'AND') {
        // Buscar empresas que tengan TODAS las etiquetas
        for (const etiquetaId of etiquetasIds) {
          const empresasConEtiqueta = await EmpresaEtiqueta.findAll({
            where: {
              ...whereEtiqueta,
              id_etiqueta: etiquetaId
            },
            attributes: ['id_empresa']
          });

          const idsEmpresasConEtiqueta = empresasConEtiqueta.map(e => e.id_empresa);

          if (empresaIds.length === 0) {
            empresaIds = idsEmpresasConEtiqueta;
          } else {
            empresaIds = empresaIds.filter(id => idsEmpresasConEtiqueta.includes(id));
          }

          if (empresaIds.length === 0) break;
        }
      } else {
        // Buscar empresas que tengan CUALQUIERA de las etiquetas
        const empresasConEtiquetas = await EmpresaEtiqueta.findAll({
          where: whereEtiqueta,
          attributes: ['id_empresa']
        });

        empresaIds = [...new Set(empresasConEtiquetas.map(e => e.id_empresa))];
      }

      if (empresaIds.length === 0) {
        return res.json({
          success: true,
          data: {
            empresas: [],
            total: 0,
            pagination: {
              currentPage: parseInt(page),
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: parseInt(limit)
            }
          }
        });
      }

      // Obtener empresas con sus etiquetas
      const whereEmpresa = {
        id_empresa: { [Op.in]: empresaIds },
        deleted_at: null
      };

      if (estado !== 'todas') {
        whereEmpresa.estado = estado;
      }

      const empresas = await EmpresaExpositora.findAndCountAll({
        where: whereEmpresa,
        include: [
          {
            model: EmpresaEtiqueta,
            as: 'participaciones',
            where: { deleted_at: null },
            required: false,
            include: [{
              model: EtiquetaLibre,
              as: 'etiquetaLibre'
            }]
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      res.json({
        success: true,
        data: {
          empresas: empresas.rows,
          total: empresas.count,
          filtros_aplicados: {
            etiquetas: etiquetasIds,
            operador,
            estado,
            evento_id: eventoId
          },
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(empresas.count / limit),
            totalItems: empresas.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error al buscar empresas por etiquetas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // ==================== DIRECTORIOS Y REPORTES ====================

  // Generar directorio temático por categoría
  static async generarDirectorioTematico(req, res) {
    try {
      const { categoriaId } = req.params;
      const { 
        includeSubcategorias = 'true',
        formato = 'json', // 'json' | 'csv'
        includeContactos = 'true'
      } = req.query;

      const categoria = await CategoriaComercial.findByPk(categoriaId);
      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      let categoriasIds = [categoriaId];

      if (includeSubcategorias === 'true') {
        const subcategorias = await CategoriaComercial.findAll({
          where: {
            id_categoria_padre: categoriaId,
            deleted_at: null,
            estado: 'activa'
          },
          attributes: ['id_categoria']
        });

        categoriasIds = categoriasIds.concat(subcategorias.map(s => s.id_categoria));
      }

      // Obtener empresas de estas categorías
      const empresasCategoria = await EmpresaCategoria.findAll({
        where: {
          id_categoria: { [Op.in]: categoriasIds },
          deleted_at: null,
          estado: 'activa'
        },
        include: [
          {
            model: EmpresaExpositora,
            as: 'empresaExpositora',
            where: { 
              deleted_at: null, 
              estado: 'aprobada' 
            }
          },
          {
            model: CategoriaComercial,
            as: 'categoriaComercial'
          }
        ],
        order: [
          ['es_categoria_principal', 'DESC'],
          [{ model: EmpresaExpositora, as: 'empresaExpositora' }, 'nombre_empresa', 'ASC']
        ]
      });

      const directorio = {
        categoria: {
          id: categoria.id_categoria,
          nombre: categoria.nombre_categoria,
          descripcion: categoria.descripcion
        },
        total_empresas: empresasCategoria.length,
        fecha_generacion: new Date(),
        empresas: empresasCategoria.map(ec => {
          const empresa = ec.empresaExpositora;
          const resultado = {
            id_empresa: empresa.id_empresa,
            nombre_empresa: empresa.nombre_empresa,
            descripcion: empresa.descripcion,
            sector: empresa.sector,
            sitio_web: empresa.sitio_web,
            categoria_asignada: {
              nombre: ec.categoriaComercial.nombre_categoria,
              es_principal: ec.es_categoria_principal,
              productos_principales: ec.productos_principales,
              servicios_principales: ec.servicios_principales
            }
          };

          if (includeContactos === 'true') {
            resultado.contacto = {
              email: empresa.email_contacto,
              telefono: empresa.telefono_contacto,
              nombre_contacto: empresa.nombre_contacto,
              cargo_contacto: empresa.cargo_contacto
            };
          }

          return resultado;
        })
      };

      if (formato === 'csv') {
        // Generar CSV (simplificado)
        let csv = 'Empresa,Sector,Categoría,Es Principal,Sitio Web';
        if (includeContactos === 'true') {
          csv += ',Email,Teléfono,Contacto';
        }
        csv += '\n';

        directorio.empresas.forEach(empresa => {
          csv += `"${empresa.nombre_empresa}","${empresa.sector || ''}","${empresa.categoria_asignada.nombre}","${empresa.categoria_asignada.es_principal ? 'Sí' : 'No'}","${empresa.sitio_web || ''}"`;
          if (includeContactos === 'true') {
            csv += `,"${empresa.contacto?.email || ''}","${empresa.contacto?.telefono || ''}","${empresa.contacto?.nombre_contacto || ''}"`;
          }
          csv += '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="directorio-${categoria.slug}.csv"`);
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: directorio
        });
      }
    } catch (error) {
      console.error('Error al generar directorio temático:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de clasificación
  static async getEstadisticasClasificacion(req, res) {
    try {
      const stats = {
        // Estadísticas generales
        total_empresas: await EmpresaExpositora.count({
          where: { deleted_at: null }
        }),
        empresas_clasificadas: await EmpresaExpositora.count({
          where: {
            deleted_at: null,
            id_empresa: {
              [Op.in]: await EmpresaCategoria.findAll({
                where: { deleted_at: null },
                attributes: ['id_empresa'],
                group: ['id_empresa']
              }).then(results => results.map(r => r.id_empresa))
            }
          }
        }),
        total_asignaciones_categoria: await EmpresaCategoria.count({
          where: { deleted_at: null }
        }),
        total_asignaciones_etiqueta: await EmpresaEtiqueta.count({
          where: { deleted_at: null }
        })
      };

      // Distribución por categorías principales
      const distribucionCategorias = await EmpresaCategoria.findAll({
        where: { 
          deleted_at: null,
          estado: 'activa'
        },
        include: [{
          model: CategoriaComercial,
          as: 'categoriaComercial',
          attributes: ['id_categoria', 'nombre_categoria']
        }],
        attributes: [
          'id_categoria',
          [EmpresaCategoria.sequelize.fn('COUNT', EmpresaCategoria.sequelize.col('id_empresa')), 'total_empresas']
        ],
        group: ['id_categoria', 'categoriaComercial.id_categoria'],
        order: [[EmpresaCategoria.sequelize.literal('total_empresas'), 'DESC']],
        limit: 10,
        raw: false
      });

      stats.top_categorias = distribucionCategorias;

      // Distribución por etiquetas más usadas
      const distribucionEtiquetas = await EtiquetaLibre.findAll({
        where: { 
          deleted_at: null,
          estado: 'activa',
          total_empresas: { [Op.gt]: 0 }
        },
        attributes: ['id_etiqueta', 'nombre_etiqueta', 'total_empresas', 'popularidad_score'],
        order: [['total_empresas', 'DESC']],
        limit: 10
      });

      stats.top_etiquetas = distribucionEtiquetas;

      // Empresas sin clasificar
      const empresasSinClasificar = await EmpresaExpositora.findAll({
        where: {
          deleted_at: null,
          estado: 'aprobada',
          id_empresa: {
            [Op.notIn]: await EmpresaCategoria.findAll({
              where: { deleted_at: null },
              attributes: ['id_empresa']
            }).then(results => results.map(r => r.id_empresa))
          }
        },
        attributes: ['id_empresa', 'nombre_empresa', 'sector'],
        limit: 5
      });

      stats.empresas_sin_clasificar = empresasSinClasificar;
      stats.porcentaje_clasificacion = Math.round((stats.empresas_clasificadas / stats.total_empresas) * 100);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de clasificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = ClasificacionExpositorController;
