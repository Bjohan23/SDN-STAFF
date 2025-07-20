const crypto = require('crypto');
const { format, addHours, addDays, isAfter, isBefore } = require('date-fns');

class CredencialUtils {

  /**
   * Generar código único para credencial
   */
  static generarCodigoUnico(tipoCredencial, eventoId) {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    const prefix = this.obtenerPrefijoPorTipo(tipoCredencial);
    const eventoSuffix = eventoId.toString().padStart(3, '0');
    
    return `${prefix}-${eventoSuffix}-${timestamp}-${random}`;
  }

  /**
   * Obtener prefijo según tipo de credencial
   */
  static obtenerPrefijoPorTipo(tipoCredencial) {
    const prefijos = {
      'visitante': 'VIS',
      'expositor': 'EXP',
      'personal': 'PER',
      'prensa': 'PRE',
      'vip': 'VIP',
      'organizador': 'ORG'
    };

    return prefijos[tipoCredencial.toLowerCase()] || 'CRE';
  }

  /**
   * Validar estructura de código único
   */
  static validarCodigoUnico(codigo) {
    if (!codigo || typeof codigo !== 'string') {
      return { valid: false, error: 'Código inválido' };
    }

    const pattern = /^[A-Z]{3}-\d{3}-[A-Z0-9]+-[A-F0-9]{8}$/;
    if (!pattern.test(codigo)) {
      return { valid: false, error: 'Formato de código inválido' };
    }

    return { valid: true };
  }

