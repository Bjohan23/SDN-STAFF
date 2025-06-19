import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { obtenerEmpresa } from '../../services/empresasService';

const DetalleEmpresa = () => {
  const { id } = useParams();
  const [empresa, setEmpresa] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const data = await obtenerEmpresa(id);
        setEmpresa(data.data);
      } catch {
        setError('No se pudo obtener la empresa');
      }
    };
    fetchEmpresa();
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!empresa) return <div>Cargando...</div>;

  return (
    <div className="detalle-empresa">
      <h2>{empresa.nombre_empresa}</h2>
      <img src={empresa.logo_url} alt="Logo" style={{ maxWidth: 120 }} />
      <div><strong>Descripción:</strong> {empresa.descripcion}</div>
      <div><strong>Sector:</strong> {empresa.sector}</div>
      <div><strong>Email:</strong> {empresa.email_contacto}</div>
      <div><strong>Teléfono:</strong> {empresa.telefono_contacto}</div>
      <div><strong>Sitio web:</strong> <a href={empresa.sitio_web} target="_blank" rel="noopener noreferrer">{empresa.sitio_web}</a></div>
      <div><strong>Redes sociales:</strong> {empresa.redes_sociales}</div>
      <div><strong>Documentos legales:</strong> {empresa.documentos_legales}</div>
      <div><strong>Estado:</strong> {empresa.estado}</div>
      {/* Aquí puedes agregar historial de eventos, métricas, etc. */}
    </div>
  );
};

export default DetalleEmpresa;
