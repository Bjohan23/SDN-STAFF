const { 
  Credencial, 
  TipoCredencial, 
  AccesoEvento, 
  LogValidacion, 
  Evento 
} = require('../models');
const QRGeneratorService = require('./QRGeneratorService');
const { Op } = require('sequelize');

class ValidationService {
  
  /**
   * Validar credencial por QR
   */
  static async validarCredencial(qrData, contextoValidacion = {}) {
    const {
      punto_acceso,
      ubicacion_fisica,
      dispositivo_validacion,
      ip_validacion,
      user_agent,
      id_usuario_validador,
      nombre_validador,
      tipo_movimiento = 'entrada',
      coordenadas_gps
    } = contextoValidacion;
    
    const tiempoInicio = Date.now();
    let resultado = 'fallida';
    let motivoFallo = '';
    let credencial = null;
    let nivelRiesgo = 'bajo';
    let indicadoresFraude = {};
    
    try {
      // 1. Validar estructura del QR
      const qrValidation = QRGeneratorService.validateQRStructure(qrData);
      if (!qrValidation.valid) {
        motivoFallo = `QR inválido: ${qrValidation.error}`;
        throw new Error(motivoFallo);
      }
      
      // 2. Buscar credencial por hash
      const qrHash = QRGeneratorService.generateQRHash(qrData);
      credencial = await Credencial.findOne({
        where: { qr_hash: qrHash, deleted_at: null },
        include: [
          { model: TipoCredencial, as: 'tipoCredencial' },
          { model: Evento, as: 'evento' },
          { 
            model: AccesoEvento, 
            as: 'accesos',
            where: { activo: true, deleted_at: null },
            required: false
          }
        ]
      });
      
      if (!credencial) {
        motivoFallo = 'Credencial no encontrada';
        nivelRiesgo = 'alto';
        indicadoresFraude.qr_no_encontrado = true;
        throw new Error(motivoFallo);
      }
      
      // 3. Verificar estado de la credencial
      if (!credencial.isValida()) {
        motivoFallo = `Credencial ${credencial.estado}`;
        if (credencial.estado === 'revocada') {
          nivelRiesgo = 'critico';
          indicadoresFraude.credencial_revocada = true;
        }
        throw new Error(motivoFallo);
      }
      
      // 4. Verificar validez temporal
      const validezTemporal = this.verificarValidezTemporal(credencial);
      if (!validezTemporal.valida) {
        motivoFallo = validezTemporal.motivo;
        throw new Error(motivoFallo);
      }
      
      // 5. Detectar posibles fraudes
      const analisisFraude = await this.analizarIndicadoresFraude(credencial, contextoValidacion);
      if (analisisFraude.riesgoAlto) {
        nivelRiesgo = 'alto';
        indicadoresFraude = { ...indicadoresFraude, ...analisisFraude.indicadores };
        
        if (analisisFraude.bloquear) {
          motivoFallo = 'Actividad sospechosa detectada';
          resultado = 'sospechosa';
          throw new Error(motivoFallo);
        }
      }
      
      // 6. Verificar accesos específicos si se proporciona punto de acceso
      if (punto_acceso) {
        const accesoPermitido = await this.verificarAccesoEspecifico(credencial, punto_acceso);
        if (!accesoPermitido.permitido) {
          motivoFallo = accesoPermitido.motivo;
          throw new Error(motivoFallo);
        }
      }
      
      // 7. Validación exitosa
      resultado = 'exitosa';
      
      // Registrar uso de la credencial
      await credencial.registrarValidacion();
      
      // Registrar uso de accesos específicos
      if (punto_acceso) {
        await this.registrarUsoAcceso(credencial, punto_acceso);
      }
      
    } catch (error) {
      motivoFallo = error.message;
    } finally {
      // Registrar el log de validación
      const tiempoRespuesta = Date.now() - tiempoInicio;
      
      await LogValidacion.create({
        id_credencial: credencial?.id_credencial || null,
        id_evento: credencial?.id_evento || null,
        fecha_validacion: new Date(),
        resultado: resultado,
        motivo_fallo: motivoFallo || null,
        punto_acceso: punto_acceso || null,
        ubicacion_fisica: ubicacion_fisica || null,
        coordenadas_gps: coordenadas_gps || null,
        dispositivo_validacion: dispositivo_validacion || null,
        ip_validacion: ip_validacion || null,
        user_agent: user_agent || null,
        id_usuario_validador: id_usuario_validador || null,
        nombre_validador: nombre_validador || null,
        qr_data_usado: qrData,
        hash_validacion: credencial?.qr_hash || null,
        tiempo_respuesta_ms: tiempoRespuesta,
        nivel_riesgo: nivelRiesgo,
        indicadores_fraude: Object.keys(indicadoresFraude).length > 0 ? indicadoresFraude : null,
        tipo_movimiento: tipo_movimiento
      });
    }
    
    return {
      valida: resultado === 'exitosa',
      resultado: resultado,
      motivo: motivoFallo,
      credencial: credencial ? {
        id: credencial.id_credencial,
        codigo: credencial.codigo_unico,
        nombre: credencial.nombre_completo,
        tipo: credencial.tipoCredencial?.nombre_tipo,
        empresa: credencial.empresa_organizacion,
        estado: credencial.estado,
        validaciones_totales: credencial.total_validaciones
      } : null,
      nivel_riesgo: nivelRiesgo,
      tiempo_respuesta_ms: Date.now() - tiempoInicio
    };
  }
  
