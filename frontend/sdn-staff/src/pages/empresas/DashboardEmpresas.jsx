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
      <h2>Dashboard de Empresas Expositoras</h2>
      <div>Total: {stats.total}</div>
      <div>Aprobadas: {stats.aprobadas}</div>
      <div>Pendientes: {stats.pendientes}</div>
      <div>Rechazadas: {stats.rechazadas}</div>
      <div>Suspendidas: {stats.suspendidas}</div>
      <div>Eliminadas: {stats.eliminadas}</div>
      <h3>Por Sector</h3>
      <ul>
        {stats.porSector?.map(s => (
          <li key={s.sector}>{s.sector}: {s.count}</li>
        ))}
      </ul>
      <h3>Por Tamaño</h3>
      <ul>
        {stats.porTamaño?.map(t => (
          <li key={t.tamaño_empresa}>{t.tamaño_empresa}: {t.count}</li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardEmpresas;
