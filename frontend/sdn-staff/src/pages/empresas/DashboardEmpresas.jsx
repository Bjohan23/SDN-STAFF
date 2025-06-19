import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const DashboardEmpresas = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/empresasExpositoras/stats');
        setStats(res.data.data);
      } catch {
        setError('No se pudo obtener estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
          <p className="text-gray-300 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-gray-700 rounded-lg border border-red-500 p-6 max-w-md">
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

  const getPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard de Empresas Expositoras</h2>
        <p className="text-gray-400">Resumen general y estadísticas clave</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          label="Total" 
          value={stats?.total || 0} 
          color="bg-blue-600 border-blue-500" 
          textColor="text-blue-100"
        />
        <StatCard 
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Aprobadas" 
          value={stats?.aprobadas || 0} 
          color="bg-green-600 border-green-500" 
          textColor="text-green-100"
          percentage={getPercentage(stats?.aprobadas, stats?.total)}
        />
        <StatCard 
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Pendientes" 
          value={stats?.pendientes || 0} 
          color="bg-yellow-600 border-yellow-500" 
          textColor="text-yellow-100"
          percentage={getPercentage(stats?.pendientes, stats?.total)}
        />
        <StatCard 
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          label="Rechazadas" 
          value={stats?.rechazadas || 0} 
          color="bg-red-600 border-red-500" 
          textColor="text-red-100"
          percentage={getPercentage(stats?.rechazadas, stats?.total)}
        />
        <StatCard 
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          }
          label="Suspendidas" 
          value={stats?.suspendidas || 0} 
          color="bg-gray-600 border-gray-500" 
          textColor="text-gray-100"
        />
        <StatCard 
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          label="Eliminadas" 
          value={stats?.eliminadas || 0} 
          color="bg-gray-700 border-gray-600" 
          textColor="text-gray-300"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Por Sector */}
        <div className="bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Distribución por Sector
            </h3>
            <span className="text-sm text-gray-400">
              {stats?.porSector?.length || 0} sectores
            </span>
          </div>
          
          {stats?.porSector?.length ? (
            <div className="space-y-3">
              {stats.porSector.map((s, index) => (
                <div key={s.sector} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getSectorColor(index)}`}></div>
                    <span className="text-gray-200 text-sm font-medium">{s.sector}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold text-sm">{s.count}</span>
                    <span className="text-gray-400 text-xs">
                      ({getPercentage(s.count, stats.total)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 text-gray-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No hay datos de sectores disponibles</p>
            </div>
          )}
        </div>

        {/* Por Tamaño */}
        <div className="bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Distribución por Tamaño
            </h3>
            <span className="text-sm text-gray-400">
              {stats?.porTamaño?.length || 0} categorías
            </span>
          </div>
          
          {stats?.porTamaño?.length ? (
            <div className="space-y-3">
              {stats.porTamaño.map((t, index) => (
                <div key={t.tamaño_empresa} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${getTamañoColor(index)}`}></div>
                    <span className="text-gray-200 text-sm font-medium capitalize">{t.tamaño_empresa}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold text-sm">{t.count}</span>
                    <span className="text-gray-400 text-xs">
                      ({getPercentage(t.count, stats.total)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 text-gray-500">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No hay datos de tamaños disponibles</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      {stats && (
        <div className="bg-gray-700 rounded-lg shadow-lg border border-gray-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-300">Última actualización: {new Date().toLocaleString('es-PE')}</span>
            </div>
            <div className="text-sm text-gray-400">
              Empresas activas: <span className="text-green-400 font-medium">{stats.aprobadas || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente StatCard mejorado
function StatCard({ icon, label, value, color, textColor, percentage }) {
  return (
    <div className={`rounded-lg shadow-lg border p-4 transition-transform hover:scale-105 ${color}`}>
      <div className="flex flex-col items-center text-center space-y-2">
        <div className={`${textColor} mb-1`}>
          {icon}
        </div>
        <div className={`text-sm font-medium ${textColor}`}>{label}</div>
        <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
        {percentage !== undefined && (
          <div className={`text-xs opacity-80 ${textColor}`}>
            {percentage}%
          </div>
        )}
      </div>
    </div>
  );
}

// Función para obtener colores de sectores
function getSectorColor(index) {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500'
  ];
  return colors[index % colors.length];
}

// Función para obtener colores de tamaños
function getTamañoColor(index) {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-indigo-500'
  ];
  return colors[index % colors.length];
}

export default DashboardEmpresas;