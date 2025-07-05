const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ActividadPonente = sequelize.define('ActividadPonente', {
    id_actividad_ponente: {
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
    id_ponente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ponente',
        key: 'id_ponente'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    // Rol del ponente en la actividad
    rol_ponente: {
      type: DataTypes.ENUM('principal', 'co_ponente', 'moderador', 'panelista', 'invitado', 'facilitador'),
      defaultValue: 'principal',
      validate: {
        isIn: {
          args: [['principal', 'co_ponente', 'moderador', 'panelista', 'invitado', 'facilitador']],
          msg: 'El rol del ponente debe ser válido'
        }
      }
    },
    orden_presentacion: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Orden de presentación cuando hay múltiples ponentes'
    },
    // Tiempo asignado específico
    tiempo_asignado_minutos: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'El tiempo mínimo es 1 minuto'
        }
      },
      comment: 'Tiempo específico asignado a este ponente'
    },
    hora_inicio_participacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora específica de inicio de participación'
    },
    hora_fin_participacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora específica de fin de participación'
    },
    // Tema y contenido específico
    tema_especifico: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Tema específico que abordará este ponente'
    },
    descripcion_participacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de su participación específica'
    },
    objetivos_ponente: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Objetivos específicos de este ponente'
    },
    // Estado y confirmación
    estado: {
      type: DataTypes.ENUM('invitado', 'confirmado', 'en_espera', 'rechazado', 'cancelado'),
      defaultValue: 'invitado',
      validate: {
        isIn: {
          args: [['invitado', 'confirmado', 'en_espera', 'rechazado', 'cancelado']],
          msg: 'El estado debe ser válido'
        }
      }
    },
    fecha_invitacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha en que se envió la invitación'
    },
    fecha_confirmacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que confirmó su participación'
    },
    fecha_ultima_respuesta: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de la última respuesta del ponente'
    },
    // Participación virtual/presencial
    modalidad_participacion: {
      type: DataTypes.ENUM('presencial', 'virtual', 'hibrido'),
      allowNull: true,
      comment: 'Modalidad específica de participación de este ponente'
    },
    requiere_conexion_previa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere conexión/prueba técnica previa'
    },
    hora_conexion_previa: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora programada para conexión/prueba previa'
    },
    // Información técnica
    equipos_requeridos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Equipos técnicos específicos requeridos'
    },
    configuracion_tecnica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuración técnica específica'
    },
    url_material_apoyo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de material de apoyo (presentaciones, etc.)'
    },
    // Coordinación y comunicación
    notas_coordinacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas de coordinación con el ponente'
    },
    instrucciones_especiales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones especiales para el ponente'
    },
    contacto_emergencia: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Contacto de emergencia del ponente'
    },
    // Evaluación y feedback
    permite_evaluacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si permite que los participantes lo evalúen'
    },
    calificacion_recibida: {
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
    total_evaluaciones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de evaluaciones recibidas para esta actividad'
    },
    // Remuneración y costos
    honorarios_acordados: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Honorarios acordados para esta actividad'
    },
    moneda_honorarios: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    incluye_viaticos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si incluye viáticos para esta actividad'
    },
    estado_pago: {
      type: DataTypes.ENUM('pendiente', 'autorizado', 'pagado', 'no_aplica'),
      defaultValue: 'no_aplica',
      validate: {
        isIn: {
          args: [['pendiente', 'autorizado', 'pagado', 'no_aplica']],
          msg: 'El estado de pago debe ser válido'
        }
      }
    },
    // Información adicional
    biografia_contextual: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Biografía específica para el contexto de esta actividad'
    },
    foto_contextual_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Foto específica para esta actividad'
    },
    redes_sociales_promocion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Redes sociales para promoción específica'
    },
    // Configuración específica
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas para esta participación'
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
    tableName: 'actividad_ponente',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_actividad', 'id_ponente'],
        unique: true,
        name: 'unique_actividad_ponente'
      },
      {
        fields: ['id_actividad']
      },
      {
        fields: ['id_ponente']
      },
      {
        fields: ['rol_ponente']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['orden_presentacion']
      },
      {
        fields: ['modalidad_participacion']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: { [Op.notIn]: ['cancelado', 'rechazado'] }
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      confirmados: {
        where: {
          deleted_at: null,
          estado: 'confirmado'
        }
      },
      principales: {
        where: {
          deleted_at: null,
          rol_ponente: 'principal'
        }
      }
    }
  });

  // Métodos de instancia
  ActividadPonente.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  ActividadPonente.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  ActividadPonente.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  ActividadPonente.prototype.isConfirmed = function() {
    return this.estado === 'confirmado';
  };

  ActividadPonente.prototype.isPrincipal = function() {
    return this.rol_ponente === 'principal';
  };

  ActividadPonente.prototype.confirmar = function() {
    return this.update({
      estado: 'confirmado',
      fecha_confirmacion: new Date(),
      fecha_ultima_respuesta: new Date()
    });
  };

  ActividadPonente.prototype.rechazar = function() {
    return this.update({
      estado: 'rechazado',
      fecha_ultima_respuesta: new Date()
    });
  };

  ActividadPonente.prototype.cancelar = function(motivo = null) {
    return this.update({
      estado: 'cancelado',
      fecha_ultima_respuesta: new Date(),
      notas_coordinacion: `${this.notas_coordinacion || ''}\n\nCancelado: ${motivo || 'Sin motivo'}`
    });
  };

  ActividadPonente.prototype.getParticipationTimeSlot = function() {
    if (this.hora_inicio_participacion && this.hora_fin_participacion) {
      return {
        inicio: this.hora_inicio_participacion,
        fin: this.hora_fin_participacion,
        duracion_minutos: Math.round((new Date(this.hora_fin_participacion) - new Date(this.hora_inicio_participacion)) / 60000)
      };
    }
    return null;
  };

  ActividadPonente.prototype.needsTechnicalCheck = function() {
    return this.requiere_conexion_previa && this.modalidad_participacion !== 'presencial';
  };

  ActividadPonente.prototype.updateEvaluation = function(calificacion) {
    const nuevoTotal = this.total_evaluaciones + 1;
    const nuevaCalificacion = ((this.calificacion_recibida || 0) * this.total_evaluaciones + calificacion) / nuevoTotal;
    
    return this.update({
      calificacion_recibida: nuevaCalificacion,
      total_evaluaciones: nuevoTotal
    });
  };

  // Asociaciones
  ActividadPonente.associate = function(models) {
    // Relación con Actividad
    ActividadPonente.belongsTo(models.Actividad, {
      foreignKey: 'id_actividad',
      as: 'actividad'
    });

    // Relación con Ponente
    ActividadPonente.belongsTo(models.Ponente, {
      foreignKey: 'id_ponente',
      as: 'ponente'
    });

    // Asociaciones de auditoría
    ActividadPonente.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    ActividadPonente.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    ActividadPonente.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return ActividadPonente;
};
