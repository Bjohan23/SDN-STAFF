import axiosInstance from '../config/axios';

const usuarios = {
    getUsuario: async () => {
        const res = await axiosInstance.get('/api/usuarios')
        return res.data
    }
}

export default usuarios; 