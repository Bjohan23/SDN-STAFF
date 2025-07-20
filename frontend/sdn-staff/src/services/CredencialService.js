import axios from "../config/axios";

const CredencialService = {
  // Obtener todas las credenciales
  getAll: async () => {
    const res = await axios.get("/credenciales");
    return res.data;
  },
  // Obtener tipos de credencial
  getTipos: async () => {
    const res = await axios.get("/credenciales/tipos");
    return res.data;
  },
  // Validar QR
  validarQR: async (codigoQR) => {
    const res = await axios.post("/credenciales/validar-qr", { codigoQR });
    return res.data;
  },
};

export default CredencialService;
