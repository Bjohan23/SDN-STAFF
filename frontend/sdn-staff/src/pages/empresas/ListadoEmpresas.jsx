import React, { useEffect, useState } from "react";
import DashboardEmpresas from "./DashboardEmpresas";
import DocumentosPorVencer from "./DocumentosPorVencer";
import AprobacionEmpresas from "./AprobacionEmpresas";
import AgregarEmpresa from "./AgregarEmpresa";
import ResumenCategorias from "../../components/ResumenCategorias";
import axios from "../../config/axios";

const TABS = [
  { 
    key: "listado", 
    label: "Listado", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  { 
    key: "dashboard", 
    label: "Dashboard", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  { 
    key: "agregar", 
    label: "Agregar Empresa", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )
  },
  { 
    key: "pendientes", 
    label: "Pendientes", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  { 
    key: "documentos", 
    label: "Documentos por vencer", 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
];

const getEstadoBadge = (estado) => {
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  switch (estado) {
    case "pendiente":
      return `${baseClasses} bg-yellow-900 text-yellow-200`;
    case "aprobada":
      return `${baseClasses} bg-green-900 text-green-200`;
    case "rechazada":
      return `${baseClasses} bg-red-900 text-red-200`;
    default:
      return `${baseClasses} bg-gray-700 text-gray-300`;
  }
};

const getTamañoEmpresaBadge = (tamaño) => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
  switch (tamaño) {
    case "pequeña":
      return `${baseClasses} bg-blue-900 text-blue-200`;
    case "mediana":
      return `${baseClasses} bg-purple-900 text-purple-200`;
    case "grande":
      return `${baseClasses} bg-indigo-900 text-indigo-200`;
    default:
      return `${baseClasses} bg-gray-700 text-gray-300`;
  }
};

const ListadoEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("listado");
  const [modalEmpresaId, setModalEmpresaId] = useState(null);
  const [modalEmpresa, setModalEmpresa] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const handleOpenModal = async (id) => {
    setModalEmpresaId(id);
    setModalLoading(true);
    setModalError("");
    setModalEmpresa(null);
    try {
      const res = await axios.get(`/api/empresasExpositoras/${id}`);
      setModalEmpresa(res.data.data);
    } catch {
      setModalError("No se pudo cargar la empresa");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalEmpresaId(null);
    setModalEmpresa(null);
    setModalError("");
  };

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await axios.get("/api/empresasExpositoras/");
        setEmpresas(res.data.data || []);
      } catch {
        setError("Error obteniendo empresas");
      } finally {
        setLoading(false);
      }
    };
    fetchEmpresas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-700 font-medium">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg shadow-lg border border-red-600 p-8 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Error</h3>
              <p className="text-gray-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800">
      <div className="max-w-none mx-auto py-6 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Empresas Expositoras</h1>
          <p className="mt-2 text-gray-300">Gestiona y supervisa todas las empresas participantes</p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 mb-6">
          <nav className="flex space-x-0" aria-label="Tabs">
            {TABS.map((tab, index) => (
              <button
                key={tab.key}
                className={`group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-sm font-medium text-center hover:bg-gray-700 focus:z-10 transition-all duration-200 ${
                  index === 0 ? 'rounded-l-lg' : ''
                } ${
                  index === TABS.length - 1 ? 'rounded-r-lg' : ''
                } ${
                  activeTab === tab.key
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-700'
                    : 'text-gray-300 border-b-2 border-transparent hover:text-white'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <div className="flex items-center justify-center space-x-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          {activeTab === "listado" && (
            <div>
              {/* Stats Header */}
              <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Listado de Empresas</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-300">
                      Total: <span className="font-medium text-white">{empresas.length}</span>
                    </span>
                    <span className="text-sm text-gray-300">
                      Pendientes: <span className="font-medium text-yellow-400">
                        {empresas.filter(emp => emp.estado === 'pendiente').length}
                      </span>
                    </span>
                    <span className="text-sm text-gray-300">
                      Aprobadas: <span className="font-medium text-green-400">
                        {empresas.filter(emp => emp.estado === 'aprobada').length}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {empresas.length === 0 ? (
                <div className="p-12 text-center bg-gray-800">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No hay empresas registradas</h3>
                  <p className="text-gray-400">Comienza agregando la primera empresa expositora</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Empresa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Sector & Tamaño
                        </th>
                        
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-600">
                      {empresas.map((emp) => (
                        <tr key={emp.id_empresa} className="hover:bg-gray-700 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {emp.logo_url ? (
                                  <img
                                    className="h-10 w-10 rounded-lg object-cover border border-gray-600"
                                    src={emp.logo_url}
                                    alt={`Logo ${emp.nombre_empresa}`}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                      {emp.nombre_empresa.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">
                                  {emp.nombre_empresa}
                                </div>
                                <div className="text-sm text-gray-400">
                                  RUC: {emp.ruc}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                                {emp.sector}
                              </span>
                              <div>
                                {getTamañoEmpresaBadge(emp.tamaño_empresa) && (
                                  <span className={getTamañoEmpresaBadge(emp.tamaño_empresa)}>
                                    {emp.tamaño_empresa}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{emp.email_contacto}</div>
                            {emp.telefono_contacto && (
                              <div className="text-sm text-gray-400">{emp.telefono_contacto}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-white">{emp.ciudad}</div>
                            <div className="text-sm text-gray-400">{emp.pais}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getEstadoBadge(emp.estado)}>
                              {emp.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-100 bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 transition-colors duration-200"
                              onClick={() => handleOpenModal(emp.id_empresa)}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "dashboard" && (
            <div className="p-6 bg-gray-800">
              <DashboardEmpresas />
            </div>
          )}
          {activeTab === "agregar" && (
            <div className="p-6 bg-gray-800">
              <AgregarEmpresa />
            </div>
          )}
          {activeTab === "pendientes" && (
            <div className="p-6 bg-gray-800">
              <AprobacionEmpresas />
            </div>
          )}
          {activeTab === "documentos" && (
            <div className="p-6 bg-gray-800">
              <DocumentosPorVencer />
            </div>
          )}
        </div>

        {/* MODAL DE DETALLE EMPRESA */}
        {modalEmpresaId && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Detalles de la Empresa
                    </h3>
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={handleCloseModal}
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  {modalLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-3 text-gray-600">Cargando empresa...</span>
                    </div>
                  ) : modalError ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-4 text-red-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-red-600 font-medium">{modalError}</p>
                    </div>
                  ) : modalEmpresa ? (
                    <div className="space-y-6">
                      {/* Header de la empresa */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {modalEmpresa.logo_url ? (
                            <img
                              src={modalEmpresa.logo_url}
                              alt={`Logo ${modalEmpresa.nombre_empresa}`}
                              className="w-16 h-16 object-cover rounded-lg border shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-bold text-lg">
                                {modalEmpresa.nombre_empresa.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xl font-bold text-gray-900">{modalEmpresa.nombre_empresa}</h4>
                          {modalEmpresa.razon_social && (
                            <p className="text-sm text-gray-500 mt-1">{modalEmpresa.razon_social}</p>
                          )}
                          <div className="flex items-center space-x-3 mt-2">
                            <span className={getEstadoBadge(modalEmpresa.estado)}>
                              {modalEmpresa.estado}
                            </span>
                            {modalEmpresa.tamaño_empresa && (
                              <span className={getTamañoEmpresaBadge(modalEmpresa.tamaño_empresa)}>
                                {modalEmpresa.tamaño_empresa}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Información básica */}
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Información Básica</h5>
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-xs font-medium text-gray-500">RUC</dt>
                              <dd className="text-sm text-gray-900">{modalEmpresa.ruc}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Sector</dt>
                              <dd className="text-sm text-gray-900">{modalEmpresa.sector}</dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Participaciones</dt>
                              <dd className="text-sm text-gray-900">{modalEmpresa.numero_participaciones}</dd>
                            </div>
                          </dl>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Contacto</h5>
                          <dl className="space-y-2">
                            <div>
                              <dt className="text-xs font-medium text-gray-500">Email</dt>
                              <dd className="text-sm text-gray-900">{modalEmpresa.email_contacto}</dd>
                            </div>
                            {modalEmpresa.telefono_contacto && (
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Teléfono</dt>
                                <dd className="text-sm text-gray-900">{modalEmpresa.telefono_contacto}</dd>
                              </div>
                            )}
                            {modalEmpresa.nombre_contacto && (
                              <div>
                                <dt className="text-xs font-medium text-gray-500">Persona de contacto</dt>
                                <dd className="text-sm text-gray-900">
                                  {modalEmpresa.nombre_contacto}
                                  {modalEmpresa.cargo_contacto && (
                                    <span className="text-gray-500"> - {modalEmpresa.cargo_contacto}</span>
                                  )}
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </div>

                      {/* Ubicación */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-3">Ubicación</h5>
                        <p className="text-sm text-gray-900">
                          {modalEmpresa.direccion}, {modalEmpresa.ciudad}, {modalEmpresa.pais}
                        </p>
                      </div>

                      {/* Descripción */}
                      {modalEmpresa.descripcion && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Descripción</h5>
                          <p className="text-sm text-gray-700">{modalEmpresa.descripcion}</p>
                        </div>
                      )}

                      {/* Sitio web */}
                      {modalEmpresa.sitio_web && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-3">Sitio Web</h5>
                          <a
                            href={modalEmpresa.sitio_web}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-500 inline-flex items-center"
                          >
                            {modalEmpresa.sitio_web}
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}

                      {/* Fechas */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>ID: {modalEmpresa.id_empresa}</p>
                          <p>Registrada: {new Date(modalEmpresa.created_at).toLocaleDateString('es-PE')}</p>
                          {modalEmpresa.fecha_aprobacion && (
                            <p>Aprobada: {new Date(modalEmpresa.fecha_aprobacion).toLocaleDateString('es-PE')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListadoEmpresas;