const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const InscripcionActividad = sequelize.define('InscripcionActividad', {
    id_inscripcion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_actividad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'actividad',
        key: 'id_actividad'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    // Información del participante
    nombre_participante: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del participante es requerido'
        },
        len: {
          args: [2, 150],
          msg: 'El nombre debe tener entre 2 y 150 caracteres'
        }
      }
    },
    email_participante: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El email es requerido'
        },
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    telefono_participante: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    empresa_organizacion: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    cargo_participante: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // Estado de la inscripción
    estado: {
      type: DataTypes.ENUM('pendiente', 'confirmada', 'en_espera', 'cancelada', 'asistio', 'no_asistio'),
      defaultValue: 'pendiente',
      validate: {
        isIn: {
          args: [['pendiente', 'confirmada', 'en_espera', 'cancelada', 'asistio', 'no_asistio']],
          msg: 'El estado debe ser válido'
        }
      }
    },
    fecha_inscripcion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_confirmacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_cancelacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    motivo_cancelacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Modalidad de participación
    modalidad_participacion: {
      type: DataTypes.ENUM('presencial', 'virtual'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['presencial', 'virtual']],
          msg: 'La modalidad debe ser presencial o virtual'
        }
      }
    },
    // Información de asistencia
    registro_asistencia: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si se registró su asistencia'
    },
    hora_entrada: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora en que ingresó a la actividad'
    },
    hora_salida: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora en que salió de la actividad'
    },
    duracion_permanencia_minutos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tiempo que permaneció en la actividad'
    },
    // Evaluación y feedback
    permitir_evaluacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si permite evaluar la actividad'
    },
    calificacion_otorgada: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'La calificación no puede ser negativa'
        },
        max: {
          args: 5,
          msg: 'La calificación no puede ser mayor a 5'
        }
      }
    },
    comentarios_participante: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comentarios del participante sobre la actividad'
    },
    fecha_evaluacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Certificación
    requiere_certificado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si solicita certificado de participación'
    },
    certificado_emitido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si ya se emitió el certificado'
    },
    fecha_emision_certificado: {
      type: DataTypes.DATE,
      allowNull: true
    },
    url_certificado: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL del certificado generado'
    },
    // Información adicional
    necesidades_especiales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Necesidades especiales de accesibilidad'
    },
    preferencias_alimentarias: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Preferencias alimentarias (para eventos presenciales)'
    },
    notas_participante: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales del participante'
    },
    notas_organizador: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas internas del organizador'
    },
    // Comunicación y notificaciones
    acepta_comunicaciones: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si acepta recibir comunicaciones del evento'
    },
    notificaciones_enviadas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Registro de notificaciones enviadas'
    },
    recordatorios_enviados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de recordatorios enviados'
    },
    // Información técnica (para modalidad virtual)
    ip_acceso: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP desde donde accedió (IPv4 o IPv6)'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Información del navegador/dispositivo'
    },
    plataforma_acceso: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Plataforma desde donde accedió'
    },
    calidad_conexion: {
      type: DataTypes.ENUM('excelente', 'buena', 'regular', 'mala'),
      allowNull: true,
      comment: 'Calidad de conexión reportada'
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
    tableName: 'inscripcion_actividad',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_actividad', 'email_participante'],
        unique: true,
        name: 'unique_inscripcion_per_activity'
      },
      {
        fields: ['id_actividad']
      },
      {
        fields: ['id_usuario']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['email_participante']
      },
      {
        fields: ['modalidad_participacion']
      },
      {
        fields: ['fecha_inscripcion']
      },
      {
        fields: ['registro_asistencia']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: { [Op.notIn]: ['cancelada'] }
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      confirmadas: {
        where: {
          deleted_at: null,
          estado: 'confirmada'
        }
      },
      asistieron: {
        where: {
          deleted_at: null,
          estado: 'asistio'
        }
      },
      porActividad: (actividadId) => ({
        where: {
          deleted_at: null,
          id_actividad: actividadId,
          estado: { [Op.notIn]: ['cancelada'] }
        }
      })
    }
  });

  // Métodos de instancia
  InscripcionActividad.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  InscripcionActividad.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  InscripcionActividad.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  InscripcionActividad.prototype.confirmar = function() {
    return this.update({
      estado: 'confirmada',
      fecha_confirmacion: new Date()
    });
  };

  InscripcionActividad.prototype.cancelar = function(motivo = null) {
    return this.update({
      estado: 'cancelada',
      fecha_cancelacion: new Date(),
      motivo_cancelacion: motivo
    });
  };

  InscripcionActividad.prototype.marcarAsistencia = function() {
    return this.update({
      estado: 'asistio',
      registro_asistencia: true,
      hora_entrada: new Date()
    });
  };

  InscripcionActividad.prototype.marcarSalida = function() {
    const tiempoEntrada = new Date(this.hora_entrada);
    const tiempoSalida = new Date();
    const duracion = Math.round((tiempoSalida - tiempoEntrada) / 60000);

    return this.update({
      hora_salida: tiempoSalida,
      duracion_permanencia_minutos: duracion
    });
  };

  InscripcionActividad.prototype.evaluarActividad = function(calificacion, comentarios = null) {
    return this.update({
      calificacion_otorgada: calificacion,
      comentarios_participante: comentarios,
      fecha_evaluacion: new Date()
    });
  };

  InscripcionActividad.prototype.emitirCertificado = function(urlCertificado) {
    return this.update({
      certificado_emitido: true,
      fecha_emision_certificado: new Date(),
      url_certificado: urlCertificado
    });
  };

  InscripcionActividad.prototype.addNotificacion = function(tipoNotificacion, enviada = true) {
    const notificaciones = this.notificaciones_enviadas || [];
    notificaciones.push({
      tipo: tipoNotificacion,
      fecha: new Date(),
      enviada: enviada
    });

    return this.update({
      notificaciones_enviadas: notificaciones
    });
  };

  // Asociaciones
  InscripcionActividad.associate = function(models) {
    // Relación con Actividad
    InscripcionActividad.belongsTo(models.Actividad, {
      foreignKey: 'id_actividad',
      as: 'actividad'
    });

    // Relación con Usuario
    InscripcionActividad.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });

    // Asociaciones de auditoría
    InscripcionActividad.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    InscripcionActividad.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    InscripcionActividad.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return InscripcionActividad;
};
