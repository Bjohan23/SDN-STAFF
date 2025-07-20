const ValidationService = require('../services/ValidationService');
const { LogValidacion, Credencial } = require('../models');

class ValidationController {

  /**
   * Validar credencial por QR
   */
  static async validarQR(req, res) {
    try {
      const { qr_data } = req.body;
      const contextoValidacion = {
        punto_acceso: req.body.punto_acceso,
        ubicacion_fisica: req.body.ubicacion_fisica,
        dispositivo_validacion: req.body.dispositivo_validacion || req.headers['x-device-id'],
        ip_validacion: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        id_usuario_validador: req.user?.id_usuario,
        nombre_validador: req.body.nombre_validador,
        tipo_movimiento: req.body.tipo_movimiento || 'entrada',
        coordenadas_gps: req.body.coordenadas_gps
      };

      if (!qr_data) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el código QR para validar'
        });
      }

      const resultado = await ValidationService.validarCredencial(qr_data, contextoValidacion);

      // Determinar código de respuesta basado en el resultado
      let statusCode = 200;
      if (!resultado.valida) {
        if (resultado.resultado === 'sospechosa') {
          statusCode = 403; // Forbidden
        } else {
          statusCode = 401; // Unauthorized
        }
      }

      res.status(statusCode).json({
        success: resultado.valida,
        result: resultado.resultado,
        message: resultado.valida ? 'Credencial válida' : resultado.motivo,
        data: {
          credencial: resultado.credencial,
          nivel_riesgo: resultado.nivel_riesgo,
          tiempo_respuesta: resultado.tiempo_respuesta_ms
        }
      });

    } catch (error) {
      console.error('Error al validar credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Validar múltiples credenciales (entrada grupal)
   */
  static async validarGrupal(req, res) {
    try {
      const { qr_codes } = req.body;
      const contextoValidacion = {
        punto_acceso: req.body.punto_acceso,
        ubicacion_fisica: req.body.ubicacion_fisica,
        dispositivo_validacion: req.body.dispositivo_validacion || req.headers['x-device-id'],
        ip_validacion: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        id_usuario_validador: req.user?.id_usuario,
        nombre_validador: req.body.nombre_validador,
        coordenadas_gps: req.body.coordenadas_gps
      };

      if (!Array.isArray(qr_codes) || qr_codes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de códigos QR'
        });
      }

      if (qr_codes.length > 10) {
        return res.status(400).json({
          success: false,
          message: 'Máximo 10 credenciales por validación grupal'
        });
      }

      const resultado = await ValidationService.validarCredencialesGrupales(qr_codes, contextoValidacion);

      res.status(200).json({
        success: true,
        message: `Validación grupal completada: ${resultado.resumen.exitosas}/${resultado.resumen.total} credenciales válidas`,
        data: resultado
      });

    } catch (error) {
      console.error('Error al validar credenciales grupales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener historial de validaciones de una credencial
   */
  static async obtenerHistorial(req, res) {
    try {
      const { id_credencial } = req.params;
      const { limite = 50, desde, hasta } = req.query;

      const opciones = { limite: parseInt(limite) };
      if (desde) opciones.desde = new Date(desde);
      if (hasta) opciones.hasta = new Date(hasta);

      const historial = await ValidationService.obtenerHistorialValidaciones(id_credencial, opciones);

      res.status(200).json({
        success: true,
        data: historial
      });

    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de validaciones por evento
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const { id_evento } = req.params;
      const { periodo = '24h' } = req.query;

      const estadisticas = await ValidationService.obtenerEstadisticasValidaciones(id_evento, periodo);

      res.status(200).json({
        success: true,
        data: estadisticas
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Detectar patrones sospechosos
   */
  static async detectarPatronesSospechosos(req, res) {
    try {
      const { id_evento } = req.query;

      const patrones = await ValidationService.detectarPatronesSospechosos(id_evento);

      res.status(200).json({
        success: true,
        data: patrones
      });

    } catch (error) {
      console.error('Error al detectar patrones sospechosos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Marcar validación como fraudulenta
   */
  static async marcarFraudulenta(req, res) {
    try {
      const { id_log } = req.params;
      const { motivo } = req.body;

      if (!motivo) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere especificar el motivo'
        });
      }

      const logValidacion = await LogValidacion.findByPk(id_log);

      if (!logValidacion) {
        return res.status(404).json({
          success: false,
          message: 'Log de validación no encontrado'
        });
      }

      await logValidacion.marcarComoFraudulenta(motivo);

      res.status(200).json({
        success: true,
        message: 'Validación marcada como fraudulenta',
        data: logValidacion
      });

    } catch (error) {
      console.error('Error al marcar como fraudulenta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener validaciones recientes
   */
  static async obtenerValidacionesRecientes(req, res) {
    try {
      const {
        id_evento,
        limite = 50,
        resultado,
        nivel_riesgo,
        punto_acceso
      } = req.query;

      const where = {};
      if (id_evento) where.id_evento = id_evento;
      if (resultado) where.resultado = resultado;
      if (nivel_riesgo) where.nivel_riesgo = nivel_riesgo;
      if (punto_acceso) where.punto_acceso = punto_acceso;

      // Últimas 24 horas por defecto
      where.fecha_validacion = {
        [require('sequelize').Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };

      const validaciones = await LogValidacion.findAll({
        where,
        limit: parseInt(limite),
        order: [['fecha_validacion', 'DESC']],
        include: [
          {
            model: Credencial,
            as: 'credencial',
            attributes: ['codigo_unico', 'nombre_completo', 'empresa_organizacion']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: validaciones
      });

    } catch (error) {
      console.error('Error al obtener validaciones recientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener resumen de validaciones en tiempo real
   */
  static async obtenerResumenTiempoReal(req, res) {
    try {
      const { id_evento } = req.params;

      // Últimas 4 horas
      const fecha_limite = new Date(Date.now() - 4 * 60 * 60 * 1000);

      const resumen = await LogValidacion.findAll({
        where: {
          id_evento,
          fecha_validacion: { [require('sequelize').Op.gte]: fecha_limite }
        },
        attributes: [
          'resultado',
          'nivel_riesgo',
          [require('sequelize').fn('COUNT', '*'), 'total'],
          [require('sequelize').fn('DATE_FORMAT', require('sequelize').col('fecha_validacion'), '%Y-%m-%d %H:00:00'), 'hora']
        ],
        group: ['resultado', 'nivel_riesgo', 'hora'],
        order: [['hora', 'DESC']],
        raw: true
      });

      // Calcular totales
      const totales = await LogValidacion.findAll({
        where: {
          id_evento,
          fecha_validacion: { [require('sequelize').Op.gte]: fecha_limite }
        },
        attributes: [
          'resultado',
          [require('sequelize').fn('COUNT', '*'), 'total']
        ],
        group: ['resultado'],
        raw: true
      });

      res.status(200).json({
        success: true,
        data: {
          resumen_por_hora: resumen,
          totales: totales,
          periodo: '4 horas',
          ultima_actualizacion: new Date()
        }
      });

    } catch (error) {
      console.error('Error al obtener resumen en tiempo real:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Validar credencial por código único (alternativo al QR)
   */
  static async validarPorCodigo(req, res) {
    try {
      const { codigo_unico } = req.body;
      const contextoValidacion = {
        punto_acceso: req.body.punto_acceso,
        ubicacion_fisica: req.body.ubicacion_fisica,
        dispositivo_validacion: req.body.dispositivo_validacion || req.headers['x-device-id'],
        ip_validacion: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        id_usuario_validador: req.user?.id_usuario,
        nombre_validador: req.body.nombre_validador,
        tipo_movimiento: req.body.tipo_movimiento || 'entrada'
      };

      if (!codigo_unico) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el código único de la credencial'
        });
      }

      // Buscar credencial por código único
      const credencial = await Credencial.findOne({
        where: { codigo_unico, deleted_at: null }
      });

      if (!credencial) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      // Validar usando el QR data de la credencial
      const resultado = await ValidationService.validarCredencial(credencial.qr_data, {
        ...contextoValidacion,
        validacion_por_codigo: true
      });

      let statusCode = 200;
      if (!resultado.valida) {
        statusCode = resultado.resultado === 'sospechosa' ? 403 : 401;
      }

      res.status(statusCode).json({
        success: resultado.valida,
        result: resultado.resultado,
        message: resultado.valida ? 'Credencial válida' : resultado.motivo,
        data: {
          credencial: resultado.credencial,
          nivel_riesgo: resultado.nivel_riesgo,
          tiempo_respuesta: resultado.tiempo_respuesta_ms
        }
      });

    } catch (error) {
      console.error('Error al validar por código:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener información de punto de acceso
   */
  static async obtenerInfoPuntoAcceso(req, res) {
    try {
      const { punto_acceso } = req.params;
      const { id_evento } = req.query;

      // Estadísticas del punto de acceso en las últimas 24 horas
      const fecha_limite = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const where = {
        punto_acceso,
        fecha_validacion: { [require('sequelize').Op.gte]: fecha_limite }
      };

      if (id_evento) where.id_evento = id_evento;

      const estadisticas = await LogValidacion.findAll({
        where,
        attributes: [
          'resultado',
          [require('sequelize').fn('COUNT', '*'), 'total'],
          [require('sequelize').fn('AVG', require('sequelize').col('tiempo_respuesta_ms')), 'tiempo_promedio']
        ],
        group: ['resultado'],
        raw: true
      });

      // Última actividad
      const ultimaActividad = await LogValidacion.findOne({
        where: { punto_acceso },
        order: [['fecha_validacion', 'DESC']],
        include: [
          {
            model: Credencial,
            as: 'credencial',
            attributes: ['codigo_unico', 'nombre_completo']
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          punto_acceso,
          estadisticas_24h: estadisticas,
          ultima_actividad: ultimaActividad,
          estado: 'activo' // Podrías implementar lógica para determinar el estado
        }
      });

    } catch (error) {
      console.error('Error al obtener info del punto de acceso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = ValidationController;