import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const DocumentosPorVencer = () => {
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await axios.get('/api/empresasExpositoras/documentos-vencer');
        setEmpresas(res.data.data || []);
      } catch {
        setError('No se pudo obtener la información');
      }
    };
    fetchEmpresas();
  }, []);

  if (error) return <div>{error}</div>;
  if (!empresas.length) return <div>No hay documentos próximos a vencer</div>;

  return (
    <div className="documentos-por-vencer">
      <h3>Empresas con Documentos Próximos a Vencer</h3>
      <table>
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Documento</th>
            <th>Fecha Vencimiento</th>
          </tr>
        </thead>
        <tbody>
          {empresas.map(emp => (
            <tr key={emp.id_empresa}>
              <td>{emp.nombre_empresa}</td>
              <td>{emp.documentos_legales}</td>
              <td>{emp.fecha_vencimiento_documentos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocumentosPorVencer;
