import axios from '../config/axios';

const API_TIPOS = '/api/tiposEvento';

const eventosService = {
  async getEventos() {
    const res = await axios.get('/api/eventos');
    return res.data;
  },
  async getEventoById(id) {
    const res = await axios.get(`/api/eventos/${id}`);
    return res.data;
  },
  async updateEvento(id, data) {
    const res = await axios.put(`/api/eventos/${id}`, data);
    return res.data;
  },
  async getTiposEvento() {
    const res = await axios.get(API_TIPOS);
    // El backend responde con { data: [tipos], ... }
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },
  async getEventosPorTipo(idTipo, page = 1, limit = 10) {
    const res = await axios.get(`${API_TIPOS}/${idTipo}/eventos`, {
      params: { page, limit }
    });
    // El backend responde con { data: [eventos], ... } o paginado
    return res.data;
  }
};

export default eventosService; 