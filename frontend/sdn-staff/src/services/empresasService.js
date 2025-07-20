// Servicios para empresas expositoras y su participación en eventos

import axios from "../config/axios";
const API = "/empresas-expositoras";
const CLASIFICACION_API = "/clasificacion";
const CATEGORIAS_API = "/categorias";

export async function registrarEmpresaPublica(data) {
  // POST /empresas-expositoras/registro-publico
  const res = await axios.post(`${API}/registro-publico`, data);
  return res.data;
}

export async function listarEmpresas() {
  // GET /empresas-expositoras
  const res = await axios.get(API);
  return res.data.data || [];
}

export async function obtenerEmpresa(id) {
  // GET /empresas-expositoras/:id
  const res = await axios.get(`${API}/${id}`);
  return res.data;
}

export async function aprobarEmpresa(id) {
  // POST /empresas-expositoras/:id/aprobar
  const res = await axios.post(`${API}/${id}/aprobar`);
  return res.data;
}

export async function rechazarEmpresa(id) {
  // POST /empresas-expositoras/:id/rechazar
  const res = await axios.post(`${API}/${id}/rechazar`);
  return res.data;
}

export async function suspenderEmpresa(id) {
  // POST /empresas-expositoras/:id/suspender
  const res = await axios.post(`${API}/${id}/suspender`);
  return res.data;
}

export async function listarEmpresasPendientes() {
  // GET /empresas-expositoras/pendientes
  const res = await axios.get(`${API}/pendientes`);
  return res.data;
}

export async function dashboardEmpresas() {
  // GET /empresas-expositoras/stats
  const res = await axios.get(`${API}/stats`);
  return res.data;
}

export async function empresasDocumentosPorVencer() {
  // GET /empresas-expositoras/documentos-vencer
  const res = await axios.get(`${API}/documentos-vencer`);
  return res.data;
}

export async function registrarEmpresaEnEvento(idEmpresa, idEvento) {
  // POST /empresas-expositoras/:id/eventos
  const res = await axios.post(`${API}/${idEmpresa}/eventos`, {
    id_evento: idEvento,
  });
  return res.data;
}

export async function obtenerHistorialParticipacion(idEmpresa) {
  // GET /empresas-expositoras/:id
  const res = await axios.get(`${API}/${idEmpresa}`);
  return res.data?.participaciones || [];
}

export async function detalleParticipacionEvento(idEmpresa, idEvento) {
  // GET /empresas-expositoras/:id/eventos/:evento_id
  const res = await axios.get(`${API}/${idEmpresa}/eventos/${idEvento}`);
  return res.data;
}

export async function buscarEmpresaPorRuc(ruc) {
  // GET /empresas-expositoras/ruc/:ruc
  const res = await axios.get(`${API}/ruc/${ruc}`);
  return res.data;
}

export async function buscarEmpresaPorEmail(email) {
  // GET /empresas-expositoras/email/:email
  const res = await axios.get(`${API}/email/${email}`);
  return res.data;
}

export async function empresasPendientes() {
  const res = await axios.get(`${API}/pendientes`);
  return res.data;
}

export async function empresasEnEvento(idEmpresa, idEvento) {
  const res = await axios.post(`${API}/${idEmpresa}/eventos`, {
    id_evento: idEvento,
  });
  return res.data;
}

// ==================== SERVICIOS DE CATEGORÍAS ====================

// Obtener categorías de una empresa
export async function obtenerCategoriasEmpresa(empresaId) {
  const res = await axios.get(`${CLASIFICACION_API}/empresas/${empresaId}/categorias`);
  return res.data;
}

// Asignar categorías a una empresa
export async function asignarCategoriasEmpresa(empresaId, categorias) {
  // Asegura que el payload sea [{id_categoria: ...}]
  const categoriasPayload = Array.isArray(categorias)
    ? categorias.map(id => ({ id_categoria: id }))
    : [];
  const res = await axios.post(`${CLASIFICACION_API}/empresas/${empresaId}/categorias`, {
    categorias: categoriasPayload,
    mantenerExistentes: false
  });
  return res.data;
}

// Establecer categoría principal
export async function establecerCategoriaPrincipal(empresaId, categoriaId) {
  const res = await axios.post(`${CLASIFICACION_API}/empresas/${empresaId}/categorias/${categoriaId}/principal`);
  return res.data;
}

// Remover categoría de una empresa
export async function removerCategoriaEmpresa(empresaId, categoriaId) {
  const res = await axios.delete(`${CLASIFICACION_API}/empresas/${empresaId}/categorias/${categoriaId}`);
  return res.data;
}

// Obtener todas las categorías disponibles
export async function obtenerCategoriasDisponibles() {
  // Usar el endpoint correcto según el backend
  const res = await axios.get(CATEGORIAS_API);
  return res.data;
}

// Buscar empresas por categorías
export async function buscarEmpresasPorCategorias(categorias = []) {
  const res = await axios.get(`${CLASIFICACION_API}/buscar/categorias`, {
    params: { categorias }
  });
  return res.data;
}

// Generar directorio temático por categoría
export async function generarDirectorioTematico(categoriaId) {
  const res = await axios.get(`${CLASIFICACION_API}/directorio/categoria/${categoriaId}`);
  return res.data;
}
