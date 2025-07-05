const AsignacionAutomaticaService = require('../services/AsignacionAutomaticaService');
const ApiResponse = require('../utils/ApiResponse');
const ValidationUtils = require('../utils/ValidationUtils');

/**
 * Controlador de Asignación Automática
 */
class AsignacionAutomaticaController {

  /**
   * Ejecutar asignación automática para un evento
   */
  static async ejecutarAsignacionAutomatica(req, res, next) {
    try {
      const { evento_id } = req.params;
      const configuracion = req.body.configuracion || {};
      const ejecutadoPor = req.user ? req.user.id_usuario : null;

      // Obtener metadatos de la request
      const metadatos = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      };

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      // Validar configuración si se proporciona
      if (configuracion.algoritmo && !['prioridad_score', 'first_come_first_served', 'mixto'].includes(configuracion.algoritmo)) {
        return ApiResponse.validation(res, [{ field: 'algoritmo', message: 'Algoritmo inválido' }]);
      }

      const resultado = await AsignacionAutomaticaService.ejecutarAsignacionAutomatica(
        evento_id, 
        configuracion, 
        ejecutadoPor, 
        metadatos
      );

      const statusCode = resultado.success ? 200 : 400;
      
      return ApiResponse.success(res, resultado, resultado.message, statusCode);
    } catch (error) {
      if (error.message === 'Evento no encontrado') {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Validar compatibilidad de empresa con stand
   */
  static async validarCompatibilidad(req, res, next) {
    try {
      const { empresa_id, stand_id } = req.params;
      const criteriosAdicionales = req.body.criterios || {};

      if (!ValidationUtils.isValidId(empresa_id)) {
        return ApiResponse.validation(res, [{ field: 'empresa_id', message: 'ID de empresa inválido' }]);
      }

      if (!ValidationUtils.isValidId(stand_id)) {
        return ApiResponse.validation(res, [{ field: 'stand_id', message: 'ID de stand inválido' }]);
      }

      const compatibilidad = await AsignacionAutomaticaService.validarCompatibilidad(
        empresa_id, 
        stand_id, 
        criteriosAdicionales
      );
      
      return ApiResponse.success(res, compatibilidad, 'Compatibilidad evaluada exitosamente');
    } catch (error) {
      if (error.message.includes('no encontrad')) {
        return ApiResponse.notFound(res, error.message);
      }
      next(error);
    }
  }

  /**
   * Obtener reporte de capacidad de asignación para un evento
   */
  static async getReporteCapacidadAsignacion(req, res, next) {
    try {
      const { evento_id } = req.params;

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      const reporte = await AsignacionAutomaticaService.getReporteCapacidadAsignacion(evento_id);
      
      return ApiResponse.success(res, reporte, 'Reporte de capacidad obtenido exitosamente');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Simular asignación automática sin ejecutar
   */
  static async simularAsignacionAutomatica(req, res, next) {
    try {
      const { evento_id } = req.params;
      const configuracion = req.body.configuracion || {};

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      // Validar configuración
      if (configuracion.algoritmo && !['prioridad_score', 'first_come_first_served', 'mixto'].includes(configuracion.algoritmo)) {
        return ApiResponse.validation(res, [{ field: 'algoritmo', message: 'Algoritmo inválido' }]);
      }

      // Usar transacción simulada (rollback al final)
      const { sequelize } = require('../models');
      const transaction = await sequelize.transaction();

      try {
        // Configuración para simulación
        const configSimulacion = {
          ...configuracion,
          solo_simulacion: true
        };

        // Obtener solicitudes elegibles
        const solicitudes = await AsignacionAutomaticaService.getSolicitudesElegibles(evento_id, configSimulacion, transaction);
        const stands = await AsignacionAutomaticaService.getStandsDisponibles(evento_id, transaction);

        // Ejecutar algoritmo sin persistir
        const resultado = await AsignacionAutomaticaService.ejecutarAlgoritmo(solicitudes, stands, configSimulacion, transaction);

        // Rollback para no persistir cambios
        await transaction.rollback();

        const simulacion = {
          solicitudes_procesadas: solicitudes.length,
          stands_disponibles: stands.length,
          asignaciones_posibles: resultado.asignaciones_exitosas.length,
          conflictos_potenciales: resultado.conflictos_potenciales.length,
          solicitudes_sin_resolver: resultado.solicitudes_sin_resolver.length,
          porcentaje_exito: solicitudes.length > 0 ? 
            (resultado.asignaciones_exitosas.length / solicitudes.length * 100) : 0,
          detalle_asignaciones: resultado.asignaciones_exitosas.map(a => ({
            empresa: a.solicitud.empresa.nombre_empresa,
            stand_asignado: a.stand.numero_stand,
            score_compatibilidad: a.score_compatibilidad,
            modalidad_original: a.solicitud.modalidad_asignacion
          })),
          conflictos_detectados: resultado.conflictos_potenciales.map(c => ({
            stand_id: c.id_stand,
            empresas_afectadas: c.solicitudes.length,
            empresas: c.solicitudes.map(s => s.empresa.nombre_empresa)
          })),
          configuracion_usada: configSimulacion
        };

        return ApiResponse.success(res, simulacion, 'Simulación de asignación completada exitosamente');

      } catch (simError) {
        await transaction.rollback();
        throw simError;
      }

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener mejores candidatos de stands para una empresa
   */
  static async getMejoresCandidatos(req, res, next) {
    try {
      const { empresa_id, evento_id } = req.params;
      const { limite = 5, criterios = {} } = req.body;

      if (!ValidationUtils.isValidId(empresa_id)) {
        return ApiResponse.validation(res, [{ field: 'empresa_id', message: 'ID de empresa inválido' }]);
      }

      if (!ValidationUtils.isValidId(evento_id)) {
        return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
      }

      const limiteNum = parseInt(limite);
      if (isNaN(limiteNum) || limiteNum < 1 || limiteNum > 20) {
        return ApiResponse.validation(res, [{ field: 'limite', message: 'Límite debe ser entre 1 y 20' }]);
      }

      const { EmpresaExpositora, Stand } = require('../models');

      // Obtener empresa
      const empresa = await EmpresaExpositora.findByPk(empresa_id);
      if (!empresa) {
        return ApiResponse.notFound(res, 'Empresa no encontrada');
      }

      // Crear solicitud simulada
      const solicitudSimulada = {
        empresa,
        id_evento: evento_id,
        criterios_automaticos: criterios,
        preferencias_empresa: {}
      };

      // Obtener stands disponibles
      const stands = await AsignacionAutomaticaService.getStandsDisponibles(evento_id);

      // Encontrar mejores candidatos
      const candidatos = await AsignacionAutomaticaService.encontrarMejoresCandidatos(
        solicitudSimulada, 
        stands, 
        { respetar_preferencias: true }
      );

      const mejoresCandidatos = candidatos.slice(0, limiteNum).map(candidato => ({
        stand: {
          id_stand: candidato.stand.id_stand,
          numero_stand: candidato.stand.numero_stand,
          area: candidato.stand.area,
          ubicacion: candidato.stand.ubicacion,
          tipo_stand: candidato.stand.tipoStand?.nombre_tipo,
          es_premium: candidato.stand.es_premium
        },
        score_compatibilidad: candidato.score,
        factores_evaluados: candidato.factores,
        recomendacion: candidato.score >= 70 ? 'altamente_recomendado' : 
                      candidato.score >= 50 ? 'recomendado' : 'no_recomendado'
      }));

      return ApiResponse.success(res, {
        empresa: {
          id_empresa: empresa.id_empresa,
          nombre_empresa: empresa.nombre_empresa
        },
        candidatos_encontrados: mejoresCandidatos.length,
        mejores_candidatos: mejoresCandidatos,
        criterios_aplicados: criterios
      }, 'Mejores candidatos obtenidos exitosamente');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener algoritmos disponibles y sus descripciones
   */
  static async getAlgoritmosDisponibles(req, res, next) {
    try {
      const algoritmos = {
        prioridad_score: {
          nombre: 'Por Puntuación de Prioridad',
          descripcion: 'Asigna stands basándose en el score de prioridad de cada empresa, considerando participaciones anteriores, calificaciones y antigüedad',
          criterios: [
            'Número de participaciones anteriores (peso: 25%)',
            'Calificación promedio de la empresa (peso: 50%)',
            'Antigüedad como expositor (peso: 20%)',
            'Estado de aprobación (peso: 5%)'
          ],
          recomendado_para: 'Eventos con empresas recurrentes donde se quiere premiar la fidelidad'
        },
        first_come_first_served: {
          nombre: 'Primero en Llegar, Primero en Ser Servido',
          descripcion: 'Asigna stands en orden cronológico según la fecha de solicitud',
          criterios: [
            'Fecha y hora de solicitud (único criterio)'
          ],
          recomendado_para: 'Eventos nuevos o cuando se quiere dar igualdad de oportunidades'
        },
        mixto: {
          nombre: 'Algoritmo Mixto',
          descripcion: 'Combina puntuación de prioridad (70%) con orden de llegada (30%)',
          criterios: [
            'Score de prioridad (peso: 70%)',
            'Orden de llegada (peso: 30%)'
          ],
          recomendado_para: 'Balance entre recompensar fidelidad y dar oportunidades a nuevos expositores'
        }
      };

      const configuracionesDisponibles = {
        incluir_solicitudes_automaticas: {
          descripcion: 'Incluir solicitudes marcadas como asignación automática',
          valor_defecto: true
        },
        incluir_solicitudes_pendientes: {
          descripcion: 'Incluir solicitudes pendientes de aprobación',
          valor_defecto: true
        },
        respetar_preferencias: {
          descripcion: 'Respetar stands específicos solicitados por las empresas',
          valor_defecto: true
        },
        optimizar_ocupacion: {
          descripcion: 'Optimizar la ocupación general del espacio',
          valor_defecto: true
        },
        permitir_reasignacion: {
          descripcion: 'Permitir reasignar stands ya asignados si mejora la optimización',
          valor_defecto: false
        }
      };

      return ApiResponse.success(res, {
        algoritmos_disponibles: algoritmos,
        configuraciones_disponibles: configuracionesDisponibles,
        configuracion_recomendada: {
          algoritmo: 'mixto',
          incluir_solicitudes_automaticas: true,
          incluir_solicitudes_pendientes: true,
          respetar_preferencias: true,
          optimizar_ocupacion: true,
          permitir_reasignacion: false
        }
      }, 'Algoritmos disponibles obtenidos exitosamente');

    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener métricas de rendimiento de asignaciones automáticas
   */
  static async getMetricasRendimiento(req, res, next) {
    try {
      const { evento_id } = req.query;
      const { fecha_desde, fecha_hasta } = req.query;

      const filtros = {};
      if (evento_id) {
        if (!ValidationUtils.isValidId(evento_id)) {
          return ApiResponse.validation(res, [{ field: 'evento_id', message: 'ID de evento inválido' }]);
        }
        filtros.id_evento = evento_id;
      }

      if (fecha_desde && fecha_hasta) {
        filtros.fecha_desde = fecha_desde;
        filtros.fecha_hasta = fecha_hasta;
      }

      const { HistoricoAsignacion } = require('../models');
      const { Op, sequelize } = require('sequelize');

      // Obtener asignaciones automáticas
      const asignacionesAutomaticas = await HistoricoAsignacion.findAll({
        where: {
          tipo_cambio: 'asignacion_inicial',
          'datos_adicionales.algoritmo': 'automatico',
          ...(filtros.id_evento && { id_evento: filtros.id_evento }),
          ...(filtros.fecha_desde && filtros.fecha_hasta && {
            fecha_cambio: {
              [Op.between]: [new Date(filtros.fecha_desde), new Date(filtros.fecha_hasta)]
            }
          })
        },
        include: [
          { association: 'empresa', attributes: ['nombre_empresa'] },
          { association: 'evento', attributes: ['nombre_evento'] }
        ]
      });

      // Calcular métricas
      const totalAsignaciones = asignacionesAutomaticas.length;
      const scorePromedio = asignacionesAutomaticas.reduce((sum, a) => 
        sum + (a.datos_adicionales?.score_compatibilidad || 0), 0) / (totalAsignaciones || 1);

      // Distribución por algoritmo
      const distribucionAlgoritmo = asignacionesAutomaticas.reduce((acc, a) => {
        const modalidad = a.datos_adicionales?.modalidad_original || 'automatica';
        acc[modalidad] = (acc[modalidad] || 0) + 1;
        return acc;
      }, {});

      // Asignaciones por evento
      const asignacionesPorEvento = asignacionesAutomaticas.reduce((acc, a) => {
        const evento = a.evento?.nombre_evento || 'Evento desconocido';
        acc[evento] = (acc[evento] || 0) + 1;
        return acc;
      }, {});

      // Empresas más beneficiadas
      const empresasMasBeneficiadas = asignacionesAutomaticas.reduce((acc, a) => {
        const empresa = a.empresa?.nombre_empresa || 'Empresa desconocida';
        if (!acc[empresa]) {
          acc[empresa] = { count: 0, score_promedio: 0 };
        }
        acc[empresa].count += 1;
        acc[empresa].score_promedio += (a.datos_adicionales?.score_compatibilidad || 0);
        return acc;
      }, {});

      // Convertir a array y calcular promedios
      const empresasRanking = Object.entries(empresasMasBeneficiadas)
        .map(([empresa, data]) => ({
          empresa,
          asignaciones: data.count,
          score_promedio: Math.round(data.score_promedio / data.count)
        }))
        .sort((a, b) => b.asignaciones - a.asignaciones)
        .slice(0, 10);

      const metricas = {
        total_asignaciones_automaticas: totalAsignaciones,
        score_compatibilidad_promedio: Math.round(scorePromedio),
        distribucion_por_modalidad: distribucionAlgoritmo,
        asignaciones_por_evento: asignacionesPorEvento,
        empresas_mas_beneficiadas: empresasRanking,
        periodo_consultado: {
          fecha_desde: filtros.fecha_desde || 'Inicio',
          fecha_hasta: filtros.fecha_hasta || 'Actual'
        },
        fecha_generacion: new Date()
      };

      return ApiResponse.success(res, metricas, 'Métricas de rendimiento obtenidas exitosamente');

    } catch (error) {
      next(error);
    }
  }
}

module.exports = AsignacionAutomaticaController;
