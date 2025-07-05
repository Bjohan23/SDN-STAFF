const { 
  SolicitudAsignacion, 
  EmpresaExpositora, 
  Evento, 
  Stand, 
  StandEvento,
  TipoStand,
  HistoricoAsignacion,
  ConflictoAsignacion
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

/**
 * Servicio para asignación automática de stands
 */
class AsignacionAutomaticaService {

  /**
   * Ejecutar asignación automática para un evento
   */
  static async ejecutarAsignacionAutomatica(idEvento, configuracion = {}, ejecutadoPor = null, metadatos = {}) {
    const transaction = await sequelize.transaction();

    try {
      // Validar que el evento existe
      const evento = await Evento.findByPk(idEvento, { transaction });
      if (!evento) {
        throw new Error('Evento no encontrado');
      }

      // Configuración por defecto
      const config = {
        incluir_solicitudes_automaticas: true,
        incluir_solicitudes_pendientes: true,
        algoritmo: 'prioridad_score', // 'prioridad_score', 'first_come_first_served', 'mixto'
        respetar_preferencias: true,
        optimizar_ocupacion: true,
        permitir_reasignacion: false,
        ...configuracion
      };

      // Obtener solicitudes elegibles para asignación automática
      const solicitudesElegibles = await this.getSolicitudesElegibles(idEvento, config, transaction);

      if (solicitudesElegibles.length === 0) {
        await transaction.commit();
        return {
          success: true,
          message: 'No hay solicitudes elegibles para asignación automática',
          asignaciones_realizadas: 0,
          solicitudes_procesadas: 0,
          conflictos_detectados: 0
        };
      }

      // Obtener stands disponibles
      const standsDisponibles = await this.getStandsDisponibles(idEvento, transaction);

      if (standsDisponibles.length === 0) {
        await transaction.commit();
        return {
          success: false,
          message: 'No hay stands disponibles para asignación',
          asignaciones_realizadas: 0,
          solicitudes_procesadas: solicitudesElegibles.length,
          conflictos_detectados: 0
        };
      }

      // Ejecutar algoritmo de asignación
      const resultadoAsignacion = await this.ejecutarAlgoritmo(
        solicitudesElegibles, 
        standsDisponibles, 
        config, 
        transaction
      );

      // Procesar asignaciones exitosas
      let asignacionesRealizadas = 0;
      const asignacionesDetalle = [];

      for (const asignacion of resultadoAsignacion.asignaciones_exitosas) {
        try {
          await this.procesarAsignacion(asignacion, ejecutadoPor, metadatos, transaction);
          asignacionesRealizadas++;
          asignacionesDetalle.push({
            solicitud_id: asignacion.solicitud.id_solicitud,
            empresa: asignacion.solicitud.empresa.nombre_empresa,
            stand_asignado: asignacion.stand.numero_stand,
            score_compatibilidad: asignacion.score_compatibilidad
          });
        } catch (error) {
          console.error(`Error procesando asignación para solicitud ${asignacion.solicitud.id_solicitud}:`, error);
        }
      }

      // Detectar y crear conflictos para solicitudes no resueltas
      let conflictosDetectados = 0;
      if (resultadoAsignacion.conflictos_potenciales.length > 0) {
        for (const conflicto of resultadoAsignacion.conflictos_potenciales) {
          try {
            await this.crearConflictoAutomatico(conflicto, idEvento, ejecutadoPor, transaction);
            conflictosDetectados++;
          } catch (error) {
            console.error('Error creando conflicto automático:', error);
          }
        }
      }

      // Crear entrada en histórico general
      await HistoricoAsignacion.crearEntrada({
        id_empresa: null, // Proceso general
        id_evento: idEvento,
        tipo_cambio: 'asignacion_inicial',
        estado_nuevo: 'procesado',
        motivo_cambio: 'Ejecución de asignación automática',
        descripcion_detallada: `Asignación automática ejecutada. ${asignacionesRealizadas} asignaciones realizadas, ${conflictosDetectados} conflictos detectados`,
        datos_adicionales: {
          algoritmo_usado: config.algoritmo,
          solicitudes_procesadas: solicitudesElegibles.length,
          stands_disponibles: standsDisponibles.length,
          asignaciones_realizadas: asignacionesRealizadas,
          conflictos_detectados: conflictosDetectados,
          configuracion: config,
          detalle_asignaciones: asignacionesDetalle
        }
      }, ejecutadoPor, metadatos);

      await transaction.commit();

      return {
        success: true,
        message: `Asignación automática completada exitosamente`,
        asignaciones_realizadas: asignacionesRealizadas,
        solicitudes_procesadas: solicitudesElegibles.length,
        conflictos_detectados: conflictosDetectados,
        stands_disponibles: standsDisponibles.length,
        detalle: {
          asignaciones: asignacionesDetalle,
          solicitudes_sin_resolver: resultadoAsignacion.solicitudes_sin_resolver.length,
          configuracion_usada: config
        }
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Obtener solicitudes elegibles para asignación automática
   */
  static async getSolicitudesElegibles(idEvento, config, transaction) {
    const whereConditions = {
      id_evento: idEvento,
      deleted_at: null
    };

    // Tipos de solicitudes a incluir
    const estadosElegibles = [];
    
    if (config.incluir_solicitudes_automaticas) {
      whereConditions.modalidad_asignacion = {
        [Op.in]: ['automatica', ...(config.incluir_solicitudes_pendientes ? ['seleccion_directa'] : [])]
      };
    }

    if (config.incluir_solicitudes_pendientes) {
      estadosElegibles.push('solicitada', 'en_revision', 'aprobada');
    } else {
      estadosElegibles.push('aprobada');
    }

    whereConditions.estado_solicitud = { [Op.in]: estadosElegibles };

    // Excluir solicitudes ya asignadas
    whereConditions.id_stand_asignado = null;

    const solicitudes = await SolicitudAsignacion.findAll({
      where: whereConditions,
      include: [
        {
          association: 'empresa',
          where: { estado: 'aprobada' }
        },
        {
          association: 'standSolicitado',
          required: false
        }
      ],
      order: [
        ['prioridad_score', 'DESC'],
        ['fecha_solicitud', 'ASC']
      ],
      transaction
    });

    return solicitudes;
  }

  /**
   * Obtener stands disponibles para asignación
   */
  static async getStandsDisponibles(idEvento, transaction) {
    const standsDisponibles = await Stand.findAll({
      where: {
        estado: 'activo',
        estado_fisico: 'disponible',
        deleted_at: null
      },
      include: [
        {
          association: 'tipoStand',
          where: { estado: 'activo' }
        },
        {
          association: 'standEventos',
          where: {
            id_evento: idEvento,
            estado_disponibilidad: 'disponible'
          },
          required: true
        }
      ],
      transaction
    });

    return standsDisponibles;
  }

  /**
   * Ejecutar algoritmo de asignación
   */
  static async ejecutarAlgoritmo(solicitudes, stands, config, transaction) {
    const asignacionesExitosas = [];
    const conflictosPotenciales = [];
    const solicitudesSinResolver = [];
    const standsUsados = new Set();

    // Ordenar solicitudes según el algoritmo seleccionado
    const solicitudesOrdenadas = this.ordenarSolicitudes(solicitudes, config.algoritmo);

    for (const solicitud of solicitudesOrdenadas) {
      let standAsignado = null;
      let scoreCompatibilidad = 0;

      // Si la solicitud especifica un stand, intentar asignarlo
      if (solicitud.id_stand_solicitado && config.respetar_preferencias) {
        const standSolicitado = stands.find(s => 
          s.id_stand === solicitud.id_stand_solicitado && 
          !standsUsados.has(s.id_stand)
        );

        if (standSolicitado) {
          const compatibilidad = await this.calcularCompatibilidad(solicitud, standSolicitado);
          if (compatibilidad.compatible) {
            standAsignado = standSolicitado;
            scoreCompatibilidad = compatibilidad.score;
          }
        }
      }

      // Si no se pudo asignar el stand solicitado, buscar el mejor disponible
      if (!standAsignado) {
        const candidatos = await this.encontrarMejoresCandidatos(
          solicitud, 
          stands.filter(s => !standsUsados.has(s.id_stand)),
          config
        );

        if (candidatos.length > 0) {
          standAsignado = candidatos[0].stand;
          scoreCompatibilidad = candidatos[0].score;
        }
      }

      if (standAsignado) {
        asignacionesExitosas.push({
          solicitud,
          stand: standAsignado,
          score_compatibilidad: scoreCompatibilidad
        });
        standsUsados.add(standAsignado.id_stand);
      } else {
        solicitudesSinResolver.push(solicitud);

        // Si múltiples solicitudes quieren el mismo stand, crear conflicto potencial
        if (solicitud.id_stand_solicitado) {
          const otrasEnConflicto = solicitudesSinResolver.filter(s => 
            s.id_stand_solicitado === solicitud.id_stand_solicitado &&
            s.id_solicitud !== solicitud.id_solicitud
          );

          if (otrasEnConflicto.length > 0) {
            conflictosPotenciales.push({
              id_stand: solicitud.id_stand_solicitado,
              solicitudes: [solicitud, ...otrasEnConflicto],
              tipo: 'multiple_solicitudes'
            });
          }
        }
      }
    }

    return {
      asignaciones_exitosas: asignacionesExitosas,
      conflictos_potenciales: conflictosPotenciales,
      solicitudes_sin_resolver: solicitudesSinResolver
    };
  }

  /**
   * Ordenar solicitudes según el algoritmo especificado
   */
  static ordenarSolicitudes(solicitudes, algoritmo) {
    switch (algoritmo) {
      case 'prioridad_score':
        return [...solicitudes].sort((a, b) => {
          if (b.prioridad_score !== a.prioridad_score) {
            return b.prioridad_score - a.prioridad_score;
          }
          return new Date(a.fecha_solicitud) - new Date(b.fecha_solicitud);
        });

      case 'first_come_first_served':
        return [...solicitudes].sort((a, b) => 
          new Date(a.fecha_solicitud) - new Date(b.fecha_solicitud)
        );

      case 'mixto':
        return [...solicitudes].sort((a, b) => {
          // 70% peso a prioridad, 30% a orden de llegada
          const scoreMixtoA = (a.prioridad_score * 0.7) + 
            ((solicitudes.length - solicitudes.indexOf(a)) * 0.3);
          const scoreMixtoB = (b.prioridad_score * 0.7) + 
            ((solicitudes.length - solicitudes.indexOf(b)) * 0.3);
          return scoreMixtoB - scoreMixtoA;
        });

      default:
        return solicitudes;
    }
  }

  /**
   * Calcular compatibilidad entre solicitud y stand
   */
  static async calcularCompatibilidad(solicitud, stand) {
    let score = 0;
    let compatible = true;
    const factores = [];

    // Factor 1: Área del stand vs necesidades de la empresa
    const areaScore = this.calcularScoreArea(solicitud, stand);
    score += areaScore.score * 0.3;
    factores.push(areaScore);
    if (!areaScore.compatible) compatible = false;

    // Factor 2: Tipo de stand vs tipo de empresa
    const tipoScore = this.calcularScoreTipo(solicitud, stand);
    score += tipoScore.score * 0.25;
    factores.push(tipoScore);

    // Factor 3: Ubicación/zona preferida
    const ubicacionScore = this.calcularScoreUbicacion(solicitud, stand);
    score += ubicacionScore.score * 0.2;
    factores.push(ubicacionScore);

    // Factor 4: Precio vs presupuesto empresa
    const precioScore = this.calcularScorePrecio(solicitud, stand);
    score += precioScore.score * 0.15;
    factores.push(precioScore);

    // Factor 5: Servicios disponibles vs necesidades
    const serviciosScore = this.calcularScoreServicios(solicitud, stand);
    score += serviciosScore.score * 0.1;
    factores.push(serviciosScore);

    return {
      compatible,
      score: Math.round(score),
      factores
    };
  }

  /**
   * Calcular score de área
   */
  static calcularScoreArea(solicitud, stand) {
    const criterios = solicitud.criterios_automaticos || {};
    const areaMinima = criterios.area_minima || 0;
    const areaMaxima = criterios.area_maxima || 1000;
    const areaIdeal = criterios.area_ideal || null;

    let compatible = stand.area >= areaMinima && stand.area <= areaMaxima;
    let score = 0;

    if (compatible) {
      if (areaIdeal) {
        // Calcular qué tan cerca está del área ideal
        const diferencia = Math.abs(stand.area - areaIdeal);
        score = Math.max(0, 100 - (diferencia / areaIdeal * 100));
      } else {
        // Score basado en si está en el rango
        score = 80;
      }
    }

    return {
      compatible,
      score,
      factor: 'area',
      descripcion: `Área del stand: ${stand.area}m². Rango solicitado: ${areaMinima}-${areaMaxima}m²`
    };
  }

  /**
   * Calcular score de tipo de stand
   */
  static calcularScoreTipo(solicitud, stand) {
    const empresa = solicitud.empresa;
    let score = 70; // Score base
    let compatible = true;

    // Empresas grandes prefieren stands premium
    if (empresa.tamaño_empresa === 'grande' && stand.es_premium) {
      score = 95;
    } else if (empresa.tamaño_empresa === 'micro' && stand.es_premium) {
      score = 50; // Penalización por posible sobrecosto
    }

    // Bonificación por tipo de stand específico en criterios
    const criterios = solicitud.criterios_automaticos || {};
    if (criterios.tipo_stand_preferido && criterios.tipo_stand_preferido === stand.tipoStand.nombre_tipo) {
      score += 20;
    }

    return {
      compatible,
      score: Math.min(100, score),
      factor: 'tipo',
      descripcion: `Tipo de stand: ${stand.tipoStand.nombre_tipo}. Tamaño empresa: ${empresa.tamaño_empresa}`
    };
  }

  /**
   * Calcular score de ubicación
   */
  static calcularScoreUbicacion(solicitud, stand) {
    const criterios = solicitud.criterios_automaticos || {};
    const preferencias = solicitud.preferencias_empresa || {};
    
    let score = 70; // Score base
    let compatible = true;

    // Zona preferida
    if (preferencias.zona_preferida && stand.ubicacion) {
      if (stand.ubicacion.toLowerCase().includes(preferencias.zona_preferida.toLowerCase())) {
        score = 90;
      }
    }

    // Ubicaciones específicas en criterios
    if (criterios.ubicaciones_permitidas && Array.isArray(criterios.ubicaciones_permitidas)) {
      const ubicacionPermitida = criterios.ubicaciones_permitidas.some(ub => 
        stand.ubicacion && stand.ubicacion.toLowerCase().includes(ub.toLowerCase())
      );
      if (!ubicacionPermitida) {
        compatible = false;
        score = 0;
      }
    }

    return {
      compatible,
      score,
      factor: 'ubicacion',
      descripcion: `Ubicación: ${stand.ubicacion || 'No especificada'}`
    };
  }

  /**
   * Calcular score de precio
   */
  static calcularScorePrecio(solicitud, stand) {
    const criterios = solicitud.criterios_automaticos || {};
    const presupuestoMaximo = criterios.presupuesto_maximo;
    
    let score = 70; // Score base
    let compatible = true;

    if (presupuestoMaximo) {
      const precioStand = stand.precio_personalizado || 
        (stand.tipoStand ? stand.tipoStand.calcularPrecio(stand.area) : 0);

      if (precioStand > presupuestoMaximo) {
        compatible = false;
        score = 0;
      } else {
        // Score inversamente proporcional al precio
        const porcentajePresupuesto = (precioStand / presupuestoMaximo) * 100;
        score = Math.max(50, 100 - porcentajePresupuesto);
      }
    }

    return {
      compatible,
      score,
      factor: 'precio',
      descripcion: `Presupuesto máximo: ${presupuestoMaximo || 'No especificado'}`
    };
  }

  /**
   * Calcular score de servicios
   */
  static calcularScoreServicios(solicitud, stand) {
    const criterios = solicitud.criterios_automaticos || {};
    const serviciosRequeridos = criterios.servicios_requeridos || [];
    
    let score = 70; // Score base
    let compatible = true;

    if (serviciosRequeridos.length > 0) {
      const serviciosDisponibles = stand.servicios_disponibles || [];
      const serviciosEncontrados = serviciosRequeridos.filter(req => 
        serviciosDisponibles.includes(req)
      );

      if (serviciosEncontrados.length === 0) {
        score = 50; // Penalización pero no incompatible
      } else {
        const porcentajeCobertura = (serviciosEncontrados.length / serviciosRequeridos.length) * 100;
        score = 50 + (porcentajeCobertura * 0.5);
      }
    }

    return {
      compatible,
      score,
      factor: 'servicios',
      descripcion: `Servicios requeridos: ${serviciosRequeridos.length}`
    };
  }

  /**
   * Encontrar mejores candidatos de stands para una solicitud
   */
  static async encontrarMejoresCandidatos(solicitud, standsDisponibles, config) {
    const candidatos = [];

    for (const stand of standsDisponibles) {
      const compatibilidad = await this.calcularCompatibilidad(solicitud, stand);
      
      if (compatibilidad.compatible) {
        candidatos.push({
          stand,
          score: compatibilidad.score,
          factores: compatibilidad.factores
        });
      }
    }

    // Ordenar por score descendente
    candidatos.sort((a, b) => b.score - a.score);

    return candidatos;
  }

  /**
   * Procesar una asignación individual
   */
  static async procesarAsignacion(asignacion, ejecutadoPor, metadatos, transaction) {
    const { solicitud, stand, score_compatibilidad } = asignacion;

    // Actualizar la solicitud
    await solicitud.update({
      estado_solicitud: 'asignada',
      id_stand_asignado: stand.id_stand,
      asignado_por: ejecutadoPor,
      fecha_asignacion: new Date()
    }, { transaction });

    // Actualizar StandEvento
    await StandEvento.update(
      { estado_disponibilidad: 'reservado' },
      { 
        where: { 
          id_stand: stand.id_stand, 
          id_evento: solicitud.id_evento 
        },
        transaction 
      }
    );

    // Actualizar EmpresaEvento
    const { EmpresaEvento } = require('../models');
    await EmpresaEvento.update(
      { id_stand: stand.id_stand },
      { 
        where: { 
          id_empresa: solicitud.id_empresa, 
          id_evento: solicitud.id_evento 
        },
        transaction 
      }
    );

    // Crear entrada en histórico
    await HistoricoAsignacion.crearEntrada({
      id_empresa: solicitud.id_empresa,
      id_evento: solicitud.id_evento,
      id_solicitud: solicitud.id_solicitud,
      id_stand_nuevo: stand.id_stand,
      tipo_cambio: 'asignacion_inicial',
      estado_anterior: solicitud.estado_solicitud,
      estado_nuevo: 'asignada',
      motivo_cambio: 'Asignación automática de stand',
      descripcion_detallada: `Stand ${stand.numero_stand} asignado automáticamente a ${solicitud.empresa.nombre_empresa}`,
      datos_adicionales: {
        score_compatibilidad: score_compatibilidad,
        algoritmo: 'automatico',
        stand_numero: stand.numero_stand,
        modalidad_original: solicitud.modalidad_asignacion
      }
    }, ejecutadoPor, metadatos);
  }

  /**
   * Crear conflicto automático
   */
  static async crearConflictoAutomatico(conflictoPotencial, idEvento, detectadoPor, transaction) {
    const empresasEnConflicto = conflictoPotencial.solicitudes.map(s => ({
      id_empresa: s.id_empresa,
      nombre_empresa: s.empresa.nombre_empresa,
      prioridad_score: s.prioridad_score
    }));

    return await ConflictoAsignacion.create({
      id_evento: idEvento,
      id_stand: conflictoPotencial.id_stand,
      tipo_conflicto: conflictoPotencial.tipo,
      empresas_en_conflicto: empresasEnConflicto,
      solicitudes_relacionadas: conflictoPotencial.solicitudes.map(s => s.id_solicitud),
      descripcion_conflicto: `Conflicto detectado automáticamente durante asignación. ${empresasEnConflicto.length} empresas solicitan el mismo stand.`,
      estado_conflicto: 'detectado',
      prioridad_resolucion: empresasEnConflicto.length > 3 ? 'alta' : 'media',
      detectado_por: detectadoPor,
      metodo_deteccion: 'automatico',
      empresas_afectadas_total: empresasEnConflicto.length,
      impacto_estimado: empresasEnConflicto.length > 3 ? 'alto' : 'medio',
      created_by: detectadoPor
    }, { transaction });
  }

  /**
   * Validar compatibilidad de empresa con stand
   */
  static async validarCompatibilidad(idEmpresa, idStand, criteriosAdicionales = {}) {
    const empresa = await EmpresaExpositora.findByPk(idEmpresa, {
      include: [{ association: 'participaciones' }]
    });

    if (!empresa) {
      throw new Error('Empresa no encontrada');
    }

    const stand = await Stand.findByPk(idStand, {
      include: [{ association: 'tipoStand' }]
    });

    if (!stand) {
      throw new Error('Stand no encontrado');
    }

    const solicitudSimulada = {
      empresa,
      criterios_automaticos: criteriosAdicionales,
      preferencias_empresa: {}
    };

    const compatibilidad = await this.calcularCompatibilidad(solicitudSimulada, stand);

    return {
      compatible: compatibilidad.compatible,
      score_compatibilidad: compatibilidad.score,
      factores_evaluados: compatibilidad.factores,
      recomendacion: compatibilidad.score >= 70 ? 'recomendado' : 
                     compatibilidad.score >= 50 ? 'aceptable' : 'no_recomendado'
    };
  }

  /**
   * Obtener reporte de capacidad de asignación para un evento
   */
  static async getReporteCapacidadAsignacion(idEvento) {
    const solicitudes = await SolicitudAsignacion.findAll({
      where: {
        id_evento: idEvento,
        estado_solicitud: ['solicitada', 'en_revision', 'aprobada'],
        deleted_at: null
      },
      include: [{ association: 'empresa' }]
    });

    const stands = await Stand.findAll({
      where: {
        estado: 'activo',
        estado_fisico: 'disponible',
        deleted_at: null
      },
      include: [
        {
          association: 'standEventos',
          where: {
            id_evento: idEvento,
            estado_disponibilidad: 'disponible'
          },
          required: true
        },
        { association: 'tipoStand' }
      ]
    });

    const analisis = {
      solicitudes_pendientes: solicitudes.length,
      stands_disponibles: stands.length,
      capacidad_asignacion: Math.min(solicitudes.length, stands.length),
      porcentaje_cobertura: solicitudes.length > 0 ? 
        (Math.min(solicitudes.length, stands.length) / solicitudes.length * 100) : 100,
      solicitudes_por_modalidad: {},
      stands_por_tipo: {},
      potenciales_conflictos: 0
    };

    // Análisis por modalidad
    for (const solicitud of solicitudes) {
      const modalidad = solicitud.modalidad_asignacion;
      if (!analisis.solicitudes_por_modalidad[modalidad]) {
        analisis.solicitudes_por_modalidad[modalidad] = 0;
      }
      analisis.solicitudes_por_modalidad[modalidad]++;
    }

    // Análisis por tipo de stand
    for (const stand of stands) {
      const tipo = stand.tipoStand.nombre_tipo;
      if (!analisis.stands_por_tipo[tipo]) {
        analisis.stands_por_tipo[tipo] = 0;
      }
      analisis.stands_por_tipo[tipo]++;
    }

    // Detectar potenciales conflictos
    const standsSolicitados = {};
    for (const solicitud of solicitudes) {
      if (solicitud.id_stand_solicitado) {
        if (!standsSolicitados[solicitud.id_stand_solicitado]) {
          standsSolicitados[solicitud.id_stand_solicitado] = 0;
        }
        standsSolicitados[solicitud.id_stand_solicitado]++;
      }
    }

    analisis.potenciales_conflictos = Object.values(standsSolicitados).filter(count => count > 1).length;

    return analisis;
  }
}

module.exports = AsignacionAutomaticaService;
