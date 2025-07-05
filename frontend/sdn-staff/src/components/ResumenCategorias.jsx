import React, { useState, useEffect } from 'react';
import * as empresasService from '../services/empresasService';

const ResumenCategorias = ({ empresaId }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (empresaId) {
      cargarCategorias();
    }
  }, [empresaId]);

  const cargarCategorias = async () => {
    try {
      const res = await empresasService.obtenerCategoriasEmpresa(empresaId);
      setCategorias(res.data || []);
    } catch (err) {
      setError('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-600 rounded-lg p-4">
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <p>No hay categorías asignadas</p>
        <p className="text-sm">Esta empresa no tiene categorías comerciales asignadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Categorías Comerciales</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categorias.map(categoria => (
          <div key={categoria.id_categoria} className="bg-gray-700 rounded-lg border border-gray-600 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: categoria.color }}
                ></div>
                <span className="font-medium text-white">{categoria.nombre_categoria}</span>
              </div>
              {categoria.es_principal && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                  Principal
                </span>
              )}
            </div>
            
            {categoria.descripcion && (
              <p className="text-gray-300 text-sm">{categoria.descripcion}</p>
            )}
            
            <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
              <span>Asignada: {new Date(categoria.fecha_asignacion).toLocaleDateString()}</span>
              <span className={`px-2 py-1 rounded ${
                categoria.activo ? 'bg-green-900 text-green-200' : 'bg-gray-600 text-gray-300'
              }`}>
                {categoria.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-900 border border-blue-600 rounded-lg">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-blue-200 text-sm">
            Total de categorías: {categorias.length} | 
            Categorías activas: {categorias.filter(c => c.activo).length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResumenCategorias; 