const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const HistoricoAsignacion = sequelize.define('HistoricoAsignacion', {
    id_historico: {
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
    id_solicitud: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'solicitud_asignacion',
        key: 'id_solicitud'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Solicitud relacionada con este cambio'
    },
    id_stand_anterior: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stand',
        key: 'id_stand'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Stand anterior (null en asignación inicial)'
    },
    id_stand_nuevo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stand',
        key: 'id_stand'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Stand nuevo asignado (null en cancelaciones)'
    },
    tipo_cambio: {
      type: DataTypes.ENUM('asignacion_inicial', 'reasignacion', 'cancelacion', 'liberacion', 'confirmacion', 'pago_realizado', 'montaje_completado'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['asignacion_inicial', 'reasignacion', 'cancelacion', 'liberacion', 'confirmacion', 'pago_realizado', 'montaje_completado']],
          msg: 'El tipo de cambio debe ser válido'
        }
      }
    },
    estado_anterior: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Estado anterior del registro'
    },
    estado_nuevo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Nuevo estado del registro'
    },
    motivo_cambio: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El motivo del cambio es requerido'
        }
      }
    },
    descripcion_detallada: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada del cambio realizado'
    },
    impacto_economico: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Impacto económico del cambio (positivo o negativo)'
    },
    datos_adicionales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Datos adicionales específicos del cambio'
    },
    // Información del cambio
    realizado_por: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El usuario que realizó el cambio es requerido'
        }
      }
    },
    fecha_cambio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ip_origen: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP desde donde se realizó el cambio'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent del navegador'
    },
    // Validaciones y aprobaciones
    requiere_aprobacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si este cambio requirió aprobación especial'
    },
    aprobado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que aprobó el cambio'
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de aprobación del cambio'
    },
    // Reversión de cambios
    es_revertible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si este cambio puede ser revertido'
    },
    revertido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si este cambio fue revertido'
    },
    id_reversion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'historico_asignacion',
        key: 'id_historico'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'ID del registro que revirtió este cambio'
    },
    fecha_reversion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se revirtió este cambio'
    },
    // Notificaciones
    notificaciones_enviadas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Log de notificaciones enviadas por este cambio'
    },
    // Campos de auditoría
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'historico_asignacion',
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
        fields: ['id_solicitud']
      },
      {
        fields: ['tipo_cambio']
      },
      {
        fields: ['fecha_cambio']
      },
      {
        fields: ['realizado_por']
      },
      {
        fields: ['id_stand_anterior']
      },
      {
        fields: ['id_stand_nuevo']
      }
    ],
    scopes: {
      recent: {
        order: [['fecha_cambio', 'DESC']]
      },
      porTipo: function(tipo) {
        return {
          where: {
            tipo_cambio: tipo
          }
        };
      },
      porEmpresa: function(empresaId) {
        return {
          where: {
            id_empresa: empresaId
          }
        };
      },
      porEvento: function(eventoId) {
        return {
          where: {
            id_evento: eventoId
          }
        };
      },
      sinRevertir: {
        where: {
          revertido: false
        }
      },
      revertibles: {
        where: {
          es_revertible: true,
          revertido: false
        }
      }
    }
  });

  // Métodos de instancia
  HistoricoAsignacion.prototype.isRevertible = function() {
    return this.es_revertible && !this.revertido;
  };

  HistoricoAsignacion.prototype.marcarRevertido = function(idReversion = null) {
    return this.update({
      revertido: true,
      id_reversion: idReversion,
      fecha_reversion: new Date()
    });
  };

  HistoricoAsignacion.prototype.requiereAprobacion = function() {
    return this.requiere_aprobacion && !this.aprobado_por;
  };

  HistoricoAsignacion.prototype.aprobar = function(aprobadoPor) {
    return this.update({
      aprobado_por: aprobadoPor,
      fecha_aprobacion: new Date()
    });
  };

  HistoricoAsignacion.prototype.addNotificacion = function(tipoNotificacion, destinatario, estado = 'enviada') {
    const notificaciones = this.notificaciones_enviadas || [];
    notificaciones.push({
      tipo: tipoNotificacion,
      destinatario: destinatario,
      estado: estado,
      fecha: new Date(),
      timestamp: Date.now()
    });
    
    return this.update({
      notificaciones_enviadas: notificaciones
    });
  };

  HistoricoAsignacion.prototype.getDiferenciasStand = function() {
    if (!this.id_stand_anterior && this.id_stand_nuevo) {
      return { tipo: 'asignacion_nueva', descripcion: 'Asignación inicial de stand' };
    }
    
    if (this.id_stand_anterior && !this.id_stand_nuevo) {
      return { tipo: 'liberacion', descripcion: 'Liberación de stand' };
    }
    
    if (this.id_stand_anterior && this.id_stand_nuevo && this.id_stand_anterior !== this.id_stand_nuevo) {
      return { tipo: 'cambio_stand', descripcion: 'Cambio de stand' };
    }
    
    return { tipo: 'sin_cambio_stand', descripcion: 'Cambio de estado sin modificar stand' };
  };

  // Método estático para crear entrada de histórico
  HistoricoAsignacion.crearEntrada = async function(datos, realizadoPor, metadatos = {}) {
    const entrada = {
      id_empresa: datos.id_empresa,
      id_evento: datos.id_evento,
      id_solicitud: datos.id_solicitud || null,
      id_stand_anterior: datos.id_stand_anterior || null,
      id_stand_nuevo: datos.id_stand_nuevo || null,
      tipo_cambio: datos.tipo_cambio,
      estado_anterior: datos.estado_anterior || null,
      estado_nuevo: datos.estado_nuevo || null,
      motivo_cambio: datos.motivo_cambio,
      descripcion_detallada: datos.descripcion_detallada || null,
      impacto_economico: datos.impacto_economico || null,
      datos_adicionales: datos.datos_adicionales || null,
      realizado_por: realizadoPor,
      fecha_cambio: new Date(),
      ip_origen: metadatos.ip || null,
      user_agent: metadatos.userAgent || null,
      requiere_aprobacion: datos.requiere_aprobacion || false,
      es_revertible: datos.es_revertible !== false // Por defecto true
    };

    return await this.create(entrada);
  };

  // Asociaciones
  HistoricoAsignacion.associate = function(models) {
    // Relación con EmpresaExpositora
    HistoricoAsignacion.belongsTo(models.EmpresaExpositora, {
      foreignKey: 'id_empresa',
      as: 'empresa'
    });

    // Relación con Evento
    HistoricoAsignacion.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Relación con SolicitudAsignacion
    HistoricoAsignacion.belongsTo(models.SolicitudAsignacion, {
      foreignKey: 'id_solicitud',
      as: 'solicitud'
    });

    // Relación con Stand anterior
    HistoricoAsignacion.belongsTo(models.Stand, {
      foreignKey: 'id_stand_anterior',
      as: 'standAnterior'
    });

    // Relación con Stand nuevo
    HistoricoAsignacion.belongsTo(models.Stand, {
      foreignKey: 'id_stand_nuevo',
      as: 'standNuevo'
    });

    // Relación con Usuario que realizó el cambio
    HistoricoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'realizado_por',
      as: 'realizadoPorUsuario'
    });

    // Relación con Usuario que aprobó
    HistoricoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'aprobado_por',
      as: 'aprobadoPorUsuario'
    });

    // Auto-relación para reversiones
    HistoricoAsignacion.belongsTo(models.HistoricoAsignacion, {
      foreignKey: 'id_reversion',
      as: 'registroReversion'
    });

    HistoricoAsignacion.hasOne(models.HistoricoAsignacion, {
      foreignKey: 'id_reversion',
      as: 'registroRevertido'
    });
  };

  return HistoricoAsignacion;
};
