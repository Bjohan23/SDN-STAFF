import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import standsService from '../../services/standsService';

const ListadoStands = () => {
  const [stands, setStands] = useState([]);
  const [tiposStand, setTiposStand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const estados = [
    { value: '', label: 'Todos los estados' },
    { value: 'disponible', label: 'Disponible', color: 'bg-green-900 text-green-200' },
    { value: 'ocupado', label: 'Ocupado', color: 'bg-red-900 text-red-200' },
    { value: 'mantenimiento', label: 'Mantenimiento', color: 'bg-yellow-900 text-yellow-200' },
    { value: 'reservado', label: 'Reservado', color: 'bg-blue-900 text-blue-200' }
  ];

  const allowedRoles = ["administrador", "manager", "staff"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  useEffect(() => {
    fetchStands();
    fetchTiposStand();
  }, [currentPage, filtroTipo, filtroEstado, searchTerm]);

  const fetchStands = async () => {
    setLoading(true);
    try {
      // Construir filtros
      const filters = {};
      if (filtroTipo) {
        filters.id_tipo_stand = filtroTipo;
      }
      if (filtroEstado) {
        filters.estado_fisico = filtroEstado;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }

      // Usar el endpoint principal con filtros
      const response = await standsService.getAllStands(currentPage, 10, filters);
      
      setStands(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError('Error al cargar los stands');
      console.error('Error fetching stands:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposStand = async () => {
    try {
      const response = await standsService.getTiposStand();
      setTiposStand(response.data || []);
    } catch (err) {
      console.error('Error fetching tipos stand:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este stand?')) {
      try {
        await standsService.deleteStand(id);
        fetchStands();
      } catch (err) {
        setError('Error al eliminar el stand');
      }
    }
  };

  const getEstadoBadge = (estado) => {
    const estadoConfig = estados.find(e => e.value === estado);
    if (!estadoConfig) return 'bg-gray-900 text-gray-200';
    return estadoConfig.color;
  };

  const filteredStands = stands.filter(stand =>
    stand.nombre_stand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stand.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stand.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthorized) {
    console.log('Usuario no autorizado:', {
      user,
      userRoles,
      allowedRoles,
      isAuthorized
    });
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
              <p className="text-xs text-gray-400 mt-2">
                Roles del usuario: {userRoles.join(', ')}
              </p>
              <p className="text-xs text-gray-400">
                Roles permitidos: {allowedRoles.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por nombre, descripción o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Stand</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {tiposStand.map((tipo) => (
                <option key={tipo.id_tipo_stand} value={tipo.id_tipo_stand}>
                  {tipo.nombre_tipo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {estados.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroTipo('');
                setFiltroEstado('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-400 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de stands */}
      <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Cargando stands...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : filteredStands.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No se encontraron stands</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {filteredStands.map((stand) => (
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
                      {stand.precio_base ? `$${stand.precio_base}` : 'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.location.href = `/stands/editar/${stand.id_stand}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(stand.id_stand)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListadoStands; 