const QRCode = require('qrcode');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class QRGeneratorService {
  
  /**
   * Generar datos seguros para el QR de una credencial
   */
  static generateSecureQRData(credencialData) {
    // Crear un identificador único para este QR
    const qrId = uuidv4();
    const timestamp = Date.now();
    
    // Datos principales que irán en el QR
    const qrPayload = {
      id: qrId,
      cred: credencialData.codigo_unico,
      event: credencialData.id_evento,
      type: credencialData.id_tipo_credencial,
      issued: timestamp,
      name: credencialData.nombre_completo,
      // Hash para verificación de integridad
      checksum: this.generateChecksum(credencialData, qrId, timestamp)
    };
    
    // Encriptar los datos
    const encryptedData = this.encryptQRData(qrPayload);
    
    // Generar hash único para validación rápida
    const qrHash = this.generateQRHash(encryptedData);
    
    return {
      qr_data: encryptedData,
      qr_hash: qrHash,
      qr_id: qrId
    };
  }
  
  /**
   * Generar checksum para verificación de integridad
   */
  static generateChecksum(credencialData, qrId, timestamp) {
    const dataString = `${credencialData.codigo_unico}|${credencialData.id_evento}|${qrId}|${timestamp}`;
    return crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
  }
  
  /**
   * Encriptar datos del QR
   */
  static encryptQRData(data) {
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.QR_ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('qr-data'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combinar IV, authTag y datos encriptados
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  /**
   * Desencriptar datos del QR
   */
  static decryptQRData(encryptedData) {
    try {
      const algorithm = 'aes-256-gcm';
      const key = crypto.scryptSync(process.env.QR_ENCRYPTION_KEY || 'default-key-change-in-production', 'salt', 32);
      
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      
      const decipher = crypto.createDecipher(algorithm, key);
      decipher.setAAD(Buffer.from('qr-data'));
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('Invalid QR data');
    }
  }
  
  /**
   * Generar hash único del QR para identificación rápida
   */
  static generateQRHash(qrData) {
    return crypto.createHash('sha256').update(qrData).digest('hex');
  }
  
  /**
   * Generar imagen QR en diferentes formatos
   */
  static async generateQRImage(qrData, options = {}) {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    };
    
    const qrOptions = { ...defaultOptions, ...options };
    
    try {
      // Generar como Data URL (base64)
      const qrDataURL = await QRCode.toDataURL(qrData, qrOptions);
      
      // Generar como Buffer para guardar archivo
      const qrBuffer = await QRCode.toBuffer(qrData, qrOptions);
      
      return {
        dataURL: qrDataURL,
        buffer: qrBuffer,
        mimeType: qrOptions.type
      };
    } catch (error) {
      throw new Error(`Error generating QR image: ${error.message}`);
    }
  }
  
  /**
   * Generar QR como SVG
   */
  static async generateQRSVG(qrData, options = {}) {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 200
    };
    
    const qrOptions = { ...defaultOptions, ...options };
    
    try {
      const qrSVG = await QRCode.toString(qrData, { format: 'svg', ...qrOptions });
      return qrSVG;
    } catch (error) {
      throw new Error(`Error generating QR SVG: ${error.message}`);
    }
  }
  
  /**
   * Validar estructura de datos QR
   */
  static validateQRStructure(qrData) {
    try {
      const decryptedData = this.decryptQRData(qrData);
      
      // Verificar campos obligatorios
      const requiredFields = ['id', 'cred', 'event', 'type', 'issued', 'checksum'];
      for (const field of requiredFields) {
        if (!decryptedData[field]) {
          return { valid: false, error: `Missing field: ${field}` };
        }
      }
      
      // Verificar que no sea muy antiguo (24 horas por defecto)
      const maxAge = process.env.QR_MAX_AGE_HOURS || 24;
      const ageInHours = (Date.now() - decryptedData.issued) / (1000 * 60 * 60);
      if (ageInHours > maxAge) {
        return { valid: false, error: 'QR code expired' };
      }
      
      return { valid: true, data: decryptedData };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
  
  /**
   * Generar QR personalizado para tipos específicos
   */
  static async generateCustomQR(tipo, data, options = {}) {
    let customOptions = { ...options };
    
    // Personalizar según el tipo de credencial
    switch (tipo) {
      case 'vip':
        customOptions.color = {
          dark: '#FFD700', // Dorado
          light: '#000000'
        };
        break;
      case 'prensa':
        customOptions.color = {
          dark: '#FF0000', // Rojo
          light: '#FFFFFF'
        };
        break;
      case 'expositor':
        customOptions.color = {
          dark: '#0066CC', // Azul
          light: '#FFFFFF'
        };
        break;
      case 'staff':
        customOptions.color = {
          dark: '#00AA00', // Verde
          light: '#FFFFFF'
        };
        break;
      default:
        // Mantener colores por defecto
        break;
    }
    
    return await this.generateQRImage(data, customOptions);
  }
  
  /**
   * Generar QR con logo embebido
   */
  static async generateQRWithLogo(qrData, logoPath, options = {}) {
    const Canvas = require('canvas');
    const fs = require('fs');
    
    try {
      // Generar QR base
      const qrImage = await this.generateQRImage(qrData, {
        ...options,
        margin: 2 // Más margen para el logo
      });
      
      // Cargar imagen del logo
      const logoBuffer = fs.readFileSync(logoPath);
      const logoImage = await Canvas.loadImage(logoBuffer);
      
      // Crear canvas
      const qrImg = await Canvas.loadImage(qrImage.buffer);
      const canvas = Canvas.createCanvas(qrImg.width, qrImg.height);
      const ctx = canvas.getContext('2d');
      
      // Dibujar QR
      ctx.drawImage(qrImg, 0, 0);
      
      // Calcular posición y tamaño del logo
      const logoSize = Math.min(qrImg.width, qrImg.height) * 0.2; // 20% del tamaño del QR
      const logoX = (qrImg.width - logoSize) / 2;
      const logoY = (qrImg.height - logoSize) / 2;
      
      // Dibujar fondo blanco para el logo
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
      
      // Dibujar logo
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      
      return {
        dataURL: canvas.toDataURL(),
        buffer: canvas.toBuffer('image/png'),
        mimeType: 'image/png'
      };
    } catch (error) {
      throw new Error(`Error generating QR with logo: ${error.message}`);
    }
  }
  
  /**
   * Generar múltiples QRs en lote
   */
  static async generateBatchQRs(credenciales, options = {}) {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < credenciales.length; i++) {
      try {
        const credencial = credenciales[i];
        const qrData = this.generateSecureQRData(credencial);
        const qrImage = await this.generateQRImage(qrData.qr_data, options);
        
        results.push({
          credencial_id: credencial.id_credencial,
          codigo_unico: credencial.codigo_unico,
          qr_data: qrData.qr_data,
          qr_hash: qrData.qr_hash,
          qr_image: qrImage,
          index: i
        });
      } catch (error) {
        errors.push({
          credencial_id: credenciales[i].id_credencial,
          codigo_unico: credenciales[i].codigo_unico,
          error: error.message,
          index: i
        });
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
}

module.exports = QRGeneratorService;