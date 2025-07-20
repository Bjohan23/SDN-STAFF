import axios from '../config/axios';

const standsService = {
  // Obtener todos los stands
  getAllStands: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page,
        limit: limit
      });

      // Agregar filtros si se proporcionan
      if (filters.estado_fisico) {
        params.append('estado_fisico', filters.estado_fisico);
      }
      if (filters.id_tipo_stand) {
        params.append('id_tipo_stand', filters.id_tipo_stand);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await axios.get(`/stands?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stand por ID
  getStandById: async (id) => {
    try {
      const response = await axios.get(`/stands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Crear nuevo stand
  createStand: async (standData) => {
    try {
      const response = await axios.post('/stands', standData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Actualizar stand
  updateStand: async (id, standData) => {
    try {
      const response = await axios.put(`/stands/${id}`, standData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Eliminar stand (soft delete)
  deleteStand: async (id) => {
    try {
      const response = await axios.delete(`/stands/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stands por tipo
  getStandsByType: async (tipoId, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/stands?page=${page}&limit=${limit}&id_tipo_stand=${tipoId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stands por estado
  getStandsByStatus: async (estado, page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/stands?page=${page}&limit=${limit}&estado_fisico=${estado}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stands disponibles
  getAvailableStands: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/stands?page=${page}&limit=${limit}&estado_fisico=disponible`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener stands ocupados
  getOccupiedStands: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/stands?page=${page}&limit=${limit}&estado_fisico=ocupado`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener estadísticas de stands
  getStandStats: async () => {
    try {
      const response = await axios.get('/stands/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener tipos de stand
  getTiposStand: async () => {
    try {
      const response = await axios.get('/tiposStand');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Restaurar stand eliminado
  restoreStand: async (id) => {
    try {
      const response = await axios.post(`/stands/${id}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default standsService; 