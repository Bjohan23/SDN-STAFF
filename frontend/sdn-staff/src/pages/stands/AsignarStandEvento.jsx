import React, { useState, useEffect } from 'react';
import axios from '../../config/axios';

const AsignarStandEvento = () => {
  const [eventos, setEventos] = useState([]);
  const [stands, setStands] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [standSeleccionado, setStandSeleccionado] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEventos();
  }, []);

  useEffect(() => {
    if (eventoSeleccionado) {
      fetchStandsDisponibles(eventoSeleccionado);
    } else {
      setStands([]);
    }
  }, [eventoSeleccionado]);

  const fetchEventos = async () => {
    try {
      const res = await axios.get('/api/eventos');
      console.log('Eventos response:', res.data);
      setEventos(res.data.data || res.data.eventos || []);
    } catch (err) {
      console.error('Error fetching eventos:', err);
      setError(`Error al cargar eventos: ${err.response?.data?.message || err.message}`);
    }
  };

  const fetchStandsDisponibles = async (eventoId) => {
    try {
      const res = await axios.get(`/api/stands/evento/${eventoId}/disponibles`);
      console.log('Stands disponibles response:', res.data);
      setStands(res.data.data || res.data.stands || []);
    } catch (err) {
      console.error('Error fetching stands disponibles:', err);
      setError(`Error al cargar stands disponibles: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAsignar = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!eventoSeleccionado || !standSeleccionado) {
      setError('Selecciona un evento y un stand');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Asignando stand:', {
        standId: standSeleccionado,
        eventoId: eventoSeleccionado
      });
      
      const response = await axios.post(`/api/stands/${standSeleccionado}/asignar-evento`, {
        id_evento: eventoSeleccionado
      });
      
      console.log('Asignación response:', response.data);
      setSuccess('Stand asignado al evento exitosamente');
      setStandSeleccionado('');
      fetchStandsDisponibles(eventoSeleccionado);
    } catch (err) {
      console.error('Error al asignar stand:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Error al asignar stand';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Asignar Stand a Evento</h2>
      {success && <div className="bg-green-700 text-green-100 p-3 rounded mb-4">{success}</div>}
      {error && <div className="bg-red-700 text-red-100 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleAsignar} className="space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">Evento</label>
          <select
            className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600"
            value={eventoSeleccionado}
            onChange={e => setEventoSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un evento</option>
            {eventos.map(ev => (
              <option key={ev.id_evento || ev.id} value={ev.id_evento || ev.id}>
                {ev.nombre_evento}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-2">Stand disponible</label>
          <select
            className="w-full px-3 py-2 rounded bg-gray-900 text-white border border-gray-600"
            value={standSeleccionado}
            onChange={e => setStandSeleccionado(e.target.value)}
            disabled={!eventoSeleccionado}
          >
            <option value="">Selecciona un stand</option>
            {stands.map(st => (
              <option key={st.id_stand} value={st.id_stand}>
                {st.numero_stand} - {st.nombre_stand || ''} (Área: {st.area} m²)
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Asignando...' : 'Asignar Stand'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AsignarStandEvento; 