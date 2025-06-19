import axios from 'axios';
// Crear instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: 'http://161.132.41.106', // Ajusta esto según tu puerto de backend
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