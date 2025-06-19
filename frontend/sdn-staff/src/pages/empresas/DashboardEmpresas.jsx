import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const DashboardEmpresas = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/empresasExpositoras/stats');
        setStats(res.data.data);
      } catch {
        setError('No se pudo obtener estadísticas');
      }
    };
    fetchStats();
  }, []);

  if (error) return <div>{error}</div>;
  if (!stats) return <div>Cargando estadísticas...</div>;

  return (
    <div className="dashboard-empresas">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Dashboard de Empresas Expositoras</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon="🏢" label="Total" value={stats.total} color="bg-indigo-100 text-indigo-700" />
        <StatCard icon="✅" label="Aprobadas" value={stats.aprobadas} color="bg-green-100 text-green-700" />
        <StatCard icon="⏳" label="Pendientes" value={stats.pendientes} color="bg-yellow-100 text-yellow-700" />
        <StatCard icon="❌" label="Rechazadas" value={stats.rechazadas} color="bg-red-100 text-red-700" />
        <StatCard icon="🚫" label="Suspendidas" value={stats.suspendidas} color="bg-gray-200 text-gray-500" />
        <StatCard icon="🗑️" label="Eliminadas" value={stats.eliminadas} color="bg-gray-100 text-gray-400" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-indigo-600 mb-2">Por Sector</h3>
          <ul className="space-y-1">
            {stats.porSector?.length ? stats.porSector.map(s => (
              <li key={s.sector} className="flex justify-between text-sm">
                <span>{s.sector}</span>
                <span className="font-bold text-indigo-700">{s.count}</span>
              </li>
            )) : <li className="text-gray-400">Sin datos</li>}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-indigo-600 mb-2">Por Tamaño</h3>
          <ul className="space-y-1">
            {stats.porTamaño?.length ? stats.porTamaño.map(t => (
              <li key={t.tamaño_empresa} className="flex justify-between text-sm">
                <span>{t.tamaño_empresa}</span>
                <span className="font-bold text-indigo-700">{t.count}</span>
              </li>
            )) : <li className="text-gray-400">Sin datos</li>}
          </ul>
        </div>
      </div>
    </div>
  );

  function StatCard({ icon, label, value, color }) {
    return (
      <div className={`rounded-xl shadow flex flex-col items-center py-6 ${color}`}>
        <div className="text-3xl mb-2">{icon}</div>
        <div className="text-lg font-semibold">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    );
  }
};

export default DashboardEmpresas;
