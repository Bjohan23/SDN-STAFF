import axios from '../config/axios';

const standsService = {
  // Obtener todos los stands
  getAllStands: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/stands?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stand por ID
  getStandById: async (id) => {
    try {
      const response = await axios.get(`/api/stands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nuevo stand
  createStand: async (standData) => {
    try {
      const response = await axios.post('/api/stands', standData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar stand
  updateStand: async (id, standData) => {
    try {
      const response = await axios.put(`/api/stands/${id}`, standData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar stand (soft delete)
  deleteStand: async (id) => {
    try {
      const response = await axios.delete(`/api/stands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stands por tipo
  getStandsByType: async (tipoId, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/stands/tipo/${tipoId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stands disponibles
  getAvailableStands: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/stands/disponibles?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stands ocupados
  getOccupiedStands: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/stands/ocupados?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener estadísticas de stands
  getStandStats: async () => {
    try {
      const response = await axios.get('/api/stands/estadisticas');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener tipos de stand
  getTiposStand: async () => {
    try {
      const response = await axios.get('/api/tiposStand');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default standsService; 