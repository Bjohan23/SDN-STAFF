// Servicios para empresas expositoras y su participación en eventos

import axios from '../config/axios';
const API = '/api/empresasExpositoras';

export async function registrarEmpresaPublica(data) {
  // POST /api/empresa-expositora/registro-publico
  const res = await axios.post(`${API}/registro-publico`, data);
  return res.data;
}

export async function listarEmpresas() {
  // GET /api/empresa-expositora
  const res = await axios.get(API);
  return res.data;
}

export async function obtenerEmpresa(id) {
  // GET /api/empresa-expositora/:id
  const res = await axios.get(`${API}/${id}`);
  return res.data;
}

export async function aprobarEmpresa(id) {
  // POST /api/empresa-expositora/:id/aprobar
  const res = await axios.post(`${API}/${id}/aprobar`);
  return res.data;
}

export async function rechazarEmpresa(id) {
  // POST /api/empresa-expositora/:id/rechazar
  const res = await axios.post(`${API}/${id}/rechazar`);
  return res.data;
}

export async function suspenderEmpresa(id) {
  // POST /api/empresa-expositora/:id/suspender
  const res = await axios.post(`${API}/${id}/suspender`);
  return res.data;
}

export async function listarEmpresasPendientes() {
  // GET /api/empresa-expositora/pendientes
  const res = await axios.get(`${API}/pendientes`);
  return res.data;
}

export async function dashboardEmpresas() {
  // GET /api/empresa-expositora/stats
  const res = await axios.get(`${API}/stats`);
  return res.data;
}

export async function empresasDocumentosPorVencer() {
  // GET /api/empresa-expositora/documentos-vencer
  const res = await axios.get(`${API}/documentos-vencer`);
  return res.data;
}

export async function registrarEmpresaEnEvento(idEmpresa, idEvento) {
  // POST /api/empresa-expositora/:id/eventos
  const res = await axios.post(`${API}/${idEmpresa}/eventos`, { id_evento: idEvento });
  return res.data;
}

export async function obtenerHistorialParticipacion(idEmpresa) {
  // GET /api/empresa-expositora/:id
  const res = await axios.get(`${API}/${idEmpresa}`);
  return res.data?.participaciones || [];
}

export async function detalleParticipacionEvento(idEmpresa, idEvento) {
  // GET /api/empresa-expositora/:id/eventos/:evento_id
  const res = await axios.get(`${API}/${idEmpresa}/eventos/${idEvento}`);
  return res.data;
}

export async function buscarEmpresaPorRuc(ruc) {
  // GET /api/empresa-expositora/ruc/:ruc
  const res = await axios.get(`${API}/ruc/${ruc}`);
  return res.data;
}

export async function buscarEmpresaPorEmail(email) {
  // GET /api/empresa-expositora/email/:email
  const res = await axios.get(`${API}/email/${email}`);
  return res.data;
}

export async function empresasPendientes() {
  const res = await axios.get(`${API}/pendientes`);
  return res.data;
}


export async function empresasEnEvento(idEmpresa, idEvento) {
  const res = await axios.post(`${API}/${idEmpresa}/eventos`, { id_evento: idEvento });
  return res.data;
}

