const { Op } = require('sequelize');
const { Actividad, TrackTematico, Ponente, ActividadPonente, SalaVirtual } = require('../models');
const ConflictDetectionService = require('./ConflictDetectionService');

class SchedulingService {
  
  /**
   * Genera slots de tiempo disponibles para un evento
   */
  static async generarSlotsDisponibles(eventoId, opciones = {}) {
    try {
      const {
        fechaInicio = new Date(),
        fechaFin = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        duracionSlot = 60, // minutos
        horaInicioDia = 9, // 9 AM
        horaFinDia = 18, // 6 PM
        diasSemana = [1, 2, 3, 4, 5], // Lunes a Viernes
        excluirFechas = []
      } = opciones;

      const slots = [];
      const fechaActual = new Date(fechaInicio);
      
      while (fechaActual <= fechaFin) {
        // Verificar si es un día válido
        if (diasSemana.includes(fechaActual.getDay())) {
          const fechaStr = fechaActual.toISOString().split('T')[0];
          
          // Verificar si la fecha no está excluida
          if (!excluirFechas.includes(fechaStr)) {
            
            // Generar slots para el día
            for (let hora = horaInicioDia; hora < horaFinDia; hora += (duracionSlot / 60)) {
              const horaInicio = Math.floor(hora);
              const minutosInicio = Math.round((hora - horaInicio) * 60);
              
              const inicioSlot = new Date(fechaActual);
              inicioSlot.setHours(horaInicio, minutosInicio, 0, 0);
              
              const finSlot = new Date(inicioSlot);
              finSlot.setMinutes(finSlot.getMinutes() + duracionSlot);
              
              // Verificar que el slot no exceda la hora de fin del día
              if (finSlot.getHours() <= horaFinDia || 
                  (finSlot.getHours() === horaFinDia && finSlot.getMinutes() === 0)) {
                
                slots.push({
                  fecha: fechaStr,
                  hora_inicio: `${String(horaInicio).padStart(2, '0')}:${String(minutosInicio).padStart(2, '0')}`,
                  hora_fin: `${String(finSlot.getHours()).padStart(2, '0')}:${String(finSlot.getMinutes()).padStart(2, '0')}`,
                  fecha_inicio_completa: inicioSlot,
                  fecha_fin_completa: finSlot,
                  duracion_minutos: duracionSlot,
                  disponible: true
                });
              }
            }
          }
        }
        
        fechaActual.setDate(fechaActual.getDate() + 1);
      }

      // Verificar disponibilidad real contra actividades existentes
      const actividadesExistentes = await Actividad.findAll({
        where: {
          id_evento: eventoId,
          deleted_at: null,
          estado: { [Op.notIn]: ['borrador', 'cancelada'] }
        },
        attributes: ['fecha_inicio', 'fecha_fin']
      });

      // Marcar slots ocupados
      for (const slot of slots) {
        for (const actividad of actividadesExistentes) {
          const inicioActividad = new Date(actividad.fecha_inicio);
          const finActividad = new Date(actividad.fecha_fin);
          
          // Verificar si hay superposición
          if ((slot.fecha_inicio_completa < finActividad) && 
              (slot.fecha_fin_completa > inicioActividad)) {
            slot.disponible = false;
            break;
          }
        }
      }

      return {
        total_slots: slots.length,
        slots_disponibles: slots.filter(s => s.disponible).length,
        slots_ocupados: slots.filter(s => !s.disponible).length,
        slots: slots
      };

    } catch (error) {
      throw new Error(`Error al generar slots: ${error.message}`);
    }
  }

  /**
   * Programa actividades automáticamente basado en prioridades
   */
  static async programarActividadesAutomatico(eventoId, actividadesSinProgramar, opciones = {}) {
    try {
      const {
        prioridadPorTipo = {
          'keynote': 10,
          'conferencia': 8,
          'panel': 7,
          'taller': 6,
          'demostracion': 5,
          'networking': 4,
          'otros': 3
        },
        evitarConflictosPonente = true,
        margenEntreActividades = 15 // minutos
      } = opciones;

      // Obtener slots disponibles
      const slotsData = await this.generarSlotsDisponibles(eventoId, opciones);
      const slotsDisponibles = slotsData.slots.filter(s => s.disponible);

      // Ordenar actividades por prioridad
      const actividadesOrdenadas = actividadesSinProgramar.sort((a, b) => {
        const prioridadA = prioridadPorTipo[a.tipo_actividad] || 1;
        const prioridadB = prioridadPorTipo[b.tipo_actividad] || 1;
        return prioridadB - prioridadA;
      });

      const programacion = [];
      const slotsAsignados = new Set();

      for (const actividad of actividadesOrdenadas) {
        let slotAsignado = null;
        
        // Buscar el mejor slot para esta actividad
        for (const slot of slotsDisponibles) {
          if (slotsAsignados.has(slot.fecha + slot.hora_inicio)) {
            continue;
          }

          // Verificar si la duración de la actividad cabe en el slot
          const duracionNecesaria = actividad.duracion_minutos || 60;
          if (duracionNecesaria > slot.duracion_minutos) {
            continue;
          }

          // Si llegamos aquí, el slot es válido
          slotAsignado = slot;
          break;
        }

        if (slotAsignado) {
          // Calcular fechas exactas
          const fechaInicio = new Date(slotAsignado.fecha_inicio_completa);
          const fechaFin = new Date(fechaInicio);
          fechaFin.setMinutes(fechaFin.getMinutes() + (actividad.duracion_minutos || 60));

          const programacionItem = {
            id_actividad: actividad.id_actividad,
            titulo: actividad.titulo,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            slot_asignado: slotAsignado,
            conflictos_detectados: []
          };

          programacion.push(programacionItem);
          
          // Marcar slot como ocupado
          slotsAsignados.add(slotAsignado.fecha + slotAsignado.hora_inicio);
        } else {
          // No se pudo programar la actividad
          programacion.push({
            id_actividad: actividad.id_actividad,
            titulo: actividad.titulo,
            fecha_inicio: null,
            fecha_fin: null,
            slot_asignado: null,
            error: 'No se encontró slot disponible',
            conflictos_detectados: ['Sin slots disponibles']
          });
        }
      }

      return {
        actividades_programadas: programacion.filter(p => p.slot_asignado !== null).length,
        actividades_sin_programar: programacion.filter(p => p.slot_asignado === null).length,
        programacion: programacion,
        slots_utilizados: slotsAsignados.size,
        slots_disponibles_restantes: slotsDisponibles.length - slotsAsignados.size
      };

    } catch (error) {
      throw new Error(`Error en programación automática: ${error.message}`);
    }
  }

  /**
   * Sugiere horarios óptimos para una actividad
   */
  static async sugerirHorariosOptimos(eventoId, actividadData, opciones = {}) {
    try {
      const {
        numeroSugerencias = 5
      } = opciones;

      // Obtener slots disponibles
      const slotsData = await this.generarSlotsDisponibles(eventoId, opciones);
      const slotsDisponibles = slotsData.slots.filter(s => s.disponible);

      const sugerencias = [];

      for (const slot of slotsDisponibles) {
        if (sugerencias.length >= numeroSugerencias) break;

        // Verificar si la actividad cabe en el slot
        const duracionNecesaria = actividadData.duracion_minutos || 60;
        if (duracionNecesaria <= slot.duracion_minutos) {
          
          let puntuacion = 100; // Puntuación base
          const motivos = [];

          // Factor 1: Horario preferido
          const hora = parseInt(slot.hora_inicio.split(':')[0]);
          if (hora >= 9 && hora <= 11) {
            puntuacion += 20;
            motivos.push('Horario matutino (mayor atención)');
          } else if (hora >= 14 && hora <= 16) {
            puntuacion += 10;
            motivos.push('Horario vespertino adecuado');
          }

          // Factor 2: Tipo de actividad vs horario
          if (actividadData.tipo_actividad === 'keynote' && hora >= 9 && hora <= 10) {
            puntuacion += 30;
            motivos.push('Horario ideal para keynote');
          } else if (actividadData.tipo_actividad === 'networking' && hora >= 17) {
            puntuacion += 25;
            motivos.push('Horario ideal para networking');
          }

          sugerencias.push({
            slot: slot,
            puntuacion: puntuacion,
            motivos: motivos,
            fecha_inicio_sugerida: slot.fecha_inicio_completa,
            fecha_fin_sugerida: new Date(slot.fecha_inicio_completa.getTime() + duracionNecesaria * 60000)
          });
        }
      }

      // Ordenar por puntuación descendente
      sugerencias.sort((a, b) => b.puntuacion - a.puntuacion);

      return {
        total_sugerencias: sugerencias.length,
        sugerencias: sugerencias.slice(0, numeroSugerencias)
      };

    } catch (error) {
      throw new Error(`Error al sugerir horarios: ${error.message}`);
    }
  }

  /**
   * Obtiene recomendaciones de programación
   */
  static async obtenerRecomendacionesProgramacion(eventoId) {
    try {
      const actividades = await Actividad.findAll({
        where: {
          id_evento: eventoId,
          deleted_at: null
        }
      });

      const recomendaciones = [];
      const actividadesSinProgramar = actividades.filter(a => !a.fecha_inicio);

      if (actividadesSinProgramar.length > 0) {
        recomendaciones.push({
          tipo: 'actividades_sin_programar',
          prioridad: 'alta',
          mensaje: `${actividadesSinProgramar.length} actividades sin programar`,
          accion: 'Usar programación automática o manual'
        });
      }

      return recomendaciones;

    } catch (error) {
      throw new Error(`Error al generar recomendaciones: ${error.message}`);
    }
  }
}

module.exports = SchedulingService;
