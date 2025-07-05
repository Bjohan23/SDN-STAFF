const { Op } = require('sequelize');
const { 
  Actividad, 
  TrackTematico, 
  Ponente, 
  ActividadPonente, 
  ActividadRecurso, 
  Recurso, 
  SalaVirtual, 
  InscripcionActividad,
  Evento 
} = require('../models');
const ConflictDetectionService = require('../services/ConflictDetectionService');
const SchedulingService = require('../services/SchedulingService');

class ActividadController {

  /**
   * Obtener todas las actividades con filtros
   */
  static async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        id_evento,
        id_track,
        tipo_actividad,
        modalidad,
        estado,
        es_publica,
        fecha_inicio,
        fecha_fin,
        search,
        incluir_ponentes = 'true',
        incluir_recursos = 'false',
        incluir_inscripciones = 'false'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereCondition = { deleted_at: null };

      // Aplicar filtros
      if (id_evento) whereCondition.id_evento = id_evento;
      if (id_track) whereCondition.id_track = id_track;
      if (tipo_actividad) whereCondition.tipo_actividad = tipo_actividad;
      if (modalidad) whereCondition.modalidad = modalidad;
      if (estado) whereCondition.estado = estado;
      if (es_publica !== undefined) whereCondition.es_publica = es_publica === 'true';

      // Filtros de fecha
      if (fecha_inicio && fecha_fin) {
        whereCondition.fecha_inicio = {
          [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
        };
      } else if (fecha_inicio) {
        whereCondition.fecha_inicio = { [Op.gte]: new Date(fecha_inicio) };
      } else if (fecha_fin) {
        whereCondition.fecha_inicio = { [Op.lte]: new Date(fecha_fin) };
      }

      // Búsqueda por texto
      if (search) {
        whereCondition[Op.or] = [
          { titulo: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } },
          { descripcion_corta: { [Op.iLike]: `%${search}%` } }
        ];
      }

      // Configurar includes
      const include = [
        {
          model: TrackTematico,
          as: 'track',
          attributes: ['id_track', 'nombre_track', 'color_hex']
        },
        {
          model: SalaVirtual,
          as: 'salaVirtual',
          attributes: ['id_sala_virtual', 'nombre_sala', 'plataforma', 'url_acceso']
        },
        {
          model: Evento,
          as: 'evento',
          attributes: ['id_evento', 'nombre_evento', 'fecha_inicio', 'fecha_fin']
        }
      ];

      if (incluir_ponentes === 'true') {
        include.push({
          model: ActividadPonente,
          as: 'asignacionesPonente',
          include: [{
            model: Ponente,
            as: 'ponente',
            attributes: ['id_ponente', 'nombre_completo', 'titulo_profesional', 'foto_url']
          }]
        });
      }

      if (incluir_recursos === 'true') {
        include.push({
          model: ActividadRecurso,
          as: 'asignacionesRecurso',
          include: [{
            model: Recurso,
            as: 'recurso',
            attributes: ['id_recurso', 'nombre_recurso', 'tipo_recurso']
          }]
        });
      }

      if (incluir_inscripciones === 'true') {
        include.push({
          model: InscripcionActividad,
          as: 'inscripciones',
          where: { deleted_at: null },
          required: false,
          attributes: ['id_inscripcion', 'estado', 'modalidad_participacion']
        });
      }

      const { count, rows: actividades } = await Actividad.findAndCountAll({
        where: whereCondition,
        include: include,
        limit: parseInt(limit),
        offset: offset,
        order: [['fecha_inicio', 'ASC'], ['created_at', 'DESC']],
        distinct: true
      });

      res.status(200).json({
        success: true,
        data: actividades,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error al listar actividades:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener una actividad por ID
   */
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const actividad = await Actividad.findByPk(id, {
        include: [
          { model: TrackTematico, as: 'track' },
          { model: SalaVirtual, as: 'salaVirtual' },
          { model: Evento, as: 'evento' },
          {
            model: ActividadPonente,
            as: 'asignacionesPonente',
            include: [{ model: Ponente, as: 'ponente' }]
          },
          {
            model: ActividadRecurso,
            as: 'asignacionesRecurso',
            include: [{ model: Recurso, as: 'recurso' }]
          },
          {
            model: InscripcionActividad,
            as: 'inscripciones',
            where: { deleted_at: null },
            required: false
          }
        ]
      });

      if (!actividad || actividad.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Actividad no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: actividad
      });

    } catch (error) {
      console.error('Error al obtener actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear nueva actividad
   */
  static async crear(req, res) {
    try {
      const {
        id_evento,
        titulo,
        tipo_actividad,
        modalidad,
        ...otrosDatos
      } = req.body;

      // Validaciones básicas
      if (!titulo || !id_evento || !tipo_actividad || !modalidad) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos faltantes',
          campos_requeridos: ['titulo', 'id_evento', 'tipo_actividad', 'modalidad']
        });
      }

      // Generar slug único
      const baseSlug = titulo.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      let slug = baseSlug;
      let contador = 1;
      
      while (await Actividad.findOne({ 
        where: { 
          id_evento, 
          slug, 
          deleted_at: null 
        } 
      })) {
        slug = `${baseSlug}-${contador}`;
        contador++;
      }

      const nuevaActividad = await Actividad.create({
        id_evento,
        titulo,
        slug,
        tipo_actividad,
        modalidad,
        created_by: req.user?.id_usuario,
        ...otrosDatos
      });

      const actividadCompleta = await Actividad.findByPk(nuevaActividad.id_actividad, {
        include: [
          { model: TrackTematico, as: 'track' },
          { model: SalaVirtual, as: 'salaVirtual' },
          { model: Evento, as: 'evento' }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Actividad creada exitosamente',
        data: actividadCompleta
      });

    } catch (error) {
      console.error('Error al crear actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar actividad
   */
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;

      const actividad = await Actividad.findByPk(id);
      
      if (!actividad || actividad.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Actividad no encontrada'
        });
      }

      await actividad.update({
        ...datosActualizacion,
        updated_by: req.user?.id_usuario
      });

      const actividadActualizada = await Actividad.findByPk(id, {
        include: [
          { model: TrackTematico, as: 'track' },
          { model: SalaVirtual, as: 'salaVirtual' },
          { model: Evento, as: 'evento' }
        ]
      });

      res.status(200).json({
        success: true,
        message: 'Actividad actualizada exitosamente',
        data: actividadActualizada
      });

    } catch (error) {
      console.error('Error al actualizar actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar actividad (soft delete)
   */
  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      const actividad = await Actividad.findByPk(id);
      
      if (!actividad || actividad.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Actividad no encontrada'
        });
      }

      await actividad.softDelete(req.user?.id_usuario);

      res.status(200).json({
        success: true,
        message: 'Actividad eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener actividades por evento (endpoint público)
   */
  static async obtenerPorEvento(req, res) {
    try {
      const { id_evento } = req.params;

      const actividades = await Actividad.findAll({
        where: {
          id_evento: id_evento,
          deleted_at: null,
          estado: { [Op.notIn]: ['borrador', 'cancelada'] },
          es_publica: true,
          publicar_en_agenda: true
        },
        include: [
          {
            model: TrackTematico,
            as: 'track',
            attributes: ['id_track', 'nombre_track', 'color_hex']
          },
          {
            model: ActividadPonente,
            as: 'asignacionesPonente',
            include: [{
              model: Ponente,
              as: 'ponente',
              attributes: ['id_ponente', 'nombre_completo', 'titulo_profesional', 'foto_url']
            }]
          }
        ],
        order: [['fecha_inicio', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: actividades
      });

    } catch (error) {
      console.error('Error al obtener actividades por evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de actividades
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const { id_evento } = req.query;

      const whereCondition = { deleted_at: null };
      if (id_evento) whereCondition.id_evento = id_evento;

      const actividades = await Actividad.findAll({
        where: whereCondition
      });

      const estadisticas = {
        total_actividades: actividades.length,
        por_estado: {},
        por_tipo: {},
        por_modalidad: {}
      };

      for (const actividad of actividades) {
        // Por estado
        estadisticas.por_estado[actividad.estado] = 
          (estadisticas.por_estado[actividad.estado] || 0) + 1;

        // Por tipo
        estadisticas.por_tipo[actividad.tipo_actividad] = 
          (estadisticas.por_tipo[actividad.tipo_actividad] || 0) + 1;

        // Por modalidad
        estadisticas.por_modalidad[actividad.modalidad] = 
          (estadisticas.por_modalidad[actividad.modalidad] || 0) + 1;
      }

      res.status(200).json({
        success: true,
        data: estadisticas
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
}

module.exports = ActividadController;
