import React, { useEffect, useState } from "react";
import DashboardEmpresas from "./DashboardEmpresas";
import DocumentosPorVencer from "./DocumentosPorVencer";
import AprobacionEmpresas from "./AprobacionEmpresas";
import AgregarEmpresa from "./AgregarEmpresa";
import axios from "../../config/axios";

const TABS = [
  { key: "listado", label: "Listado" },
  { key: "dashboard", label: "Dashboard" },
  { key: "agregar", label: "Agregar Empresa" },
  { key: "pendientes", label: "Pendientes" },
  { key: "documentos", label: "Documentos por vencer" },
];

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

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">
        Empresas Expositoras
      </h2>
      <div className="flex justify-center mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-indigo-100 text-indigo-600"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "listado" && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead className="bg-indigo-100">
              <tr>
                <th className="py-2 px-4 border-b">Nombre</th>
                <th className="py-2 px-4 border-b">Sector</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Estado</th>
                <th className="py-2 px-4 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((emp) => (
                <tr key={emp.id_empresa} className="hover:bg-indigo-50">
                  <td className="py-2 px-4 border-b">{emp.nombre_empresa}</td>
                  <td className="py-2 px-4 border-b">{emp.sector}</td>
                  <td className="py-2 px-4 border-b">{emp.email_contacto}</td>
                  <td className="py-2 px-4 border-b">{emp.estado}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="inline-block bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition shadow-md"
                      onClick={() => handleOpenModal(emp.id_empresa)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* MODAL DE DETALLE EMPRESA */}
      {modalEmpresaId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-60 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-lg w-full relative animate-slide-up">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-indigo-600 text-2xl font-bold"
              onClick={handleCloseModal}
              aria-label="Cerrar"
            >
              &times;
            </button>
            {modalLoading ? (
              <div className="text-center py-12 text-lg text-indigo-600 font-semibold">
                Cargando empresa...
              </div>
            ) : modalError ? (
              <div className="text-center text-red-500 py-8">{modalError}</div>
            ) : modalEmpresa ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {modalEmpresa.logo_url && (
                    <img
                      src={modalEmpresa.logo_url}
                      alt="Logo"
                      className="w-20 h-20 object-contain rounded-xl border shadow"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-indigo-700 mb-1">
                      {modalEmpresa.nombre_empresa}
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        modalEmpresa.estado === "pendiente"
                          ? "bg-yellow-100 text-yellow-700"
                          : modalEmpresa.estado === "aprobada"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {modalEmpresa.estado}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-600">RUC:</span>{" "}
                    {modalEmpresa.ruc}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Sector:</span>{" "}
                    {modalEmpresa.sector}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">Email:</span>{" "}
                    {modalEmpresa.email_contacto}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-600">
                      Teléfono:
                    </span>{" "}
                    {modalEmpresa.telefono_contacto}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-gray-600">
                      Descripción:
                    </span>{" "}
                    {modalEmpresa.descripcion}
                  </div>
                  <div className="col-span-2">
                    <span className="font-semibold text-gray-600">
                      Sitio web:
                    </span>{" "}
                    <a
                      href={modalEmpresa.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 underline"
                    >
                      {modalEmpresa.sitio_web}
                    </a>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  ID: {modalEmpresa.id_empresa}
                </div>
                {/* Aquí puedes agregar más detalles visuales, métricas, historial, etc. */}
              </div>
            ) : null}
          </div>
        </div>
      )}
      {activeTab === "dashboard" && <DashboardEmpresas />}
      {activeTab === "agregar" && <AgregarEmpresa />}
      {activeTab === "pendientes" && <AprobacionEmpresas />}
      {activeTab === "documentos" && <DocumentosPorVencer />}
    </div>
  );
};

export default ListadoEmpresas;
