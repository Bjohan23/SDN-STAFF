import axios from "../config/axios";

const ASIGNACION_API = "/api/asignacionAutomatica";
const SOLICITUDES_API = "/api/solicitudesAsignacion";
const CONFLICTOS_API = "/api/conflictosAsignacion";

// ==================== ASIGNACIÓN AUTOMÁTICA ====================

// Generar asignación automática para un evento
export async function generarAsignacionAutomatica(eventoId, configuracion = {}) {
  const res = await axios.post(`${ASIGNACION_API}/generar/${eventoId}`, configuracion);
  return res.data;
}

// Obtener estado de asignación automática
export async function obtenerEstadoAsignacion(eventoId) {
  const res = await axios.get(`${ASIGNACION_API}/estado/${eventoId}`);
  return res.data;
}

// Ejecutar asignación automática
export async function ejecutarAsignacionAutomatica(eventoId, parametros = {}) {
  const res = await axios.post(`${ASIGNACION_API}/ejecutar/${eventoId}`, parametros);
  return res.data;
}

// Obtener resultados de asignación automática
export async function obtenerResultadosAsignacion(eventoId) {
  const res = await axios.get(`${ASIGNACION_API}/resultados/${eventoId}`);
  return res.data;
}

// ==================== SOLICITUDES DE ASIGNACIÓN ====================

// Crear solicitud de asignación
export async function crearSolicitudAsignacion(data) {
  const res = await axios.post(SOLICITUDES_API, data);
  return res.data;
}

// Obtener solicitudes de una empresa
export async function obtenerSolicitudesEmpresa(empresaId) {
  const res = await axios.get(`${SOLICITUDES_API}/empresa/${empresaId}`);
  return res.data;
}

// Obtener solicitudes de un evento
export async function obtenerSolicitudesEvento(eventoId) {
  const res = await axios.get(`${SOLICITUDES_API}/evento/${eventoId}`);
  return res.data;
}

// Aprobar solicitud
export async function aprobarSolicitud(solicitudId) {
  const res = await axios.post(`${SOLICITUDES_API}/${solicitudId}/aprobar`);
  return res.data;
}

// Rechazar solicitud
export async function rechazarSolicitud(solicitudId, motivo) {
  const res = await axios.post(`${SOLICITUDES_API}/${solicitudId}/rechazar`, { motivo });
  return res.data;
}

// ==================== CONFLICTOS DE ASIGNACIÓN ====================

// Obtener conflictos de un evento
export async function obtenerConflictosEvento(eventoId) {
  const res = await axios.get(`${CONFLICTOS_API}/evento/${eventoId}`);
  return res.data;
}

// Resolver conflicto
export async function resolverConflicto(conflictoId, resolucion) {
  const res = await axios.post(`${CONFLICTOS_API}/${conflictoId}/resolver`, resolucion);
  return res.data;
}

// ==================== HISTORIAL DE ASIGNACIONES ====================

// Obtener historial de asignaciones
export async function obtenerHistorialAsignaciones(eventoId) {
  const res = await axios.get(`${ASIGNACION_API}/historial/${eventoId}`);
  return res.data;
}

// Obtener estadísticas de asignación
export async function obtenerEstadisticasAsignacion(eventoId) {
  const res = await axios.get(`${ASIGNACION_API}/estadisticas/${eventoId}`);
  return res.data;
}

// ==================== CONFIGURACIÓN DE ASIGNACIÓN ====================

// Obtener configuración de asignación para un evento
export async function obtenerConfiguracionAsignacion(eventoId) {
  const res = await axios.get(`${ASIGNACION_API}/configuracion/${eventoId}`);
  return res.data;
}

// Actualizar configuración de asignación
export async function actualizarConfiguracionAsignacion(eventoId, configuracion) {
  const res = await axios.put(`${ASIGNACION_API}/configuracion/${eventoId}`, configuracion);
  return res.data;
}

// ==================== VALIDACIONES ====================

// Validar si un evento puede tener asignación automática
export async function validarAsignacionEvento(eventoId) {
  const res = await axios.get(`${ASIGNACION_API}/validar/${eventoId}`);
  return res.data;
}

// Obtener empresas elegibles para asignación
export async function obtenerEmpresasElegibles(eventoId) {
  const res = await axios.get(`${ASIGNACION_API}/empresas-elegibles/${eventoId}`);
  return res.data;
} 