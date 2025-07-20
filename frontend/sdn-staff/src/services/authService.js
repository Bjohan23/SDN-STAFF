import axiosInstance from '../config/axios';

const authService = {
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        correo: userData.email,
        password: userData.password
      });
      return response.data;
    } catch (error) {
      // Mejor manejo de errores: mostrar mensaje del backend si existe
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (typeof error.response?.data === 'string') {
        throw new Error(error.response.data);
      }
      throw new Error(error.message || 'Error al registrar usuario');
    }
  },
  forgotPassword: async (email) => {
    const res = await axiosInstance.post('/auth/forgot-password', { correo: email });
    return res.data;
  },
  resetPassword: async ({ correo, code, newPassword }) => {
    const res = await axiosInstance.post('/auth/reset-password', { correo, code, newPassword });
    return res.data;
  }
};

export default authService; 