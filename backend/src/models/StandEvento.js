const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const StandEvento = sequelize.define('StandEvento', {
    id_stand: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'stand',
        key: 'id_stand'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID del stand es requerido'
        },
        isInt: {
          msg: 'El ID del stand debe ser un número entero'
        }
      }
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'evento',
        key: 'id_evento'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID del evento es requerido'
        },
        isInt: {
          msg: 'El ID del evento debe ser un número entero'
        }
      }
    },
    estado_disponibilidad: {
      type: DataTypes.ENUM('disponible', 'reservado', 'ocupado', 'mantenimiento', 'bloqueado'),
      defaultValue: 'disponible',
      validate: {
        isIn: {
          args: [['disponible', 'reservado', 'ocupado', 'mantenimiento', 'bloqueado']],
          msg: 'El estado debe ser: disponible, reservado, ocupado, mantenimiento o bloqueado'
        }
      }
    },
    precio_evento: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El precio del evento no puede ser negativo'
        }
      }
    },
    descuento_porcentaje: {
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
    precio_final: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El precio final no puede ser negativo'
        }
      }
    },
    fecha_reserva: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_limite_pago: {
      type: DataTypes.DATE,
      allowNull: true
    },
    configuracion_especial: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuración especial para este evento'
    },
    servicios_incluidos_evento: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios incluidos específicos para este evento'
    },
    restricciones_evento: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Restricciones específicas para este evento'
    },
    horario_montaje: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Horarios disponibles para montaje'
    },
    horario_desmontaje: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Horarios para desmontaje'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prioridad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: 'La prioridad no puede ser negativa'
        }
      }
    },
    es_destacado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    maximo_dias_reserva: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 7,
      validate: {
        min: {
          args: 1,
          msg: 'El máximo de días de reserva debe ser al menos 1'
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
    tableName: 'stand_evento',
    timestamps: false,
    underscored: false,
    scopes: {
      active: {
        where: {
          deleted_at: null
        }
      },
      disponible: {
        where: {
          deleted_at: null,
          estado_disponibilidad: 'disponible'
        }
      },
      destacados: {
        where: {
          deleted_at: null,
          es_destacado: true
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      }
    }
  });

  // Métodos de instancia
  StandEvento.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  StandEvento.prototype.isDisponible = function() {
    return this.estado_disponibilidad === 'disponible' && !this.isDeleted();
  };

  StandEvento.prototype.isReservado = function() {
    return this.estado_disponibilidad === 'reservado' && !this.isDeleted();
  };

  StandEvento.prototype.isOcupado = function() {
    return this.estado_disponibilidad === 'ocupado' && !this.isDeleted();
  };

  StandEvento.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  StandEvento.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  StandEvento.prototype.reservar = function(diasReserva = null) {
    const diasMaximos = diasReserva || this.maximo_dias_reserva || 7;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasMaximos);

    return this.update({
      estado_disponibilidad: 'reservado',
      fecha_reserva: new Date(),
      fecha_limite_pago: fechaLimite
    });
  };

  StandEvento.prototype.ocupar = function() {
    return this.update({
      estado_disponibilidad: 'ocupado'
    });
  };

  StandEvento.prototype.liberar = function() {
    return this.update({
      estado_disponibilidad: 'disponible',
      fecha_reserva: null,
      fecha_limite_pago: null
    });
  };

  StandEvento.prototype.calcularPrecioFinal = function() {
    let precio = parseFloat(this.precio_evento || 0);
    
    if (this.descuento_porcentaje) {
      const descuento = precio * (parseFloat(this.descuento_porcentaje) / 100);
      precio -= descuento;
    }
    
    return precio;
  };

  StandEvento.prototype.reservaVencida = function() {
    if (!this.fecha_limite_pago || !this.isReservado()) {
      return false;
    }
    
    return new Date() > new Date(this.fecha_limite_pago);
  };

  // Asociaciones
  StandEvento.associate = function(models) {
    // Relación con Stand
    StandEvento.belongsTo(models.Stand, {
      foreignKey: 'id_stand',
      as: 'stand'
    });

    // Relación con Evento
    StandEvento.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Asociaciones de auditoría
    StandEvento.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    StandEvento.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    StandEvento.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return StandEvento;
};
