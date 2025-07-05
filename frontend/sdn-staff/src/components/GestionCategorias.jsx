import React, { useState, useEffect } from 'react';
import * as empresasService from '../services/empresasService';

const GestionCategorias = ({ empresaId, onUpdate }) => {
  const [categoriasEmpresa, setCategoriasEmpresa] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [categoriaPrincipal, setCategoriaPrincipal] = useState(null);

  useEffect(() => {
    if (empresaId) {
      cargarDatos();
    }
  }, [empresaId]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resCategoriasEmpresa, resCategoriasDisponibles] = await Promise.all([
        empresasService.obtenerCategoriasEmpresa(empresaId),
        empresasService.obtenerCategoriasDisponibles()
      ]);
      
      setCategoriasEmpresa(resCategoriasEmpresa.data || []);
      setCategoriasDisponibles(resCategoriasDisponibles.data || []);
      
      // Establecer categoría principal
      const principal = resCategoriasEmpresa.data?.find(c => c.es_principal);
      setCategoriaPrincipal(principal?.id_categoria || null);
    } catch (err) {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarCategorias = async () => {
    if (selectedCategorias.length === 0) {
      setError('Selecciona al menos una categoría');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await empresasService.asignarCategoriasEmpresa(empresaId, selectedCategorias);
      setSuccess('Categorías asignadas exitosamente');
      setSelectedCategorias([]);
      cargarDatos();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al asignar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleEstablecerPrincipal = async (categoriaId) => {
    setLoading(true);
    setError('');
    try {
      await empresasService.establecerCategoriaPrincipal(empresaId, categoriaId);
      setSuccess('Categoría principal establecida exitosamente');
      setCategoriaPrincipal(categoriaId);
      cargarDatos();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Error al establecer categoría principal');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverCategoria = async (categoriaId) => {
    if (!window.confirm('¿Estás seguro de que quieres remover esta categoría?')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await empresasService.removerCategoriaEmpresa(empresaId, categoriaId);
      setSuccess('Categoría removida exitosamente');
      if (categoriaPrincipal === categoriaId) {
        setCategoriaPrincipal(null);
      }
      cargarDatos();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Error al remover categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriaChange = (categoriaId, checked) => {
    if (checked) {
      setSelectedCategorias(prev => [...prev, categoriaId]);
    } else {
      setSelectedCategorias(prev => prev.filter(id => id !== categoriaId));
    }
  };

  if (loading && categoriasEmpresa.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Categorías actuales */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Categorías Asignadas</h3>
        
        {categoriasEmpresa.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p>No hay categorías asignadas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categoriasEmpresa.map(categoria => (
              <div key={categoria.id_categoria} className="bg-gray-700 rounded-lg border border-gray-600 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoria.color }}
                    ></div>
                    <span className="font-medium text-white">{categoria.nombre_categoria}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {categoria.es_principal && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                        Principal
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoverCategoria(categoria.id_categoria)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Remover categoría"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {categoria.descripcion && (
                  <p className="text-gray-300 text-sm mb-3">{categoria.descripcion}</p>
                )}
                
                <div className="flex space-x-2">
                  {!categoria.es_principal && (
                    <button
                      onClick={() => handleEstablecerPrincipal(categoria.id_categoria)}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 transition-colors"
                    >
                      Establecer como Principal
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asignar nuevas categorías */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Asignar Nuevas Categorías</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {categoriasDisponibles
            .filter(cat => !categoriasEmpresa.some(ce => ce.id_categoria === cat.id_categoria))
            .map(categoria => (
              <label key={categoria.id_categoria} className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategorias.includes(categoria.id_categoria)}
                  onChange={(e) => handleCategoriaChange(categoria.id_categoria, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoria.color }}
                  ></div>
                  <span className="text-white">{categoria.nombre_categoria}</span>
                </div>
              </label>
            ))}
        </div>
        
        {categoriasDisponibles.filter(cat => !categoriasEmpresa.some(ce => ce.id_categoria === cat.id_categoria)).length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            <p>Todas las categorías disponibles ya están asignadas</p>
          </div>
        ) : (
          <button
            onClick={handleAsignarCategorias}
            disabled={loading || selectedCategorias.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Asignando...' : `Asignar ${selectedCategorias.length} categoría(s)`}
          </button>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-900 border border-blue-600 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-blue-200 text-sm">
            <p><strong>Información:</strong></p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Una empresa puede tener múltiples categorías</li>
              <li>Solo una categoría puede ser marcada como principal</li>
              <li>Las categorías principales tienen prioridad en las asignaciones automáticas</li>
              <li>Puedes remover categorías en cualquier momento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionCategorias; 