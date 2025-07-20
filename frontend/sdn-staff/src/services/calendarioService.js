import axios from '../config/axios';

class CalendarioService {
  /**
   * Obtener eventos del calendario con filtros
   */
  static async obtenerEventos(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fechaInicio) {
        params.append('fecha_inicio', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        params.append('fecha_fin', filtros.fechaFin);
      }
      if (filtros.tipo && filtros.tipo !== 'todos') {
        params.append('tipo', filtros.tipo);
      }
      if (filtros.estado && filtros.estado !== 'todos') {
        params.append('estado', filtros.estado);
      }
      if (filtros.categoria && filtros.categoria !== 'todos') {
        params.append('categoria', filtros.categoria);
      }
      if (filtros.usuarioId) {
        params.append('usuario_id', filtros.usuarioId);
      }

      const response = await axios.get(`/api/eventos?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      throw new Error('Error al obtener los eventos del calendario');
    }
  }

  /**
   * Crear nuevo evento
   */
  static async crearEvento(eventoData) {
    try {
      const response = await axios.post('/api/eventos', eventoData);
      return response.data;
    } catch (error) {
      console.error('Error creando evento:', error);
      throw new Error('Error al crear el evento');
    }
  }

  /**
   * Actualizar evento
   */
  static async actualizarEvento(eventoId, eventoData) {
    try {
      const response = await axios.put(`/api/eventos/${eventoId}`, eventoData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando evento:', error);
      throw new Error('Error al actualizar el evento');
    }
  }

  /**
   * Eliminar evento
   */
  static async eliminarEvento(eventoId) {
    try {
      const response = await axios.delete(`/api/eventos/${eventoId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw new Error('Error al eliminar el evento');
    }
  }

  /**
   * Obtener conflictos de programación
   */
  static async obtenerConflictos(fechaInicio, fechaFin) {
    try {
      const response = await axios.get('/api/eventos/conflictos', {
        params: {
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo conflictos:', error);
      throw new Error('Error al obtener los conflictos de programación');
    }
  }

  /**
   * Resolver conflicto de programación
   */
  static async resolverConflicto(conflictoId, solucion) {
    try {
      const response = await axios.post(`/api/eventos/conflictos/${conflictoId}/resolver`, {
        solucion
      });
      return response.data;
    } catch (error) {
      console.error('Error resolviendo conflicto:', error);
      throw new Error('Error al resolver el conflicto');
    }
  }

  /**
   * Exportar eventos a formato iCal
   */
  static async exportarICal(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fechaInicio) {
        params.append('fecha_inicio', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        params.append('fecha_fin', filtros.fechaFin);
      }
      if (filtros.tipo && filtros.tipo !== 'todos') {
        params.append('tipo', filtros.tipo);
      }

      const response = await axios.get(`/api/eventos/export/ical?${params.toString()}`, {
        responseType: 'blob'
      });

      // Crear y descargar archivo
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `eventos_${new Date().toISOString().split('T')[0]}.ics`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exportando iCal:', error);
      throw new Error('Error al exportar el calendario');
    }
  }

  /**
   * Generar URL para Google Calendar
   */
  static generarURLGoogleCalendar(evento) {
    const formatearFecha = (fecha) => {
      return new Date(fecha).toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: evento.nombre,
      dates: `${formatearFecha(evento.fecha_inicio)}/${formatearFecha(evento.fecha_fin)}`,
      details: evento.descripcion || '',
      location: evento.ubicacion || ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Obtener eventos por usuario
   */
  static async obtenerEventosUsuario(usuarioId, filtros = {}) {
    try {
      const params = new URLSearchParams({ usuario_id: usuarioId });
      
      if (filtros.fechaInicio) {
        params.append('fecha_inicio', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        params.append('fecha_fin', filtros.fechaFin);
      }

      const response = await axios.get(`/api/usuarios/${usuarioId}/eventos?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo eventos del usuario:', error);
      throw new Error('Error al obtener los eventos del usuario');
    }
  }

  /**
   * Registrar usuario en evento
   */
  static async registrarEnEvento(eventoId, usuarioId) {
    try {
      const response = await axios.post(`/api/eventos/${eventoId}/registro`, {
        usuario_id: usuarioId
      });
      return response.data;
    } catch (error) {
      console.error('Error registrando en evento:', error);
      throw new Error('Error al registrarse en el evento');
    }
  }

  /**
   * Cancelar registro en evento
   */
  static async cancelarRegistroEvento(eventoId, usuarioId) {
    try {
      const response = await axios.delete(`/api/eventos/${eventoId}/registro/${usuarioId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelando registro:', error);
      throw new Error('Error al cancelar el registro');
    }
  }

  /**
   * Obtener recordatorios del usuario
   */
  static async obtenerRecordatorios(usuarioId) {
    try {
      const response = await axios.get(`/api/usuarios/${usuarioId}/recordatorios`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo recordatorios:', error);
      throw new Error('Error al obtener los recordatorios');
    }
  }

  /**
   * Crear recordatorio para evento
   */
  static async crearRecordatorio(recordatorioData) {
    try {
      const response = await axios.post('/api/recordatorios', recordatorioData);
      return response.data;
    } catch (error) {
      console.error('Error creando recordatorio:', error);
      throw new Error('Error al crear el recordatorio');
    }
  }

  /**
   * Actualizar recordatorio
   */
  static async actualizarRecordatorio(recordatorioId, recordatorioData) {
    try {
      const response = await axios.put(`/api/recordatorios/${recordatorioId}`, recordatorioData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando recordatorio:', error);
      throw new Error('Error al actualizar el recordatorio');
    }
  }

  /**
   * Eliminar recordatorio
   */
  static async eliminarRecordatorio(recordatorioId) {
    try {
      const response = await axios.delete(`/api/recordatorios/${recordatorioId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando recordatorio:', error);
      throw new Error('Error al eliminar el recordatorio');
    }
  }

  /**
   * Obtener estadísticas del calendario
   */
  static async obtenerEstadisticas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.fechaInicio) {
        params.append('fecha_inicio', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        params.append('fecha_fin', filtros.fechaFin);
      }

      const response = await axios.get(`/api/eventos/estadisticas?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener las estadísticas del calendario');
    }
  }

  /**
   * Verificar disponibilidad de horario
   */
  static async verificarDisponibilidad(fechaInicio, fechaFin, eventoId = null) {
    try {
      const params = {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin
      };

      if (eventoId) {
        params.excluir_evento = eventoId;
      }

      const response = await axios.get('/api/eventos/disponibilidad', { params });
      return response.data;
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      throw new Error('Error al verificar la disponibilidad');
    }
  }

  /**
   * Obtener próximos eventos
   */
  static async obtenerProximosEventos(limite = 5, usuarioId = null) {
    try {
      const params = {
        limite,
        fecha_desde: new Date().toISOString()
      };

      if (usuarioId) {
        params.usuario_id = usuarioId;
      }

      const response = await axios.get('/api/eventos/proximos', { params });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo próximos eventos:', error);
      throw new Error('Error al obtener los próximos eventos');
    }
  }

  /**
   * Duplicar evento
   */
  static async duplicarEvento(eventoId, nuevaFecha) {
    try {
      const response = await axios.post(`/api/eventos/${eventoId}/duplicar`, {
        nueva_fecha: nuevaFecha
      });
      return response.data;
    } catch (error) {
      console.error('Error duplicando evento:', error);
      throw new Error('Error al duplicar el evento');
    }
  }

  /**
   * Obtener plantillas de eventos
   */
  static async obtenerPlantillas() {
    try {
      const response = await axios.get('/api/eventos/plantillas');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo plantillas:', error);
      throw new Error('Error al obtener las plantillas de eventos');
    }
  }

  /**
   * Crear evento desde plantilla
   */
  static async crearDesdeePlantilla(plantillaId, fechaInicio, datosAdicionales = {}) {
    try {
      const response = await axios.post(`/api/eventos/plantillas/${plantillaId}/crear`, {
        fecha_inicio: fechaInicio,
        ...datosAdicionales
      });
      return response.data;
    } catch (error) {
      console.error('Error creando evento desde plantilla:', error);
      throw new Error('Error al crear el evento desde la plantilla');
    }
  }
}

export default CalendarioService;