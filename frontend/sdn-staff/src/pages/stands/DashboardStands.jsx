import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useStands } from '../../contexts/StandsContext';
import standsService from '../../services/standsService';
import ListadoStands from './ListadoStands';
import AgregarStand from './AgregarStand';

const TABS = [
  { 
    key: "dashboard", 
    label: "Dashboard", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    key: "listado", 
    label: "Listado", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  { 
    key: "agregar", 
    label: "Agregar Stand", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )
  },
  { 
    key: "mantenimiento", 
    label: "Mantenimiento", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
];

const DashboardStands = () => {
  const [stats, setStats] = useState({
    totalStands: 0,
    standsDisponibles: 0,
    standsOcupados: 0,
    standsMantenimiento: 0,
    standsReservados: 0
  });
  const [standsRecientes, setStandsRecientes] = useState([]);
  const [tiposStand, setTiposStand] = useState([]);
  const [standsMantenimiento, setStandsMantenimiento] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const { refreshTrigger, triggerRefresh } = useStands();

  const allowedRoles = ["administrador", "manager", "staff"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Obtener estadísticas
      const statsResponse = await standsService.getStandStats();
      const statsData = statsResponse.data || statsResponse;
      
      // Mapear las estadísticas del backend al formato esperado por el frontend
      setStats({
        totalStands: statsData.total || 0,
        standsDisponibles: statsData.disponibles || 0,
        standsOcupados: statsData.ocupados || 0,
        standsMantenimiento: statsData.mantenimiento || 0,
        standsReservados: 0 // El backend no tiene este campo específico, se puede calcular si es necesario
      });

      // Obtener stands recientes
      const standsResponse = await standsService.getAllStands(1, 5);
      setStandsRecientes(standsResponse.data || []);

      // Obtener tipos de stand
      const tiposResponse = await standsService.getTiposStand();
      setTiposStand(tiposResponse.data || []);

      // Obtener stands en mantenimiento
      const mantenimientoResponse = await standsService.getStandsByStatus('mantenimiento', 1, 10);
      setStandsMantenimiento(mantenimientoResponse.data || []);

    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      disponible: 'bg-green-900 text-green-200',
      ocupado: 'bg-red-900 text-red-200',
      mantenimiento: 'bg-yellow-900 text-yellow-200',
      reservado: 'bg-blue-900 text-blue-200'
    };
    return estados[estado] || 'bg-gray-900 text-gray-200';
  };

  const getPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0;
  };

  const handleRestoreStand = async (id) => {
    try {
      await standsService.restoreStand(id);
      fetchDashboardData(); // Recargar datos
    } catch (err) {
      setError('Error al restaurar el stand');
    }
  };

  if (!isAuthorized) {
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
              <h3 className="text-lg font-medium text-white">No autorizado</h3>
              <p className="text-gray-300">No tienes permisos para acceder a esta sección</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-400">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Stands</h1>
        <p className="mt-2 text-gray-300">Gestiona y supervisa todos los stands del sistema</p>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6">
        <nav className="flex space-x-0" aria-label="Tabs">
          {TABS.map((tab, index) => (
            <button
              key={tab.key}
              className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-sm font-medium text-center hover:bg-gray-700 focus:z-10 transition-all duration-200 ${
                index === 0 ? 'rounded-l-lg' : ''
              } ${
                index === TABS.length - 1 ? 'rounded-r-lg' : ''
              } ${
                activeTab === tab.key
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
                  : 'text-gray-300 border-b-2 border-transparent hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              <div className="flex items-center justify-center space-x-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        {activeTab === "dashboard" && (
          <div className="p-6">
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total de Stands */}
              <StatCard 
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                label="Total Stands" 
                value={stats.totalStands} 
                color="bg-blue-600 border-blue-500" 
                textColor="text-blue-100"
              />

              {/* Stands Disponibles */}
              <StatCard 
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                label="Disponibles" 
                value={stats.standsDisponibles} 
                color="bg-green-600 border-green-500" 
                textColor="text-green-100"
                percentage={getPercentage(stats.standsDisponibles, stats.totalStands)}
              />

              {/* Stands Ocupados */}
              <StatCard 
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
                label="Ocupados" 
                value={stats.standsOcupados} 
                color="bg-red-600 border-red-500" 
                textColor="text-red-100"
                percentage={getPercentage(stats.standsOcupados, stats.totalStands)}
              />

              {/* Stands en Mantenimiento */}
              <StatCard 
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
                label="Mantenimiento" 
                value={stats.standsMantenimiento} 
                color="bg-yellow-600 border-yellow-500" 
                textColor="text-yellow-100"
                percentage={getPercentage(stats.standsMantenimiento, stats.totalStands)}
              />

              {/* Stands Reservados */}
              <StatCard 
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12h0m-8 0h16a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                }
                label="Reservados" 
                value={stats.standsReservados} 
                color="bg-purple-600 border-purple-500" 
                textColor="text-purple-100"
                percentage={getPercentage(stats.standsReservados, stats.totalStands)}
              />
            </div>

            {/* Stands recientes */}
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-600 px-6 py-4 border-b border-gray-500">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Stands Recientes
                </h3>
              </div>
              
              {standsRecientes.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No hay stands recientes</h3>
                  <p className="text-gray-400">Crea tu primer stand para comenzar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Stand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Área
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Precio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-700 divide-y divide-gray-600">
                      {standsRecientes.map((stand) => (
                        <tr key={stand.id_stand} className="hover:bg-gray-600 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {stand.nombre_stand}
                              </div>
                              {stand.numero_stand && (
                                <div className="text-sm text-gray-400">
                                  {stand.numero_stand}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-200">
                              {stand.tipoStand?.nombre_tipo || 'No especificado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoBadge(stand.estado_fisico)}`}>
                              {stand.estado_fisico}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {stand.ubicacion || 'No especificada'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {stand.area} m²
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {stand.precio_personalizado ? (
                              <span className="text-green-400 font-medium">
                                S/ {parseFloat(stand.precio_personalizado).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-gray-500 italic">No especificado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tipos de stand disponibles */}
            <div className="mt-6 bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Tipos de Stand Disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiposStand.map((tipo) => (
                  <div key={tipo.id_tipo_stand} className="bg-gray-600 rounded-lg p-4 border border-gray-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-white">{tipo.nombre_tipo}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Área: {tipo.area_minima} - {tipo.area_maxima} m²
                        </p>
                        {tipo.precio_base && (
                          <p className="text-xs text-gray-400">
                            Precio: ${tipo.precio_base}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-200">
                          {tipo.orden_visualizacion || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {tiposStand.length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay tipos de stand configurados</p>
              )}
            </div>
          </div>
        )}

        {activeTab === "listado" && (
          <div className="p-6">
            <ListadoStands />
          </div>
        )}

        {activeTab === "agregar" && (
          <div className="p-6">
            <AgregarStand />
          </div>
        )}

        {activeTab === "mantenimiento" && (
          <div className="p-6">
            <div className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-600 px-6 py-4 border-b border-gray-500">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Stands en Mantenimiento
                </h3>
              </div>
              
              {standsMantenimiento.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No hay stands en mantenimiento</h3>
                  <p className="text-gray-400">Todos los stands están operativos</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Stand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Área
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-700 divide-y divide-gray-600">
                      {standsMantenimiento.map((stand) => (
                        <tr key={stand.id_stand} className="hover:bg-gray-600 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {stand.nombre_stand}
                              </div>
                              {stand.numero_stand && (
                                <div className="text-sm text-gray-400">
                                  {stand.numero_stand}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900 text-purple-200">
                              {stand.tipoStand?.nombre_tipo || 'No especificado'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {stand.ubicacion || 'No especificada'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {stand.area} m²
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleRestoreStand(stand.id_stand)}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              Restaurar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente StatCard
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

export default DashboardStands; 