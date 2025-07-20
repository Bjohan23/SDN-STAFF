module.exports = (sequelize, DataTypes) => {
  const Credencial = sequelize.define('Credencial', {
  id_credencial: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  codigo_unico: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Código único alfanumérico para identificar la credencial'
  },
  id_evento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'evento',
      key: 'id_evento'
    },
    comment: 'Evento al que pertenece la credencial'
  },
  id_tipo_credencial: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tipo_credencial',
      key: 'id_tipo_credencial'
    },
    comment: 'Tipo de credencial'
  },
  id_plantilla: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'plantilla_credencial',
      key: 'id_plantilla'
    },
    comment: 'Plantilla utilizada para generar la credencial'
  },
  // Información del portador
  nombre_completo: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Nombre completo del portador de la credencial'
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    validate: {
      isEmail: true
    },
    comment: 'Email del portador'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Teléfono de contacto'
  },
  documento_identidad: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Documento de identidad (DNI, pasaporte, etc.)'
  },
  empresa_organizacion: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: 'Empresa u organización a la que pertenece'
  },
  cargo_titulo: {
    type: DataTypes.STRING(150),
    allowNull: true,
    comment: 'Cargo o título profesional'
  },
  // Datos específicos
  id_empresa_expositora: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'empresa_expositora',
      key: 'id_empresa'
    },
    comment: 'Si es expositor, referencia a la empresa expositora'
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    },
    comment: 'Si es usuario del sistema, referencia al usuario'
  },
  // Control de validez
  fecha_emision: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Fecha y hora de emisión de la credencial'
  },
  fecha_activacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha desde la cual la credencial es válida'
  },
  fecha_expiracion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha hasta la cual la credencial es válida'
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'activa', 'suspendida', 'revocada', 'expirada'),
    allowNull: false,
    defaultValue: 'pendiente',
    comment: 'Estado actual de la credencial'
  },
  // Datos del QR
  qr_data: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Datos codificados en el QR (JSON encriptado)'
  },
  qr_hash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: 'Hash SHA-256 único del QR para validación'
  },
  // Control de accesos
  total_validaciones: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Número total de veces que se ha validado'
  },
  ultima_validacion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha y hora de la última validación'
  },
  limite_validaciones: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Límite máximo de validaciones (null = sin límite)'
  },
  // Archivos generados
  archivo_pdf_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Ruta del archivo PDF generado'
  },
  imagen_credencial_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Ruta de la imagen de la credencial'
  },
  // Metadatos
  datos_adicionales: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Datos adicionales específicos del evento o tipo'
  },
  configuracion_accesos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuración específica de accesos para esta credencial'
  },
  notas_internas: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas internas para el personal'
  },
  // Control de reimpresión
  total_reimpresiones: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Número de veces que se ha reimpreso'
  },
  ultima_reimpresion: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Fecha de la última reimpresión'
  },
  // Campos de auditoría
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  deleted_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'credencial',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['codigo_unico']
    },
    {
      unique: true,
      fields: ['qr_hash']
    },
    {
      fields: ['id_evento']
    },
    {
      fields: ['id_tipo_credencial']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['email']
    },
    {
      fields: ['documento_identidad']
    },
    {
      fields: ['fecha_emision']
    },
    {
      fields: ['fecha_expiracion']
    }
  ]
});

// Métodos de instancia
Credencial.prototype.isDeleted = function() {
  return this.deleted_at !== null;
};

Credencial.prototype.softDelete = async function(userId = null) {
  this.deleted_at = new Date();
  this.deleted_by = userId;
  this.estado = 'revocada';
  return await this.save();
};

Credencial.prototype.isValida = function() {
  if (this.estado !== 'activa') return false;
  
  const ahora = new Date();
  
  // Verificar fecha de activación
  if (this.fecha_activacion && ahora < this.fecha_activacion) return false;
  
  // Verificar fecha de expiración
  if (this.fecha_expiracion && ahora > this.fecha_expiracion) return false;
  
  // Verificar límite de validaciones
  if (this.limite_validaciones && this.total_validaciones >= this.limite_validaciones) return false;
  
  return true;
};

Credencial.prototype.registrarValidacion = async function() {
  this.total_validaciones += 1;
  this.ultima_validacion = new Date();
  return await this.save();
};

Credencial.prototype.revocar = async function(userId = null) {
  this.estado = 'revocada';
  this.updated_by = userId;
  return await this.save();
};

Credencial.prototype.suspender = async function(userId = null) {
  this.estado = 'suspendida';
  this.updated_by = userId;
  return await this.save();
};

Credencial.prototype.activar = async function(userId = null) {
  this.estado = 'activa';
  this.updated_by = userId;
  return await this.save();
};

  return Credencial;
};