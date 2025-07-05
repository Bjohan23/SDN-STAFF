const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const SolicitudAsignacion = sequelize.define('SolicitudAsignacion', {
    id_solicitud: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa_expositora',
        key: 'id_empresa'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de empresa es requerido'
        }
      }
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'evento',
        key: 'id_evento'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de evento es requerido'
        }
      }
    },
    id_stand_solicitado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stand',
        key: 'id_stand'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Stand específico solicitado, null para asignación automática'
    },
    modalidad_asignacion: {
      type: DataTypes.ENUM('seleccion_directa', 'manual', 'automatica'),
      allowNull: false,
      defaultValue: 'seleccion_directa',
      validate: {
        isIn: {
          args: [['seleccion_directa', 'manual', 'automatica']],
          msg: 'La modalidad debe ser: seleccion_directa, manual o automatica'
        }
      }
    },
    estado_solicitud: {
      type: DataTypes.ENUM('solicitada', 'en_revision', 'aprobada', 'rechazada', 'asignada', 'cancelada'),
      allowNull: false,
      defaultValue: 'solicitada',
      validate: {
        isIn: {
          args: [['solicitada', 'en_revision', 'aprobada', 'rechazada', 'asignada', 'cancelada']],
          msg: 'El estado debe ser: solicitada, en_revision, aprobada, rechazada, asignada o cancelada'
        }
      }
    },
    prioridad_score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'El score de prioridad no puede ser negativo'
        },
        max: {
          args: 100,
          msg: 'El score de prioridad no puede ser mayor a 100'
        }
      },
      comment: 'Score calculado basado en participaciones anteriores, antigüedad, etc.'
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_limite_respuesta: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha límite para responder a la solicitud'
    },
    criterios_automaticos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Criterios para asignación automática: área_minima, ubicacion_preferida, etc.'
    },
    preferencias_empresa: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Preferencias específicas de la empresa para el stand'
    },
    motivo_solicitud: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justificación o motivo de la solicitud'
    },
    motivo_rechazo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo en caso de rechazo de la solicitud'
    },
    observaciones_internas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas internas del equipo organizador'
    },
    // Datos de quien procesa la solicitud
    revisado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que revisó la solicitud'
    },
    fecha_revision: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se revisó la solicitud'
    },
    asignado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que realizó la asignación final'
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se realizó la asignación'
    },
    id_stand_asignado: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stand',
        key: 'id_stand'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Stand finalmente asignado (puede ser diferente al solicitado)'
    },
    // Información de costos
    precio_ofertado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El precio ofertado no puede ser negativo'
        }
      }
    },
    descuento_aplicado: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El descuento no puede ser negativo'
        },
        max: {
          args: 100,
          msg: 'El descuento no puede ser mayor al 100%'
        }
      }
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
    tableName: 'solicitud_asignacion',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_empresa']
      },
      {
        fields: ['id_evento']
      },
      {
        fields: ['estado_solicitud']
      },
      {
        fields: ['fecha_solicitud']
      },
      {
        fields: ['prioridad_score']
      },
      {
        unique: true,
        fields: ['id_empresa', 'id_evento'],
        name: 'unique_solicitud_empresa_evento',
        where: { deleted_at: null }
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      pendientes: {
        where: {
          estado_solicitud: ['solicitada', 'en_revision'],
          deleted_at: null
        }
      },
      aprobadas: {
        where: {
          estado_solicitud: 'aprobada',
          deleted_at: null
        }
      },
      asignadas: {
        where: {
          estado_solicitud: 'asignada',
          deleted_at: null
        }
      },
      porPrioridad: {
        where: {
          deleted_at: null
        },
        order: [['prioridad_score', 'DESC'], ['fecha_solicitud', 'ASC']]
      }
    }
  });

  // Métodos de instancia
  SolicitudAsignacion.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  SolicitudAsignacion.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  SolicitudAsignacion.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  SolicitudAsignacion.prototype.isPendiente = function() {
    return ['solicitada', 'en_revision'].includes(this.estado_solicitud);
  };

  SolicitudAsignacion.prototype.isAprobada = function() {
    return this.estado_solicitud === 'aprobada';
  };

  SolicitudAsignacion.prototype.isAsignada = function() {
    return this.estado_solicitud === 'asignada';
  };

  SolicitudAsignacion.prototype.aprobar = function(revisadoPor = null, observaciones = null) {
    return this.update({
      estado_solicitud: 'aprobada',
      revisado_por: revisadoPor,
      fecha_revision: new Date(),
      observaciones_internas: observaciones
    });
  };

  SolicitudAsignacion.prototype.rechazar = function(motivo, revisadoPor = null) {
    return this.update({
      estado_solicitud: 'rechazada',
      motivo_rechazo: motivo,
      revisado_por: revisadoPor,
      fecha_revision: new Date()
    });
  };

  SolicitudAsignacion.prototype.asignarStand = function(idStand, asignadoPor = null, precio = null, descuento = null) {
    return this.update({
      estado_solicitud: 'asignada',
      id_stand_asignado: idStand,
      asignado_por: asignadoPor,
      fecha_asignacion: new Date(),
      precio_ofertado: precio,
      descuento_aplicado: descuento
    });
  };

  SolicitudAsignacion.prototype.calcularPrioridadScore = async function() {
    // Lógica para calcular el score de prioridad
    let score = 0;
    
    if (this.empresa) {
      // Puntos por número de participaciones anteriores
      score += Math.min(this.empresa.numero_participaciones * 5, 25);
      
      // Puntos por calificación promedio
      if (this.empresa.calificacion_promedio) {
        score += this.empresa.calificacion_promedio * 10;
      }
      
      // Puntos por antigüedad (años desde primera participación)
      const añosAntiguedad = new Date().getFullYear() - new Date(this.empresa.created_at).getFullYear();
      score += Math.min(añosAntiguedad * 2, 20);
    }
    
    return Math.min(score, 100);
  };

  SolicitudAsignacion.prototype.solicitudVencida = function() {
    if (!this.fecha_limite_respuesta) return false;
    return new Date() > new Date(this.fecha_limite_respuesta) && this.isPendiente();
  };

  // Asociaciones
  SolicitudAsignacion.associate = function(models) {
    // Relación con EmpresaExpositora
    SolicitudAsignacion.belongsTo(models.EmpresaExpositora, {
      foreignKey: 'id_empresa',
      as: 'empresa'
    });

    // Relación con Evento
    SolicitudAsignacion.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Relación con Stand solicitado
    SolicitudAsignacion.belongsTo(models.Stand, {
      foreignKey: 'id_stand_solicitado',
      as: 'standSolicitado'
    });

    // Relación con Stand asignado
    SolicitudAsignacion.belongsTo(models.Stand, {
      foreignKey: 'id_stand_asignado',
      as: 'standAsignado'
    });

    // Relación con Usuario que revisó
    SolicitudAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'revisado_por',
      as: 'revisadoPorUsuario'
    });

    // Relación con Usuario que asignó
    SolicitudAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'asignado_por',
      as: 'asignadoPorUsuario'
    });

    // Asociaciones de auditoría
    SolicitudAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    SolicitudAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    SolicitudAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return SolicitudAsignacion;
};
