import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const DocumentosPorVencer = () => {
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroUrgencia, setFiltroUrgencia] = useState('all'); // 'all', 'vencido', 'critico', 'proximo'

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/empresas-expositoras/documentos-vencer');
        setEmpresas(res.data.data || []);
      } catch {
        setError('No se pudo obtener la información de documentos');
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresas();
  }, []);

  const calcularDiasRestantes = (fechaVencimiento) => {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const getUrgenciaBadge = (diasRestantes) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    if (diasRestantes < 0) {
      return {
        classes: `${baseClasses} bg-red-900 text-red-200`,
        label: `Vencido (${Math.abs(diasRestantes)} días)`,
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        tipo: 'vencido'
      };
    } else if (diasRestantes === 0) {
      return {
        classes: `${baseClasses} bg-red-800 text-red-100`,
        label: 'Vence hoy',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        tipo: 'critico'
      };
    } else if (diasRestantes <= 7) {
      return {
        classes: `${baseClasses} bg-orange-900 text-orange-200`,
        label: `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`,
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        tipo: 'critico'
      };
    } else if (diasRestantes <= 30) {
      return {
        classes: `${baseClasses} bg-yellow-900 text-yellow-200`,
        label: `${diasRestantes} días`,
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        tipo: 'proximo'
      };
    } else {
      return {
        classes: `${baseClasses} bg-green-900 text-green-200`,
        label: `${diasRestantes} días`,
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        tipo: 'normal'
      };
    }
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const empresasConDias = empresas.map(emp => ({
    ...emp,
    diasRestantes: calcularDiasRestantes(emp.fecha_vencimiento_documentos),
    urgencia: getUrgenciaBadge(calcularDiasRestantes(emp.fecha_vencimiento_documentos))
  }));

  const empresasFiltradas = empresasConDias.filter(emp => {
    if (filtroUrgencia === 'all') return true;
    return emp.urgencia.tipo === filtroUrgencia;
  });

  const estadisticas = {
    total: empresasConDias.length,
    vencidos: empresasConDias.filter(emp => emp.diasRestantes < 0).length,
    criticos: empresasConDias.filter(emp => emp.diasRestantes >= 0 && emp.diasRestantes <= 7).length,
    proximos: empresasConDias.filter(emp => emp.diasRestantes > 7 && emp.diasRestantes <= 30).length,
    normales: empresasConDias.filter(emp => emp.diasRestantes > 30).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
          <p className="text-gray-300 font-medium">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gray-700 rounded-lg border border-red-600 p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Error</h3>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Documentos por Vencer</h2>
        <p className="text-gray-400">Monitoreo de vencimientos de documentos legales</p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total</p>
              <p className="text-2xl font-semibold text-white">{estadisticas.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg border border-red-600 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Vencidos</p>
              <p className="text-2xl font-semibold text-red-300">{estadisticas.vencidos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg border border-orange-600 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Críticos</p>
              <p className="text-2xl font-semibold text-orange-300">{estadisticas.criticos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg border border-yellow-600 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Próximos</p>
              <p className="text-2xl font-semibold text-yellow-300">{estadisticas.proximos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {empresas.length > 0 && (
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-4">
          <h3 className="text-sm font-medium text-white mb-3">Filtrar por urgencia:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFiltroUrgencia('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filtroUrgencia === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Todos ({estadisticas.total})
            </button>
            <button
              onClick={() => setFiltroUrgencia('vencido')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filtroUrgencia === 'vencido'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Vencidos ({estadisticas.vencidos})
            </button>
            <button
              onClick={() => setFiltroUrgencia('critico')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filtroUrgencia === 'critico'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Críticos ({estadisticas.criticos})
            </button>
            <button
              onClick={() => setFiltroUrgencia('proximo')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filtroUrgencia === 'proximo'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Próximos ({estadisticas.proximos})
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {empresas.length === 0 ? (
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No hay documentos próximos a vencer
          </h3>
          <p className="text-gray-400">
            Todas las empresas tienen sus documentos al día
          </p>
        </div>
      ) : empresasFiltradas.length === 0 ? (
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-8 text-center">
          <h3 className="text-lg font-medium text-white mb-2">
            No hay empresas en esta categoría
          </h3>
          <p className="text-gray-400">
            Prueba cambiando el filtro de urgencia
          </p>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden">
          {/* Header de la tabla */}
          <div className="bg-gray-600 px-6 py-4 border-b border-gray-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentos por Vencer
              </h3>
              <span className="text-sm text-gray-300">
                Mostrando {empresasFiltradas.length} de {empresas.length} empresas
              </span>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fecha Vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contacto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {empresasFiltradas
                  .sort((a, b) => a.diasRestantes - b.diasRestantes)
                  .map((emp) => (
                    <tr key={emp.id_empresa} className="hover:bg-gray-600 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {emp.logo_url ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover border border-gray-500"
                                src={emp.logo_url}
                                alt={`Logo ${emp.nombre_empresa}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {emp.nombre_empresa.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">
                              {emp.nombre_empresa}
                            </div>
                            <div className="text-xs text-gray-400">
                              RUC: {emp.ruc}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {emp.documentos_legales || 'Documentos legales'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {formatFecha(emp.fecha_vencimiento_documentos)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={emp.urgencia.classes}>
                          {emp.urgencia.icon}
                          {emp.urgencia.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm text-white">{emp.email_contacto}</div>
                        {emp.telefono_contacto && (
                          <div className="text-xs text-gray-400">{emp.telefono_contacto}</div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nota informativa */}
      {empresas.length > 0 && (
        <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-200">Recordatorio</h4>
              <div className="mt-1 text-sm text-blue-300 space-y-1">
                <p>• Los documentos vencidos requieren atención inmediata</p>
                <p>• Los documentos críticos (≤7 días) necesitan renovación urgente</p>
                <p>• Contacta a las empresas con documentos próximos a vencer</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentosPorVencer;