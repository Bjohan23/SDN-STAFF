const fs = require('fs').promises;
const path = require('path');

class PDFUtils {

  /**
   * Configuración por defecto para PDFs
   */
  static get DEFAULT_CONFIG() {
    return {
      format: 'A4',
      border: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      quality: 100,
      dpi: 300,
      timeout: 30000
    };
  }

  /**
   * Configuraciones específicas por tipo de credencial
   */
  static getConfigForType(tipoCredencial) {
    const configs = {
      'visitante': {
        ...this.DEFAULT_CONFIG,
        width: '85.60mm',   // Tamaño tarjeta de crédito
        height: '53.98mm',
        border: '2mm'
      },
      'expositor': {
        ...this.DEFAULT_CONFIG,
        width: '100mm',
        height: '150mm',
        border: '3mm'
      },
      'personal': {
        ...this.DEFAULT_CONFIG,
        width: '100mm',
        height: '150mm',
        border: '3mm'
      },
      'prensa': {
        ...this.DEFAULT_CONFIG,
        width: '100mm',
        height: '150mm',
        border: '3mm'
      },
      'vip': {
        ...this.DEFAULT_CONFIG,
        width: '100mm',
        height: '150mm',
        border: '3mm',
        quality: 150
      }
    };

    return configs[tipoCredencial.toLowerCase()] || configs['visitante'];
  }

