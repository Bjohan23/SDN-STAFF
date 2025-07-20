import axiosInstance from '../config/axios';

const usuarios = {
    getUsuario: async () => {
        const res = await axiosInstance.get('/usuarios')
        return res.data
    },
    
    // Obtener perfil del usuario autenticado
    getProfile: async () => {
        const res = await axiosInstance.get('/usuarios/profile')
        return res.data
    },
    
    // Actualizar perfil del usuario autenticado
    updateProfile: async (profileData) => {
        const res = await axiosInstance.put('/usuarios/profile', profileData)
        return res.data
    }
}

export default usuarios; 