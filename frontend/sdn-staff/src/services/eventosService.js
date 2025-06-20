import axios from '../config/axios';

const API_TIPOS = '/api/tiposEvento';

const eventosService = {
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