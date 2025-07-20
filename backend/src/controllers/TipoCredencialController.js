const { TipoCredencial } = require('../models');
const { Op } = require('sequelize');

class TipoCredencialController {

  /**
   * Crear nuevo tipo de credencial
   */
  static async crear(req, res) {
    try {
      const datosTipo = req.body;
      const userId = req.user?.id_usuario;

      // Validaciones básicas
      if (!datosTipo.nombre_tipo) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del tipo de credencial es requerido'
        });
      }

      // Verificar que no exista otro tipo con el mismo nombre
      const tipoExistente = await TipoCredencial.findOne({
        where: {
          nombre_tipo: datosTipo.nombre_tipo,
          deleted_at: null
        }
      });

      if (tipoExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un tipo de credencial con ese nombre'
        });
      }

      const nuevoTipo = await TipoCredencial.create({
        ...datosTipo,
        created_by: userId
      });

      res.status(201).json({
        success: true,
        message: 'Tipo de credencial creado exitosamente',
        data: nuevoTipo
      });

    } catch (error) {
      console.error('Error al crear tipo de credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Listar tipos de credencial
   */
  static async listar(req, res) {
    try {
      console.log('🔍 TipoCredencialController.listar called');
      const {
        page = 1,
        limit = 10,
        search,
        nivel_acceso,
        activo,
        es_imprimible
      } = req.query;

      const where = { deleted_at: null };

      // Aplicar filtros
      if (search) {
        where[Op.or] = [
          { nombre_tipo: { [Op.like]: `%${search}%` } },
          { descripcion: { [Op.like]: `%${search}%` } }
        ];
      }

      if (nivel_acceso) where.nivel_acceso = nivel_acceso;
      if (activo !== undefined) where.activo = activo === 'true';
      if (es_imprimible !== undefined) where.es_imprimible = es_imprimible === 'true';

      const offset = (page - 1) * limit;

      const { count, rows: tipos } = await TipoCredencial.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: offset,
        order: [['nombre_tipo', 'ASC']]
      });

      console.log(`📊 Found ${count} tipos, returning ${tipos.length} rows`);

      res.status(200).json({
        success: true,
        data: tipos,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error al listar tipos de credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener tipo de credencial por ID
   */
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const tipo = await TipoCredencial.findByPk(id);

      if (!tipo || tipo.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: tipo
      });

    } catch (error) {
      console.error('Error al obtener tipo de credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar tipo de credencial
   */
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;
      const userId = req.user?.id_usuario;

      const tipo = await TipoCredencial.findByPk(id);

      if (!tipo || tipo.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial no encontrado'
        });
      }

      // Si se está cambiando el nombre, verificar que no exista otro con el mismo nombre
      if (datosActualizacion.nombre_tipo && datosActualizacion.nombre_tipo !== tipo.nombre_tipo) {
        const tipoExistente = await TipoCredencial.findOne({
          where: {
            nombre_tipo: datosActualizacion.nombre_tipo,
            id_tipo_credencial: { [Op.ne]: id },
            deleted_at: null
          }
        });

        if (tipoExistente) {
          return res.status(409).json({
            success: false,
            message: 'Ya existe un tipo de credencial con ese nombre'
          });
        }
      }

      await tipo.update({
        ...datosActualizacion,
        updated_by: userId
      });

      res.status(200).json({
        success: true,
        message: 'Tipo de credencial actualizado exitosamente',
        data: tipo
      });

    } catch (error) {
      console.error('Error al actualizar tipo de credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar tipo de credencial (soft delete)
   */
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const tipo = await TipoCredencial.findByPk(id);

      if (!tipo || tipo.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial no encontrado'
        });
      }

      // Verificar si hay credenciales usando este tipo
      const { Credencial } = require('../models');
      const credencialesAsociadas = await Credencial.count({
        where: {
          id_tipo_credencial: id,
          deleted_at: null
        }
      });

      if (credencialesAsociadas > 0) {
        return res.status(409).json({
          success: false,
          message: `No se puede eliminar el tipo porque tiene ${credencialesAsociadas} credenciales asociadas`
        });
      }

      await tipo.softDelete(userId);

      res.status(200).json({
        success: true,
        message: 'Tipo de credencial eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar tipo de credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Activar/Desactivar tipo de credencial
   */
  static async toggleActivo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const tipo = await TipoCredencial.findByPk(id);

      if (!tipo || tipo.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial no encontrado'
        });
      }

      await tipo.update({
        activo: !tipo.activo,
        updated_by: userId
      });

      res.status(200).json({
        success: true,
        message: `Tipo de credencial ${tipo.activo ? 'activado' : 'desactivado'} exitosamente`,
        data: tipo
      });

    } catch (error) {
      console.error('Error al cambiar estado del tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener tipos activos para formularios
   */
  static async obtenerActivos(req, res) {
    try {
      const tipos = await TipoCredencial.findAll({
        where: {
          activo: true,
          deleted_at: null
        },
        attributes: ['id_tipo_credencial', 'nombre_tipo', 'descripcion', 'color_identificacion', 'nivel_acceso'],
        order: [['nombre_tipo', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: tipos
      });

    } catch (error) {
      console.error('Error al obtener tipos activos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener configuración de accesos por tipo
   */
  static async obtenerConfiguracionAccesos(req, res) {
    try {
      const { id } = req.params;

      const tipo = await TipoCredencial.findByPk(id);

      if (!tipo || tipo.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial no encontrado'
        });
      }

      // Obtener accesos por defecto basados en el tipo
      const CredencialService = require('../services/CredencialService');
      const accesosPorDefecto = CredencialService.getAccesosPorTipo(tipo.nombre_tipo);

      res.status(200).json({
        success: true,
        data: {
          tipo_credencial: tipo,
          accesos_por_defecto: accesosPorDefecto,
          configuracion_accesos: tipo.configuracion_accesos || {}
        }
      });

    } catch (error) {
      console.error('Error al obtener configuración de accesos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar configuración de accesos
   */
  static async actualizarConfiguracionAccesos(req, res) {
    try {
      const { id } = req.params;
      const { configuracion_accesos } = req.body;
      const userId = req.user?.id_usuario;

      const tipo = await TipoCredencial.findByPk(id);

      if (!tipo || tipo.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial no encontrado'
        });
      }

      await tipo.update({
        configuracion_accesos,
        updated_by: userId
      });

      res.status(200).json({
        success: true,
        message: 'Configuración de accesos actualizada exitosamente',
        data: tipo
      });

    } catch (error) {
      console.error('Error al actualizar configuración de accesos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Duplicar tipo de credencial
   */
  static async duplicar(req, res) {
    try {
      const { id } = req.params;
      const { nuevo_nombre } = req.body;
      const userId = req.user?.id_usuario;

      if (!nuevo_nombre) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere especificar el nuevo nombre'
        });
      }

      const tipoOriginal = await TipoCredencial.findByPk(id);

      if (!tipoOriginal || tipoOriginal.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial original no encontrado'
        });
      }

      // Verificar que no exista otro tipo con el nuevo nombre
      const tipoExistente = await TipoCredencial.findOne({
        where: {
          nombre_tipo: nuevo_nombre,
          deleted_at: null
        }
      });

      if (tipoExistente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un tipo de credencial con ese nombre'
        });
      }

      const nuevoTipo = await TipoCredencial.create({
        nombre_tipo: nuevo_nombre,
        descripcion: tipoOriginal.descripcion,
        color_identificacion: tipoOriginal.color_identificacion,
        nivel_acceso: tipoOriginal.nivel_acceso,
        es_imprimible: tipoOriginal.es_imprimible,
        requiere_aprobacion: tipoOriginal.requiere_aprobacion,
        duracion_validez_horas: tipoOriginal.duracion_validez_horas,
        permite_reingreso: tipoOriginal.permite_reingreso,
        configuracion_accesos: tipoOriginal.configuracion_accesos,
        activo: true,
        created_by: userId
      });

      res.status(201).json({
        success: true,
        message: 'Tipo de credencial duplicado exitosamente',
        data: nuevoTipo
      });

    } catch (error) {
      console.error('Error al duplicar tipo de credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de uso por tipo
   */
  static async obtenerEstadisticasUso(req, res) {
    try {
      const { id } = req.params;

      const tipo = await TipoCredencial.findByPk(id);

      if (!tipo || tipo.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial no encontrado'
        });
      }

      const { Credencial } = require('../models');
      const { sequelize } = require('sequelize');

      // Estadísticas generales
      const totalCredenciales = await Credencial.count({
        where: {
          id_tipo_credencial: id,
          deleted_at: null
        }
      });

      // Por estado
      const porEstado = await Credencial.findAll({
        where: {
          id_tipo_credencial: id,
          deleted_at: null
        },
        attributes: [
          'estado',
          [sequelize.fn('COUNT', '*'), 'total']
        ],
        group: ['estado'],
        raw: true
      });

      // Credenciales creadas por mes (últimos 6 meses)
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - 6);

      const porMes = await Credencial.findAll({
        where: {
          id_tipo_credencial: id,
          deleted_at: null,
          created_at: { [Op.gte]: fechaLimite }
        },
        attributes: [
          [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'mes'],
          [sequelize.fn('COUNT', '*'), 'total']
        ],
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          tipo_credencial: tipo,
          total_credenciales: totalCredenciales,
          por_estado: porEstado,
          por_mes: porMes
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas de uso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener niveles de acceso disponibles
   */
  static async obtenerNivelesAcceso(req, res) {
    try {
      const nivelesAcceso = [
        {
          valor: 'basico',
          nombre: 'Básico',
          descripcion: 'Acceso limitado a áreas públicas'
        },
        {
          valor: 'intermedio',
          nombre: 'Intermedio',
          descripcion: 'Acceso a áreas públicas y algunas restringidas'
        },
        {
          valor: 'avanzado',
          nombre: 'Avanzado',
          descripcion: 'Acceso amplio con algunas restricciones'
        },
        {
          valor: 'total',
          nombre: 'Total',
          descripcion: 'Acceso completo a todas las áreas'
        }
      ];

      res.status(200).json({
        success: true,
        data: nivelesAcceso
      });

    } catch (error) {
      console.error('Error al obtener niveles de acceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = TipoCredencialController;