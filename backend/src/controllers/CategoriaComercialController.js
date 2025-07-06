const { CategoriaComercial, EmpresaCategoria, EmpresaExpositora, Usuario } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

class CategoriaComercialController {
  // ==================== CRUD BÁSICO ====================

  // Obtener todas las categorías
  static async getAllCategorias(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        includeSubcategorias = 'true',
        includeInactivas = 'false',
        soloRaices = 'false',
        ordenPor = 'orden_visualizacion',
        direccion = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereCondition = {
        deleted_at: null
      };

      // Filtros
      if (includeInactivas === 'false') {
        whereCondition.estado = 'activa';
      }

      if (soloRaices === 'true') {
        whereCondition.id_categoria_padre = null;
      }

      const includeOptions = [
        {
          model: Usuario,
          as: 'createdByUser',
          attributes: ['id_usuario', 'nombre', 'correo']
        }
      ];

      if (includeSubcategorias === 'true') {
        includeOptions.push({
          model: CategoriaComercial,
          as: 'subcategorias',
          where: { deleted_at: null, estado: 'activa' },
          required: false,
          separate: true,
          order: [['orden_visualizacion', 'ASC']]
        });
      }

      const categorias = await CategoriaComercial.findAndCountAll({
        where: whereCondition,
        include: includeOptions,
        limit: parseInt(limit),
        offset: offset,
        order: [[ordenPor, direccion.toUpperCase()]],
        distinct: true
      });

      res.json({
        success: true,
        data: categorias.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(categorias.count / limit),
          totalItems: categorias.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener categoría por ID
  static async getCategoriaById(req, res) {
    try {
      const { id } = req.params;
      const { includeStats = 'true' } = req.query;

      const includeOptions = [
        {
          model: CategoriaComercial,
          as: 'categoriaPadre',
          attributes: ['id_categoria', 'nombre_categoria', 'slug']
        },
        {
          model: CategoriaComercial,
          as: 'subcategorias',
          where: { deleted_at: null },
          required: false,
          order: [['orden_visualizacion', 'ASC']]
        },
        {
          model: Usuario,
          as: 'createdByUser',
          attributes: ['id_usuario', 'nombre', 'email']
        }
      ];

      if (includeStats === 'true') {
        includeOptions.push({
          model: EmpresaCategoria,
          as: 'asignacionesEmpresa',
          where: { deleted_at: null, estado: 'activa' },
          required: false,
          include: [{
            model: EmpresaExpositora,
            as: 'empresaExpositora',
            attributes: ['id_empresa', 'nombre_empresa', 'estado'],
            where: { deleted_at: null }
          }]
        });
      }

      const categoria = await CategoriaComercial.findOne({
        where: {
          id_categoria: id,
          deleted_at: null
        },
        include: includeOptions
      });

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      res.json({
        success: true,
        data: categoria
      });
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nueva categoría
  static async createCategoria(req, res) {
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
        nombre_categoria,
        descripcion,
        id_categoria_padre,
        permite_expositores = true,
        icono,
        color_hex,
        imagen_url,
        es_destacada = false,
        orden_visualizacion = 0,
        sugerencia_ubicacion_stand,
        requiere_servicios_especiales,
        palabras_clave,
        meta_descripcion
      } = req.body;

      const userId = req.user.id_usuario;

      // Generar slug automáticamente
      const baseSlug = nombre_categoria
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      let slug = baseSlug;
      let counter = 1;

      // Verificar que el slug sea único
      while (await CategoriaComercial.findOne({ where: { slug, deleted_at: null } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Calcular nivel de jerarquía
      let nivel_jerarquia = 1;
      let ruta_jerarquia = nombre_categoria;

      if (id_categoria_padre) {
        const categoriaPadre = await CategoriaComercial.findByPk(id_categoria_padre);
        if (!categoriaPadre) {
          return res.status(400).json({
            success: false,
            message: 'Categoría padre no encontrada'
          });
        }
        nivel_jerarquia = categoriaPadre.nivel_jerarquia + 1;
        ruta_jerarquia = `${categoriaPadre.ruta_jerarquia}/${nombre_categoria}`;
      }

      const nuevaCategoria = await CategoriaComercial.create({
        nombre_categoria,
        slug,
        descripcion,
        id_categoria_padre,
        nivel_jerarquia,
        ruta_jerarquia,
        permite_expositores,
        icono,
        color_hex,
        imagen_url,
        es_destacada,
        orden_visualizacion,
        sugerencia_ubicacion_stand,
        requiere_servicios_especiales,
        palabras_clave,
        meta_descripcion,
        created_by: userId
      });

      // Actualizar contador de subcategorías del padre
      if (id_categoria_padre) {
        const categoriaPadre = await CategoriaComercial.findByPk(id_categoria_padre);
        await categoriaPadre.updateCounters();
      }

      const categoriaCompleta = await CategoriaComercial.findByPk(nuevaCategoria.id_categoria, {
        include: [
          {
            model: CategoriaComercial,
            as: 'categoriaPadre',
            attributes: ['id_categoria', 'nombre_categoria', 'slug']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Categoría creada exitosamente',
        data: categoriaCompleta
      });
    } catch (error) {
      console.error('Error al crear categoría:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una categoría con ese nombre o slug'
        });
      }
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar categoría
  static async updateCategoria(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id_usuario;

      const categoria = await CategoriaComercial.findOne({
        where: {
          id_categoria: id,
          deleted_at: null
        }
      });

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      const datosActualizacion = { ...req.body };
      delete datosActualizacion.id_categoria;
      delete datosActualizacion.slug; // El slug no se actualiza manualmente
      datosActualizacion.updated_by = userId;

      // Si cambia el nombre, regenerar slug
      if (datosActualizacion.nombre_categoria && datosActualizacion.nombre_categoria !== categoria.nombre_categoria) {
        const baseSlug = datosActualizacion.nombre_categoria
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

        let newSlug = baseSlug;
        let counter = 1;

        while (await CategoriaComercial.findOne({ 
          where: { 
            slug: newSlug, 
            deleted_at: null,
            id_categoria: { [Op.ne]: id }
          } 
        })) {
          newSlug = `${baseSlug}-${counter}`;
          counter++;
        }

        datosActualizacion.slug = newSlug;
      }

      await categoria.update(datosActualizacion);

      // Si cambió la jerarquía, actualizar rutas
      if (datosActualizacion.id_categoria_padre !== undefined) {
        await categoria.updateHierarchyPath();
      }

      const categoriaActualizada = await CategoriaComercial.findByPk(id, {
        include: [
          {
            model: CategoriaComercial,
            as: 'categoriaPadre',
            attributes: ['id_categoria', 'nombre_categoria', 'slug']
          },
          {
            model: CategoriaComercial,
            as: 'subcategorias',
            where: { deleted_at: null },
            required: false
          }
        ]
      });

      res.json({
        success: true,
        message: 'Categoría actualizada exitosamente',
        data: categoriaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar categoría (soft delete)
  static async deleteCategoria(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id_usuario;

      const categoria = await CategoriaComercial.findOne({
        where: {
          id_categoria: id,
          deleted_at: null
        }
      });

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      // Verificar si tiene subcategorías activas
      const subcategoriasActivas = await CategoriaComercial.count({
        where: {
          id_categoria_padre: id,
          deleted_at: null,
          estado: 'activa'
        }
      });

      if (subcategoriasActivas > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la categoría porque tiene subcategorías activas',
          subcategoriasActivas
        });
      }

      // Verificar si tiene empresas asignadas
      const empresasAsignadas = await EmpresaCategoria.count({
        where: {
          id_categoria: id,
          deleted_at: null,
          estado: 'activa'
        }
      });

      if (empresasAsignadas > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la categoría porque tiene empresas asignadas',
          empresasAsignadas
        });
      }

      await categoria.softDelete(userId);

      res.json({
        success: true,
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // ==================== FUNCIONES ESPECIALES ====================

  // Obtener árbol jerárquico completo
  static async getArbolJerarquico(req, res) {
    try {
      const { includeInactivas = 'false' } = req.query;

      const whereCondition = {
        deleted_at: null,
        id_categoria_padre: null // Solo categorías raíz
      };

      if (includeInactivas === 'false') {
        whereCondition.estado = 'activa';
      }

      const buildTree = async (categorias) => {
        for (let categoria of categorias) {
          const subcategorias = await CategoriaComercial.findAll({
            where: {
              id_categoria_padre: categoria.id_categoria,
              deleted_at: null,
              ...(includeInactivas === 'false' && { estado: 'activa' })
            },
            order: [['orden_visualizacion', 'ASC']]
          });

          if (subcategorias.length > 0) {
            categoria.dataValues.subcategorias = await buildTree(subcategorias);
          } else {
            categoria.dataValues.subcategorias = [];
          }
        }
        return categorias;
      };

      const categoriasRaiz = await CategoriaComercial.findAll({
        where: whereCondition,
        order: [['orden_visualizacion', 'ASC']]
      });

      const arbol = await buildTree(categoriasRaiz);

      res.json({
        success: true,
        data: arbol
      });
    } catch (error) {
      console.error('Error al obtener árbol jerárquico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener categorías destacadas
  static async getCategoriasDestacadas(req, res) {
    try {
      const { limit = 10 } = req.query;

      const categorias = await CategoriaComercial.findAll({
        where: {
          deleted_at: null,
          estado: 'activa',
          es_destacada: true
        },
        order: [
          ['total_expositores', 'DESC'],
          ['orden_visualizacion', 'ASC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Error al obtener categorías destacadas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Buscar categorías
  static async buscarCategorias(req, res) {
    try {
      const { 
        q,
        tipo = 'todos', // 'todos', 'principales', 'subcategorias'
        limit = 20 
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
        [Op.or]: [
          { nombre_categoria: { [Op.like]: `%${q}%` } },
          { descripcion: { [Op.like]: `%${q}%` } },
          { palabras_clave: { [Op.like]: `%${q}%` } }
        ]
      };

      if (tipo === 'principales') {
        whereCondition.id_categoria_padre = null;
      } else if (tipo === 'subcategorias') {
        whereCondition.id_categoria_padre = { [Op.ne]: null };
      }

      const categorias = await CategoriaComercial.findAll({
        where: whereCondition,
        include: [
          {
            model: CategoriaComercial,
            as: 'categoriaPadre',
            attributes: ['id_categoria', 'nombre_categoria']
          }
        ],
        order: [
          ['es_destacada', 'DESC'],
          ['total_expositores', 'DESC'],
          ['nombre_categoria', 'ASC']
        ],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: categorias,
        total: categorias.length
      });
    } catch (error) {
      console.error('Error al buscar categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas de categorías
  static async getEstadisticasCategorias(req, res) {
    try {
      const stats = {
        totalCategorias: await CategoriaComercial.count({
          where: { deleted_at: null }
        }),
        categoriasActivas: await CategoriaComercial.count({
          where: { deleted_at: null, estado: 'activa' }
        }),
        categoriasDestacadas: await CategoriaComercial.count({
          where: { deleted_at: null, estado: 'activa', es_destacada: true }
        }),
        categoriasPrincipales: await CategoriaComercial.count({
          where: { deleted_at: null, estado: 'activa', id_categoria_padre: null }
        }),
        subcategorias: await CategoriaComercial.count({
          where: { deleted_at: null, estado: 'activa', id_categoria_padre: { [Op.ne]: null } }
        })
      };

      // Top 5 categorías con más expositores
      const topCategorias = await CategoriaComercial.findAll({
        where: {
          deleted_at: null,
          estado: 'activa',
          total_expositores: { [Op.gt]: 0 }
        },
        order: [['total_expositores', 'DESC']],
        limit: 5,
        attributes: ['id_categoria', 'nombre_categoria', 'total_expositores']
      });

      stats.topCategoriasPorExpositores = topCategorias;

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

  // Actualizar contadores de una categoría
  static async actualizarContadores(req, res) {
    try {
      const { id } = req.params;

      const categoria = await CategoriaComercial.findOne({
        where: {
          id_categoria: id,
          deleted_at: null
        }
      });

      if (!categoria) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada'
        });
      }

      await categoria.updateCounters();

      res.json({
        success: true,
        message: 'Contadores actualizados exitosamente',
        data: {
          id_categoria: categoria.id_categoria,
          total_expositores: categoria.total_expositores,
          total_subcategorias: categoria.total_subcategorias
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
}

module.exports = CategoriaComercialController;
