import axiosInstance from "../config/axios";

const rolesService = {
  async asignarMultiplesRoles(userId, rolesIds) {
    return axiosInstance.post(`/api/usuarios/${userId}/roles`, { roles: rolesIds });
  },
  async getRoles() {
    const res = await axiosInstance.get('/api/roles');
    // El backend responde con { data: [roles], ... }
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },
};

export default rolesService;
