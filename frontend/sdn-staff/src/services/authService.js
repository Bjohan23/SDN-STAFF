import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
console.log(API_URL);
// Configure axios defaults
axios.defaults.withCredentials = true;

const authService = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        correo: userData.email,
        password: userData.password
      });
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error.response?.data || error.message;
    }
  },
  forgotPassword: async (email) => {
    const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { correo: email });
    return res.data;
  },
  resetPassword: async ({ correo, code, newPassword }) => {
    const res = await axios.post(`${API_URL}/auth/reset-password`, { correo, code, newPassword });
    return res.data;
  }
};

export default authService; 