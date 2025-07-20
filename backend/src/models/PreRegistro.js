module.exports = (sequelize, DataTypes) => {
const PreRegistro = sequelize.define('PreRegistro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Relaciones
  evento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'evento',
      key: 'id_evento'
    }
  },
  
  registro_principal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'pre_registros',
      key: 'id'
    },
    comment: 'Para registros grupales, referencia al registro principal'
  },
  
  // Identificadores únicos
  codigo_registro: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Código único para identificar el registro'
  },
  
  // Datos personales
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  documento_identidad: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  
  tipo_documento: {
    type: DataTypes.ENUM('cedula', 'pasaporte', 'ruc', 'otro'),
    allowNull: false,
    defaultValue: 'cedula'
  },
  
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  
  genero: {
    type: DataTypes.ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir'),
    allowNull: true
  },
  
  // Datos profesionales
  empresa: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  cargo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  
  sector_empresa: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  anos_experiencia: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  
  // Datos del evento
  tipo_participacion: {
    type: DataTypes.ENUM('visitante', 'profesional', 'estudiante', 'vip', 'prensa', 'ponente', 'organizador'),
    allowNull: false,
    defaultValue: 'visitante'
  },
  
  intereses: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array de áreas de interés del participante'
  },
  
  expectativas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  como_se_entero: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // Datos adicionales
  necesidades_especiales: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  comentarios: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Términos y condiciones
  acepta_terminos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  acepta_marketing: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  // Estado del registro
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmado', 'pendiente_pago', 'pagado', 'cancelado', 'presente', 'no_asistio'),
    allowNull: false,
    defaultValue: 'pendiente'
  },
  
  motivo_cancelacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Códigos QR y acceso
  codigo_qr: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Datos del código QR en base64'
  },
  
  url_qr: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL pública del código QR'
  },
  
  codigo_acceso: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Código alternativo de acceso'
  },
  
  // Fechas importantes
  fecha_registro: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  fecha_confirmacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  fecha_pago: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  fecha_check_in: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // Datos de pago
  monto_pagado: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  
  metodo_pago: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  referencia_pago: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // Registro grupal
  es_registro_grupal: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  
  numero_participantes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  
  // Metadatos de registro
  ip_registro: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  fuente_registro: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'web',
    comment: 'web, mobile_app, admin, api, etc.'
  },
  
  // Preferencias de comunicación
  idioma_preferido: {
    type: DataTypes.STRING(5),
    allowNull: true,
    defaultValue: 'es'
  },
  
  zona_horaria: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  
  // Estadísticas de participación
  numero_eventos_anteriores: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  
  puntuacion_participacion: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    comment: 'Puntuación basada en participación en eventos anteriores'
  },
  
  // Campos de auditoría
  creado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  
  actualizado_por: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  
  // Timestamps
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'pre_registros',
  paranoid: true, // Soft delete
  timestamps: true,
  
  indexes: [
    {
      fields: ['evento_id']
    },
    {
      fields: ['codigo_registro'],
      unique: true
    },
    {
      fields: ['email', 'evento_id']
    },
    {
      fields: ['documento_identidad', 'evento_id']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['tipo_participacion']
    },
    {
      fields: ['fecha_registro']
    },
    {
      fields: ['registro_principal_id']
    },
    {
      fields: ['es_registro_grupal']
    }
  ],
  
  validate: {
    // Validar que si acepta términos, el valor sea true
    aceptaTerminos() {
      if (this.acepta_terminos !== true) {
        throw new Error('Debe aceptar los términos y condiciones');
      }
    },
    
    // Validar email único por evento (solo para registros activos)
    async emailUnicoEnEvento() {
      if (this.estado !== 'cancelado') {
        const existeOtro = await PreRegistro.findOne({
          where: {
            evento_id: this.evento_id,
            email: this.email,
            estado: { [require('sequelize').Op.ne]: 'cancelado' },
            id: { [require('sequelize').Op.ne]: this.id || 0 }
          }
        });
        
        if (existeOtro) {
          throw new Error('Ya existe un registro con este email para este evento');
        }
      }
    }
  },
  
  hooks: {
    beforeCreate: async (preRegistro) => {
      // Generar código de registro si no existe
      if (!preRegistro.codigo_registro) {
        preRegistro.codigo_registro = await PreRegistro.generarCodigoUnico();
      }
      
      // Normalizar email
      if (preRegistro.email) {
        preRegistro.email = preRegistro.email.toLowerCase().trim();
      }
      
      // Establecer fecha de confirmación si el estado es confirmado
      if (preRegistro.estado === 'confirmado' && !preRegistro.fecha_confirmacion) {
        preRegistro.fecha_confirmacion = new Date();
      }
    },
    
    beforeUpdate: async (preRegistro) => {
      // Actualizar fecha de confirmación
      if (preRegistro.changed('estado') && preRegistro.estado === 'confirmado') {
        preRegistro.fecha_confirmacion = new Date();
      }
      
      // Actualizar fecha de pago
      if (preRegistro.changed('estado') && preRegistro.estado === 'pagado') {
        preRegistro.fecha_pago = new Date();
      }
      
      // Actualizar fecha de check-in
      if (preRegistro.changed('estado') && preRegistro.estado === 'presente') {
        preRegistro.fecha_check_in = new Date();
      }
      
      preRegistro.fecha_actualizacion = new Date();
    }
  }
});

// Métodos estáticos
PreRegistro.generarCodigoUnico = async function() {
  let codigo;
  let existe = true;
  
  while (existe) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    codigo = `REG-${timestamp}-${random}`.toUpperCase();
    
    const existente = await PreRegistro.findOne({
      where: { codigo_registro: codigo }
    });
    
    existe = !!existente;
  }
  
  return codigo;
};

// Métodos de instancia
PreRegistro.prototype.toJSON = function() {
  const values = { ...this.dataValues };
  
  // No incluir datos sensibles en respuestas JSON
  delete values.ip_registro;
  delete values.user_agent;
  
  return values;
};

PreRegistro.prototype.esValido = function() {
  return this.estado !== 'cancelado' && this.acepta_terminos;
};

PreRegistro.prototype.puedeAcceder = function() {
  return ['confirmado', 'pagado', 'presente'].includes(this.estado);
};

PreRegistro.prototype.requierePago = function() {
  const tiposConPago = ['profesional', 'vip'];
  return tiposConPago.includes(this.tipo_participacion) && this.estado !== 'pagado';
};

PreRegistro.prototype.obtenerNombreCompleto = function() {
  return `${this.nombre} ${this.apellidos}`.trim();
};

// Asociaciones
PreRegistro.associate = function(models) {
  // Relación con Evento
  PreRegistro.belongsTo(models.Evento, {
    foreignKey: 'evento_id',
    as: 'evento'
  });

  // Relación con Usuario (creado por)
  PreRegistro.belongsTo(models.Usuario, {
    foreignKey: 'creado_por',
    as: 'creadoPor'
  });

  // Relación con Usuario (actualizado por)
  PreRegistro.belongsTo(models.Usuario, {
    foreignKey: 'actualizado_por',
    as: 'actualizadoPor'
  });

  // Auto-relación para registros grupales
  PreRegistro.belongsTo(models.PreRegistro, {
    foreignKey: 'registro_principal_id',
    as: 'registroPrincipal'
  });

  PreRegistro.hasMany(models.PreRegistro, {
    foreignKey: 'registro_principal_id',
    as: 'participantesAdicionales'
  });
};

return PreRegistro;
};