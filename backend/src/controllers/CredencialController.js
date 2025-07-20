const CredencialService = require('../services/CredencialService');
const QRGeneratorService = require('../services/QRGeneratorService');
const PDFGeneratorService = require('../services/PDFGeneratorService');
const { Credencial, TipoCredencial, Evento } = require('../models');

class CredencialController {

  /**
   * Crear nueva credencial
   */
  static async crear(req, res) {
    try {
      const datosCredencial = req.body;
      const userId = req.user?.id_usuario;

      // Validaciones básicas
      if (!datosCredencial.id_evento || !datosCredencial.id_tipo_credencial || !datosCredencial.nombre_completo) {
        return res.status(400).json({
          success: false,
          message: 'Campos requeridos: id_evento, id_tipo_credencial, nombre_completo'
        });
      }

      const credencial = await CredencialService.crearCredencial(datosCredencial, userId);

      res.status(201).json({
        success: true,
        message: 'Credencial creada exitosamente',
        data: credencial
      });

    } catch (error) {
      console.error('Error al crear credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Crear credenciales en lote
   */
  static async crearLote(req, res) {
    try {
      const { credenciales } = req.body;
      const userId = req.user?.id_usuario;

      if (!Array.isArray(credenciales) || credenciales.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de credenciales'
        });
      }

      const resultado = await CredencialService.generarCredencialesLote(credenciales, userId);

      res.status(201).json({
        success: true,
        message: `Procesadas ${resultado.total_procesadas} credenciales. ${resultado.exitosas_count} exitosas, ${resultado.errores_count} errores`,
        data: resultado
      });

    } catch (error) {
      console.error('Error al crear credenciales en lote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener credencial por ID
   */
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      const credencial = await CredencialService.obtenerCredencialCompleta(id);

      if (!credencial || credencial.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      res.status(200).json({
        success: true,
        data: credencial
      });

    } catch (error) {
      console.error('Error al obtener credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Listar credenciales con filtros
   */
  static async listar(req, res) {
    try {
      const filtros = req.query;
      const resultado = await CredencialService.buscarCredenciales(filtros);

      res.status(200).json({
        success: true,
        data: resultado.rows,
        pagination: {
          total: resultado.count,
          page: parseInt(filtros.page || 1),
          limit: parseInt(filtros.limit || 10),
          totalPages: Math.ceil(resultado.count / (filtros.limit || 10))
        }
      });

    } catch (error) {
      console.error('Error al listar credenciales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Actualizar credencial
   */
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const datosActualizacion = req.body;
      const userId = req.user?.id_usuario;

      const credencial = await Credencial.findByPk(id);

      if (!credencial || credencial.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      await credencial.update({
        ...datosActualizacion,
        updated_by: userId
      });

      const credencialActualizada = await CredencialService.obtenerCredencialCompleta(id);

      res.status(200).json({
        success: true,
        message: 'Credencial actualizada exitosamente',
        data: credencialActualizada
      });

    } catch (error) {
      console.error('Error al actualizar credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Eliminar credencial (soft delete)
   */
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const credencial = await Credencial.findByPk(id);

      if (!credencial || credencial.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      await credencial.softDelete(userId);

      res.status(200).json({
        success: true,
        message: 'Credencial eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Generar credencial física (PDF)
   */
  static async generarPDF(req, res) {
    try {
      const { id } = req.params;

      const resultado = await CredencialService.generarCredencialFisica(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${resultado.pdf.filename}"`);
      res.send(resultado.pdf.buffer);

    } catch (error) {
      console.error('Error al generar PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Generar PDFs en lote
   */
  static async generarPDFLote(req, res) {
    try {
      const { credenciales_ids } = req.body;

      if (!Array.isArray(credenciales_ids) || credenciales_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de IDs de credenciales'
        });
      }

      // Obtener credenciales
      const credenciales = await Promise.all(
        credenciales_ids.map(id => CredencialService.obtenerCredencialCompleta(id))
      );

      const credencialesValidas = credenciales.filter(c => c && !c.isDeleted());

      if (credencialesValidas.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No se encontraron credenciales válidas'
        });
      }

      // Generar QRs
      const qrResults = await QRGeneratorService.generateBatchQRs(credencialesValidas);

      // Obtener plantilla (usar la primera credencial como referencia)
      const plantilla = await CredencialService.obtenerPlantillaPorDefecto(
        credencialesValidas[0].id_tipo_credencial
      );

      // Generar PDF múltiple
      const pdfMultiple = await PDFGeneratorService.generateMultiCredentialPDF(
        credencialesValidas,
        plantilla,
        qrResults.success
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${pdfMultiple.filename}"`);
      res.send(pdfMultiple.buffer);

    } catch (error) {
      console.error('Error al generar PDF en lote:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener imagen QR de credencial
   */
  static async obtenerQR(req, res) {
    try {
      const { id } = req.params;

      const credencial = await Credencial.findByPk(id);

      if (!credencial || credencial.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Credencial no encontrada'
        });
      }

      const qrImage = await QRGeneratorService.generateQRImage(credencial.qr_data);

      res.setHeader('Content-Type', 'image/png');
      res.send(qrImage.buffer);

    } catch (error) {
      console.error('Error al obtener QR:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Revocar credencial
   */
  static async revocar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const userId = req.user?.id_usuario;

      if (!motivo) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere especificar el motivo de revocación'
        });
      }

      const credencial = await CredencialService.revocarCredencial(id, motivo, userId);

      res.status(200).json({
        success: true,
        message: 'Credencial revocada exitosamente',
        data: credencial
      });

    } catch (error) {
      console.error('Error al revocar credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Reactivar credencial
   */
  static async reactivar(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const credencial = await CredencialService.reactivarCredencial(id, userId);

      res.status(200).json({
        success: true,
        message: 'Credencial reactivada exitosamente',
        data: credencial
      });

    } catch (error) {
      console.error('Error al reactivar credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Reimprimir credencial
   */
  static async reimprimir(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const resultado = await CredencialService.reimprimirCredencial(id, userId);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="reimpresion_${resultado.pdf.filename}"`);
      res.send(resultado.pdf.buffer);

    } catch (error) {
      console.error('Error al reimprimir credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener estadísticas de credenciales
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const { id_evento } = req.query;

      const estadisticas = await CredencialService.obtenerEstadisticas(id_evento);

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
   * Generar reporte de credenciales
   */
  static async generarReporte(req, res) {
    try {
      const { id_evento } = req.params;

      // Obtener evento
      const evento = await Evento.findByPk(id_evento);
      if (!evento) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      // Obtener credenciales del evento
      const resultado = await CredencialService.buscarCredenciales({
        id_evento,
        limit: 1000
      });

      // Obtener estadísticas
      const estadisticas = await CredencialService.obtenerEstadisticas(id_evento);

      // Generar PDF del reporte
      const reportePDF = await PDFGeneratorService.generateCredentialReport(
        evento,
        resultado.rows,
        estadisticas
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${reportePDF.filename}"`);
      res.send(reportePDF.buffer);

    } catch (error) {
      console.error('Error al generar reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Obtener credenciales por evento
   */
  static async obtenerPorEvento(req, res) {
    try {
      const { id_evento } = req.params;
      const filtros = { ...req.query, id_evento };

      const resultado = await CredencialService.buscarCredenciales(filtros);

      res.status(200).json({
        success: true,
        data: resultado.rows,
        pagination: {
          total: resultado.count,
          page: parseInt(filtros.page || 1),
          limit: parseInt(filtros.limit || 10),
          totalPages: Math.ceil(resultado.count / (filtros.limit || 10))
        }
      });

    } catch (error) {
      console.error('Error al obtener credenciales por evento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  /**
   * Duplicar credencial
   */
  static async duplicar(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id_usuario;

      const credencialOriginal = await CredencialService.obtenerCredencialCompleta(id);

      if (!credencialOriginal || credencialOriginal.isDeleted()) {
        return res.status(404).json({
          success: false,
          message: 'Credencial original no encontrada'
        });
      }

      // Crear nueva credencial con los mismos datos
      const datosNuevaCredencial = {
        id_evento: credencialOriginal.id_evento,
        id_tipo_credencial: credencialOriginal.id_tipo_credencial,
        nombre_completo: credencialOriginal.nombre_completo,
        email: credencialOriginal.email,
        telefono: credencialOriginal.telefono,
        documento_identidad: credencialOriginal.documento_identidad,
        empresa_organizacion: credencialOriginal.empresa_organizacion,
        cargo_titulo: credencialOriginal.cargo_titulo,
        id_empresa_expositora: credencialOriginal.id_empresa_expositora,
        id_usuario: credencialOriginal.id_usuario,
        datos_adicionales: credencialOriginal.datos_adicionales
      };

      const nuevaCredencial = await CredencialService.crearCredencial(datosNuevaCredencial, userId);

      res.status(201).json({
        success: true,
        message: 'Credencial duplicada exitosamente',
        data: nuevaCredencial
      });

    } catch (error) {
      console.error('Error al duplicar credencial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = CredencialController;