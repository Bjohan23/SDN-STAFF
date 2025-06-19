import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../config/axios';

const HistorialParticipacion = () => {
  const { id } = useParams();
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const res = await axios.get(`/api/empresa-expositora/${id}`);
        setHistorial(res.data.data?.participaciones || []);
      } catch {
        setError('No se pudo obtener el historial');
      }
    };
    fetchHistorial();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!historial.length) return <div>No hay historial de participación</div>;

  return (
    <div className="historial-participacion">
      <h3>Historial de Participación en Eventos</h3>
      <table>
        <thead>
          <tr>
            <th>Evento</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((h, i) => (
            <tr key={i}>
              <td>{h.evento?.nombre_evento || h.id_evento}</td>
              <td>{h.fecha_registro}</td>
              <td>{h.estado_participacion}</td>
              <td>
                <a href={`/empresas/${id}/eventos/${h.id_evento}`}>Ver detalle</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialParticipacion;
