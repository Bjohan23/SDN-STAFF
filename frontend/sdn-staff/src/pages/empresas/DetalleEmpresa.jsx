import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import * as empresasService from '../../services/empresasService';
import GestionCategorias from '../../components/GestionCategorias';
import ResumenCategorias from '../../components/ResumenCategorias';

const DetalleEmpresa = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [empresa, setEmpresa] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        setLoading(true);
        const data = await empresasService.obtenerEmpresa(id);
        setEmpresa(data.data);
      } catch (err) {
        setError('No se pudo obtener la empresa');
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresa();
  }, [id]);

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

  if (error) return (
    <div className="bg-red-900 border border-red-600 rounded-lg p-4 m-6">
      <p className="text-red-200">{error}</p>
    </div>
  );
  
  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (!empresa) return (
    <div className="text-center py-12 text-gray-400">
      <p>No se encontró la empresa</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      {/* Header de la empresa */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <div className="flex items-center space-x-4">
          {empresa.logo_url && (
            <img 
              src={empresa.logo_url} 
              alt="Logo" 
              className="w-20 h-20 object-contain border border-gray-600 rounded"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{empresa.nombre_empresa}</h1>
            <p className="text-gray-400 mt-1">{empresa.sector}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                empresa.estado === 'aprobada' ? 'bg-green-900 text-green-200' :
                empresa.estado === 'pendiente' ? 'bg-yellow-900 text-yellow-200' :
                empresa.estado === 'rechazada' ? 'bg-red-900 text-red-200' :
                'bg-gray-700 text-gray-300'
              }`}>
                {empresa.estado}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="bg-gray-800 rounded-lg border border-gray-600">
        <div className="border-b border-gray-600">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('categorias')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'categorias'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              Categorías
            </button>
            <button
              onClick={() => setActiveTab('resumen')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'resumen'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              Resumen de Categorías
            </button>
            <button
              onClick={() => setActiveTab('eventos')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'eventos'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              Participación en Eventos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Tab: Información General */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Información de Contacto</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Email</label>
                    <p className="text-white">{empresa.email_contacto}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Teléfono</label>
                    <p className="text-white">{empresa.telefono_contacto}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Sitio Web</label>
                    {empresa.sitio_web ? (
                      <a 
                        href={empresa.sitio_web} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        {empresa.sitio_web}
                      </a>
                    ) : (
                      <p className="text-gray-400">No especificado</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Redes Sociales</label>
                    <p className="text-white">{empresa.redes_sociales || 'No especificadas'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Información Empresarial</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Descripción</label>
                    <p className="text-white">{empresa.descripcion}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Sector</label>
                    <p className="text-white">{empresa.sector}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Documentos Legales</label>
                    <p className="text-white">{empresa.documentos_legales || 'No especificados'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Fecha de Registro</label>
                    <p className="text-white">
                      {new Date(empresa.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Categorías */}
          {activeTab === 'categorias' && (
            <GestionCategorias 
              empresaId={id} 
              onUpdate={() => {
                // Recargar datos si es necesario
              }}
            />
          )}

          {/* Tab: Resumen de Categorías */}
          {activeTab === 'resumen' && (
            <ResumenCategorias empresaId={id} />
          )}

          {/* Tab: Participación en Eventos */}
          {activeTab === 'eventos' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Participación en Eventos</h3>
              <p className="text-gray-400">
                Aquí se mostrará el historial de participación en eventos de la empresa.
              </p>
              {/* Aquí puedes agregar el componente de historial de eventos */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleEmpresa;
