import React, { useState, useEffect } from 'react';
import { useStands } from '../../contexts/StandsContext';
import ConfirmationModal from '../../components/ConfirmationModal';
import NotificationToast from '../../components/NotificationToast';
import { useNotification } from '../../hooks/useNotification';
import axios from '../../config/axios';

const ListadoStands = () => {
  const [stands, setStands] = useState([]);
  const [tiposStand, setTiposStand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    id_tipo_stand: '',
    estado_fisico: ''
  });
  
  // Estados para el modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStand, setEditingStand] = useState(null);
  const [editForm, setEditForm] = useState({
    numero_stand: '',
    nombre_stand: '',
    id_tipo_stand: '',
    area: '',
    ubicacion: '',
    estado_fisico: 'disponible',
    permite_subdivision: false,
    capacidad_maxima_personas: '',
    observaciones: '',
    precio_personalizado: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const { notification, showSuccess, showError, hideNotification } = useNotification();
  const { refreshTrigger, triggerRefresh } = useStands();

  const estadosFisicos = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'ocupado', label: 'Ocupado' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'fuera_de_servicio', label: 'Fuera de Servicio' }
  ];

  useEffect(() => {
    fetchStands();
    fetchTiposStand();
  }, [filters, refreshTrigger]);

  const fetchStands = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/stands', { params: filters });
      setStands(response.data.data || []);
    } catch (err) {
      setError('Error al cargar los stands');
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposStand = async () => {
    try {
      const response = await axios.get('/tiposStand');
      setTiposStand(response.data.data || []);
    } catch (err) {
      console.error('Error fetching tipos stand:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      id_tipo_stand: '',
      estado_fisico: ''
    });
  };

  const handleDelete = async (id) => {
    const stand = stands.find(s => s.id_stand === id);
    setConfirmAction({
      title: "Eliminar Stand",
      message: `¿Está seguro de que desea eliminar el stand "${stand?.numero_stand || stand?.nombre_stand}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      type: "danger",
      action: async () => {
        try {
          const response = await axios.delete(`/stands/${id}`);
          if (response.data.success) {
            showSuccess(response.data.message || 'Stand eliminado correctamente');
            fetchStands();
          }
        } catch (err) {
          const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al eliminar el stand';
          setError(errorMsg);
          showError(errorMsg);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleRestore = async (id) => {
    const stand = stands.find(s => s.id_stand === id);
    setConfirmAction({
      title: "Restaurar Stand",
      message: `¿Está seguro de que desea restaurar el stand "${stand?.numero_stand || stand?.nombre_stand}"?`,
      confirmText: "Restaurar",
      type: "info",
      action: async () => {
        try {
          const response = await axios.post(`/stands/${id}/restore`);
          if (response.data.success) {
            showSuccess(response.data.message || 'Stand restaurado correctamente');
            fetchStands();
          }
        } catch (err) {
          const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al restaurar el stand';
          setError(errorMsg);
          showError(errorMsg);
        }
      }
    });
    setShowConfirmModal(true);
  };

  // Funciones para el modal de edición
  const handleEdit = (stand) => {
    setEditingStand(stand);
    setEditForm({
      numero_stand: stand.numero_stand || '',
      nombre_stand: stand.nombre_stand || '',
      id_tipo_stand: stand.id_tipo_stand || '',
      area: stand.area || '',
      ubicacion: stand.ubicacion || '',
      estado_fisico: stand.estado_fisico || 'disponible',
      permite_subdivision: stand.permite_subdivision || false,
      capacidad_maxima_personas: stand.capacidad_maxima_personas || '',
      observaciones: stand.observaciones || '',
      precio_personalizado: stand.precio_personalizado || ''
    });
    setShowEditModal(true);
    setEditError('');
    setEditSuccess('');
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const payload = {
        ...editForm,
        area: editForm.area ? parseFloat(editForm.area) : null,
        capacidad_maxima_personas: editForm.capacidad_maxima_personas ? parseInt(editForm.capacidad_maxima_personas) : null,
        precio_personalizado: editForm.precio_personalizado ? parseFloat(editForm.precio_personalizado) : null
      };

      const response = await axios.put(`/stands/${editingStand.id_stand}`, payload);
      
      if (response.data.success) {
        showSuccess(response.data.message || 'Stand actualizado exitosamente');
        setShowEditModal(false);
        
        // Disparar actualización de la lista de stands
        triggerRefresh();
        fetchStands();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al actualizar el stand';
      setEditError(errorMsg);
      showError(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingStand(null);
    setEditForm({});
    setEditError('');
    setEditSuccess('');
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      disponible: 'bg-green-900 text-green-200',
      ocupado: 'bg-red-900 text-red-200',
      mantenimiento: 'bg-yellow-900 text-yellow-200',
      fuera_de_servicio: 'bg-gray-900 text-gray-200'
    };
    return estados[estado] || 'bg-gray-900 text-gray-200';
  };

  const getTipoBadge = (tipo) => {
    return 'bg-purple-900 text-purple-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-700 rounded-lg border border-gray-600 p-6">
        <h3 className="text-lg font-medium text-white mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Buscar
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Buscar por nombre, descripción o ubic"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Stand
            </label>
            <select
              name="id_tipo_stand"
              value={filters.id_tipo_stand}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los tipos</option>
              {tiposStand.map(tipo => (
                <option key={tipo.id_tipo_stand} value={tipo.id_tipo_stand}>
                  {tipo.nombre_tipo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estado
            </label>
            <select
              name="estado_fisico"
              value={filters.estado_fisico}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los estados</option>
              {estadosFisicos.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gray-700 rounded-lg border border-gray-600 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-600">
          <h3 className="text-lg font-medium text-white">Listado de Stands</h3>
        </div>
        
        {error && (
          <div className="p-4 bg-red-900 border border-red-600">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {stands.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No se encontraron stands</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    STAND
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    TIPO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ESTADO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    UBICACIÓN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ÁREA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    PRECIO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ACCIONES
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {stands.map((stand) => (
                  <tr key={stand.id_stand} className="hover:bg-gray-600 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {stand.numero_stand}
                        </div>
                        <div className="text-sm text-gray-400">
                          {stand.nombre_stand}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoBadge()}`}>
                        {stand.tipoStand?.nombre_tipo || 'N/A'}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {stand.deleted_at ? (
                          // Si está eliminado, mostrar botón de restaurar
                          <button
                            onClick={() => handleRestore(stand.id_stand)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            Restaurar
                          </button>
                        ) : (
                          // Si no está eliminado, mostrar botones normales
                          <>
                            <button
                              onClick={() => handleEdit(stand)}
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Editar Stand</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {editError && (
                <div className="bg-red-900 border border-red-600 rounded-lg p-4">
                  <p className="text-red-200">{editError}</p>
                </div>
              )}

              {editSuccess && (
                <div className="bg-green-900 border border-green-600 rounded-lg p-4">
                  <p className="text-green-200">{editSuccess}</p>
                </div>
              )}

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número del Stand *
                  </label>
                  <input
                    type="text"
                    name="numero_stand"
                    value={editForm.numero_stand}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre del Stand *
                  </label>
                  <input
                    type="text"
                    name="nombre_stand"
                    value={editForm.nombre_stand}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Stand *
                  </label>
                  <select
                    name="id_tipo_stand"
                    value={editForm.id_tipo_stand}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposStand.map(tipo => (
                      <option key={tipo.id_tipo_stand} value={tipo.id_tipo_stand}>
                        {tipo.nombre_tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Área (m²) *
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={editForm.area}
                    onChange={handleEditChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={editForm.ubicacion}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estado Físico
                  </label>
                  <select
                    name="estado_fisico"
                    value={editForm.estado_fisico}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {estadosFisicos.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Precio Personalizado (S/)
                  </label>
                  <input
                    type="number"
                    name="precio_personalizado"
                    value={editForm.precio_personalizado}
                    onChange={handleEditChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capacidad Máxima (personas)
                  </label>
                  <input
                    type="number"
                    name="capacidad_maxima_personas"
                    value={editForm.capacidad_maxima_personas}
                    onChange={handleEditChange}
                    min="1"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={editForm.observaciones}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Checkboxes */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="permite_subdivision"
                    checked={editForm.permite_subdivision}
                    onChange={handleEditChange}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Permite Subdivisión</span>
                </label>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-600">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </div>
                  ) : (
                    'Actualizar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmAction?.action || (() => {})}
        title={confirmAction?.title || ""}
        message={confirmAction?.message || ""}
        confirmText={confirmAction?.confirmText || "Confirmar"}
        cancelText="Cancelar"
        type={confirmAction?.type || "warning"}
      />

      {/* Toast de Notificación */}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </div>
  );
};

export default ListadoStands; 