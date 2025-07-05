import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import * as asignacionService from '../../services/asignacionService';
import * as eventosService from '../../services/eventosService';
import * as empresasService from '../../services/empresasService';

const AsignacionAutomatica = () => {
  const { id_evento } = useParams();
  const { user } = useAuth();
  
  const [evento, setEvento] = useState(null);
  const [estadoAsignacion, setEstadoAsignacion] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [configuracion, setConfiguracion] = useState({
    prioridadCategoria: true,
    balancearDistribucion: true,
    considerarHistorial: true,
    maxEmpresasPorCategoria: 10,
    porcentajeReserva: 20
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [empresasElegibles, setEmpresasElegibles] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [conflictos, setConflictos] = useState([]);

  useEffect(() => {
    if (id_evento) {
      cargarDatosEvento();
      cargarEstadoAsignacion();
      cargarEmpresasElegibles();
      cargarSolicitudes();
      cargarConflictos();
    }
  }, [id_evento]);

  const cargarDatosEvento = async () => {
    try {
      const res = await eventosService.getEventoById(id_evento);
      setEvento(res.data);
    } catch (err) {
      setError('Error al cargar datos del evento');
    }
  };

  const cargarEstadoAsignacion = async () => {
    try {
      const res = await asignacionService.obtenerEstadoAsignacion(id_evento);
      setEstadoAsignacion(res.data);
    } catch (err) {
      console.log('No hay estado de asignación disponible');
    }
  };

  const cargarEmpresasElegibles = async () => {
    try {
      const res = await asignacionService.obtenerEmpresasElegibles(id_evento);
      setEmpresasElegibles(res.data || []);
    } catch (err) {
      setError('Error al cargar empresas elegibles');
    }
  };

  const cargarSolicitudes = async () => {
    try {
      const res = await asignacionService.obtenerSolicitudesEvento(id_evento);
      setSolicitudes(res.data || []);
    } catch (err) {
      console.log('No hay solicitudes disponibles');
    }
  };

  const cargarConflictos = async () => {
    try {
      const res = await asignacionService.obtenerConflictosEvento(id_evento);
      setConflictos(res.data || []);
    } catch (err) {
      console.log('No hay conflictos disponibles');
    }
  };

  const validarAsignacion = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await asignacionService.validarAsignacionEvento(id_evento);
      if (res.data.valido) {
        setSuccess('El evento es válido para asignación automática');
      } else {
        setError(res.data.mensaje || 'El evento no es válido para asignación automática');
      }
    } catch (err) {
      setError('Error al validar asignación');
    } finally {
      setLoading(false);
    }
  };

  const generarAsignacion = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await asignacionService.generarAsignacionAutomatica(id_evento, configuracion);
      setSuccess('Asignación generada exitosamente');
      cargarEstadoAsignacion();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar asignación');
    } finally {
      setLoading(false);
    }
  };

  const ejecutarAsignacion = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await asignacionService.ejecutarAsignacionAutomatica(id_evento, configuracion);
      setSuccess('Asignación ejecutada exitosamente');
      cargarEstadoAsignacion();
      cargarResultados();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al ejecutar asignación');
    } finally {
      setLoading(false);
    }
  };

  const cargarResultados = async () => {
    try {
      const res = await asignacionService.obtenerResultadosAsignacion(id_evento);
      setResultados(res.data);
    } catch (err) {
      console.log('No hay resultados disponibles');
    }
  };

  const aprobarSolicitud = async (solicitudId) => {
    try {
      await asignacionService.aprobarSolicitud(solicitudId);
      setSuccess('Solicitud aprobada exitosamente');
      cargarSolicitudes();
    } catch (err) {
      setError('Error al aprobar solicitud');
    }
  };

  const rechazarSolicitud = async (solicitudId, motivo) => {
    try {
      await asignacionService.rechazarSolicitud(solicitudId, motivo);
      setSuccess('Solicitud rechazada exitosamente');
      cargarSolicitudes();
    } catch (err) {
      setError('Error al rechazar solicitud');
    }
  };

  const resolverConflicto = async (conflictoId, resolucion) => {
    try {
      await asignacionService.resolverConflicto(conflictoId, resolucion);
      setSuccess('Conflicto resuelto exitosamente');
      cargarConflictos();
    } catch (err) {
      setError('Error al resolver conflicto');
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

  if (!evento) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Asignación Automática de Stands</h1>
            <p className="text-gray-400 mt-2">Evento: {evento.nombre_evento}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={validarAsignacion}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Validar
            </button>
            <button
              onClick={generarAsignacion}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Generar
            </button>
            <button
              onClick={ejecutarAsignacion}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Ejecutar
            </button>
          </div>
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

      {/* Configuración */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Configuración de Asignación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Priorizar por Categoría
            </label>
            <input
              type="checkbox"
              checked={configuracion.prioridadCategoria}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, prioridadCategoria: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Balancear Distribución
            </label>
            <input
              type="checkbox"
              checked={configuracion.balancearDistribucion}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, balancearDistribucion: e.target.checked }))}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Máximo Empresas por Categoría
            </label>
            <input
              type="number"
              value={configuracion.maxEmpresasPorCategoria}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, maxEmpresasPorCategoria: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Porcentaje de Reserva (%)
            </label>
            <input
              type="number"
              value={configuracion.porcentajeReserva}
              onChange={(e) => setConfiguracion(prev => ({ ...prev, porcentajeReserva: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
          <h3 className="text-lg font-semibold text-white">Empresas Elegibles</h3>
          <p className="text-2xl font-bold text-blue-400">{empresasElegibles.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
          <h3 className="text-lg font-semibold text-white">Solicitudes</h3>
          <p className="text-2xl font-bold text-yellow-400">{solicitudes.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
          <h3 className="text-lg font-semibold text-white">Conflictos</h3>
          <p className="text-2xl font-bold text-red-400">{conflictos.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-600 p-4">
          <h3 className="text-lg font-semibold text-white">Estado</h3>
          <p className="text-2xl font-bold text-green-400">
            {estadoAsignacion?.estado || 'Pendiente'}
          </p>
        </div>
      </div>

      {/* Solicitudes */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Solicitudes de Asignación</h2>
        {solicitudes.length === 0 ? (
          <p className="text-gray-400">No hay solicitudes pendientes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Empresa</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Categoría</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Estado</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {solicitudes.map(solicitud => (
                  <tr key={solicitud.id_solicitud}>
                    <td className="px-4 py-2 text-white">{solicitud.empresa?.nombre_empresa}</td>
                    <td className="px-4 py-2 text-white">{solicitud.categoria?.nombre_categoria}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        solicitud.estado === 'pendiente' ? 'bg-yellow-900 text-yellow-200' :
                        solicitud.estado === 'aprobada' ? 'bg-green-900 text-green-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {solicitud.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {solicitud.estado === 'pendiente' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => aprobarSolicitud(solicitud.id_solicitud)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => rechazarSolicitud(solicitud.id_solicitud, 'Rechazado por administrador')}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Conflictos */}
      <div className="bg-gray-800 rounded-lg border border-gray-600 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Conflictos de Asignación</h2>
        {conflictos.length === 0 ? (
          <p className="text-gray-400">No hay conflictos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Empresa</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Tipo Conflicto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Descripción</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {conflictos.map(conflicto => (
                  <tr key={conflicto.id_conflicto}>
                    <td className="px-4 py-2 text-white">{conflicto.empresa?.nombre_empresa}</td>
                    <td className="px-4 py-2 text-white">{conflicto.tipo_conflicto}</td>
                    <td className="px-4 py-2 text-white">{conflicto.descripcion}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => resolverConflicto(conflicto.id_conflicto, { resolucion: 'manual' })}
                        className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Resolver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsignacionAutomatica; 