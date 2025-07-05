const { Op } = require('sequelize');
const { Actividad, ConflictoProgramacion, ActividadPonente, ActividadRecurso, Ponente, Recurso } = require('../models');

class ConflictDetectionService {
  
  /**
   * Detecta todos los conflictos para un evento específico
   */
  static async detectarConflictosEvento(eventoId, opciones = {}) {
    try {
      const actividades = await Actividad.findAll({
        where: {
          id_evento: eventoId,
          deleted_at: null,
          estado: { [Op.notIn]: ['borrador', 'cancelada'] }
        },
        include: [
          {
            model: ActividadPonente,
            as: 'asignacionesPonente',
            include: [{
              model: Ponente,
              as: 'ponente'
            }]
          },
          {
            model: ActividadRecurso,
            as: 'asignacionesRecurso',
            include: [{
              model: Recurso,
              as: 'recurso'
            }]
          }
        ]
      });

      const conflictos = [];

      // Detectar diferentes tipos de conflictos
      for (let i = 0; i < actividades.length; i++) {
        for (let j = i + 1; j < actividades.length; j++) {
          const actividad1 = actividades[i];
          const actividad2 = actividades[j];

          // Detectar conflictos de horario
          const conflictoHorario = this.detectarConflictoHorario(actividad1, actividad2);
          if (conflictoHorario) {
            conflictos.push(conflictoHorario);
          }

          // Detectar conflictos de ubicación
          const conflictoUbicacion = this.detectarConflictoUbicacion(actividad1, actividad2);
          if (conflictoUbicacion) {
            conflictos.push(conflictoUbicacion);
          }

          // Detectar conflictos de ponentes
          const conflictoPonente = this.detectarConflictoPonente(actividad1, actividad2);
          if (conflictoPonente) {
            conflictos.push(conflictoPonente);
          }

          // Detectar conflictos de recursos
          const conflictoRecurso = this.detectarConflictoRecurso(actividad1, actividad2);
          if (conflictoRecurso) {
            conflictos.push(conflictoRecurso);
          }

          // Detectar conflictos de track
          const conflictoTrack = this.detectarConflictoTrack(actividad1, actividad2);
          if (conflictoTrack) {
            conflictos.push(conflictoTrack);
          }
        }
      }

      // Guardar conflictos en la base de datos si no existen
      const conflictosGuardados = [];
      for (const conflicto of conflictos) {
        const existeConflicto = await ConflictoProgramacion.findOne({
          where: {
            id_evento: eventoId,
            [Op.or]: [
              {
                id_actividad_1: conflicto.id_actividad_1,
                id_actividad_2: conflicto.id_actividad_2,
                tipo_conflicto: conflicto.tipo_conflicto
              },
              {
                id_actividad_1: conflicto.id_actividad_2,
                id_actividad_2: conflicto.id_actividad_1,
                tipo_conflicto: conflicto.tipo_conflicto
              }
            ],
            estado: { [Op.notIn]: ['resuelto', 'ignorado'] },
            deleted_at: null
          }
        });

        if (!existeConflicto) {
          const nuevoConflicto = await ConflictoProgramacion.create({
            ...conflicto,
            id_evento: eventoId,
            metodo_deteccion: 'automatico',
            detectado_por: opciones.detectadoPor || null
          });
          conflictosGuardados.push(nuevoConflicto);
        }
      }

      return {
        total_conflictos: conflictos.length,
        conflictos_nuevos: conflictosGuardados.length,
        conflictos: conflictosGuardados
      };

    } catch (error) {
      throw new Error(`Error al detectar conflictos: ${error.message}`);
    }
  }

  /**
   * Detecta conflictos de horario entre dos actividades
   */
  static detectarConflictoHorario(actividad1, actividad2) {
    const inicio1 = new Date(actividad1.fecha_inicio);
    const fin1 = new Date(actividad1.fecha_fin);
    const inicio2 = new Date(actividad2.fecha_inicio);
    const fin2 = new Date(actividad2.fecha_fin);

    // Verificar si hay superposición de horarios
    const haySuperposicion = (inicio1 < fin2) && (inicio2 < fin1);

    if (haySuperposicion) {
      const tiempoSuperposicion = Math.min(fin1, fin2) - Math.max(inicio1, inicio2);
      const minutosSuperposicion = Math.round(tiempoSuperposicion / 60000);

      return {
        id_actividad_1: actividad1.id_actividad,
        id_actividad_2: actividad2.id_actividad,
        tipo_conflicto: 'horario_superpuesto',
        severidad: this.calcularSeveridadHorario(minutosSuperposicion, actividad1, actividad2),
        descripcion: `Superposición de horarios de ${minutosSuperposicion} minutos entre "${actividad1.titulo}" y "${actividad2.titulo}"`,
        detalle_conflicto: {
          minutos_superposicion: minutosSuperposicion,
          actividad1_horario: {
            inicio: actividad1.fecha_inicio,
            fin: actividad1.fecha_fin
          },
          actividad2_horario: {
            inicio: actividad2.fecha_inicio,
            fin: actividad2.fecha_fin
          }
        },
        participantes_afectados: (actividad1.total_inscritos || 0) + (actividad2.total_inscritos || 0)
      };
    }

    return null;
  }

  /**
   * Detecta conflictos de ubicación entre dos actividades
   */
  static detectarConflictoUbicacion(actividad1, actividad2) {
    // Solo verificar si ambas son presenciales o híbridas y tienen la misma ubicación
    if ((actividad1.modalidad === 'presencial' || actividad1.modalidad === 'hibrido') &&
        (actividad2.modalidad === 'presencial' || actividad2.modalidad === 'hibrido') &&
        actividad1.ubicacion_fisica && actividad2.ubicacion_fisica &&
        actividad1.ubicacion_fisica.toLowerCase() === actividad2.ubicacion_fisica.toLowerCase()) {
      
      // Verificar también si hay superposición de tiempo
      const conflictoHorario = this.detectarConflictoHorario(actividad1, actividad2);
      if (conflictoHorario) {
        return {
          id_actividad_1: actividad1.id_actividad,
          id_actividad_2: actividad2.id_actividad,
          tipo_conflicto: 'misma_ubicacion',
          severidad: 'alta',
          descripcion: `Misma ubicación física "${actividad1.ubicacion_fisica}" para actividades simultáneas`,
          detalle_conflicto: {
            ubicacion: actividad1.ubicacion_fisica,
            modalidad_1: actividad1.modalidad,
            modalidad_2: actividad2.modalidad,
            conflicto_horario: conflictoHorario.detalle_conflicto
          },
          participantes_afectados: Math.max(actividad1.total_inscritos || 0, actividad2.total_inscritos || 0)
        };
      }
    }

    return null;
  }

