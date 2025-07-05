const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const SalaVirtual = sequelize.define('SalaVirtual', {
    id_sala_virtual: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Información básica
    nombre_sala: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la sala no puede estar vacío'
        },
        len: {
          args: [2, 120],
          msg: 'El nombre debe tener entre 2 y 120 caracteres'
        }
      }
    },
    codigo_sala: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: {
        name: 'unique_codigo_sala_virtual',
        msg: 'Este código ya está en uso'
      },
      comment: 'Código único identificativo de la sala'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 800],
          msg: 'La descripción no puede exceder 800 caracteres'
        }
      }
    },
    // Plataforma y configuración técnica
    plataforma: {
      type: DataTypes.ENUM(
        'zoom', 'teams', 'meet', 'webex', 'gotomeeting', 
        'jitsi', 'bigbluebutton', 'custom', 'youtube', 'twitch'
      ),
      allowNull: false,
      validate: {
        isIn: {
          args: [[
            'zoom', 'teams', 'meet', 'webex', 'gotomeeting', 
            'jitsi', 'bigbluebutton', 'custom', 'youtube', 'twitch'
          ]],
          msg: 'La plataforma debe ser válida'
        }
      }
    },
    url_acceso: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La URL de acceso es requerida'
        },
        isUrl: {
          msg: 'Debe ser una URL válida'
        }
      },
      comment: 'URL principal para acceder a la sala'
    },
    url_acceso_alternativa: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Debe ser una URL válida'
        }
      },
      comment: 'URL alternativa en caso de problemas'
    },
    // Credenciales y acceso
    meeting_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ID de la reunión/sala'
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Contraseña de acceso'
    },
    access_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Código de acceso adicional'
    },
    phone_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Número telefónico para acceso'
    },
    // Capacidades y límites
    capacidad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
      validate: {
        min: {
          args: 1,
          msg: 'La capacidad debe ser al menos 1'
        }
      }
    },
    permite_grabacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si permite grabar la sesión'
    },
    permite_streaming: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si permite transmisión en vivo'
    },
    permite_chat: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si tiene funcionalidad de chat'
    },
    permite_breakout_rooms: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si permite salas secundarias'
    },
    permite_compartir_pantalla: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si permite compartir pantalla'
    },
    permite_pizarra: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si tiene pizarra virtual'
    },
    // Configuración de moderación
    requiere_aprobacion_entrada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere aprobación para entrar'
    },
    sala_espera_habilitada: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si tiene sala de espera'
    },
    auto_admitir_participantes: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si admite automáticamente a los participantes'
    },
    moderador_principal: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Email del moderador principal'
    },
    co_hosts: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de co-hosts/moderadores'
    },
    // Estado y disponibilidad
    estado: {
      type: DataTypes.ENUM('disponible', 'ocupada', 'mantenimiento', 'inactiva'),
      defaultValue: 'disponible',
      validate: {
        isIn: {
          args: [['disponible', 'ocupada', 'mantenimiento', 'inactiva']],
          msg: 'El estado debe ser válido'
        }
      }
    },
    es_permanente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es una sala permanente o temporal'
    },
    fecha_expiracion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de expiración (para salas temporales)'
    },
    // Configuración de streaming
    streaming_key: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Clave para streaming en plataformas externas'
    },
    streaming_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de streaming en vivo'
    },
    plataformas_streaming: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Plataformas donde se transmite simultáneamente'
    },
    // Configuración técnica avanzada
    calidad_video: {
      type: DataTypes.ENUM('720p', '1080p', '4k', 'auto'),
      defaultValue: 'auto',
      validate: {
        isIn: {
          args: [['720p', '1080p', '4k', 'auto']],
          msg: 'La calidad de video debe ser válida'
        }
      }
    },
    codec_video: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Codec de video preferido'
    },
    bitrate_audio: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Bitrate de audio en kbps'
    },
    configuracion_tecnica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones técnicas específicas'
    },
    // Accesibilidad
    subtitulos_automaticos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si tiene subtítulos automáticos'
    },
    interpretacion_idiomas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuración de interpretación de idiomas'
    },
    soporte_dispositivos_moviles: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si soporta dispositivos móviles'
    },
    // Información del proveedor/licencia
    propietario_cuenta: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Propietario de la cuenta/licencia'
    },
    email_cuenta: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    tipo_licencia: {
      type: DataTypes.ENUM('gratuita', 'basica', 'profesional', 'empresarial', 'personalizada'),
      defaultValue: 'basica',
      validate: {
        isIn: {
          args: [['gratuita', 'basica', 'profesional', 'empresarial', 'personalizada']],
          msg: 'El tipo de licencia debe ser válido'
        }
      }
    },
    costo_por_hora: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo por hora de uso'
    },
    // Métricas y uso
    total_usos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número total de veces que se ha usado'
    },
    horas_uso_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de horas de uso acumuladas'
    },
    max_participantes_simultaneos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Máximo de participantes que ha tenido simultáneamente'
    },
    ultima_utilizacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Configuración adicional
    instrucciones_acceso: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones especiales para acceder'
    },
    notas_tecnicas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas técnicas importantes'
    },
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas adicionales'
    },
    // Campos de auditoría
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
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
    tableName: 'sala_virtual',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['codigo_sala'],
        unique: true
      },
      {
        fields: ['plataforma']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['es_permanente']
      },
      {
        fields: ['moderador_principal']
      },
      {
        fields: ['capacidad_maxima']
      },
      {
        fields: ['fecha_expiracion']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: { [Op.ne]: 'inactiva' }
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      disponibles: {
        where: {
          deleted_at: null,
          estado: 'disponible'
        }
      },
      permanentes: {
        where: {
          deleted_at: null,
          es_permanente: true
        }
      },
      porPlataforma: (plataforma) => ({
        where: {
          deleted_at: null,
          plataforma: plataforma,
          estado: { [Op.ne]: 'inactiva' }
        }
      })
    }
  });

  // Métodos de instancia
  SalaVirtual.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  SalaVirtual.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  SalaVirtual.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  SalaVirtual.prototype.isAvailable = function() {
    if (this.isDeleted() || this.estado !== 'disponible') return false;
    
    if (!this.es_permanente && this.fecha_expiracion) {
      return new Date() < new Date(this.fecha_expiracion);
    }
    
    return true;
  };

  SalaVirtual.prototype.isExpired = function() {
    if (this.es_permanente || !this.fecha_expiracion) return false;
    return new Date() > new Date(this.fecha_expiracion);
  };

  SalaVirtual.prototype.getAccessInfo = function() {
    return {
      url_acceso: this.url_acceso,
      url_alternativa: this.url_acceso_alternativa,
      meeting_id: this.meeting_id,
      password: this.password,
      access_code: this.access_code,
      phone_number: this.phone_number,
      instrucciones: this.instrucciones_acceso
    };
  };

  SalaVirtual.prototype.getStreamingInfo = function() {
    return {
      permite_streaming: this.permite_streaming,
      streaming_url: this.streaming_url,
      streaming_key: this.streaming_key,
      plataformas: this.plataformas_streaming,
      calidad_video: this.calidad_video
    };
  };

  SalaVirtual.prototype.getCapabilities = function() {
    return {
      capacidad_maxima: this.capacidad_maxima,
      permite_grabacion: this.permite_grabacion,
      permite_streaming: this.permite_streaming,
      permite_chat: this.permite_chat,
      permite_breakout_rooms: this.permite_breakout_rooms,
      permite_compartir_pantalla: this.permite_compartir_pantalla,
      permite_pizarra: this.permite_pizarra,
      subtitulos_automaticos: this.subtitulos_automaticos,
      soporte_dispositivos_moviles: this.soporte_dispositivos_moviles
    };
  };

  SalaVirtual.prototype.marcarComoOcupada = function() {
    return this.update({ estado: 'ocupada' });
  };

  SalaVirtual.prototype.marcarComoDisponible = function() {
    return this.update({ estado: 'disponible' });
  };

  SalaVirtual.prototype.updateUsageMetrics = function(duracionMinutos, participantes = 0) {
    const nuevasHoras = Math.round(duracionMinutos / 60);
    
    return this.update({
      total_usos: this.total_usos + 1,
      horas_uso_total: this.horas_uso_total + nuevasHoras,
      max_participantes_simultaneos: Math.max(this.max_participantes_simultaneos, participantes),
      ultima_utilizacion: new Date()
    });
  };

  SalaVirtual.prototype.canAccommodate = function(numeroParticipantes) {
    return numeroParticipantes <= this.capacidad_maxima;
  };

  SalaVirtual.prototype.getCostForDuration = function(duracionMinutos) {
    if (!this.costo_por_hora) return 0;
    const horas = duracionMinutos / 60;
    return parseFloat(this.costo_por_hora) * horas;
  };

  // Asociaciones
  SalaVirtual.associate = function(models) {
    // Relación con Actividad
    SalaVirtual.hasMany(models.Actividad, {
      foreignKey: 'id_sala_virtual',
      as: 'actividades'
    });

    // Asociaciones de auditoría
    SalaVirtual.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    SalaVirtual.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    SalaVirtual.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return SalaVirtual;
};
