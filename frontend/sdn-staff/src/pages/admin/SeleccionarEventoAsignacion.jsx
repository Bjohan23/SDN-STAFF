import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import * as eventosService from '../../services/eventosService';

const SeleccionarEventoAsignacion = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const res = await eventosService.getEventos();
      setEventos(res.data || []);
    } catch (err) {
      setError('Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarEvento = (eventoId) => {
    navigate(`/admin/asignacion-automatica/${eventoId}`);
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
            <h1 className="text-2xl font-bold text-white">Seleccionar Evento para Asignación</h1>
            <p className="text-gray-400 mt-2">Elige un evento para gestionar su asignación automática de stands</p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-lg p-4">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Eventos Disponibles</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 12h0m-8 0h16a2 2 0 002-2V9a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p>No hay eventos disponibles</p>
            <p className="text-sm">Crea un evento primero para poder gestionar asignaciones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventos.map(evento => (
              <div key={evento.id_evento} className="bg-gray-700 rounded-lg border border-gray-600 p-4 hover:bg-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{evento.nombre_evento}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    evento.estado === 'activo' ? 'bg-green-900 text-green-200' :
                    evento.estado === 'publicado' ? 'bg-blue-900 text-blue-200' :
                    evento.estado === 'borrador' ? 'bg-gray-900 text-gray-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {evento.estado}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-300 mb-4">
                  <p><strong>Tipo:</strong> {evento.tipoEvento?.nombre_tipo || 'No especificado'}</p>
                  <p><strong>Ubicación:</strong> {evento.ubicacion || 'No especificada'}</p>
                  <p><strong>Fechas:</strong> {new Date(evento.fecha_inicio).toLocaleDateString()} - {new Date(evento.fecha_fin).toLocaleDateString()}</p>
                </div>
                
                <button
                  onClick={() => handleSeleccionarEvento(evento.id_evento)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gestionar Asignación
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeleccionarEventoAsignacion; 