import axios from '../config/axios';

const actividadesService = {
  async getActividades(params) {
    const response = await axios.get(`/actividades`, { params });
    return response.data;
  },
  async getActividadById(id) {
    const response = await axios.get(`/actividades/${id}`);
    return response.data;
  },
  async crearActividad(data) {
    const response = await axios.post('/actividades', data);
    return response.data;
  },
  async actualizarActividad(id, data) {
    const response = await axios.put(`/actividades/${id}`, data);
    return response.data;
  },
  async eliminarActividad(id) {
    const response = await axios.delete(`/actividades/${id}`);
    return response.data;
  },
};

export default actividadesService;