  /**
   * Detecta conflictos de ponentes entre dos actividades
   */
  static detectarConflictoPonente(actividad1, actividad2) {
    const ponentes1 = actividad1.asignacionesPonente || [];
    const ponentes2 = actividad2.asignacionesPonente || [];

    for (const asignacion1 of ponentes1) {
      for (const asignacion2 of ponentes2) {
        if (asignacion1.id_ponente === asignacion2.id_ponente) {
          // Verificar si hay superposición de tiempo
          const conflictoHorario = this.detectarConflictoHorario(actividad1, actividad2);
          if (conflictoHorario) {
            return {
              id_actividad_1: actividad1.id_actividad,
              id_actividad_2: actividad2.id_actividad,
              tipo_conflicto: 'mismo_ponente',
              severidad: 'alta',
              descripcion: `El ponente "${asignacion1.ponente?.nombre_completo || 'N/A'}" está asignado a actividades simultáneas`,
              detalle_conflicto: {
                id_ponente: asignacion1.id_ponente,
                nombre_ponente: asignacion1.ponente?.nombre_completo,
                rol_actividad_1: asignacion1.rol_ponente,
                rol_actividad_2: asignacion2.rol_ponente,
                conflicto_horario: conflictoHorario.detalle_conflicto
              },
              participantes_afectados: (actividad1.total_inscritos || 0) + (actividad2.total_inscritos || 0)
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Detecta conflictos de recursos entre dos actividades
   */
  static detectarConflictoRecurso(actividad1, actividad2) {
    const recursos1 = actividad1.asignacionesRecurso || [];
    const recursos2 = actividad2.asignacionesRecurso || [];

    for (const asignacion1 of recursos1) {
      for (const asignacion2 of recursos2) {
        if (asignacion1.id_recurso === asignacion2.id_recurso) {
          // Verificar si hay superposición de tiempo
          const conflictoHorario = this.detectarConflictoHorario(actividad1, actividad2);
          if (conflictoHorario) {
            const severidad = asignacion1.recurso?.es_critico ? 'critica' : 'media';
            
            return {
              id_actividad_1: actividad1.id_actividad,
              id_actividad_2: actividad2.id_actividad,
              tipo_conflicto: 'mismo_recurso',
              severidad: severidad,
              descripcion: `El recurso "${asignacion1.recurso?.nombre_recurso || 'N/A'}" está asignado a actividades simultáneas`,
              detalle_conflicto: {
                id_recurso: asignacion1.id_recurso,
                nombre_recurso: asignacion1.recurso?.nombre_recurso,
                es_critico: asignacion1.recurso?.es_critico,
                conflicto_horario: conflictoHorario.detalle_conflicto
              },
              participantes_afectados: (actividad1.total_inscritos || 0) + (actividad2.total_inscritos || 0)
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Detecta conflictos de track temático
   */
  static detectarConflictoTrack(actividad1, actividad2) {
    // Solo es conflicto si están en el mismo track y hay superposición de horarios
    if (actividad1.id_track && actividad2.id_track && 
        actividad1.id_track === actividad2.id_track) {
      
      const conflictoHorario = this.detectarConflictoHorario(actividad1, actividad2);
      if (conflictoHorario) {
        return {
          id_actividad_1: actividad1.id_actividad,
          id_actividad_2: actividad2.id_actividad,
          tipo_conflicto: 'mismo_track',
          severidad: 'media',
          descripcion: `Actividades del mismo track temático programadas simultáneamente`,
          detalle_conflicto: {
            id_track: actividad1.id_track,
            conflicto_horario: conflictoHorario.detalle_conflicto
          },
          participantes_afectados: Math.min(actividad1.total_inscritos || 0, actividad2.total_inscritos || 0)
        };
      }
    }

    return null;
  }

  /**
   * Calcula la severidad de un conflicto de horario
   */
  static calcularSeveridadHorario(minutosSuperposicion, actividad1, actividad2) {
    const duracionTotal1 = actividad1.duracion_minutos || 60;
    const duracionTotal2 = actividad2.duracion_minutos || 60;
    const porcentajeSuperposicion = Math.max(
      (minutosSuperposicion / duracionTotal1) * 100,
      (minutosSuperposicion / duracionTotal2) * 100
    );

    if (porcentajeSuperposicion >= 80) return 'critica';
    if (porcentajeSuperposicion >= 50) return 'alta';
    if (porcentajeSuperposicion >= 20) return 'media';
    return 'baja';
  }

  /**
   * Obtiene estadísticas de conflictos para un evento
   */
  static async obtenerEstadisticasConflictos(eventoId) {
    try {
      const conflictos = await ConflictoProgramacion.findAll({
        where: {
          id_evento: eventoId,
          deleted_at: null
        }
      });

      const estadisticas = {
        total: conflictos.length,
        por_estado: {},
        por_tipo: {},
        por_severidad: {},
        resueltos: 0,
        pendientes: 0
      };

      for (const conflicto of conflictos) {
        // Por estado
        estadisticas.por_estado[conflicto.estado] = 
          (estadisticas.por_estado[conflicto.estado] || 0) + 1;

        // Por tipo
        estadisticas.por_tipo[conflicto.tipo_conflicto] = 
          (estadisticas.por_tipo[conflicto.tipo_conflicto] || 0) + 1;

        // Por severidad
        estadisticas.por_severidad[conflicto.severidad] = 
          (estadisticas.por_severidad[conflicto.severidad] || 0) + 1;

        // Contadores específicos
        if (conflicto.estado === 'resuelto') {
          estadisticas.resueltos++;
        } else if (['detectado', 'en_revision', 'escalado'].includes(conflicto.estado)) {
          estadisticas.pendientes++;
        }
      }

      return estadisticas;

    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

module.exports = ConflictDetectionService;
