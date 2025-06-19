import React, { useEffect, useState } from 'react';
import axios from '../../config/axios';

const RegistroEnEvento = ({ idEmpresa }) => {
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const res = await axios.get('/api/evento');
        setEventos(res.data.data || []);
      } catch {
        setEventos([]);
      }
    };
    fetchEventos();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    try {
      await axios.post(`/api/empresa-expositora/${idEmpresa}/eventos`, { id_evento: eventoSeleccionado });
      setMensaje('Empresa registrada en evento');
    } catch {
      setMensaje('Error al registrar en evento');
    }
  };

  return (
    <div className="registro-en-evento">
      <h3>Registrar empresa en evento</h3>
      <form onSubmit={handleSubmit}>
        <select value={eventoSeleccionado} onChange={e => setEventoSeleccionado(e.target.value)} required>
          <option value="">Seleccione un evento</option>
          {eventos.map(ev => (
            <option key={ev.id_evento} value={ev.id_evento}>{ev.nombre_evento}</option>
          ))}
        </select>
        <button type="submit">Registrar</button>
      </form>
      {mensaje && <div>{mensaje}</div>}
    </div>
  );
};

export default RegistroEnEvento;
