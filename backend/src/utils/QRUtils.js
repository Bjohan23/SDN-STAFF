const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class QRUtils {

  /**
   * Configuración de encriptación
   */
  static get ENCRYPTION_CONFIG() {
    return {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
      tagLength: 16
    };
  }

  /**
   * Generar clave de encriptación desde password
   */
  static generateEncryptionKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, this.ENCRYPTION_CONFIG.keyLength, 'sha256');
  }

  /**
   * Encriptar datos para QR
   */
  static encryptQRData(data, secretKey = null) {
    try {
      const key = secretKey || process.env.QR_ENCRYPTION_KEY || 'default-qr-key-2024';
      const salt = crypto.randomBytes(16);
      const encryptionKey = this.generateEncryptionKey(key, salt);
      const iv = crypto.randomBytes(this.ENCRYPTION_CONFIG.ivLength);
      
      const cipher = crypto.createCipher(this.ENCRYPTION_CONFIG.algorithm, encryptionKey, iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combinar todos los componentes
      const result = {
        data: encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: authTag.toString('hex')
      };
      
      return Buffer.from(JSON.stringify(result)).toString('base64');
      
    } catch (error) {
      throw new Error(`Error al encriptar datos QR: ${error.message}`);
    }
  }

  /**
   * Desencriptar datos de QR
   */
  static decryptQRData(encryptedData, secretKey = null) {
    try {
      const key = secretKey || process.env.QR_ENCRYPTION_KEY || 'default-qr-key-2024';
      const parsedData = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
      
      const salt = Buffer.from(parsedData.salt, 'hex');
      const iv = Buffer.from(parsedData.iv, 'hex');
      const authTag = Buffer.from(parsedData.tag, 'hex');
      const encryptionKey = this.generateEncryptionKey(key, salt);
      
      const decipher = crypto.createDecipher(this.ENCRYPTION_CONFIG.algorithm, encryptionKey, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(parsedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
      
    } catch (error) {
      throw new Error(`Error al desencriptar datos QR: ${error.message}`);
    }
  }

  /**
   * Generar hash único para QR
   */
  static generateQRHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Validar estructura de datos QR
   */
  static validateQRStructure(qrData) {
    try {
      if (!qrData || typeof qrData !== 'string') {
        return { valid: false, error: 'Datos QR inválidos' };
      }

      // Intentar decodificar base64
      const decoded = Buffer.from(qrData, 'base64').toString('utf8');
      const parsed = JSON.parse(decoded);

      // Verificar campos requeridos
      const requiredFields = ['data', 'iv', 'salt', 'tag'];
      for (const field of requiredFields) {
        if (!parsed[field]) {
          return { valid: false, error: `Campo requerido faltante: ${field}` };
        }
      }

      return { valid: true };

    } catch (error) {
      return { valid: false, error: 'Estructura QR inválida' };
    }
  }

  /**
   * Generar ID único para QR
   */
  static generateQRId() {
    return uuidv4();
  }

  /**
   * Crear payload para QR
   */
  static createQRPayload(credencialData, options = {}) {
    const qrId = this.generateQRId();
    const timestamp = Date.now();

    const payload = {
      id: qrId,
      cred: credencialData.codigo_unico,
      evt: credencialData.id_evento,
      exp: credencialData.fecha_expiracion ? new Date(credencialData.fecha_expiracion).getTime() : null,
      ts: timestamp,
      v: '1.0' // versión del formato
    };

    // Agregar datos opcionales
    if (options.includePersonalData) {
      payload.name = credencialData.nombre_completo;
      payload.email = credencialData.email;
    }

    if (options.includeAccessLevel) {
      payload.access = credencialData.TipoCredencial?.nivel_acceso;
    }

    return payload;
  }

  /**
   * Validar payload de QR
   */
  static validateQRPayload(payload) {
    const errors = [];

    if (!payload.id) errors.push('ID faltante');
    if (!payload.cred) errors.push('Código de credencial faltante');
    if (!payload.evt) errors.push('ID de evento faltante');
    if (!payload.ts) errors.push('Timestamp faltante');

    // Validar expiración
    if (payload.exp && payload.exp < Date.now()) {
      errors.push('QR expirado');
    }

    // Validar timestamp (no debe ser muy antiguo ni futuro)
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 días
    const maxFuture = 24 * 60 * 60 * 1000; // 24 horas

    if (payload.ts < (now - maxAge)) {
      errors.push('QR demasiado antiguo');
    }

    if (payload.ts > (now + maxFuture)) {
      errors.push('QR tiene timestamp futuro');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Generar checksum para validación de integridad
   */
  static generateChecksum(data) {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex').substring(0, 8);
  }

  /**
   * Verificar checksum
   */
  static verifyChecksum(data, checksum) {
    return this.generateChecksum(data) === checksum;
  }

  /**
   * Detectar intentos de falsificación
   */
  static detectFraudAttempt(qrData, validationHistory = []) {
    const indicators = [];

    // Verificar si el mismo QR se ha usado muchas veces
    const sameQRUsage = validationHistory.filter(v => v.qr_data === qrData).length;
    if (sameQRUsage > 100) {
      indicators.push({
        type: 'excessive_usage',
        severity: 'high',
        message: `QR usado ${sameQRUsage} veces`
      });
    }

    // Verificar validaciones muy rápidas
    const recentValidations = validationHistory
      .filter(v => (Date.now() - new Date(v.fecha_validacion).getTime()) < 60000) // Último minuto
      .length;

    if (recentValidations > 10) {
      indicators.push({
        type: 'rapid_validation',
        severity: 'medium',
        message: `${recentValidations} validaciones en el último minuto`
      });
    }

    return {
      isSuspicious: indicators.length > 0,
      indicators: indicators,
      riskLevel: this.calculateRiskLevel(indicators)
    };
  }

  /**
   * Calcular nivel de riesgo
   */
  static calculateRiskLevel(indicators) {
    if (!indicators.length) return 'low';

    const highSeverityCount = indicators.filter(i => i.severity === 'high').length;
    const mediumSeverityCount = indicators.filter(i => i.severity === 'medium').length;

    if (highSeverityCount > 0) return 'high';
    if (mediumSeverityCount > 2) return 'medium';
    if (mediumSeverityCount > 0) return 'medium';

    return 'low';
  }

  /**
   * Generar datos para QR con configuración personalizada
   */
  static generateSecureQRData(credencialData, options = {}) {
    const payload = this.createQRPayload(credencialData, options);
    
    // Validar payload
    const validation = this.validateQRPayload(payload);
    if (!validation.valid) {
      throw new Error(`Payload inválido: ${validation.errors.join(', ')}`);
    }

    // Agregar checksum
    payload.chk = this.generateChecksum(payload);

    // Encriptar
    const encryptedData = this.encryptQRData(payload, options.encryptionKey);
    const qrHash = this.generateQRHash(encryptedData);

    return {
      qr_data: encryptedData,
      qr_hash: qrHash,
      qr_id: payload.id,
      version: payload.v
    };
  }

  /**
   * Validar y decodificar QR completo
   */
  static validateAndDecodeQR(qrData, options = {}) {
    try {
      // Validar estructura
      const structureValidation = this.validateQRStructure(qrData);
      if (!structureValidation.valid) {
        return { valid: false, error: structureValidation.error };
      }

      // Desencriptar
      const payload = this.decryptQRData(qrData, options.encryptionKey);

      // Validar checksum
      const checksum = payload.chk;
      delete payload.chk;
      
      if (!this.verifyChecksum(payload, checksum)) {
        return { valid: false, error: 'Checksum inválido - posible manipulación' };
      }

      // Validar payload
      const payloadValidation = this.validateQRPayload(payload);
      if (!payloadValidation.valid) {
        return { 
          valid: false, 
          error: `Payload inválido: ${payloadValidation.errors.join(', ')}` 
        };
      }

      // Detectar fraude
      const fraudDetection = this.detectFraudAttempt(qrData, options.validationHistory);

      return {
        valid: true,
        payload: payload,
        fraud_indicators: fraudDetection.indicators,
        risk_level: fraudDetection.riskLevel,
        is_suspicious: fraudDetection.isSuspicious
      };

    } catch (error) {
      return { 
        valid: false, 
        error: `Error al validar QR: ${error.message}` 
      };
    }
  }

  /**
   * Generar configuración de QR para diferentes tipos
   */
  static getQRConfigForType(tipoCredencial) {
    const configs = {
      'visitante': {
        includePersonalData: false,
        includeAccessLevel: true,
        errorCorrectionLevel: 'M'
      },
      'expositor': {
        includePersonalData: true,
        includeAccessLevel: true,
        errorCorrectionLevel: 'H'
      },
      'personal': {
        includePersonalData: true,
        includeAccessLevel: true,
        errorCorrectionLevel: 'H'
      },
      'prensa': {
        includePersonalData: true,
        includeAccessLevel: true,
        errorCorrectionLevel: 'M'
      },
      'vip': {
        includePersonalData: true,
        includeAccessLevel: true,
        errorCorrectionLevel: 'H'
      }
    };

    return configs[tipoCredencial.toLowerCase()] || configs['visitante'];
  }
}

module.exports = QRUtils;