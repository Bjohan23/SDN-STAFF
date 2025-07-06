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
      const res = await axios.get('/api/categorias?includeInactivas=true');
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
        await axios.put(`/api/categorias/${editingCategoria.id_categoria}`, form);
        setSuccess('Categoría actualizada exitosamente');
      } else {
        await axios.post('/api/categorias', form);
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
        await axios.delete(`/api/categorias/${id}`);
        setSuccess('Categoría eliminada exitosamente');
        cargarCategorias();
      } catch (err) {
        setError('Error al eliminar categoría');
      }
    }
  };

  const toggleActivo = async (categoria) => {
    try {
      await axios.put(`/api/categorias/${categoria.id_categoria}`, {
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

      {/* --- NUEVA SECCIÓN: Asignar categorías a empresas expositoras --- */}
      <div className="bg-gray-800 rounded-lg border border-yellow-600 p-6 mt-8">
        <h2 className="text-xl font-semibold text-yellow-300 mb-4">Asignar Categorías a Empresas Expositoras</h2>
        <CategoriaEmpresaAsignacion />
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

// --- COMPONENTE INTERNO: Asignación de categorías a empresas ---
import * as empresasService from '../../services/empresasService';

function CategoriaEmpresaAsignacion() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState('');
  const [asignadas, setAsignadas] = useState([]); // Siempre array
  const [disponibles, setDisponibles] = useState([]); // Siempre array
  const [seleccionadas, setSeleccionadas] = useState([]); // Siempre array
  const [principal, setPrincipal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    empresasService.listarEmpresas().then(setEmpresas);
  }, []);

  useEffect(() => {
    if (empresaId) cargarDatosEmpresa();
    else {
      setAsignadas([]); setDisponibles([]); setSeleccionadas([]); setPrincipal(null);
    }
    // eslint-disable-next-line
  }, [empresaId]);

  // Cargar todas las categorías y las asignadas a la empresa
  const cargarDatosEmpresa = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      // Obtener todas las categorías comerciales (no solo disponibles)
      const [asig, todas] = await Promise.all([
        empresasService.obtenerCategoriasEmpresa(empresaId),
        empresasService.obtenerCategoriasDisponibles()
      ]);
      // El backend devuelve asig.data.categorias
      const asignadasArr = Array.isArray(asig?.data?.categorias) ? asig.data.categorias : [];
      const disponiblesArr = Array.isArray(todas?.data) ? todas.data : [];
      setAsignadas(asignadasArr);
      setDisponibles(disponiblesArr);
      setPrincipal(asignadasArr.find(c => c.principal) || null);
      setSeleccionadas([]);
    } catch (err) {
      setAsignadas([]);
      setDisponibles([]);
      setPrincipal(null);
      setSeleccionadas([]);
      setError('Error al cargar categorías de la empresa');
    } finally {
      setLoading(false);
    }
  };

  // Determina si la categoría ya está asignada
  const isCategoriaAsignada = (catId) => Array.isArray(asignadas) && asignadas.some(a => a.id_categoria === catId);

  // Handler para checkboxes: solo permite seleccionar categorías NO asignadas
  const handleCheckboxChange = (catId) => {
    if (isCategoriaAsignada(catId)) return; // No permitir seleccionar ya asignadas
    setSeleccionadas(prev => prev.includes(catId)
      ? prev.filter(id => id !== catId)
      : [...prev, catId]);
  };

  // Handler para asignar categorías seleccionadas
  const handleAsignar = async () => {
    if (!empresaId || seleccionadas.length === 0) {
      setError('Selecciona una empresa y al menos una categoría');
      return;
    }
    setLoading(true); setError(''); setSuccess('');
    try {
      await empresasService.asignarCategoriasEmpresa(empresaId, seleccionadas);
      await cargarDatosEmpresa(); // Espera a que termine de cargar
      setSuccess('Categorías asignadas exitosamente');
      setSeleccionadas([]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al asignar categorías');
    } finally {
      setLoading(false);
    }
  };


  const handleRemover = async (catId) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      await empresasService.removerCategoriaEmpresa(empresaId, catId);
      setSuccess('Categoría removida');
      cargarDatosEmpresa();
    } catch (err) {
      setError('Error al remover categoría');
    } finally {
      setLoading(false);
    }
  };

  const handlePrincipal = async (catId) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      await empresasService.establecerCategoriaPrincipal(empresaId, catId);
      setSuccess('Categoría principal actualizada');
      cargarDatosEmpresa();
    } catch (err) {
      setError('Error al establecer principal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Empresa Selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-200 mb-1 block">Selecciona una empresa</label>
        {empresas.length === 0 ? (
          <div className="text-gray-400 text-sm">No hay empresas registradas</div>
        ) : (
          <select
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            value={empresaId}
            onChange={e => setEmpresaId(e.target.value)}
          >
            <option value="">-- Selecciona una empresa --</option>
            {empresas.map(emp => (
              <option value={emp.id_empresa} key={emp.id_empresa}>
                {emp.nombre_comercial || emp.nombre_empresa || emp.razon_social || `Empresa ${emp.id_empresa}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Loading/Error/Success */}
      {loading && <div className="text-yellow-300 mb-2">Cargando...</div>}
      {error && <div className="text-red-400 mb-2">{error}</div>}
      {success && <div className="text-green-400 mb-2">{success}</div>}

      {/* Asignadas y asignación manual */}
      {empresaId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Asignadas */}
          <div>
            <h3 className="text-lg text-yellow-200 font-bold mb-2">Categorías Asignadas</h3>
            {Array.isArray(asignadas) && asignadas.length === 0 ? (
              <div className="text-gray-400 text-sm">No hay categorías asignadas</div>
            ) : (
              <ul className="space-y-2">
                {Array.isArray(asignadas) && asignadas.length > 0 && asignadas.map(cat => (
                  <li key={cat.id_categoria} className="flex items-center justify-between bg-gray-700 rounded px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{background: cat.color}}></span>
                      <span className="text-gray-100 text-sm">{cat.nombre_categoria || (cat.categoriaComercial && cat.categoriaComercial.nombre_categoria) || `Categoría #${cat.id_categoria}`}</span>
                      {cat.principal && <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-xs rounded text-black font-semibold">Principal</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {!cat.principal && (
                        <button onClick={() => handlePrincipal(cat.id_categoria)} className="text-xs text-yellow-300 hover:underline">Marcar principal</button>
                      )}
                      <button onClick={() => handleRemover(cat.id_categoria)} className="text-xs text-red-400 hover:underline">Quitar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Asignación manual */}
          <div>
            <h3 className="text-lg text-yellow-200 font-bold mb-2">Asignar nuevas categorías</h3>
            {disponibles.length === 0 ? (
              <div className="text-gray-400 text-sm">No hay categorías comerciales registradas</div>
            ) : (
              <form onSubmit={e => {e.preventDefault(); handleAsignar();}}>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {disponibles.map(cat => (
                    <label key={cat.id_categoria} className={`flex items-center gap-2 text-gray-200 text-sm ${isCategoriaAsignada(cat.id_categoria) ? 'opacity-40 line-through' : ''}`}>
                      <input
                        type="checkbox"
                        value={cat.id_categoria}
                        checked={seleccionadas.includes(cat.id_categoria)}
                        onChange={() => handleCheckboxChange(cat.id_categoria)}
                        disabled={isCategoriaAsignada(cat.id_categoria)}
                        className="accent-yellow-500"
                      />
                      <span className="w-3 h-3 rounded-full inline-block" style={{background: cat.color}}></span>
                      {cat.nombre_categoria}
                    </label>
                  ))}
                </div>
                <button
                  type="submit"
                  className="mt-4 px-4 py-2 bg-yellow-500 text-gray-900 rounded font-bold hover:bg-yellow-400 disabled:opacity-50"
                  disabled={seleccionadas.length === 0 || loading}
                >
                  Asignar seleccionadas
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionCategorias; 