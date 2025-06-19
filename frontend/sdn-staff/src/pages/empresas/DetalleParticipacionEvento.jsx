import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../config/axios";

const DetalleParticipacionEvento = () => {
  const { id, evento_id } = useParams();
  const [detalle, setDetalle] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        const res = await axios.get(
          `/api/empresasExpositoras/${id}/eventos/${evento_id}`
        );
        setDetalle(res.data.data);
      } catch {
        setError("No se pudo obtener el detalle");
      }
    };
    fetchDetalle();
  }, [id, evento_id]);

  if (error) return <div>{error}</div>;
  if (!detalle) return <div>Cargando...</div>;

  return (
    <div className="detalle-participacion-evento">
      <h3>Detalle de Participación</h3>
      <div>
        <strong>Evento:</strong>{" "}
        {detalle.evento?.nombre_evento || detalle.id_evento}
      </div>
      <div>
        <strong>Fecha registro:</strong> {detalle.fecha_registro}
      </div>
      <div>
        <strong>Estado:</strong> {detalle.estado_participacion}
      </div>
      <div>
        <strong>Stand:</strong> {detalle.numero_stand}
      </div>
      <div>
        <strong>Pagos:</strong> {detalle.estado_pago}
      </div>
      <div>
        <strong>Precio stand:</strong> {detalle.precio_stand}
      </div>
      <div>
        <strong>Servicios adicionales:</strong> {detalle.servicios_adicionales}
      </div>
      {/* Agrega aquí más detalles según el backend */}
    </div>
  );
};

export default DetalleParticipacionEvento;
