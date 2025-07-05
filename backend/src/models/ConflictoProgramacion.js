const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ConflictoProgramacion = sequelize.define('ConflictoProgramacion', {
    id_conflicto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'evento',
        key: 'id_evento'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    // Actividades en conflicto
    id_actividad_1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'actividad',
        key: 'id_actividad'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    id_actividad_2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'actividad',
        key: 'id_actividad'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    // Tipo y severidad del conflicto
    tipo_conflicto: {
      type: DataTypes.ENUM(
        'horario_superpuesto', 'misma_ubicacion', 'mismo_ponente', 
        'mismo_recurso', 'mismo_track', 'aforo_excedido', 'otro'
      ),
      allowNull: false,
      validate: {
        isIn: {
          args: [[
            'horario_superpuesto', 'misma_ubicacion', 'mismo_ponente', 
            'mismo_recurso', 'mismo_track', 'aforo_excedido', 'otro'
          ]],
          msg: 'El tipo de conflicto debe ser válido'
        }
      }
    },
    severidad: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
      defaultValue: 'media',
      validate: {
        isIn: {
          args: [['baja', 'media', 'alta', 'critica']],
          msg: 'La severidad debe ser válida'
        }
      }
    },
    // Descripción del conflicto
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descripción detallada del conflicto'
    },
    detalle_conflicto: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Detalles específicos del conflicto en formato JSON'
    },
    // Estado del conflicto
    estado: {
      type: DataTypes.ENUM('detectado', 'en_revision', 'resuelto', 'ignorado', 'escalado'),
      defaultValue: 'detectado',
      validate: {
        isIn: {
          args: [['detectado', 'en_revision', 'resuelto', 'ignorado', 'escalado']],
          msg: 'El estado debe ser válido'
        }
      }
    },
    fecha_deteccion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Resolución del conflicto
    metodo_deteccion: {
      type: DataTypes.ENUM('automatico', 'manual', 'reportado'),
      defaultValue: 'automatico',
      validate: {
        isIn: {
          args: [['automatico', 'manual', 'reportado']],
          msg: 'El método de detección debe ser válido'
        }
      }
    },
    accion_resolucion: {
      type: DataTypes.ENUM(
        'cambio_horario', 'cambio_ubicacion', 'cambio_ponente', 
        'cambio_recurso', 'cancelacion_actividad', 'fusion_actividades', 'ninguna'
      ),
      allowNull: true,
      validate: {
        isIn: {
          args: [[
            'cambio_horario', 'cambio_ubicacion', 'cambio_ponente', 
            'cambio_recurso', 'cancelacion_actividad', 'fusion_actividades', 'ninguna'
          ]],
          msg: 'La acción de resolución debe ser válida'
        }
      }
    },
    descripcion_resolucion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de cómo se resolvió el conflicto'
    },
    // Responsables
    detectado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    asignado_a: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    resuelto_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    // Métricas y impacto
    impacto_estimado: {
      type: DataTypes.ENUM('bajo', 'medio', 'alto', 'critico'),
      defaultValue: 'medio',
      validate: {
        isIn: {
          args: [['bajo', 'medio', 'alto', 'critico']],
          msg: 'El impacto estimado debe ser válido'
        }
      }
    },
    participantes_afectados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número estimado de participantes afectados'
    },
    costo_resolucion: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo estimado de resolver el conflicto'
    },
    // Prioridad y urgencia
    prioridad: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: {
        min: {
          args: 1,
          msg: 'La prioridad debe ser entre 1 y 10'
        },
        max: {
          args: 10,
          msg: 'La prioridad debe ser entre 1 y 10'
        }
      },
      comment: 'Prioridad del 1 (más alta) al 10 (más baja)'
    },
    es_urgente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere atención urgente'
    },
    fecha_limite_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha límite para resolver el conflicto'
    },
    // Notificaciones y comunicación
    notificaciones_enviadas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Registro de notificaciones enviadas'
    },
    requiere_aprobacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere aprobación superior para resolver'
    },
    aprobado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Información adicional
    notas_adicionales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales sobre el conflicto'
    },
    historial_cambios: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Historial de cambios de estado'
    },
    es_recurrente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es un conflicto que se repite'
    },
    conflicto_padre_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'conflicto_programacion',
        key: 'id_conflicto'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'ID del conflicto principal si es derivado'
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
    tableName: 'conflicto_programacion',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_evento']
      },
      {
        fields: ['id_actividad_1']
      },
      {
        fields: ['id_actividad_2']
      },
      {
        fields: ['tipo_conflicto']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['severidad']
      },
      {
        fields: ['prioridad']
      },
      {
        fields: ['es_urgente']
      },
      {
        fields: ['fecha_deteccion']
      },
      {
        fields: ['asignado_a']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: { [Op.notIn]: ['resuelto', 'ignorado'] }
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      pendientes: {
        where: {
          deleted_at: null,
          estado: ['detectado', 'en_revision']
        }
      },
      urgentes: {
        where: {
          deleted_at: null,
          es_urgente: true,
          estado: { [Op.notIn]: ['resuelto', 'ignorado'] }
        }
      },
      porEvento: (eventoId) => ({
        where: {
          deleted_at: null,
          id_evento: eventoId
        }
      }),
      porSeveridad: (severidad) => ({
        where: {
          deleted_at: null,
          severidad: severidad,
          estado: { [Op.notIn]: ['resuelto', 'ignorado'] }
        }
      })
    }
  });

  // Métodos de instancia
  ConflictoProgramacion.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  ConflictoProgramacion.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  ConflictoProgramacion.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  ConflictoProgramacion.prototype.asignar = function(usuarioId) {
    return this.update({
      asignado_a: usuarioId,
      estado: 'en_revision'
    });
  };

  ConflictoProgramacion.prototype.resolver = function(accionResolucion, descripcionResolucion, resueltoPor) {
    return this.update({
      estado: 'resuelto',
      accion_resolucion: accionResolucion,
      descripcion_resolucion: descripcionResolucion,
      resuelto_por: resueltoPor,
      fecha_resolucion: new Date()
    });
  };

  ConflictoProgramacion.prototype.escalar = function() {
    return this.update({
      estado: 'escalado',
      prioridad: Math.max(1, this.prioridad - 2),
      es_urgente: true
    });
  };

  ConflictoProgramacion.prototype.ignorar = function(motivo) {
    return this.update({
      estado: 'ignorado',
      descripcion_resolucion: motivo,
      fecha_resolucion: new Date()
    });
  };

  ConflictoProgramacion.prototype.addNotificacion = function(tipoNotificacion, destinatario) {
    const notificaciones = this.notificaciones_enviadas || [];
    notificaciones.push({
      tipo: tipoNotificacion,
      destinatario: destinatario,
      fecha: new Date()
    });

    return this.update({
      notificaciones_enviadas: notificaciones
    });
  };

  ConflictoProgramacion.prototype.updateHistorial = function(cambio, usuario) {
    const historial = this.historial_cambios || [];
    historial.push({
      cambio: cambio,
      usuario: usuario,
      fecha: new Date(),
      estado_anterior: this.estado
    });

    return this.update({
      historial_cambios: historial
    });
  };

  ConflictoProgramacion.prototype.isExpired = function() {
    return this.fecha_limite_resolucion && new Date() > new Date(this.fecha_limite_resolucion);
  };

  ConflictoProgramacion.prototype.getPriorityLevel = function() {
    if (this.prioridad <= 2) return 'crítica';
    if (this.prioridad <= 4) return 'alta';
    if (this.prioridad <= 6) return 'media';
    return 'baja';
  };

  ConflictoProgramacion.prototype.aprobar = function(aprobadoPor) {
    return this.update({
      aprobado_por: aprobadoPor,
      fecha_aprobacion: new Date()
    });
  };

  // Asociaciones
  ConflictoProgramacion.associate = function(models) {
    // Relación con Evento
    ConflictoProgramacion.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Relaciones con Actividades
    ConflictoProgramacion.belongsTo(models.Actividad, {
      foreignKey: 'id_actividad_1',
      as: 'actividad1'
    });

    ConflictoProgramacion.belongsTo(models.Actividad, {
      foreignKey: 'id_actividad_2',
      as: 'actividad2'
    });

    // Relaciones con Usuarios
    ConflictoProgramacion.belongsTo(models.Usuario, {
      foreignKey: 'detectado_por',
      as: 'detectadoPorUsuario'
    });

    ConflictoProgramacion.belongsTo(models.Usuario, {
      foreignKey: 'asignado_a',
      as: 'asignadoAUsuario'
    });

    ConflictoProgramacion.belongsTo(models.Usuario, {
      foreignKey: 'resuelto_por',
      as: 'resueltoPorUsuario'
    });

    ConflictoProgramacion.belongsTo(models.Usuario, {
      foreignKey: 'aprobado_por',
      as: 'aprobadoPorUsuario'
    });

    // Relación recursiva para conflictos padre
    ConflictoProgramacion.belongsTo(ConflictoProgramacion, {
      foreignKey: 'conflicto_padre_id',
      as: 'conflictoPadre'
    });

    ConflictoProgramacion.hasMany(ConflictoProgramacion, {
      foreignKey: 'conflicto_padre_id',
      as: 'conflictosDerivados'
    });

    // Asociaciones de auditoría
    ConflictoProgramacion.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    ConflictoProgramacion.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    ConflictoProgramacion.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return ConflictoProgramacion;
};
