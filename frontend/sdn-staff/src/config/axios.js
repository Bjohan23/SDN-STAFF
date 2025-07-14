import axios from 'axios';
// Crear instancia de axios con configuración base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Usa la variable de entorno o un valor por defecto
const axiosInstance = axios.create({
  baseURL: API_URL, 
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para manejar tokens
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 