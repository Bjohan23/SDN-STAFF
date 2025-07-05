const { Op } = require('sequelize');
const { TrackTematico, Actividad, Evento, Usuario } = require('../models');

class TrackTematicoController {

  /**
   * Obtener todos los tracks con filtros, paginación y búsqueda.
   */
  static async listar(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        id_evento,
        estado,
        es_destacado,
        es_publico,
        search,
        incluir_actividades = 'false'
      } = req.query;

      const offset = (page - 1) * limit;
      const whereCondition = { deleted_at: null };

      // Aplicar filtros
      if (id_evento) whereCondition.id_evento = id_evento;
      if (estado) whereCondition.estado = estado;
      if (es_destacado !== undefined) whereCondition.es_destacado = es_destacado === 'true';
      if (es_publico !== undefined) whereCondition.es_publico = es_publico === 'true';

      // Búsqueda por texto
      if (search) {
        whereCondition[Op.or] = [
          { nombre_track: { [Op.iLike]: `%${search}%` } },
          { descripcion: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const include = [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id_evento', 'nombre_evento', 'fecha_inicio', 'fecha_fin']
        }
      ];

      if (incluir_actividades === 'true') {
        include.push({
          model: Actividad,
          as: 'actividades',
          where: { deleted_at: null },
          required: false,
          attributes: ['id_actividad', 'titulo', 'tipo_actividad', 'estado', 'fecha_inicio', 'fecha_fin']
        });
      }

      const { count, rows: tracks } = await TrackTematico.findAndCountAll({
        where: whereCondition,
        include: include,
        limit: parseInt(limit),
        offset: offset,
        order: [['orden_visualizacion', 'ASC'], ['nombre_track', 'ASC']],
        distinct: true
      });

      res.status(200).json({
        success: true,
        data: tracks,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error al listar tracks:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener un track por ID, incluyendo actividades y estadísticas calculadas.
   */
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const { incluir_actividades = 'true' } = req.query;

      const include = [
        {
          model: Evento,
          as: 'evento',
          attributes: ['id_evento', 'nombre_evento', 'fecha_inicio', 'fecha_fin']
        }
      ];

      if (incluir_actividades === 'true') {
        include.push({
          model: Actividad,
          as: 'actividades',
          where: { deleted_at: null },
          required: false,
          attributes: [
            'id_actividad', 'titulo', 'descripcion_corta', 'tipo_actividad', 
            'estado', 'fecha_inicio', 'fecha_fin', 'duracion_minutos', 
            'modalidad', 'aforo_maximo', 'total_inscritos'
          ],
          order: [['fecha_inicio', 'ASC']]
        });
      }

      const track = await TrackTematico.findByPk(id, { include });

      if (!track || track.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Track temático no encontrado'
        });
      }

      const trackData = track.toJSON();

      // Calcular estadísticas si se incluyen actividades
      if (trackData.actividades) {
        trackData.estadisticas = {
          actividades_por_estado: {},
          actividades_por_tipo: {},
          duracion_total_minutos: 0,
          capacidad_total: 0,
          total_inscritos: 0,
          porcentaje_ocupacion: 0
        };

        for (const actividad of track.actividades) {
          trackData.estadisticas.actividades_por_estado[actividad.estado] = 
            (trackData.estadisticas.actividades_por_estado[actividad.estado] || 0) + 1;

          trackData.estadisticas.actividades_por_tipo[actividad.tipo_actividad] = 
            (trackData.estadisticas.actividades_por_tipo[actividad.tipo_actividad] || 0) + 1;

          trackData.estadisticas.duracion_total_minutos += actividad.duracion_minutos || 0;
          trackData.estadisticas.capacidad_total += actividad.aforo_maximo || 0;
          trackData.estadisticas.total_inscritos += actividad.total_inscritos || 0;
        }

        if (trackData.estadisticas.capacidad_total > 0) {
          trackData.estadisticas.porcentaje_ocupacion = Math.round(
            (trackData.estadisticas.total_inscritos / trackData.estadisticas.capacidad_total) * 100
          );
        }
      }

      res.status(200).json({
        success: true,
        data: trackData
      });

    } catch (error) {
      console.error('Error al obtener track:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear un nuevo track temático.
   */
  static async crear(req, res) {
    try {
      const {
        id_evento,
        nombre_track,
        descripcion,
        color_hex,
        icono,
        nivel_audiencia = 'mixto',
        es_publico = true,
        estado = 'borrador',
        ...otrosDatos
      } = req.body;

      if (!nombre_track || !id_evento) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre_track y id_evento son requeridos.'
        });
      }
      
      const evento = await Evento.findByPk(id_evento);
      if (!evento) {
        return res.status(404).json({ success: false, message: 'Evento no encontrado' });
      }

      const trackExistente = await TrackTematico.findOne({
        where: { id_evento, nombre_track, deleted_at: null }
      });
      if (trackExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un track con este nombre en el evento.'
        });
      }
      
