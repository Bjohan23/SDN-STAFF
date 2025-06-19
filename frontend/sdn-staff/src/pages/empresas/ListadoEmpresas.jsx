import React, { useEffect, useState } from 'react';
import DashboardEmpresas from './DashboardEmpresas';
import DocumentosPorVencer from './DocumentosPorVencer';
import AprobacionEmpresas from './AprobacionEmpresas';
import AgregarEmpresa from './AgregarEmpresa';
import axios from '../../config/axios';

const TABS = [
  { key: 'listado', label: 'Listado' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'agregar', label: 'Agregar Empresa' },
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'documentos', label: 'Documentos por vencer' },
];

const ListadoEmpresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('listado');

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await axios.get('/api/empresasExpositoras');
        setEmpresas(res.data.data || []);
      } catch {
        setError('Error obteniendo empresas');
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
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Empresas Expositoras</h2>
      <div className="flex justify-center mb-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded ${activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'listado' && (
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
              {empresas.map(emp => (
                <tr key={emp.id_empresa} className="hover:bg-indigo-50">
                  <td className="py-2 px-4 border-b">{emp.nombre_empresa}</td>
                  <td className="py-2 px-4 border-b">{emp.sector}</td>
                  <td className="py-2 px-4 border-b">{emp.email_contacto}</td>
                  <td className="py-2 px-4 border-b">{emp.estado}</td>
                  <td className="py-2 px-4 border-b">
                    <a href={`/empresas/${emp.id_empresa}`} className="inline-block bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition">Ver</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'dashboard' && <DashboardEmpresas />}
      {activeTab === 'agregar' && <AgregarEmpresa />}
      {activeTab === 'pendientes' && <AprobacionEmpresas />}
      {activeTab === 'documentos' && <DocumentosPorVencer />}
    </div>
  );
};

export default ListadoEmpresas;