  /**
   * Generar CSS base para credenciales
   */
  static generateBaseCSS() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      .credencial {
        width: 100%;
        height: 100%;
        font-family: 'Arial', sans-serif;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        overflow: hidden;
        position: relative;
      }
      
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px;
        text-align: center;
        font-weight: bold;
      }
      
      .content {
        padding: 15px;
        height: calc(100% - 80px);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      
      .foto {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: 3px solid #ddd;
        object-fit: cover;
        margin: 0 auto 10px;
      }
      
      .nombre {
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 5px;
        color: #333;
      }
      
      .empresa {
        font-size: 12px;
        text-align: center;
        color: #666;
        margin-bottom: 10px;
      }
      
      .qr-code {
        text-align: center;
        margin: 10px 0;
      }
      
      .qr-code img {
        width: 80px;
        height: 80px;
      }
      
      .codigo {
        font-size: 10px;
        text-align: center;
        color: #999;
        font-family: monospace;
        margin-top: 5px;
      }
      
      .footer {
        background: #f8f9fa;
        padding: 8px;
        text-align: center;
        font-size: 10px;
        color: #666;
        border-top: 1px solid #e9ecef;
      }
      
      .nivel-acceso {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(255,255,255,0.9);
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: bold;
      }
      
      .nivel-acceso.basico { color: #28a745; }
      .nivel-acceso.intermedio { color: #ffc107; }
      .nivel-acceso.avanzado { color: #fd7e14; }
      .nivel-acceso.total { color: #dc3545; }
      
      @media print {
        .credencial {
          box-shadow: none;
          border: 1px solid #ddd;
        }
      }
    `;
  }

  /**
   * Generar template HTML base
   */
  static generateBaseTemplate() {
    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Credencial - {{nombre_evento}}</title>
        <style>{{css_styles}}</style>
      </head>
      <body>
        <div class="credencial">
          <div class="header">
            <div class="evento-nombre">{{nombre_evento}}</div>
            <div class="tipo-credencial">{{tipo_credencial}}</div>
          </div>
          
          <div class="nivel-acceso {{nivel_acceso}}">
            {{nivel_acceso_text}}
          </div>
          
          <div class="content">
            <div class="info-personal">
              {{#if foto_url}}
              <img src="{{foto_url}}" alt="Foto" class="foto">
              {{/if}}
              
              <div class="nombre">{{nombre_completo}}</div>
              
              {{#if empresa_organizacion}}
              <div class="empresa">{{empresa_organizacion}}</div>
              {{/if}}
              
              {{#if cargo_titulo}}
              <div class="cargo">{{cargo_titulo}}</div>
              {{/if}}
            </div>
            
            <div class="qr-code">
              <img src="{{qr_image_url}}" alt="Código QR">
              <div class="codigo">{{codigo_unico}}</div>
            </div>
          </div>
          
          <div class="footer">
            <div>Válida hasta: {{fecha_validez}}</div>
            <div>Emitida: {{fecha_emision}}</div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Procesar template con datos
   */
  static processTemplate(template, data) {
    let processed = template;

    // Reemplazar variables simples
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value || '');
    }

    // Procesar condicionales {{#if variable}}
    processed = processed.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
      return data[variable] ? content : '';
    });

    // Procesar condicionales {{#unless variable}}
    processed = processed.replace(/{{#unless\s+(\w+)}}([\s\S]*?){{\/unless}}/g, (match, variable, content) => {
      return !data[variable] ? content : '';
    });

    return processed;
  }

  /**
   * Optimizar CSS para impresión
   */
  static optimizeCSSForPrint(css) {
    const printOptimizations = `
      @page {
        margin: 0;
        size: A4;
      }
      
      body {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      
      .credencial {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      @media print {
        * {
          -webkit-print-color-adjust: exact;
        }
      }
    `;

    return css + printOptimizations;
  }

  /**
   * Validar template HTML
   */
  static validateTemplate(html) {
    const errors = [];
    const warnings = [];

    // Verificar estructura básica
    if (!html.includes('<html')) {
      errors.push('Template debe contener etiqueta <html>');
    }

    if (!html.includes('<head>')) {
      warnings.push('Se recomienda incluir etiqueta <head>');
    }

    if (!html.includes('<body>')) {
      errors.push('Template debe contener etiqueta <body>');
    }

    // Verificar variables requeridas
    const requiredVariables = ['nombre_completo', 'codigo_unico', 'qr_image_url'];
    requiredVariables.forEach(variable => {
      if (!html.includes(`{{${variable}}}`)) {
        warnings.push(`Variable recomendada faltante: {{${variable}}}`);
      }
    });

    // Verificar etiquetas de cierre
    const openTags = html.match(/<\w+[^>]*>/g) || [];
    const closeTags = html.match(/<\/\w+>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      warnings.push('Posible problema con etiquetas sin cerrar');
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings
    };
  }

  /**
   * Generar configuración de Puppeteer
   */
  static generatePuppeteerConfig(options = {}) {
    const config = {
      ...this.DEFAULT_CONFIG,
      ...options
    };

    return {
      format: config.format,
      margin: config.border,
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      landscape: config.landscape || false
    };
  }

  /**
   * Optimizar imagen para credencial
   */
  static async optimizeImageForCredential(imagePath, outputPath, options = {}) {
    const defaultOptions = {
      width: 200,
      height: 200,
      quality: 85,
      format: 'jpeg'
    };

    const opts = { ...defaultOptions, ...options };

    try {
      // Aquí se podría implementar optimización de imagen
      // usando una librería como sharp o jimp
      return {
        success: true,
        path: outputPath,
        originalSize: 0,
        optimizedSize: 0
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generar marca de agua para PDF
   */
  static generateWatermarkCSS(texto = 'CONFIDENCIAL', opacity = 0.1) {
    return `
      .watermark {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 4em;
        color: rgba(0,0,0,${opacity});
        z-index: -1;
        pointer-events: none;
        user-select: none;
        font-weight: bold;
        text-transform: uppercase;
      }
    `;
  }

  /**
   * Crear template de emergencia
   */
  static generateEmergencyTemplate(data) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .emergency-credential { 
            border: 2px solid red; 
            padding: 20px; 
            text-align: center;
            background: #fff9c4;
          }
          .warning { color: red; font-weight: bold; margin-bottom: 10px; }
          .info { margin: 10px 0; }
          .qr { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="emergency-credential">
          <div class="warning">CREDENCIAL DE EMERGENCIA</div>
          <div class="info"><strong>Nombre:</strong> ${data.nombre_completo}</div>
          <div class="info"><strong>Evento:</strong> ${data.nombre_evento}</div>
          <div class="info"><strong>Código:</strong> ${data.codigo_unico}</div>
          <div class="qr">
            <img src="${data.qr_image_url}" alt="QR Code" style="width: 100px; height: 100px;">
          </div>
          <div class="info">Esta es una credencial temporal generada por el sistema</div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Calcular dimensiones óptimas
   */
  static calculateOptimalDimensions(tipoCredencial, contenido) {
    const baseDimensions = this.getConfigForType(tipoCredencial);
    
    // Ajustar según contenido
    if (contenido.incluye_foto && contenido.incluye_qr) {
      baseDimensions.height = parseInt(baseDimensions.height) * 1.2 + 'mm';
    }

    if (contenido.texto_largo) {
      baseDimensions.width = parseInt(baseDimensions.width) * 1.1 + 'mm';
    }

    return baseDimensions;
  }

  /**
   * Generar metadata para PDF
   */
  static generatePDFMetadata(credencial, evento) {
    return {
      title: `Credencial - ${credencial.nombre_completo}`,
      author: `Sistema SDN-STAFF`,
      subject: `Credencial para evento: ${evento.nombre_evento}`,
      keywords: `credencial,evento,${evento.id_evento},${credencial.codigo_unico}`,
      creator: 'SDN-STAFF System',
      producer: 'PDFUtils v1.0',
      creationDate: new Date(),
      modDate: new Date()
    };
  }
}

module.exports = PDFUtils;