      // Generar slug único para el track
      const baseSlug = nombre_track.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      let slug = baseSlug;
      let contador = 1;
      while (await TrackTematico.findOne({ where: { slug, deleted_at: null } })) {
        slug = `${baseSlug}-${contador++}`;
      }

      const ultimoOrden = await TrackTematico.max('orden_visualizacion', {
        where: { id_evento, deleted_at: null }
      });

      const nuevoTrack = await TrackTematico.create({
        id_evento,
        nombre_track,
        slug,
        descripcion,
        color_hex,
        icono,
        nivel_audiencia,
        es_publico,
        estado,
        orden_visualizacion: (ultimoOrden || 0) + 1,
        created_by: req.user?.id_usuario,
        ...otrosDatos
      });

      const trackCompleto = await TrackTematico.findByPk(nuevoTrack.id_track, {
        include: [{ model: Evento, as: 'evento', attributes: ['id_evento', 'nombre_evento'] }]
      });

      res.status(201).json({
        success: true,
        message: 'Track temático creado exitosamente.',
        data: trackCompleto
      });

    } catch (error) {
      console.error('Error al crear track:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  /**
   * Actualizar un track temático existente.
   */
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;

      const track = await TrackTematico.findByPk(id);
      
      if (!track || track.isDeleted()) {
        return res.status(404).json({ success: false, message: 'Track temático no encontrado' });
      }

      // Si se cambia el nombre, verificar que sea único y actualizar el slug
      if (datosActualizacion.nombre_track && datosActualizacion.nombre_track !== track.nombre_track) {
        const trackExistente = await TrackTematico.findOne({
          where: {
            id_evento: track.id_evento,
            nombre_track: datosActualizacion.nombre_track,
            id_track: { [Op.ne]: id },
            deleted_at: null
          }
        });

        if (trackExistente) {
          return res.status(400).json({ success: false, message: 'Ya existe un track con este nombre en el evento.' });
        }
        
        // Actualizar slug
        const baseSlug = datosActualizacion.nombre_track.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        let slug = baseSlug;
        let contador = 1;
        while (await TrackTematico.findOne({ where: { slug, id_track: { [Op.ne]: id }, deleted_at: null } })) {
            slug = `${baseSlug}-${contador++}`;
        }
        datosActualizacion.slug = slug;
      }

      await track.update({ ...datosActualizacion, updated_by: req.user?.id_usuario });

      if (track.estado === 'activo') {
        await track.updateMetrics();
      }

      const trackActualizado = await TrackTematico.findByPk(id, {
        include: [{ model: Evento, as: 'evento', attributes: ['id_evento', 'nombre_evento'] }]
      });

      res.status(200).json({
        success: true,
        message: 'Track temático actualizado exitosamente.',
        data: trackActualizado
      });

    } catch (error) {
      console.error('Error al actualizar track:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  /**
   * Eliminar un track temático (marcado como borrado).
   */
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const track = await TrackTematico.findByPk(id);
      
      if (!track || track.isDeleted()) {
        return res.status(404).json({ success: false, message: 'Track temático no encontrado' });
      }

      // Prevenir eliminación si tiene actividades asociadas
      const actividadesAsociadas = await Actividad.count({
        where: { id_track: id, deleted_at: null }
      });

      if (actividadesAsociadas > 0) {
        return res.status(400).json({
          success: false,
          message: `No se puede eliminar. Tiene ${actividadesAsociadas} actividades asociadas.`,
          sugerencia: 'Reasigne las actividades a otro track o elimínelas primero.'
        });
      }

      await track.softDelete(req.user?.id_usuario);

      res.status(200).json({
        success: true,
        message: 'Track temático eliminado exitosamente.'
      });

    } catch (error) {
      console.error('Error al eliminar track:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  /**
   * Obtener los tracks públicos y activos de un evento específico.
   */
  static async obtenerPorEvento(req, res) {
    try {
      const { id_evento } = req.params;
      const { incluir_privados = 'false', incluir_actividades = 'true' } = req.query;

      const whereCondition = {
        id_evento: id_evento,
        deleted_at: null,
        estado: 'activo'
      };

      if (incluir_privados !== 'true') {
        whereCondition.es_publico = true;
      }

      const include = [];
      if (incluir_actividades === 'true') {
        include.push({
          model: Actividad,
          as: 'actividades',
          where: {
            deleted_at: null,
            estado: { [Op.notIn]: ['borrador', 'cancelada'] },
            es_publica: true,
            publicar_en_agenda: true
          },
          required: false,
          attributes: ['id_actividad', 'titulo', 'descripcion_corta', 'tipo_actividad', 'fecha_inicio', 'fecha_fin', 'duracion_minutos', 'modalidad'],
          order: [['fecha_inicio', 'ASC']]
        });
      }

      const tracks = await TrackTematico.findAll({
        where: whereCondition,
        include: include,
        order: [['orden_visualizacion', 'ASC'], ['nombre_track', 'ASC']]
      });

      res.status(200).json({ success: true, data: tracks });

    } catch (error) {
      console.error('Error al obtener tracks por evento:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  /**
   * Actualizar el orden de visualización de los tracks.
   */
  static async actualizarOrden(req, res) {
    try {
      const { tracks_ordenados } = req.body;

      if (!Array.isArray(tracks_ordenados)) {
        return res.status(400).json({ success: false, message: 'Se requiere un array de tracks.' });
      }

      for (let i = 0; i < tracks_ordenados.length; i++) {
        const { id_track } = tracks_ordenados[i];
        await TrackTematico.update(
          { orden_visualizacion: i + 1, updated_by: req.user?.id_usuario },
          { where: { id_track: id_track, deleted_at: null } }
        );
      }

      res.status(200).json({ success: true, message: 'Orden de tracks actualizado exitosamente.' });

    } catch (error) {
      console.error('Error al actualizar orden:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  /**
   * Obtener estadísticas generales de los tracks.
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const { id_evento } = req.query;
      const whereCondition = { deleted_at: null };
      if (id_evento) whereCondition.id_evento = id_evento;

      const tracks = await TrackTematico.findAll({
        where: whereCondition,
        include: [{ model: Actividad, as: 'actividades', where: { deleted_at: null }, required: false }]
      });

      const estadisticas = {
        total_tracks: tracks.length,
        por_estado: {},
        por_nivel_audiencia: {},
        tracks_con_actividades: 0,
        tracks_sin_actividades: 0,
        promedio_actividades_por_track: 0,
        tracks_destacados: 0,
        tracks_publicos: 0
      };

      let totalActividades = 0;
      for (const track of tracks) {
        estadisticas.por_estado[track.estado] = (estadisticas.por_estado[track.estado] || 0) + 1;
        estadisticas.por_nivel_audiencia[track.nivel_audiencia] = (estadisticas.por_nivel_audiencia[track.nivel_audiencia] || 0) + 1;
        
        const numActividades = track.actividades?.length || 0;
        totalActividades += numActividades;

        if (numActividades > 0) estadisticas.tracks_con_actividades++;
        else estadisticas.tracks_sin_actividades++;

        if (track.es_destacado) estadisticas.tracks_destacados++;
        if (track.es_publico) estadisticas.tracks_publicos++;
      }

      estadisticas.promedio_actividades_por_track = tracks.length > 0 ? 
        Math.round((totalActividades / tracks.length) * 100) / 100 : 0;

      res.status(200).json({ success: true, data: estadisticas });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }

  /**
   * Forzar la actualización de las métricas calculadas de un track.
   */
  static async actualizarMetricas(req, res) {
    try {
      const { id } = req.params;
      const track = await TrackTematico.findByPk(id);
      
      if (!track || track.isDeleted()) {
        return res.status(404).json({ success: false, message: 'Track temático no encontrado' });
      }

      await track.updateMetrics();
      const trackActualizado = await TrackTematico.findByPk(id);

      res.status(200).json({
        success: true,
        message: 'Métricas actualizadas exitosamente.',
        data: {
          id_track: track.id_track,
          nombre_track: track.nombre_track,
          total_actividades: trackActualizado.total_actividades,
          duracion_total_minutos: trackActualizado.duracion_total_minutos,
          capacidad_total: trackActualizado.capacidad_total
        }
      });

    } catch (error) {
      console.error('Error al actualizar métricas:', error);
      res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
    }
  }
}

module.exports = TrackTematicoController;