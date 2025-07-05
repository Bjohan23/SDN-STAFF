import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import axios from '../../config/axios';

const GestionCategorias = () => {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [form, setForm] = useState({
    nombre_categoria: '',
    descripcion: '',
    color: '#3B82F6',
    activo: true
  });

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/categoriasComerciales');
      setCategorias(res.data.data || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingCategoria) {
        await axios.put(`/api/categoriasComerciales/${editingCategoria.id_categoria}`, form);
        setSuccess('Categoría actualizada exitosamente');
      } else {
        await axios.post('/api/categoriasComerciales', form);
        setSuccess('Categoría creada exitosamente');
      }
      
      setForm({
        nombre_categoria: '',
        descripcion: '',
        color: '#3B82F6',
        activo: true
      });
      setEditingCategoria(null);
      setShowModal(false);
      cargarCategorias();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (categoria) => {
    setEditingCategoria(categoria);
    setForm({
      nombre_categoria: categoria.nombre_categoria,
      descripcion: categoria.descripcion || '',
      color: categoria.color || '#3B82F6',
      activo: categoria.activo
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await axios.delete(`/api/categoriasComerciales/${id}`);
        setSuccess('Categoría eliminada exitosamente');
        cargarCategorias();
      } catch (err) {
        setError('Error al eliminar categoría');
      }
    }
  };

  const toggleActivo = async (categoria) => {
    try {
      await axios.put(`/api/categoriasComerciales/${categoria.id_categoria}`, {
        ...categoria,
        activo: !categoria.activo
      });
      setSuccess('Estado actualizado exitosamente');
      cargarCategorias();
    } catch (err) {
      setError('Error al actualizar estado');
    }
  };

  const allowedRoles = ["administrador", "manager"];
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((r) => r.nombre_rol)
    : [user?.rol].filter(Boolean);
  const isAuthorized = userRoles.some((rol) => allowedRoles.includes(rol));

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

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Categorías Comerciales</h1>
            <p className="text-gray-400 mt-2">Administra las categorías para clasificar empresas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-900 border border-green-600 rounded-lg p-4">
          <p className="text-green-200">{success}</p>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Categorías Comerciales</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : categorias.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p>No hay categorías registradas</p>
            <p className="text-sm">Crea la primera categoría para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map(categoria => (
              <div key={categoria.id_categoria} className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoria.color }}
                    ></div>
                    <h3 className="text-lg font-semibold text-white">{categoria.nombre_categoria}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActivo(categoria)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        categoria.activo 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {categoria.activo ? 'Activa' : 'Inactiva'}
                    </button>
                  </div>
                </div>
                
                {categoria.descripcion && (
                  <p className="text-gray-300 text-sm mb-3">{categoria.descripcion}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>ID: {categoria.id_categoria}</span>
                  <span>Creada: {new Date(categoria.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleEdit(categoria)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(categoria.id_categoria)}
                    className="flex-1 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear/editar categoría */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="relative inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-600">
              <div className="bg-gray-800 px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl leading-6 font-bold text-white">
                    {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                  <button
                    type="button"
                    className="bg-gray-700 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-6 pb-6">
                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de la categoría *
                    </label>
                    <input
                      type="text"
                      name="nombre_categoria"
                      value={form.nombre_categoria}
                      onChange={(e) => setForm(prev => ({ ...prev, nombre_categoria: e.target.value }))}
                      required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Tecnología, Alimentación, etc."
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="descripcion"
                      value={form.descripcion}
                      onChange={(e) => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Descripción opcional de la categoría"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Color de identificación
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        name="color"
                        value={form.color}
                        onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                        className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
                      />
                      <span className="text-gray-300 text-sm">{form.color}</span>
                    </div>
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="activo"
                        checked={form.activo}
                        onChange={(e) => setForm(prev => ({ ...prev, activo: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">Categoría activa</span>
                    </label>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-600">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Guardando...' : (editingCategoria ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCategorias; 