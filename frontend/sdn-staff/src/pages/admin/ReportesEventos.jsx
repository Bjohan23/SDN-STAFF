import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  CalendarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  FunnelIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import axios from '../../config/axios';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportesEventos = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [tipoReporte, setTipoReporte] = useState('general');
  const [rangoFechas, setRangoFechas] = useState({
    inicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });
  
  // Estados para los datos de reportes
  const [reporteGeneral, setReporteGeneral] = useState(null);
  const [reporteVisitantes, setReporteVisitantes] = useState(null);
  const [reporteFinanciero, setReporteFinanciero] = useState(null);
  const [reporteComparativo, setReporteComparativo] = useState(null);
  const [reporteDemo, setReporteDemo] = useState(null);

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarReportes();
    }
  }, [eventoSeleccionado, rangoFechas, tipoReporte]);

  const cargarEventos = async () => {
    try {
      const response = await axios.get('/api/eventos');
      setEventos(response.data.data || []);
      if (response.data.data.length > 0) {
        setEventoSeleccionado(response.data.data[0].id);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarReportes = async () => {
    try {
      setLoading(true);
      
      const params = {
        evento_id: eventoSeleccionado,
        fecha_inicio: rangoFechas.inicio,
        fecha_fin: rangoFechas.fin
      };

      // Cargar diferentes tipos de reportes según la selección
      switch (tipoReporte) {
        case 'general':
          await cargarReporteGeneral(params);
          break;
        case 'visitantes':
          await cargarReporteVisitantes(params);
          break;
        case 'financiero':
          await cargarReporteFinanciero(params);
          break;
        case 'comparativo':
          await cargarReporteComparativo(params);
          break;
        case 'demografico':
          await cargarReporteDemografico(params);
          break;
        default:
          await cargarReporteGeneral(params);
      }
      
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarReporteGeneral = async (params) => {
    try {
      // Simular datos del reporte general
      const mockData = {
        metricas_principales: {
          total_visitantes: 1250,
          tasa_conversion: 78.5,
          ingresos_totales: 45750,
          eventos_realizados: 12,
          satisfaccion_promedio: 4.6
        },
        visitantes_por_mes: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          data: [320, 450, 380, 520, 620, 580]
        },
        tipos_participacion: {
          labels: ['Visitante', 'Profesional', 'VIP', 'Estudiante', 'Prensa'],
          data: [450, 320, 180, 250, 50]
        },
        eventos_populares: [
          { nombre: 'Tech Summit 2024', visitantes: 450, rating: 4.8 },
          { nombre: 'Business Forum', visitantes: 380, rating: 4.6 },
          { nombre: 'Innovation Day', visitantes: 320, rating: 4.7 },
          { nombre: 'Startup Showcase', visitantes: 280, rating: 4.5 }
        ]
      };
      
      setReporteGeneral(mockData);
    } catch (error) {
      console.error('Error cargando reporte general:', error);
    }
  };

  const cargarReporteVisitantes = async (params) => {
    try {
      const mockData = {
        registro_diario: {
          labels: Array.from({length: 30}, (_, i) => `Día ${i+1}`),
          data: Array.from({length: 30}, () => Math.floor(Math.random() * 50) + 10)
        },
        fuentes_trafico: {
          labels: ['Redes Sociales', 'Web Directa', 'Email Marketing', 'Referidos', 'Publicidad'],
          data: [35, 25, 20, 15, 5]
        },
        conversion_embudo: {
          visitantes_web: 5000,
          iniciaron_registro: 2500,
          completaron_registro: 1250,
          asistieron_evento: 980
        },
        segmentacion_intereses: {
          labels: ['Tecnología', 'Negocios', 'Marketing', 'Innovación', 'Educación'],
          data: [320, 280, 245, 205, 180]
        }
      };
      
      setReporteVisitantes(mockData);
    } catch (error) {
      console.error('Error cargando reporte de visitantes:', error);
    }
  };

  const cargarReporteFinanciero = async (params) => {
    try {
      const mockData = {
        ingresos_mensuales: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          data: [12500, 18750, 15200, 22300, 28900, 31200]
        },
        ingresos_por_tipo: {
          labels: ['Profesional', 'VIP', 'Estudiante', 'Patrocinios'],
          data: [25000, 15000, 3750, 12000]
        },
        costos_vs_ingresos: {
          labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          ingresos: [12500, 18750, 15200, 22300, 28900, 31200],
          costos: [8500, 12200, 11800, 15600, 19200, 20800]
        },
        roi_eventos: 68.5,
        margen_beneficio: 45.2
      };
      
      setReporteFinanciero(mockData);
    } catch (error) {
      console.error('Error cargando reporte financiero:', error);
    }
  };

  const cargarReporteComparativo = async (params) => {
    try {
      const mockData = {
        comparacion_anual: {
          labels: ['2022', '2023', '2024'],
          datasets: [
            {
              label: 'Visitantes',
              data: [2800, 3450, 4200],
              backgroundColor: 'rgba(59, 130, 246, 0.8)'
            },
            {
              label: 'Ingresos (miles)',
              data: [85, 127, 156],
              backgroundColor: 'rgba(16, 185, 129, 0.8)'
            }
          ]
        },
        eventos_por_trimestre: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          data_2023: [8, 12, 15, 10],
          data_2024: [10, 15, 18, 12]
        },
        crecimiento_porcentual: {
          visitantes: 21.7,
          ingresos: 22.8,
          eventos: 13.6,
          satisfaccion: 8.2
        }
      };
      
      setReporteComparativo(mockData);
    } catch (error) {
      console.error('Error cargando reporte comparativo:', error);
    }
  };

  const cargarReporteDemografico = async (params) => {
    try {
      const mockData = {
        edad_participantes: {
          labels: ['18-25', '26-35', '36-45', '46-55', '56+'],
          data: [180, 420, 350, 250, 150]
        },
        genero: {
          labels: ['Femenino', 'Masculino', 'Otro'],
          data: [48, 50, 2]
        },
        ubicacion_geografica: {
          labels: ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Otras'],
          data: [45, 30, 12, 8, 5]
        },
        sectores_empresa: {
          labels: ['Tecnología', 'Finanzas', 'Salud', 'Educación', 'Manufactura'],
          data: [280, 220, 180, 150, 120]
        },
        nivel_experiencia: {
          labels: ['0-2 años', '3-5 años', '6-10 años', '11-15 años', '16+ años'],
          data: [200, 320, 380, 250, 180]
        }
      };
      
      setReporteDemo(mockData);
    } catch (error) {
      console.error('Error cargando reporte demográfico:', error);
    }
  };

  const exportarReporte = async (formato) => {
    try {
      const response = await axios.get(`/api/reportes/evento/${eventoSeleccionado}/exportar`, {
        params: {
          tipo: tipoReporte,
          formato,
          fecha_inicio: rangoFechas.inicio,
          fecha_fin: rangoFechas.fin
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { 
        type: formato === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-${tipoReporte}-${eventoSeleccionado}-${new Date().toISOString().split('T')[0]}.${formato}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando reporte:', error);
    }
  };

  const enviarPorEmail = async () => {
    try {
      await axios.post(`/api/reportes/evento/${eventoSeleccionado}/enviar-email`, {
        tipo: tipoReporte,
        destinatarios: [user.email],
        fecha_inicio: rangoFechas.inicio,
        fecha_fin: rangoFechas.fin
      });
      
      alert('Reporte enviado por email exitosamente');
    } catch (error) {
      console.error('Error enviando reporte:', error);
      alert('Error al enviar el reporte');
    }
  };

  const opcionesGrafico = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const opcionesGraficoPastel = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Analytics</h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado del rendimiento de eventos
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => exportarReporte('pdf')}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            PDF
          </button>
          
          <button
            onClick={() => exportarReporte('xlsx')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
            Excel
          </button>
          
          <button
            onClick={enviarPorEmail}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ShareIcon className="w-5 h-5 mr-2" />
            Enviar Email
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evento
            </label>
            <select
              value={eventoSeleccionado || ''}
              onChange={(e) => setEventoSeleccionado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los eventos</option>
              {eventos.map(evento => (
                <option key={evento.id} value={evento.id}>
                  {evento.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="general">General</option>
              <option value="visitantes">Visitantes</option>
              <option value="financiero">Financiero</option>
              <option value="comparativo">Comparativo</option>
              <option value="demografico">Demográfico</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={rangoFechas.inicio}
              onChange={(e) => setRangoFechas(prev => ({ ...prev, inicio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={rangoFechas.fin}
              onChange={(e) => setRangoFechas(prev => ({ ...prev, fin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reporte General */}
      {tipoReporte === 'general' && reporteGeneral && (
        <div className="space-y-8">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UsersIcon className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Visitantes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteGeneral.metricas_principales.total_visitantes.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUpIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteGeneral.metricas_principales.tasa_conversion}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reporteGeneral.metricas_principales.ingresos_totales.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CalendarIcon className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Eventos Realizados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteGeneral.metricas_principales.eventos_realizados}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Satisfacción</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteGeneral.metricas_principales.satisfaccion_promedio}/5
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitantes por Mes</h3>
              <Bar
                data={{
                  labels: reporteGeneral.visitantes_por_mes.labels,
                  datasets: [{
                    label: 'Visitantes',
                    data: reporteGeneral.visitantes_por_mes.data,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                  }]
                }}
                options={opcionesGrafico}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Participación</h3>
              <Doughnut
                data={{
                  labels: reporteGeneral.tipos_participacion.labels,
                  datasets: [{
                    data: reporteGeneral.tipos_participacion.data,
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ]
                  }]
                }}
                options={opcionesGraficoPastel}
              />
            </div>
          </div>

          {/* Eventos populares */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventos Más Populares</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitantes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reporteGeneral.eventos_populares.map((evento, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {evento.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {evento.visitantes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ⭐ {evento.rating}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reporte de Visitantes */}
      {tipoReporte === 'visitantes' && reporteVisitantes && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registro Diario</h3>
              <Line
                data={{
                  labels: reporteVisitantes.registro_diario.labels,
                  datasets: [{
                    label: 'Registros',
                    data: reporteVisitantes.registro_diario.data,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true
                  }]
                }}
                options={opcionesGrafico}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuentes de Tráfico</h3>
              <Pie
                data={{
                  labels: reporteVisitantes.fuentes_trafico.labels,
                  datasets: [{
                    data: reporteVisitantes.fuentes_trafico.data,
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ]
                  }]
                }}
                options={opcionesGraficoPastel}
              />
            </div>
          </div>

          {/* Embudo de conversión */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Embudo de Conversión</h3>
            <div className="space-y-4">
              {Object.entries(reporteVisitantes.conversion_embudo).map(([etapa, valor], index) => {
                const porcentaje = index === 0 ? 100 : (valor / reporteVisitantes.conversion_embudo.visitantes_web * 100);
                return (
                  <div key={etapa} className="flex items-center">
                    <div className="w-48 text-sm font-medium text-gray-700 capitalize">
                      {etapa.replace('_', ' ')}
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full transition-all duration-1000"
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-medium text-gray-900">{valor.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-2">({porcentaje.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reporte Financiero */}
      {tipoReporte === 'financiero' && reporteFinanciero && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUpIcon className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">ROI Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteFinanciero.roi_eventos}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Margen de Beneficio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteFinanciero.margen_beneficio}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos Mensuales</h3>
              <Bar
                data={{
                  labels: reporteFinanciero.ingresos_mensuales.labels,
                  datasets: [{
                    label: 'Ingresos ($)',
                    data: reporteFinanciero.ingresos_mensuales.data,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                  }]
                }}
                options={opcionesGrafico}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos por Tipo</h3>
              <Doughnut
                data={{
                  labels: reporteFinanciero.ingresos_por_tipo.labels,
                  datasets: [{
                    data: reporteFinanciero.ingresos_por_tipo.data,
                    backgroundColor: [
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                      'rgba(59, 130, 246, 0.8)'
                    ]
                  }]
                }}
                options={opcionesGraficoPastel}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Costos vs Ingresos</h3>
            <Bar
              data={{
                labels: reporteFinanciero.costos_vs_ingresos.labels,
                datasets: [
                  {
                    label: 'Ingresos',
                    data: reporteFinanciero.costos_vs_ingresos.ingresos,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)'
                  },
                  {
                    label: 'Costos',
                    data: reporteFinanciero.costos_vs_ingresos.costos,
                    backgroundColor: 'rgba(239, 68, 68, 0.8)'
                  }
                ]
              }}
              options={opcionesGrafico}
            />
          </div>
        </div>
      )}

      {/* Reporte Comparativo */}
      {tipoReporte === 'comparativo' && reporteComparativo && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Object.entries(reporteComparativo.crecimiento_porcentual).map(([metrica, valor]) => (
              <div key={metrica} className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 capitalize">
                    Crecimiento {metrica}
                  </p>
                  <p className={`text-2xl font-bold ${valor >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {valor >= 0 ? '+' : ''}{valor}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparación Anual</h3>
            <Bar
              data={reporteComparativo.comparacion_anual}
              options={opcionesGrafico}
            />
          </div>
        </div>
      )}

      {/* Reporte Demográfico */}
      {tipoReporte === 'demografico' && reporteDemo && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Edad</h3>
              <Bar
                data={{
                  labels: reporteDemo.edad_participantes.labels,
                  datasets: [{
                    label: 'Participantes',
                    data: reporteDemo.edad_participantes.data,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)'
                  }]
                }}
                options={opcionesGrafico}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Género</h3>
              <Pie
                data={{
                  labels: reporteDemo.genero.labels,
                  datasets: [{
                    data: reporteDemo.genero.data,
                    backgroundColor: [
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)'
                    ]
                  }]
                }}
                options={opcionesGraficoPastel}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación Geográfica</h3>
              <Doughnut
                data={{
                  labels: reporteDemo.ubicacion_geografica.labels,
                  datasets: [{
                    data: reporteDemo.ubicacion_geografica.data,
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                      'rgba(239, 68, 68, 0.8)'
                    ]
                  }]
                }}
                options={opcionesGraficoPastel}
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sectores de Empresa</h3>
              <Bar
                data={{
                  labels: reporteDemo.sectores_empresa.labels,
                  datasets: [{
                    label: 'Participantes',
                    data: reporteDemo.sectores_empresa.data,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)'
                  }]
                }}
                options={opcionesGrafico}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesEventos;