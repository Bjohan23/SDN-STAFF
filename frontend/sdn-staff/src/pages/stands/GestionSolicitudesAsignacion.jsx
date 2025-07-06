import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { 
  getAllSolicitudes, 
  aprobarSolicitud, 
  rechazarSolicitud, 
  asignarStand, 
  cancelarSolicitud 
} from '../../services/asignacionService';

const GestionSolicitudesAsignacion = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState({});
  const [filters, setFilters] = useState({
    estado_solicitud: '',
    modalidad_asignacion: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0
  });
  const { user } = useAuth();

  const estadosSolicitud = [
    { value: '', label: 'Todos los estados' },
    { value: 'solicitada', label: 'Solicitada' },
    { value: 'en_revision', label: 'En Revisión' },
    { value: 'aprobada', label: 'Aprobada' },
    { value: 'rechazada', label: 'Rechazada' },
    { value: 'asignada', label: 'Asignada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];

  const modalidadesAsignacion = [
    { value: '', label: 'Todas las modalidades' },
    { value: 'seleccion_directa', label: 'Selección Directa' },
    { value: 'manual', label: 'Manual' },
    { value: 'automatica', label: 'Automática' }
  ];

  const allowedRoles = ["administrador", "manager", "Editor"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

  useEffect(() => {
    if (isAuthorized) {
      fetchSolicitudes();
    }
  }, [isAuthorized, pagination.page, filters]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await getAllSolicitudes(params);
      setSolicitudes(response.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 0,
        totalItems: response.pagination?.totalItems || 0
      }));
    } catch (err) {
      setError('Error al cargar las solicitudes');
      console.error('Error fetching solicitudes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const openModal = (type, solicitud = null) => {
    setModalType(type);
    setSelectedSolicitud(solicitud);
    setModalData({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedSolicitud(null);
    setModalData({});
  };

  const handleModalSubmit = async () => {
    try {
      setLoading(true);
      let response;

      switch (modalType) {
        case 'aprobar':
          response = await aprobarSolicitud(selectedSolicitud.id_solicitud, modalData.observaciones);
          break;
        case 'rechazar':
          response = await rechazarSolicitud(selectedSolicitud.id_solicitud, modalData.motivo);
          break;
        case 'asignar':
          response = await asignarStand(selectedSolicitud.id_solicitud, {
            id_stand: modalData.id_stand,
            precio: modalData.precio,
            descuento: modalData.descuento
          });
          break;
        case 'cancelar':
          response = await cancelarSolicitud(selectedSolicitud.id_solicitud);
          break;
        default:
          return;
      }

      if (response.success) {
        setSuccess(`Solicitud ${modalType === 'aprobar' ? 'aprobada' : modalType === 'rechazar' ? 'rechazada' : modalType === 'asignar' ? 'asignada' : 'cancelada'} exitosamente`);
        closeModal();
        fetchSolicitudes();
      } else {
        setError(response.message || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      solicitada: 'bg-yellow-600 text-yellow-100',
      en_revision: 'bg-blue-600 text-blue-100',
      aprobada: 'bg-green-600 text-green-100',
      rechazada: 'bg-red-600 text-red-100',
      asignada: 'bg-purple-600 text-purple-100',
      cancelada: 'bg-gray-600 text-gray-100'
    };
    return badges[estado] || 'bg-gray-600 text-gray-100';
  };

  const getModalidadBadge = (modalidad) => {
    const badges = {
      seleccion_directa: 'bg-blue-600 text-blue-100',
      manual: 'bg-orange-600 text-orange-100',
      automatica: 'bg-green-600 text-green-100'
    };
    return badges[modalidad] || 'bg-gray-600 text-gray-100';
  };

  if (!isAuthorized) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-900 border border-red-600 rounded-lg p-6 max-w-md mx-auto">
          <svg className="h-12 w-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-200 mb-2">Acceso Denegado</h3>
          <p className="text-red-300">No tienes permisos para acceder a esta funcionalidad.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Gestión de Solicitudes de Asignación</h2>
        <p className="text-gray-400">Administra las solicitudes de asignación de stands a expositores</p>
      </div>

      {/* Mensajes de estado */}
      {success && (
        <div className="bg-green-900 border border-green-600 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-green-200 font-medium">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-200 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={filters.estado_solicitud}
              onChange={(e) => handleFilterChange('estado_solicitud', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {estadosSolicitud.map((estado) => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Modalidad
            </label>
            <select
              value={filters.modalidad_asignacion}
              onChange={(e) => handleFilterChange('modalidad_asignacion', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {modalidadesAsignacion.map((modalidad) => (
                <option key={modalidad.value} value={modalidad.value}>{modalidad.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar por empresa o evento..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({
                  estado_solicitud: '',
                  modalidad_asignacion: '',
                  search: ''
                });
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de solicitudes */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Modalidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cargando solicitudes...
                    </div>
                  </td>
                </tr>
              ) : solicitudes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                    No se encontraron solicitudes
                  </td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => (
                  <tr key={solicitud.id_solicitud} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {solicitud.empresa?.nombre_empresa || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {solicitud.empresa?.ruc || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {solicitud.evento?.nombre_evento || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {solicitud.evento?.fecha_inicio ? new Date(solicitud.evento.fecha_inicio).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(solicitud.estado_solicitud)}`}>
                        {solicitud.estado_solicitud.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getModalidadBadge(solicitud.modalidad_asignacion)}`}>
                        {solicitud.modalidad_asignacion.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(solicitud.fecha_solicitud).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {solicitud.estado_solicitud === 'solicitada' && (
                          <>
                            <button
                              onClick={() => openModal('aprobar', solicitud)}
                              className="text-green-400 hover:text-green-300"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => openModal('rechazar', solicitud)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                        {solicitud.estado_solicitud === 'aprobada' && (
                          <button
                            onClick={() => openModal('asignar', solicitud)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Asignar Stand
                          </button>
                        )}
                        {['solicitada', 'en_revision'].includes(solicitud.estado_solicitud) && (
                          <button
                            onClick={() => openModal('cancelar', solicitud)}
                            className="text-yellow-400 hover:text-yellow-300"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-600">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.totalItems)}
                  </span>{' '}
                  de <span className="font-medium">{pagination.totalItems}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-white mb-4">
                {modalType === 'aprobar' && 'Aprobar Solicitud'}
                {modalType === 'rechazar' && 'Rechazar Solicitud'}
                {modalType === 'asignar' && 'Asignar Stand'}
                {modalType === 'cancelar' && 'Cancelar Solicitud'}
              </h3>
              
              {modalType === 'aprobar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={modalData.observaciones || ''}
                    onChange={(e) => setModalData({ ...modalData, observaciones: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              )}

              {modalType === 'rechazar' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo del rechazo *
                  </label>
                  <textarea
                    value={modalData.motivo || ''}
                    onChange={(e) => setModalData({ ...modalData, motivo: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Motivo del rechazo..."
                    required
                  />
                </div>
              )}

              {modalType === 'asignar' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stand a asignar *
                    </label>
                    <select
                      value={modalData.id_stand || ''}
                      onChange={(e) => setModalData({ ...modalData, id_stand: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar stand</option>
                      {/* Aquí deberías cargar los stands disponibles */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Precio (S/)
                    </label>
                    <input
                      type="number"
                      value={modalData.precio || ''}
                      onChange={(e) => setModalData({ ...modalData, precio: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      value={modalData.descuento || ''}
                      onChange={(e) => setModalData({ ...modalData, descuento: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {modalType === 'cancelar' && (
                <p className="text-gray-300">
                  ¿Estás seguro de que deseas cancelar esta solicitud? Esta acción no se puede deshacer.
                </p>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleModalSubmit}
                  disabled={loading || (modalType === 'rechazar' && !modalData.motivo) || (modalType === 'asignar' && !modalData.id_stand)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionSolicitudesAsignacion; 