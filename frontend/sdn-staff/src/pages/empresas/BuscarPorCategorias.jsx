import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  obtenerCategoriasDisponibles, 
  buscarEmpresasPorCategorias 
} from '../../services/empresasService';
import ResumenCategorias from '../../components/ResumenCategorias';

const BuscarPorCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const response = await obtenerCategoriasDisponibles();
      setCategorias(response.data || []);
    } catch (err) {
      setError('Error al cargar las categorías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    if (categoriasSeleccionadas.length === 0) {
      setError('Debe seleccionar al menos una categoría');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const categoriasIds = categoriasSeleccionadas.map(cat => cat.id_categoria);
      const response = await buscarEmpresasPorCategorias(categoriasIds);
      setEmpresas(response.data || []);
    } catch (err) {
      setError('Error al buscar empresas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarCategoria = (categoria) => {
    const yaSeleccionada = categoriasSeleccionadas.find(c => c.id_categoria === categoria.id_categoria);
    if (yaSeleccionada) {
      setCategoriasSeleccionadas(categoriasSeleccionadas.filter(c => c.id_categoria !== categoria.id_categoria));
    } else {
      setCategoriasSeleccionadas([...categoriasSeleccionadas, categoria]);
    }
  };

  const limpiarBusqueda = () => {
    setCategoriasSeleccionadas([]);
    setEmpresas([]);
    setError('');
  };

  return (
    <div className="buscar-por-categorias max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Buscar Empresas por Categorías</h1>
        
        {/* Selector de categorías */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Seleccionar Categorías</h3>
          
          {loading && categorias.length === 0 ? (
            <div className="text-center py-4">Cargando categorías...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categorias.map((categoria) => {
                const seleccionada = categoriasSeleccionadas.find(c => c.id_categoria === categoria.id_categoria);
                
                return (
                  <div
                    key={categoria.id_categoria}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      seleccionada
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSeleccionarCategoria(categoria)}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={seleccionada}
                        onChange={() => handleSeleccionarCategoria(categoria)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{categoria.nombre_categoria}</h4>
                        {categoria.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">{categoria.descripcion}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {categoria.total_expositores} empresas
                          </span>
                          {categoria.es_destacada && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Destacada
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={handleBuscar}
            disabled={loading || categoriasSeleccionadas.length === 0}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? 'Buscando...' : `Buscar (${categoriasSeleccionadas.length} categorías)`}
          </button>
          
          <button
            onClick={limpiarBusqueda}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Limpiar
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Resultados */}
      {empresas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Resultados ({empresas.length} empresas encontradas)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {empresas.map((empresa) => (
              <div key={empresa.id_empresa} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  {empresa.logo_url && (
                    <img 
                      src={empresa.logo_url} 
                      alt="Logo" 
                      className="w-12 h-12 object-contain border rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      <Link 
                        to={`/empresas/${empresa.id_empresa}`}
                        className="hover:text-blue-600"
                      >
                        {empresa.nombre_empresa}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{empresa.sector}</p>
                    
                    <div className="mb-3">
                      <ResumenCategorias empresaId={empresa.id_empresa} maxCategorias={2} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        empresa.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                        empresa.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {empresa.estado}
                      </span>
                      
                      <Link 
                        to={`/empresas/${empresa.id_empresa}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver detalles →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {empresas.length === 0 && !loading && categoriasSeleccionadas.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No se encontraron empresas con las categorías seleccionadas</p>
            <p className="text-gray-400 text-sm mt-2">Intenta con otras categorías o amplía tu búsqueda</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscarPorCategorias; 