  /**
   * Verificar validez temporal de la credencial
   */
  static verificarValidezTemporal(credencial) {
    const ahora = new Date();
    
    // Verificar fecha de activación
    if (credencial.fecha_activacion && ahora < credencial.fecha_activacion) {
      return {
        valida: false,
        motivo: 'Credencial aún no activada'
      };
    }
    
    // Verificar fecha de expiración
    if (credencial.fecha_expiracion && ahora > credencial.fecha_expiracion) {
      return {
        valida: false,
        motivo: 'Credencial expirada'
      };
    }
    
    // Verificar duración de validez del tipo
    if (credencial.tipoCredencial?.duracion_validez_horas) {
      const horasTranscurridas = (ahora - credencial.fecha_emision) / (1000 * 60 * 60);
      if (horasTranscurridas > credencial.tipoCredencial.duracion_validez_horas) {
        return {
          valida: false,
          motivo: 'Credencial expirada por duración'
        };
      }
    }
    
    return { valida: true };
  }
  
  /**
   * Analizar indicadores de fraude
   */
  static async analizarIndicadoresFraude(credencial, contextoValidacion) {
    const indicadores = {};
    let puntuacionRiesgo = 0;
    
    // 1. Verificar múltiples validaciones rápidas
    const validacionesRecientes = await LogValidacion.count({
      where: {
        id_credencial: credencial.id_credencial,
        fecha_validacion: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
        },
        resultado: 'exitosa'
      }
    });
    
    if (validacionesRecientes > 3) {
      indicadores.multiples_validaciones_rapidas = true;
      puntuacionRiesgo += 30;
    }
    
    // 2. Verificar validaciones desde múltiples ubicaciones
    if (contextoValidacion.ip_validacion) {
      const ipsRecientes = await LogValidacion.findAll({
        where: {
          id_credencial: credencial.id_credencial,
          fecha_validacion: {
            [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) // Última hora
          }
        },
        attributes: ['ip_validacion'],
        group: ['ip_validacion'],
        raw: true
      });
      
      if (ipsRecientes.length > 2) {
        indicadores.multiples_ubicaciones = true;
        puntuacionRiesgo += 25;
      }
    }
    