  /**
   * Generar hash para validación de integridad
   */
  static generarHashIntegridad(credencialData) {
    const data = {
      id_credencial: credencialData.id_credencial,
      codigo_unico: credencialData.codigo_unico,
      id_evento: credencialData.id_evento,
      nombre_completo: credencialData.nombre_completo,
      email: credencialData.email,
      fecha_creacion: credencialData.created_at
    };

    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Validar hash de integridad
   */
  static validarHashIntegridad(credencialData, hashProvisto) {
    const hashCalculado = this.generarHashIntegridad(credencialData);
    return hashCalculado === hashProvisto;
  }

  /**
   * Calcular fecha de expiración
   */
  static calcularFechaExpiracion(fechaInicio, duracionHoras, fechaEvento = null) {
    if (!fechaInicio) {
      fechaInicio = new Date();
    }

    if (duracionHoras && duracionHoras > 0) {
      return addHours(fechaInicio, duracionHoras);
    }

    // Si no hay duración específica, expirar al final del evento
    if (fechaEvento) {
      return addDays(new Date(fechaEvento), 1);
    }

    // Por defecto: 24 horas
    return addHours(fechaInicio, 24);
  }

  /**
   * Verificar si una credencial está vigente
   */
  static estaVigente(credencial) {
    const ahora = new Date();

    // Verificar estado
    if (credencial.estado !== 'activa') {
      return { vigente: false, motivo: 'Estado no activo' };
    }

    // Verificar fecha de activación
    if (credencial.fecha_activacion && isBefore(ahora, new Date(credencial.fecha_activacion))) {
      return { vigente: false, motivo: 'Aún no activada' };
    }

    // Verificar fecha de expiración
    if (credencial.fecha_expiracion && isAfter(ahora, new Date(credencial.fecha_expiracion))) {
      return { vigente: false, motivo: 'Expirada' };
    }

    return { vigente: true };
  }

  /**
   * Formatear datos para PDF
   */
  static formatearParaPDF(credencial, evento, tipoCredencial) {
    return {
      // Datos básicos
      codigo_unico: credencial.codigo_unico,
      qr_data: credencial.qr_data,
      nombre_completo: credencial.nombre_completo,
      email: credencial.email,
      telefono: credencial.telefono,
      empresa_organizacion: credencial.empresa_organizacion,
      cargo_titulo: credencial.cargo_titulo,

      // Datos del evento
      nombre_evento: evento.nombre_evento,
      fecha_evento: format(new Date(evento.fecha_inicio), 'dd/MM/yyyy'),
      ubicacion_evento: evento.ubicacion,

      // Datos del tipo
      tipo_credencial: tipoCredencial.nombre_tipo,
      color_identificacion: tipoCredencial.color_identificacion,
      nivel_acceso: tipoCredencial.nivel_acceso,

      // Fechas formateadas
      fecha_emision: format(new Date(credencial.created_at), 'dd/MM/yyyy HH:mm'),
      fecha_validez: credencial.fecha_expiracion ? 
        format(new Date(credencial.fecha_expiracion), 'dd/MM/yyyy HH:mm') : 
        'Sin límite',

      // Datos adicionales
      numero_impresiones: credencial.numero_impresiones || 0,
      es_reimpreson: credencial.numero_impresiones > 1
    };
  }

  /**
   * Generar metadatos para logging
   */
  static generarMetadatosLog(contexto = {}) {
    return {
      timestamp: new Date().toISOString(),
      ip_cliente: contexto.ip_cliente,
      user_agent: contexto.user_agent,
      punto_acceso: contexto.punto_acceso,
      ubicacion_fisica: contexto.ubicacion_fisica,
      dispositivo_validacion: contexto.dispositivo_validacion,
      coordenadas_gps: contexto.coordenadas_gps,
      session_id: contexto.session_id
    };
  }

  /**
   * Calcular nivel de riesgo para validación
   */
  static calcularNivelRiesgo(credencial, historialValidaciones = [], contexto = {}) {
    let puntuacionRiesgo = 0;

    // Factores de riesgo
    const factores = {
      credencial_nueva: 5,           // Credencial creada recientemente
      multiples_intentos: 15,        // Múltiples intentos de validación
      ubicacion_inusual: 10,         // Validación desde ubicación inusual
      horario_inusual: 8,           // Validación fuera de horario del evento
      credencial_duplicada: 20,      // Posible duplicación
      patron_sospechoso: 25         // Patrón de uso sospechoso
    };

    // Evaluar cada factor
    const ahoraRa = new Date();
    const tiempoCreacion = (ahora - new Date(credencial.created_at)) / (1000 * 60 * 60);

    // Credencial muy nueva (menos de 1 hora)
    if (tiempoCreacion < 1) {
      puntuacionRiesgo += factores.credencial_nueva;
    }

    // Múltiples validaciones en corto tiempo
    const validacionesRecientes = historialValidaciones.filter(v => {
      const tiempoValidacion = (ahora - new Date(v.fecha_validacion)) / (1000 * 60);
      return tiempoValidacion < 60; // Últimos 60 minutos
    });

    if (validacionesRecientes.length > 5) {
      puntuacionRiesgo += factores.multiples_intentos;
    }

    // Determinar nivel
    if (puntuacionRiesgo >= 50) return 'critico';
    if (puntuacionRiesgo >= 30) return 'alto';
    if (puntuacionRiesgo >= 15) return 'medio';
    return 'bajo';
  }

  /**
   * Detectar patrones sospechosos
   */
  static detectarPatronesSospechosos(validaciones = []) {
    const patrones = [];

    // Agrupar por IP
    const porIP = {};
    validaciones.forEach(v => {
      const ip = v.metadatos_validacion?.ip_cliente;
      if (ip) {
        porIP[ip] = (porIP[ip] || 0) + 1;
      }
    });

    // IPs con demasiadas validaciones
    Object.entries(porIP).forEach(([ip, count]) => {
      if (count > 50) {
        patrones.push({
          tipo: 'ip_sospechosa',
          descripcion: `IP ${ip} con ${count} validaciones`,
          severidad: 'alta',
          ip: ip
        });
      }
    });

    // Validaciones muy rápidas consecutivas
    const validacionesOrdenadas = validaciones.sort((a, b) => 
      new Date(a.fecha_validacion) - new Date(b.fecha_validacion)
    );

    for (let i = 1; i < validacionesOrdenadas.length; i++) {
      const anterior = new Date(validacionesOrdenadas[i-1].fecha_validacion);
      const actual = new Date(validacionesOrdenadas[i].fecha_validacion);
      const diferencia = actual - anterior;

      if (diferencia < 1000) { // Menos de 1 segundo
        patrones.push({
          tipo: 'validacion_rapida',
          descripcion: 'Validaciones consecutivas muy rápidas',
          severidad: 'media',
          diferencia_ms: diferencia
        });
      }
    }

    return patrones;
  }

  /**
   * Sanitizar datos de entrada
   */
  static sanitizarDatos(datos) {
    const sanitized = {};

    for (const [key, value] of Object.entries(datos)) {
      if (typeof value === 'string') {
        // Remover caracteres peligrosos
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/[<>]/g, '')
          .trim();
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Generar estadísticas de uso
   */
  static generarEstadisticasUso(credenciales = [], validaciones = []) {
    const estadisticas = {
      total_credenciales: credenciales.length,
      por_estado: {},
      por_tipo: {},
      validaciones_por_hora: {},
      patrones_uso: {}
    };

    // Agrupar por estado
    credenciales.forEach(c => {
      estadisticas.por_estado[c.estado] = (estadisticas.por_estado[c.estado] || 0) + 1;
    });

    // Validaciones por hora
    validaciones.forEach(v => {
      const hora = format(new Date(v.fecha_validacion), 'HH');
      estadisticas.validaciones_por_hora[hora] = (estadisticas.validaciones_por_hora[hora] || 0) + 1;
    });

    return estadisticas;
  }

  /**
   * Validar permisos de acceso
   */
  static validarPermisosAcceso(credencial, tipoCredencial, puntoAcceso = null) {
    const permisos = {
      acceso_permitido: false,
      motivo_denegacion: null,
      nivel_acceso: tipoCredencial.nivel_acceso,
      areas_permitidas: []
    };

    // Verificar vigencia
    const vigencia = this.estaVigente(credencial);
    if (!vigencia.vigente) {
      permisos.motivo_denegacion = vigencia.motivo;
      return permisos;
    }

    // Verificar configuración de accesos
    const configuracion = tipoCredencial.configuracion_accesos || {};
    
    if (puntoAcceso) {
      const accesoPermitido = configuracion.areas_permitidas?.includes(puntoAcceso) || 
                             tipoCredencial.nivel_acceso === 'total';
      
      if (!accesoPermitido) {
        permisos.motivo_denegacion = 'Área no autorizada';
        return permisos;
      }
    }

    permisos.acceso_permitido = true;
    permisos.areas_permitidas = configuracion.areas_permitidas || [];
    
    return permisos;
  }
}

module.exports = CredencialUtils;