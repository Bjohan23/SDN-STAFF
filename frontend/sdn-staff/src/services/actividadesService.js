import axios from "../config/axios";

export const getActividades = async (params = {}) => {
  const response = await axios.get(`/api/actividades`, { params });
  return response.data;
};

export const getActividadById = async (id) => {
  const response = await axios.get(`/api/actividades/${id}`);
  return response.data;
};

// Crear actividad
export const crearActividad = async (data) => {
  const response = await axios.post('/api/actividades', data);
  return response.data;
};

// Actualizar actividad
export const actualizarActividad = async (id, data) => {
  const response = await axios.put(`/api/actividades/${id}`, data);
  return response.data;
};

// Eliminar actividad
export const eliminarActividad = async (id) => {
  const response = await axios.delete(`/api/actividades/${id}`);
  return response.data;
};
