const { PlantillaCredencial, TipoCredencial } = require('../models');
const TemplateService = require('../services/TemplateService');
const { Op } = require('sequelize');

class PlantillaCredencialController {

  /**
   * Crear nueva plantilla de credencial
   */
  static async crear(req, res) {
    try {
      const datosPlantilla = req.body;
      const userId = req.user?.id_usuario;

      // Validaciones básicas
      if (!datosPlantilla.nombre_plantilla || !datosPlantilla.id_tipo_credencial || !datosPlantilla.diseño_html) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: nombre_plantilla, id_tipo_credencial, diseño_html'
        });
      }

      // Validar que el tipo de credencial existe
      const tipoCredencial = await TipoCredencial.findByPk(datosPlantilla.id_tipo_credencial);
      if (!tipoCredencial || tipoCredencial.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de credencial no encontrado'
        });
      }

      // Validar template HTML
      const validacionTemplate = TemplateService.validateTemplate(datosPlantilla.diseño_html);
      if (!validacionTemplate.valid) {
        return res.status(400).json({
          success: false,
          message: 'Template HTML inválido',
          error: validacionTemplate.error
        });
      }

      // Verificar si se debe marcar como plantilla por defecto
      if (datosPlantilla.es_plantilla_default) {
        // Desmarcar otras plantillas por defecto del mismo tipo
        await PlantillaCredencial.update(
          { es_plantilla_default: false },
          {
            where: {
              id_tipo_credencial: datosPlantilla.id_tipo_credencial,
              deleted_at: null
            }
          }
        );
      }

      const nuevaPlantilla = await PlantillaCredencial.create({
        ...datosPlantilla,
        created_by: userId,
        variables_disponibles: TemplateService.getAvailableVariables()
      });

      res.status(201).json({
        success: true,
        message: 'Plantilla creada exitosamente',
        data: nuevaPlantilla
      });

    } catch (error) {
      console.error('Error al crear plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Listar plantillas con filtros
   */
  static async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        id_tipo_credencial,
        id_tipo_evento,
        activa,
        es_plantilla_default
      } = req.query;

      const where = { deleted_at: null };

      // Aplicar filtros
      if (search) {
        where[Op.or] = [
          { nombre_plantilla: { [Op.like]: `%${search}%` } }
        ];
      }

      if (id_tipo_credencial) where.id_tipo_credencial = id_tipo_credencial;
      if (id_tipo_evento) where.id_tipo_evento = id_tipo_evento;
      if (activa !== undefined) where.activa = activa === 'true';
      if (es_plantilla_default !== undefined) where.es_plantilla_default = es_plantilla_default === 'true';

      const offset = (page - 1) * limit;

      const { count, rows: plantillas } = await PlantillaCredencial.findAndCountAll({
        where,
        include: [
          {
            model: TipoCredencial,
            as: 'tipoCredencial',
            attributes: ['id_tipo_credencial', 'nombre_tipo', 'color_identificacion']
          }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [['nombre_plantilla', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: plantillas,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error al listar plantillas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener plantilla por ID
   */
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const plantilla = await PlantillaCredencial.findByPk(id, {
        include: [
          {
            model: TipoCredencial,
            as: 'tipoCredencial'
          }
        ]
      });

      if (!plantilla || plantilla.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: plantilla
      });

    } catch (error) {
      console.error('Error al obtener plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar plantilla
   */
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;
      const userId = req.user?.id_usuario;

      const plantilla = await PlantillaCredencial.findByPk(id);

      if (!plantilla || plantilla.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla no encontrada'
        });
      }

      // Validar template HTML si se está actualizando
      if (datosActualizacion.diseño_html) {
        const validacionTemplate = TemplateService.validateTemplate(datosActualizacion.diseño_html);
        if (!validacionTemplate.valid) {
          return res.status(400).json({
            success: false,
            message: 'Template HTML inválido',
            error: validacionTemplate.error
          });
        }
      }

      // Manejar plantilla por defecto
      if (datosActualizacion.es_plantilla_default && !plantilla.es_plantilla_default) {
        await PlantillaCredencial.update(
          { es_plantilla_default: false },
          {
            where: {
              id_tipo_credencial: plantilla.id_tipo_credencial,
              id_plantilla: { [Op.ne]: id },
              deleted_at: null
            }
          }
        );
      }

      await plantilla.update({
        ...datosActualizacion,
        updated_by: userId,
        version: this.incrementarVersion(plantilla.version)
      });

      res.status(200).json({
        success: true,
        message: 'Plantilla actualizada exitosamente',
        data: plantilla
      });

    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar plantilla (soft delete)
   */
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const plantilla = await PlantillaCredencial.findByPk(id);

      if (!plantilla || plantilla.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla no encontrada'
        });
      }

      // Verificar si hay credenciales usando esta plantilla
      const { Credencial } = require('../models');
      const credencialesAsociadas = await Credencial.count({
        where: {
          id_plantilla: id,
          deleted_at: null
        }
      });

      if (credencialesAsociadas > 0) {
        return res.status(409).json({
          success: false,
          message: `No se puede eliminar la plantilla porque tiene ${credencialesAsociadas} credenciales asociadas`
        });
      }

      await plantilla.softDelete(userId);

      res.status(200).json({
        success: true,
        message: 'Plantilla eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Clonar plantilla
   */
  static async clonar(req, res) {
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

      const plantillaOriginal = await PlantillaCredencial.findByPk(id);

      if (!plantillaOriginal || plantillaOriginal.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla original no encontrada'
        });
      }

      const plantillaClonada = await plantillaOriginal.clonar(nuevo_nombre, userId);

      res.status(201).json({
        success: true,
        message: 'Plantilla clonada exitosamente',
        data: plantillaClonada
      });

    } catch (error) {
      console.error('Error al clonar plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Generar preview de plantilla
   */
  static async generarPreview(req, res) {
    try {
      const { id } = req.params;
      const datosEjemplo = req.body.datos_ejemplo || null;

      const plantilla = await PlantillaCredencial.findByPk(id);

      if (!plantilla || plantilla.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla no encontrada'
        });
      }

      const preview = TemplateService.generatePreview(plantilla, datosEjemplo);

      res.status(200).json({
        success: true,
        data: preview
      });

    } catch (error) {
      console.error('Error al generar preview:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Generar preview HTML completo
   */
  static async generarPreviewHTML(req, res) {
    try {
      const { id } = req.params;
      const datosEjemplo = req.body.datos_ejemplo || null;

      const plantilla = await PlantillaCredencial.findByPk(id);

      if (!plantilla || plantilla.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla no encontrada'
        });
      }

      const preview = TemplateService.generatePreview(plantilla, datosEjemplo);

      res.setHeader('Content-Type', 'text/html');
      res.send(preview.fullHTML);

    } catch (error) {
      console.error('Error al generar preview HTML:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener plantillas por tipo de credencial
   */
  static async obtenerPorTipo(req, res) {
    try {
      const { id_tipo_credencial } = req.params;
      const { activas_solo = 'true' } = req.query;

      const where = {
        id_tipo_credencial,
        deleted_at: null
      };

      if (activas_solo === 'true') {
        where.activa = true;
      }

      const plantillas = await PlantillaCredencial.findAll({
        where,
        attributes: ['id_plantilla', 'nombre_plantilla', 'es_plantilla_default', 'activa', 'version'],
        order: [['es_plantilla_default', 'DESC'], ['nombre_plantilla', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: plantillas
      });

    } catch (error) {
      console.error('Error al obtener plantillas por tipo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Establecer como plantilla por defecto
   */
  static async establecerComoDefecto(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const plantilla = await PlantillaCredencial.findByPk(id);

      if (!plantilla || plantilla.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla no encontrada'
        });
      }

      // Desmarcar otras plantillas por defecto del mismo tipo
      await PlantillaCredencial.update(
        { es_plantilla_default: false },
        {
          where: {
            id_tipo_credencial: plantilla.id_tipo_credencial,
            id_plantilla: { [Op.ne]: id },
            deleted_at: null
          }
        }
      );

      // Marcar esta como por defecto
      await plantilla.update({
        es_plantilla_default: true,
        updated_by: userId
      });

      res.status(200).json({
        success: true,
        message: 'Plantilla establecida como por defecto',
        data: plantilla
      });

    } catch (error) {
      console.error('Error al establecer plantilla por defecto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Activar/Desactivar plantilla
   */
  static async toggleActiva(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const plantilla = await PlantillaCredencial.findByPk(id);

      if (!plantilla || plantilla.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla no encontrada'
        });
      }

      await plantilla.update({
        activa: !plantilla.activa,
        updated_by: userId
      });

      res.status(200).json({
        success: true,
        message: `Plantilla ${plantilla.activa ? 'activada' : 'desactivada'} exitosamente`,
        data: plantilla
      });

    } catch (error) {
      console.error('Error al cambiar estado de plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener variables disponibles para templates
   */
  static async obtenerVariablesDisponibles(req, res) {
    try {
      const variables = TemplateService.getAvailableVariables();

      res.status(200).json({
        success: true,
        data: variables
      });

    } catch (error) {
      console.error('Error al obtener variables disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener templates predefinidos por tipo
   */
  static async obtenerTemplatesPredefinidos(req, res) {
    try {
      const { tipo } = req.params;

      const templates = {
        'visitante': {
          html: TemplateService.getVisitanteTemplate(),
          css: TemplateService.getDefaultCSS()
        },
        'expositor': {
          html: TemplateService.getExpositorTemplate(),
          css: TemplateService.getDefaultCSS()
        },
        'personal': {
          html: TemplateService.getPersonalTemplate(),
          css: TemplateService.getDefaultCSS()
        },
        'prensa': {
          html: TemplateService.getPrensaTemplate(),
          css: TemplateService.getDefaultCSS()
        },
        'vip': {
          html: TemplateService.getVIPTemplate(),
          css: TemplateService.getDefaultCSS()
        },
        'default': {
          html: TemplateService.getDefaultTemplate(),
          css: TemplateService.getDefaultCSS()
        }
      };

      const template = templates[tipo.toLowerCase()] || templates['default'];

      res.status(200).json({
        success: true,
        data: template
      });

    } catch (error) {
      console.error('Error al obtener template predefinido:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Validar template HTML
   */
  static async validarTemplate(req, res) {
    try {
      const { template_html } = req.body;

      if (!template_html) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el HTML del template'
        });
      }

      const validacion = TemplateService.validateTemplate(template_html);

      res.status(200).json({
        success: true,
        data: validacion
      });

    } catch (error) {
      console.error('Error al validar template:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Incrementar versión de plantilla
   */
  static incrementarVersion(versionActual) {
    const [mayor, menor] = (versionActual || '1.0').split('.').map(Number);
    return `${mayor}.${menor + 1}`;
  }
}

module.exports = PlantillaCredencialController;