import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const AprobacionEmpresas = () => {
  const [pendientes, setPendientes] = useState([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        const res = await axios.get('/api/empresasExpositoras/pendientes');
        setPendientes(res.data.data || []);
      } catch {
        setPendientes([]);
      }
    };
    fetchPendientes();
  }, []);

  const aprobar = async id => {
    setMensaje('');
    try {
      await axios.post(`/api/empresa-expositora/${id}/aprobar`);
      setMensaje('Empresa aprobada');
    } catch {
      setMensaje('Error al aprobar');
    }
  };
  const rechazar = async id => {
    setMensaje('');
    try {
      await axios.post(`/api/empresa-expositora/${id}/rechazar`);
      setMensaje('Empresa rechazada');
    } catch {
      setMensaje('Error al rechazar');
    }
  };

  return (
    <div className="aprobacion-empresas">
      <h2>Empresas Pendientes de Aprobación</h2>
      {mensaje && <div>{mensaje}</div>}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Sector</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pendientes.map(emp => (
            <tr key={emp.id_empresa}>
              <td>{emp.nombre_empresa}</td>
              <td>{emp.email_contacto}</td>
              <td>{emp.sector}</td>
              <td>
                <button onClick={() => aprobar(emp.id_empresa)}>Aprobar</button>
                <button onClick={() => rechazar(emp.id_empresa)}>Rechazar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AprobacionEmpresas;
