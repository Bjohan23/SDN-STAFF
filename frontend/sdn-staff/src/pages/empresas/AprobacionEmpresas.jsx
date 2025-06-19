import React, { useEffect, useState } from "react";
import axios from "../../config/axios";

const AprobacionEmpresas = () => {
  const [pendientes, setPendientes] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState(""); // 'success', 'error'
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null); // ID de la empresa que se está procesando
  const [modalEmpresa, setModalEmpresa] = useState(null);

  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        setCargando(true);
        const res = await axios.get("/api/empresasExpositoras/pendientes");
        setPendientes(res.data.data || []);
      } catch {
        setPendientes([]);
        setMensaje("Error al cargar las empresas pendientes");
        setTipoMensaje("error");
      } finally {
        setCargando(false);
      }
    };
    fetchPendientes();
  }, []);

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => {
      setMensaje("");
      setTipoMensaje("");
    }, 5000);
  };

  const aprobar = async (id) => {
    setProcesando(id);
    try {
      await axios.post(`/api/empresasExpositoras/${id}/aprobar`);
      setPendientes((prev) => prev.filter((emp) => emp.id_empresa !== id));
      mostrarMensaje("Empresa aprobada exitosamente", "success");
    } catch {
      mostrarMensaje("Error al aprobar la empresa", "error");
    } finally {
      setProcesando(null);
    }
  };

  const rechazar = async (id) => {
    setProcesando(id);
    try {
      await axios.post(`/api/empresasExpositoras/${id}/rechazar`);
      setPendientes((prev) => prev.filter((emp) => emp.id_empresa !== id));
      mostrarMensaje("Empresa rechazada exitosamente", "success");
    } catch {
      mostrarMensaje("Error al rechazar la empresa", "error");
    } finally {
      setProcesando(null);
    }
  };

  const verDetalle = (empresa) => {
    setModalEmpresa(empresa);
  };

  const cerrarModal = () => {
    setModalEmpresa(null);
  };

  const getTamañoBadge = (tamaño) => {
    if (!tamaño) return null;
    const baseClasses =
      "inline-flex items-center px-2 py-1 rounded text-xs font-medium";
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

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
          <p className="text-gray-300 font-medium">
            Cargando empresas pendientes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Aprobación de Empresas
        </h2>
        <p className="text-gray-400">
          Gestiona las empresas expositoras pendientes de aprobación
        </p>
      </div>

      {/* Mensaje de estado */}
      {mensaje && (
        <div
          className={`p-4 rounded-lg border ${
            tipoMensaje === "success"
              ? "bg-green-900 border-green-600"
              : "bg-red-900 border-red-600"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`flex-shrink-0 w-5 h-5 mr-3 ${
                tipoMensaje === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {tipoMensaje === "success" ? (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p
              className={`font-medium ${
                tipoMensaje === "success" ? "text-green-200" : "text-red-200"
              }`}
            >
              {mensaje}
            </p>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {pendientes.length === 0 ? (
        <div className="bg-gray-700 rounded-lg border border-gray-600 p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No hay empresas pendientes
          </h3>
          <p className="text-gray-400">
            Todas las empresas han sido procesadas
          </p>
        </div>
      ) : (
        <div className="bg-gray-700 rounded-lg shadow-lg border border-gray-600 overflow-hidden">
          {/* Estadísticas */}
          <div className="bg-gray-600 px-6 py-4 border-b border-gray-500">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Empresas Pendientes de Aprobación
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900 text-yellow-200">
                {pendientes.length} pendiente
                {pendientes.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sector & Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-700 divide-y divide-gray-600">
                {pendientes.map((emp) => (
                  <tr
                    key={emp.id_empresa}
                    className="hover:bg-gray-600 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {emp.logo_url ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover border border-gray-500"
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
                          {emp.razon_social && (
                            <div className="text-xs text-gray-400">
                              {emp.razon_social}
                            </div>
                          )}
                          <div className="text-xs text-gray-400">
                            RUC: {emp.ruc}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {emp.email_contacto}
                      </div>
                      {emp.telefono_contacto && (
                        <div className="text-xs text-gray-400">
                          {emp.telefono_contacto}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                          {emp.sector}
                        </span>
                        {emp.tamaño_empresa && (
                          <div>
                            <span
                              className={getTamañoBadge(emp.tamaño_empresa)}
                            >
                              {emp.tamaño_empresa}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {emp.ciudad || "No especificada"}
                      </div>
                      <div className="text-xs text-gray-400">{emp.pais}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {formatFecha(emp.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => verDetalle(emp)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs leading-4 font-medium rounded text-blue-200 bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-700 transition-colors duration-200"
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Ver
                        </button>
                        <button
                          onClick={() => aprobar(emp.id_empresa)}
                          disabled={procesando === emp.id_empresa}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {procesando === emp.id_empresa ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Aprobar
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => rechazar(emp.id_empresa)}
                          disabled={procesando === emp.id_empresa}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {procesando === emp.id_empresa ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Rechazar
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de detalle */}
      {modalEmpresa && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              onClick={cerrarModal}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="relative inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-gray-600">
              <div className="bg-gray-800 px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg leading-6 font-medium text-white">
                    Detalles de la Empresa Pendiente
                  </h3>
                  <button
                    type="button"
                    className="bg-gray-700 rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={cerrarModal}
                  >
                    <span className="sr-only">Cerrar</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6">
                <div className="space-y-6">
                  {/* Header de la empresa */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {modalEmpresa.logo_url ? (
                        <img
                          src={modalEmpresa.logo_url}
                          alt={`Logo ${modalEmpresa.nombre_empresa}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-600 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {modalEmpresa.nombre_empresa
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xl font-bold text-white">
                        {modalEmpresa.nombre_empresa}
                      </h4>
                      {modalEmpresa.razon_social && (
                        <p className="text-sm text-gray-400 mt-1">
                          {modalEmpresa.razon_social}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200">
                          Pendiente
                        </span>
                        {modalEmpresa.tamaño_empresa && (
                          <span
                            className={getTamañoBadge(
                              modalEmpresa.tamaño_empresa
                            )}
                          >
                            {modalEmpresa.tamaño_empresa}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información en grid */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h5 className="text-sm font-medium text-white mb-3">
                        Información Básica
                      </h5>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs font-medium text-gray-400">
                            RUC
                          </dt>
                          <dd className="text-sm text-gray-200">
                            {modalEmpresa.ruc}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-400">
                            Sector
                          </dt>
                          <dd className="text-sm text-gray-200">
                            {modalEmpresa.sector}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-gray-400">
                            Fecha de Registro
                          </dt>
                          <dd className="text-sm text-gray-200">
                            {formatFecha(modalEmpresa.created_at)}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-white mb-3">
                        Contacto
                      </h5>
                      <dl className="space-y-2">
                        <div>
                          <dt className="text-xs font-medium text-gray-400">
                            Email
                          </dt>
                          <dd className="text-sm text-gray-200">
                            {modalEmpresa.email_contacto}
                          </dd>
                        </div>
                        {modalEmpresa.telefono_contacto && (
                          <div>
                            <dt className="text-xs font-medium text-gray-400">
                              Teléfono
                            </dt>
                            <dd className="text-sm text-gray-200">
                              {modalEmpresa.telefono_contacto}
                            </dd>
                          </div>
                        )}
                        {modalEmpresa.sitio_web && (
                          <div>
                            <dt className="text-xs font-medium text-gray-400">
                              Sitio Web
                            </dt>
                            <dd className="text-sm">
                              <a
                                href={modalEmpresa.sitio_web}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                              >
                                {modalEmpresa.sitio_web}
                                <svg
                                  className="w-3 h-3 ml-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Ubicación */}
                  {(modalEmpresa.direccion || modalEmpresa.ciudad) && (
                    <div>
                      <h5 className="text-sm font-medium text-white mb-3">
                        Ubicación
                      </h5>
                      <p className="text-sm text-gray-200">
                        {[
                          modalEmpresa.direccion,
                          modalEmpresa.ciudad,
                          modalEmpresa.pais,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Descripción */}
                  {modalEmpresa.descripcion && (
                    <div>
                      <h5 className="text-sm font-medium text-white mb-3">
                        Descripción
                      </h5>
                      <p className="text-sm text-gray-300">
                        {modalEmpresa.descripcion}
                      </p>
                    </div>
                  )}

                  {/* Acciones en el modal */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
                    <button
                      onClick={() => {
                        rechazar(modalEmpresa.id_empresa);
                        cerrarModal();
                      }}
                      disabled={procesando === modalEmpresa.id_empresa}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Rechazar
                    </button>
                    <button
                      onClick={() => {
                        aprobar(modalEmpresa.id_empresa);
                        cerrarModal();
                      }}
                      disabled={procesando === modalEmpresa.id_empresa}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Aprobar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AprobacionEmpresas;
