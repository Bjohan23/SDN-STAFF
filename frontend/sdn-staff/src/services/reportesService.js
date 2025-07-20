import axios from '../config/axios';

class ReportesService {
  /**
   * Obtener reporte general
   */
  static async obtenerReporteGeneral(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.evento_id) params.append('evento_id', filtros.evento_id);
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.incluir_graficos !== undefined) params.append('incluir_graficos', filtros.incluir_graficos);

      const response = await axios.get(`/api/reportes/general?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte general:', error);
      throw new Error('Error al obtener el reporte general');
    }
  }

  /**
   * Obtener reporte de visitantes
   */
  static async obtenerReporteVisitantes(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.evento_id) params.append('evento_id', filtros.evento_id);
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const response = await axios.get(`/api/reportes/visitantes?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte de visitantes:', error);
      throw new Error('Error al obtener el reporte de visitantes');
    }
  }

  /**
   * Obtener reporte financiero
   */
  static async obtenerReporteFinanciero(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.evento_id) params.append('evento_id', filtros.evento_id);
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const response = await axios.get(`/api/reportes/financiero?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte financiero:', error);
      throw new Error('Error al obtener el reporte financiero');
    }
  }

  /**
   * Obtener reporte comparativo
   */
  static async obtenerReporteComparativo(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.evento_id) params.append('evento_id', filtros.evento_id);
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const response = await axios.get(`/api/reportes/comparativo?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte comparativo:', error);
      throw new Error('Error al obtener el reporte comparativo');
    }
  }

  /**
   * Obtener reporte demográfico
   */
  static async obtenerReporteDemografico(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.evento_id) params.append('evento_id', filtros.evento_id);
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const response = await axios.get(`/api/reportes/demografico?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reporte demográfico:', error);
      throw new Error('Error al obtener el reporte demográfico');
    }
  }

  /**
   * Exportar reporte
   */
  static async exportarReporte(eventoId, tipoReporte, formato, filtros = {}) {
    try {
      const params = new URLSearchParams({
        tipo: tipoReporte,
        formato
      });
      
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);

      const response = await axios.get(`/api/reportes/evento/${eventoId}/exportar?${params.toString()}`, {
        responseType: 'blob'
      });

      // Crear y descargar archivo
      const blob = new Blob([response.data], { 
        type: formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${tipoReporte}-${eventoId}-${new Date().toISOString().split('T')[0]}.${formato}`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exportando reporte:', error);
      throw new Error('Error al exportar el reporte');
    }
  }

  /**
   * Enviar reporte por email
   */
  static async enviarReportePorEmail(eventoId, configuracion) {
    try {
      const response = await axios.post(`/api/reportes/evento/${eventoId}/enviar-email`, configuracion);
      return response.data;
    } catch (error) {
      console.error('Error enviando reporte por email:', error);
      throw new Error('Error al enviar el reporte por email');
    }
  }

  /**
   * Programar reporte automático
   */
  static async programarReporte(configuracion) {
    try {
      const response = await axios.post('/api/reportes/programar', configuracion);
      return response.data;
    } catch (error) {
      console.error('Error programando reporte:', error);
      throw new Error('Error al programar el reporte');
    }
  }

  /**
   * Obtener reportes programados
   */
  static async obtenerReportesProgramados(filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.evento_id) params.append('evento_id', filtros.evento_id);
      if (filtros.activo !== undefined) params.append('activo', filtros.activo);

      const response = await axios.get(`/api/reportes/programados?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo reportes programados:', error);
      throw new Error('Error al obtener los reportes programados');
    }
  }

  /**
   * Actualizar reporte programado
   */
  static async actualizarReporteProgramado(id, configuracion) {
    try {
      const response = await axios.put(`/api/reportes/programados/${id}`, configuracion);
      return response.data;
    } catch (error) {
      console.error('Error actualizando reporte programado:', error);
      throw new Error('Error al actualizar el reporte programado');
    }
  }

  /**
   * Eliminar reporte programado
   */
  static async eliminarReporteProgramado(id) {
    try {
      const response = await axios.delete(`/api/reportes/programados/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando reporte programado:', error);
      throw new Error('Error al eliminar el reporte programado');
    }
  }

  /**
   * Obtener configuraciones disponibles para reportes
   */
  static obtenerConfiguraciones() {
    return {
      tipos_reporte: [
        { value: 'general', label: 'General', descripcion: 'Métricas principales y resumen general' },
        { value: 'visitantes', label: 'Visitantes', descripcion: 'Análisis de registros y conversión' },
        { value: 'financiero', label: 'Financiero', descripcion: 'Ingresos, costos y ROI' },
        { value: 'comparativo', label: 'Comparativo', descripcion: 'Comparación entre períodos' },
        { value: 'demografico', label: 'Demográfico', descripcion: 'Perfil de participantes' }
      ],
      
      formatos_exportacion: [
        { value: 'pdf', label: 'PDF', icon: '📄' },
        { value: 'xlsx', label: 'Excel', icon: '📊' }
      ],
      
      frecuencias_programacion: [
        { value: 'diario', label: 'Diario', descripcion: 'Todos los días' },
        { value: 'semanal', label: 'Semanal', descripcion: 'Una vez por semana' },
        { value: 'mensual', label: 'Mensual', descripcion: 'Una vez por mes' }
      ],
      
      rangos_fecha_predefinidos: [
        { 
          value: 'hoy', 
          label: 'Hoy',
          obtenerRango: () => {
            const hoy = new Date();
            return {
              inicio: hoy.toISOString().split('T')[0],
              fin: hoy.toISOString().split('T')[0]
            };
          }
        },
        { 
          value: 'semana_actual', 
          label: 'Semana Actual',
          obtenerRango: () => {
            const hoy = new Date();
            const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
            const finSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 6));
            return {
              inicio: inicioSemana.toISOString().split('T')[0],
              fin: finSemana.toISOString().split('T')[0]
            };
          }
        },
        { 
          value: 'mes_actual', 
          label: 'Mes Actual',
          obtenerRango: () => {
            const hoy = new Date();
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
            return {
              inicio: inicioMes.toISOString().split('T')[0],
              fin: finMes.toISOString().split('T')[0]
            };
          }
        },
        { 
          value: 'trimestre_actual', 
          label: 'Trimestre Actual',
          obtenerRango: () => {
            const hoy = new Date();
            const trimestre = Math.floor(hoy.getMonth() / 3);
            const inicioTrimestre = new Date(hoy.getFullYear(), trimestre * 3, 1);
            const finTrimestre = new Date(hoy.getFullYear(), (trimestre + 1) * 3, 0);
            return {
              inicio: inicioTrimestre.toISOString().split('T')[0],
              fin: finTrimestre.toISOString().split('T')[0]
            };
          }
        },
        { 
          value: 'ano_actual', 
          label: 'Año Actual',
          obtenerRango: () => {
            const hoy = new Date();
            return {
              inicio: `${hoy.getFullYear()}-01-01`,
              fin: `${hoy.getFullYear()}-12-31`
            };
          }
        },
        { 
          value: 'ultimos_30_dias', 
          label: 'Últimos 30 días',
          obtenerRango: () => {
            const hoy = new Date();
            const hace30Dias = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));
            return {
              inicio: hace30Dias.toISOString().split('T')[0],
              fin: hoy.toISOString().split('T')[0]
            };
          }
        }
      ],
      
      colores_graficos: {
        primary: 'rgba(59, 130, 246, 0.8)',
        secondary: 'rgba(16, 185, 129, 0.8)',
        tertiary: 'rgba(245, 158, 11, 0.8)',
        quaternary: 'rgba(139, 92, 246, 0.8)',
        quinternary: 'rgba(239, 68, 68, 0.8)'
      }
    };
  }

  /**
   * Aplicar rango de fecha predefinido
   */
  static aplicarRangoFechaPredefinido(rango) {
    const configuraciones = this.obtenerConfiguraciones();
    const rangoPredefinido = configuraciones.rangos_fecha_predefinidos.find(r => r.value === rango);
    
    if (rangoPredefinido) {
      return rangoPredefinido.obtenerRango();
    }
    
    return null;
  }

  /**
   * Formatear datos para gráficos
   */
  static formatearDatosGrafico(datos, tipo = 'bar', opciones = {}) {
    const configuraciones = this.obtenerConfiguraciones();
    
    const datosFormateados = {
      labels: datos.labels || [],
      datasets: []
    };

    if (tipo === 'bar' || tipo === 'line') {
      datosFormateados.datasets.push({
        label: opciones.label || 'Datos',
        data: datos.data || [],
        backgroundColor: opciones.backgroundColor || configuraciones.colores_graficos.primary,
        borderColor: opciones.borderColor || configuraciones.colores_graficos.primary.replace('0.8', '1'),
        borderWidth: opciones.borderWidth || 1,
        fill: tipo === 'line' ? (opciones.fill || false) : undefined
      });
    } else if (tipo === 'pie' || tipo === 'doughnut') {
      const colores = Object.values(configuraciones.colores_graficos);
      datosFormateados.datasets.push({
        data: datos.data || [],
        backgroundColor: datos.data?.map((_, index) => colores[index % colores.length]) || []
      });
    }

    return datosFormateados;
  }

  /**
   * Generar opciones de gráfico estándar
   */
  static generarOpcionesGrafico(tipo = 'bar', configuracion = {}) {
    const opcionesBase = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: configuracion.legendPosition || 'top',
          display: configuracion.showLegend !== false
        },
        title: {
          display: !!configuracion.titulo,
          text: configuracion.titulo || ''
        },
        tooltip: {
          enabled: configuracion.showTooltip !== false
        }
      }
    };

    if (tipo === 'bar' || tipo === 'line') {
      opcionesBase.scales = {
        y: {
          beginAtZero: configuracion.beginAtZero !== false,
          grid: {
            display: configuracion.showGrid !== false
          }
        },
        x: {
          grid: {
            display: configuracion.showGrid !== false
          }
        }
      };
    }

    return opcionesBase;
  }

  /**
   * Calcular métricas derivadas
   */
  static calcularMetricas(datos) {
    if (!datos || typeof datos !== 'object') return {};

    const metricas = {};

    // Calcular totales
    if (Array.isArray(datos.series)) {
      metricas.total = datos.series.reduce((sum, valor) => sum + (valor || 0), 0);
      metricas.promedio = metricas.total / datos.series.length;
      metricas.maximo = Math.max(...datos.series);
      metricas.minimo = Math.min(...datos.series);
    }

    // Calcular variación porcentual
    if (datos.actual !== undefined && datos.anterior !== undefined) {
      metricas.variacion_porcentual = datos.anterior > 0 
        ? ((datos.actual - datos.anterior) / datos.anterior * 100).toFixed(2)
        : 0;
      metricas.variacion_absoluta = datos.actual - datos.anterior;
    }

    // Calcular tasa de crecimiento
    if (Array.isArray(datos.series) && datos.series.length >= 2) {
      const ultimo = datos.series[datos.series.length - 1];
      const anterior = datos.series[datos.series.length - 2];
      metricas.tasa_crecimiento = anterior > 0 
        ? ((ultimo - anterior) / anterior * 100).toFixed(2)
        : 0;
    }

    return metricas;
  }

  /**
   * Validar configuración de reporte
   */
  static validarConfiguracion(configuracion) {
    const errores = [];

    if (!configuracion.tipo_reporte) {
      errores.push('Tipo de reporte es requerido');
    }

    if (!configuracion.evento_id) {
      errores.push('Evento es requerido');
    }

    if (configuracion.fecha_inicio && configuracion.fecha_fin) {
      if (new Date(configuracion.fecha_inicio) > new Date(configuracion.fecha_fin)) {
        errores.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    if (configuracion.destinatarios && Array.isArray(configuracion.destinatarios)) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      configuracion.destinatarios.forEach((email, index) => {
        if (!emailRegex.test(email)) {
          errores.push(`Email inválido en posición ${index + 1}: ${email}`);
        }
      });
    }

    return errores;
  }

  /**
   * Obtener resumen de reporte
   */
  static generarResumenReporte(datosReporte, tipoReporte) {
    const resumen = {
      tipo: tipoReporte,
      fecha_generacion: new Date().toISOString(),
      total_datos: 0,
      metricas_principales: {},
      puntos_clave: []
    };

    switch (tipoReporte) {
      case 'general':
        if (datosReporte.metricas_principales) {
          resumen.metricas_principales = datosReporte.metricas_principales;
          resumen.puntos_clave = [
            `Total de ${datosReporte.metricas_principales.total_registros || 0} registros`,
            `Tasa de conversión del ${datosReporte.metricas_principales.tasa_conversion || 0}%`,
            `Ingresos totales: $${(datosReporte.metricas_principales.ingresos_totales || 0).toLocaleString()}`
          ];
        }
        break;
        
      case 'visitantes':
        if (datosReporte.embudo_conversion) {
          const conversion = datosReporte.embudo_conversion;
          const tasaFinal = conversion.visitas_web > 0 
            ? ((conversion.asistieron_evento / conversion.visitas_web) * 100).toFixed(2)
            : 0;
          resumen.puntos_clave = [
            `${conversion.visitas_web || 0} visitas web`,
            `${conversion.completaron_registro || 0} registros completados`,
            `Tasa de conversión final: ${tasaFinal}%`
          ];
        }
        break;
        
      case 'financiero':
        if (datosReporte.metricas_financieras) {
          const metricas = datosReporte.metricas_financieras;
          resumen.metricas_principales = metricas;
          resumen.puntos_clave = [
            `ROI: ${metricas.roi || 0}%`,
            `Margen de beneficio: ${metricas.margen_beneficio || 0}%`,
            `Beneficio neto: $${(metricas.beneficio_neto || 0).toLocaleString()}`
          ];
        }
        break;
    }

    return resumen;
  }
}

export default ReportesService;