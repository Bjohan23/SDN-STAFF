import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

export const getActividades = async (params = {}) => {
  const response = await axios.get(`${API_URL}/actividades`, { params });
  return response.data;
};

export const getActividadById = async (id) => {
  const response = await axios.get(`${API_URL}/actividades/${id}`);
  return response.data;
};

// Puedes agregar más métodos si necesitas (crear, actualizar, etc.)