    // 3. Verificar patrones de uso anormales
    const validacionesHoy = await LogValidacion.count({
      where: {
        id_credencial: credencial.id_credencial,
        fecha_validacion: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    
    if (validacionesHoy > 20) {
      indicadores.uso_excesivo_diario = true;
      puntuacionRiesgo += 20;
    }
    
    // 4. Verificar credencial reportada como perdida/robada
    // (esto requeriría una tabla adicional para reportes)
    
    // 5. Verificar validaciones fuera de horario normal del evento
    if (credencial.evento) {
      const horaActual = new Date().getHours();
      if (horaActual < 7 || horaActual > 23) {
        indicadores.validacion_fuera_horario = true;
        puntuacionRiesgo += 15;
      }
    }
    
    return {
      riesgoAlto: puntuacionRiesgo > 40,
      bloquear: puntuacionRiesgo > 70,
      puntuacion: puntuacionRiesgo,
      indicadores: indicadores
    };
  }
  
  /**
   * Verificar acceso específico
   */
  static async verificarAccesoEspecifico(credencial, puntoAcceso) {
    // Mapear punto de acceso a tipo de acceso
    const tipoAcceso = this.mapearPuntoAccesoATipo(puntoAcceso);
    
    const acceso = credencial.accesos?.find(a => a.tipo_acceso === tipoAcceso);
    
    if (!acceso) {
      return {
        permitido: false,
        motivo: `Sin permisos para acceder a ${puntoAcceso}`
      };
    }
    
    // Verificar si el acceso es válido en este momento
    if (!acceso.esValidoAhora()) {
      return {
        permitido: false,
        motivo: 'Acceso no válido en este horario'
      };
    }
    
    return { permitido: true };
  }
  
  /**
   * Mapear punto de acceso físico a tipo de acceso
   */
  static mapearPuntoAccesoATipo(puntoAcceso) {
    const mapeo = {
      'entrada_principal': 'entrada_general',
      'entrada_vip': 'zona_vip',
      'entrada_expositores': 'area_expositores',
      'entrada_prensa': 'area_prensa',
      'entrada_staff': 'area_staff',
      'sala_conferencias_a': 'sala_conferencias',
      'sala_conferencias_b': 'sala_conferencias',
      'backstage': 'backstage',
      'catering': 'zona_catering',
      'networking': 'area_networking',
      'parking': 'parking'
    };
    
    return mapeo[puntoAcceso.toLowerCase()] || 'entrada_general';
  }
  
  /**
   * Registrar uso de acceso específico
   */
  static async registrarUsoAcceso(credencial, puntoAcceso) {
    const tipoAcceso = this.mapearPuntoAccesoATipo(puntoAcceso);
    const acceso = credencial.accesos?.find(a => a.tipo_acceso === tipoAcceso);
    
    if (acceso) {
      await acceso.registrarUso();
    }
  }
  
  /**
   * Validar múltiples credenciales (para entrada grupal)
   */
  static async validarCredencialesGrupales(qrDataArray, contextoValidacion = {}) {
    const resultados = [];
    
    for (let i = 0; i < qrDataArray.length; i++) {
      const resultado = await this.validarCredencial(qrDataArray[i], {
        ...contextoValidacion,
        es_validacion_grupal: true,
        posicion_en_grupo: i + 1,
        total_en_grupo: qrDataArray.length
      });
      
      resultados.push({
        indice: i,
        ...resultado
      });
    }
    
    const exitosas = resultados.filter(r => r.valida).length;
    const fallidas = resultados.length - exitosas;
    
    return {
      resultados,
      resumen: {
        total: resultados.length,
        exitosas,
        fallidas,
        porcentaje_exito: (exitosas / resultados.length) * 100
      }
    };
  }
  
  /**
   * Obtener historial de validaciones de una credencial
   */
  static async obtenerHistorialValidaciones(idCredencial, opciones = {}) {
    const { limite = 50, desde, hasta } = opciones;
    
    const where = { id_credencial: idCredencial };
    
    if (desde || hasta) {
      where.fecha_validacion = {};
      if (desde) where.fecha_validacion[Op.gte] = desde;
      if (hasta) where.fecha_validacion[Op.lte] = hasta;
    }
    
    return await LogValidacion.findAll({
      where,
      limit: limite,
      order: [['fecha_validacion', 'DESC']],
      include: [
        { 
          model: Credencial, 
          as: 'credencial',
          attributes: ['codigo_unico', 'nombre_completo']
        }
      ]
    });
  }
  
  /**
   * Obtener estadísticas de validaciones por evento
   */
  static async obtenerEstadisticasValidaciones(idEvento, periodo = '24h') {
    const fechaInicio = this.calcularFechaInicio(periodo);
    
    const estadisticas = await LogValidacion.findAll({
      where: {
        id_evento: idEvento,
        fecha_validacion: { [Op.gte]: fechaInicio }
      },
      attributes: [
        'resultado',
        'nivel_riesgo',
        [sequelize.fn('COUNT', '*'), 'total'],
        [sequelize.fn('DATE', sequelize.col('fecha_validacion')), 'fecha']
      ],
      group: ['resultado', 'nivel_riesgo', sequelize.fn('DATE', sequelize.col('fecha_validacion'))],
      raw: true
    });
    
    return {
      periodo,
      fecha_inicio: fechaInicio,
      estadisticas
    };
  }
  
  /**
   * Calcular fecha de inicio según el período
   */
  static calcularFechaInicio(periodo) {
    const ahora = new Date();
    
    switch (periodo) {
      case '1h':
        return new Date(ahora.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(ahora.getTime() - 24 * 60 * 60 * 1000);
    }
  }
  
  /**
   * Detectar patrones sospechosos
   */
  static async detectarPatronesSospechosos(idEvento = null) {
    const where = {};
    if (idEvento) where.id_evento = idEvento;
    
    // Credenciales con múltiples fallos recientes
    const credencialesConFallos = await LogValidacion.findAll({
      where: {
        ...where,
        resultado: 'fallida',
        fecha_validacion: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        'id_credencial',
        [sequelize.fn('COUNT', '*'), 'total_fallos']
      ],
      group: ['id_credencial'],
      having: sequelize.literal('COUNT(*) > 5'),
      raw: true
    });
    
    // IPs con múltiples validaciones fallidas
    const ipsConFallos = await LogValidacion.findAll({
      where: {
        ...where,
        resultado: 'fallida',
        ip_validacion: { [Op.ne]: null },
        fecha_validacion: {
          [Op.gte]: new Date(Date.now() - 60 * 60 * 1000)
        }
      },
      attributes: [
        'ip_validacion',
        [sequelize.fn('COUNT', '*'), 'total_fallos']
      ],
      group: ['ip_validacion'],
      having: sequelize.literal('COUNT(*) > 10'),
      raw: true
    });
    
    return {
      credenciales_sospechosas: credencialesConFallos,
      ips_sospechosas: ipsConFallos
    };
  }
}

module.exports = ValidationService;