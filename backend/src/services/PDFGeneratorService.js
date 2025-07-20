const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class PDFGeneratorService {
  
  /**
   * Generar PDF de credencial individual
   */
  static async generateCredentialPDF(credencial, plantilla, qrImageData) {
    try {
      // Compilar template HTML
      const htmlContent = await this.compileTemplate(plantilla, credencial, qrImageData);
      
      // Configuración del PDF
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm'
        },
        ...this.getPDFDimensions(plantilla.dimensiones)
      };
      
      // Generar PDF
      const pdfBuffer = await this.htmlToPDF(htmlContent, pdfOptions);
      
      return {
        buffer: pdfBuffer,
        mimeType: 'application/pdf',
        filename: `credencial_${credencial.codigo_unico}.pdf`
      };
    } catch (error) {
      throw new Error(`Error generating credential PDF: ${error.message}`);
    }
  }
  
  /**
   * Compilar template HTML con datos de la credencial
   */
  static async compileTemplate(plantilla, credencial, qrImageData) {
    try {
      // Registrar helpers de Handlebars
      this.registerHandlebarsHelpers();
      
      // Preparar datos para el template
      const templateData = {
        // Datos de la credencial
        ...credencial.dataValues || credencial,
        
        // Datos del evento
        evento: credencial.evento || {},
        
        // Datos del tipo de credencial
        tipoCredencial: credencial.tipoCredencial || {},
        
        // QR como data URL
        qrCodeDataURL: qrImageData.dataURL,
        
        // Fecha formateada
        fechaEmision: this.formatDate(credencial.fecha_emision),
        fechaActivacion: credencial.fecha_activacion ? this.formatDate(credencial.fecha_activacion) : null,
        fechaExpiracion: credencial.fecha_expiracion ? this.formatDate(credencial.fecha_expiracion) : null,
        
        // URLs de assets
        logoEvento: plantilla.logo_evento || '',
        imagenFondo: plantilla.imagen_fondo || '',
        
        // Variables adicionales
        ...plantilla.variables_disponibles
      };
      
      // Compilar template
      const template = handlebars.compile(plantilla.diseño_html);
      const htmlContent = template(templateData);
      
      // Agregar CSS
      const finalHTML = this.wrapHTMLWithCSS(htmlContent, plantilla.estilos_css);
      
      return finalHTML;
    } catch (error) {
      throw new Error(`Error compiling template: ${error.message}`);
    }
  }
  
  /**
   * Registrar helpers personalizados de Handlebars
   */
  static registerHandlebarsHelpers() {
    // Helper para formatear fechas
    handlebars.registerHelper('formatDate', (date) => {
      if (!date) return '';
      return this.formatDate(date);
    });
    
    // Helper para texto en mayúsculas
    handlebars.registerHelper('uppercase', (text) => {
      return text ? text.toString().toUpperCase() : '';
    });
    
    // Helper para texto en minúsculas
    handlebars.registerHelper('lowercase', (text) => {
      return text ? text.toString().toLowerCase() : '';
    });
    
    // Helper para capitalizar primera letra
    handlebars.registerHelper('capitalize', (text) => {
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    });
    
    // Helper condicional
    handlebars.registerHelper('ifEquals', (arg1, arg2, options) => {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });
    
    // Helper para QR con tamaño personalizado
    handlebars.registerHelper('qrCode', (dataURL, size = 100) => {
      return new handlebars.SafeString(`<img src="${dataURL}" width="${size}" height="${size}" alt="QR Code" />`);
    });
  }
  
  /**
   * Envolver HTML con CSS
   */
  static wrapHTMLWithCSS(htmlContent, customCSS = '') {
    const baseCSS = `
      <style>
        @page {
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Arial', sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .credencial {
          width: 100%;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .qr-code {
          max-width: 100px;
          max-height: 100px;
        }
        ${customCSS}
      </style>
    `;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credencial</title>
        ${baseCSS}
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
  }
  
  /**
   * Convertir HTML a PDF usando Puppeteer
   */
  static async htmlToPDF(htmlContent, options) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security'
        ]
      });
      
      const page = await browser.newPage();
      
      // Configurar viewport
      await page.setViewport({ width: 1200, height: 800 });
      
      // Cargar contenido HTML
      await page.setContent(htmlContent, {
        waitUntil: ['networkidle0', 'load']
      });
      
      // Esperar a que las imágenes se carguen
      await page.waitForTimeout(1000);
      
      // Generar PDF
      const pdfBuffer = await page.pdf(options);
      
      return pdfBuffer;
    } catch (error) {
      throw new Error(`Error converting HTML to PDF: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
  
  /**
   * Obtener dimensiones del PDF basadas en la plantilla
   */
  static getPDFDimensions(dimensiones) {
    if (!dimensiones) {
      return { format: 'A4' };
    }
    
    const { ancho, alto, unidad = 'px' } = dimensiones;
    
    if (ancho && alto) {
      // Convertir a mm si es necesario
      let widthMM, heightMM;
      
      if (unidad === 'px') {
        // Conversión aproximada: 1px = 0.264583mm
        widthMM = ancho * 0.264583;
        heightMM = alto * 0.264583;
      } else if (unidad === 'mm') {
        widthMM = ancho;
        heightMM = alto;
      } else if (unidad === 'cm') {
        widthMM = ancho * 10;
        heightMM = alto * 10;
      } else {
        return { format: 'A4' };
      }
      
      return {
        format: 'A4', // Mantener A4 como fallback
        width: `${widthMM}mm`,
        height: `${heightMM}mm`
      };
    }
    
    return { format: 'A4' };
  }
  
  /**
   * Generar PDFs en lote
   */
  static async generateBatchPDFs(credenciales, plantilla, qrImages) {
    const results = [];
    const errors = [];
    
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      for (let i = 0; i < credenciales.length; i++) {
        try {
          const credencial = credenciales[i];
          const qrImage = qrImages.find(qr => qr.credencial_id === credencial.id_credencial);
          
          if (!qrImage) {
            throw new Error('QR image not found');
          }
          
          const page = await browser.newPage();
          const htmlContent = await this.compileTemplate(plantilla, credencial, qrImage.qr_image);
          
          await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
          await page.waitForTimeout(500);
          
          const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
          });
          
          await page.close();
          
          results.push({
            credencial_id: credencial.id_credencial,
            codigo_unico: credencial.codigo_unico,
            pdf_buffer: pdfBuffer,
            filename: `credencial_${credencial.codigo_unico}.pdf`
          });
        } catch (error) {
          errors.push({
            credencial_id: credenciales[i].id_credencial,
            codigo_unico: credenciales[i].codigo_unico,
            error: error.message
          });
        }
      }
    } catch (error) {
      throw new Error(`Error in batch PDF generation: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    
    return {
      success: results,
      errors: errors,
      total_processed: credenciales.length,
      success_count: results.length,
      error_count: errors.length
    };
  }
  
  /**
   * Generar PDF de múltiples credenciales en una página
   */
  static async generateMultiCredentialPDF(credenciales, plantilla, qrImages, options = {}) {
    const {
      credencialesPorPagina = 6,
      orientacion = 'portrait',
      formato = 'A4'
    } = options;
    
    try {
      let htmlContent = this.getMultiCredentialHTML();
      
      // Procesar credenciales en grupos
      const grupos = this.chunkArray(credenciales, credencialesPorPagina);
      
      for (const grupo of grupos) {
        let paginaHTML = '<div class="pagina">';
        
        for (const credencial of grupo) {
          const qrImage = qrImages.find(qr => qr.credencial_id === credencial.id_credencial);
          if (qrImage) {
            const credencialHTML = await this.compileTemplate(plantilla, credencial, qrImage.qr_image);
            paginaHTML += `<div class="credencial-container">${credencialHTML}</div>`;
          }
        }
        
        paginaHTML += '</div>';
        htmlContent += paginaHTML;
      }
      
      htmlContent += '</body></html>';
      
      const pdfOptions = {
        format: formato,
        landscape: orientacion === 'landscape',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
      };
      
      const pdfBuffer = await this.htmlToPDF(htmlContent, pdfOptions);
      
      return {
        buffer: pdfBuffer,
        mimeType: 'application/pdf',
        filename: `credenciales_lote_${Date.now()}.pdf`
      };
    } catch (error) {
      throw new Error(`Error generating multi-credential PDF: ${error.message}`);
    }
  }
  
  /**
   * HTML base para múltiples credenciales
   */
  static getMultiCredentialHTML() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { margin: 10mm; }
          body { margin: 0; font-family: Arial, sans-serif; }
          .pagina { 
            display: flex; 
            flex-wrap: wrap; 
            justify-content: space-around;
            align-content: flex-start;
            min-height: 100vh;
            page-break-after: always;
          }
          .pagina:last-child { page-break-after: avoid; }
          .credencial-container { 
            width: 48%; 
            height: 32%; 
            margin-bottom: 10px; 
            border: 1px dashed #ccc;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
    `;
  }
  
  /**
   * Utilidad para dividir array en chunks
   */
  static chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  /**
   * Formatear fecha
   */
  static formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Generar PDF de reporte de credenciales
   */
  static async generateCredentialReport(evento, credenciales, estadisticas) {
    try {
      const template = handlebars.compile(this.getReportTemplate());
      const htmlContent = template({
        evento,
        credenciales,
        estadisticas,
        fechaGeneracion: this.formatDate(new Date()),
        totalCredenciales: credenciales.length
      });
      
      const pdfBuffer = await this.htmlToPDF(htmlContent, {
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
      });
      
      return {
        buffer: pdfBuffer,
        mimeType: 'application/pdf',
        filename: `reporte_credenciales_${evento.id_evento}_${Date.now()}.pdf`
      };
    } catch (error) {
      throw new Error(`Error generating credential report: ${error.message}`);
    }
  }
  
  /**
   * Template para reporte de credenciales
   */
  static getReportTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-card { text-align: center; padding: 15px; background: #f5f5f5; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Credenciales</h1>
          <h2>{{evento.nombre_evento}}</h2>
          <p>Generado el: {{fechaGeneracion}}</p>
        </div>
        
        <div class="stats">
          <div class="stat-card">
            <h3>{{totalCredenciales}}</h3>
            <p>Total Credenciales</p>
          </div>
          {{#each estadisticas}}
          <div class="stat-card">
            <h3>{{this.total}}</h3>
            <p>{{this.tipo}}</p>
          </div>
          {{/each}}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha Emisión</th>
            </tr>
          </thead>
          <tbody>
            {{#each credenciales}}
            <tr>
              <td>{{this.codigo_unico}}</td>
              <td>{{this.nombre_completo}}</td>
              <td>{{this.tipoCredencial.nombre_tipo}}</td>
              <td>{{this.estado}}</td>
              <td>{{formatDate this.fecha_emision}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}

module.exports = PDFGeneratorService;