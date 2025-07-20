const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Configurar el transportador de email
    this.transporter = nodemailer.createTransporter({
      host: process.env.MAIL_HOST || 'localhost',
      port: process.env.MAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME || '',
        pass: process.env.MAIL_PASSWORD || ''
      }
    });
  }

  /**
   * Enviar email
   */
  static async enviarEmail(opciones) {
    try {
      // Por ahora solo simular el envío
      console.log('Email simulado enviado:', {
        to: opciones.to,
        subject: opciones.subject,
        template: opciones.template || 'texto plano',
        data: opciones.data || {}
      });

      return {
        success: true,
        messageId: 'simulado-' + Date.now()
      };
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmación de pre-registro
   */
  static async enviarConfirmacionPreRegistro(destinatario, datos) {
    return this.enviarEmail({
      to: destinatario,
      subject: `Confirmación de registro - ${datos.evento.nombre}`,
      template: 'confirmacion-pre-registro',
      data: datos
    });
  }

  /**
   * Enviar reporte por email
   */
  static async enviarReporte(destinatarios, tipoReporte, datosReporte) {
    return this.enviarEmail({
      to: destinatarios,
      subject: `Reporte ${tipoReporte}`,
      template: 'reporte-evento',
      data: datosReporte
    });
  }
}

module.exports = EmailService;