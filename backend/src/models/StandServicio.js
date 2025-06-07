const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const StandServicio = sequelize.define('StandServicio', {
    id_stand_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_stand: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stand',
        key: 'id_stand'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID del stand es requerido'
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
          msg: 'El ID del evento es requerido'
        }
      }
    },
    id_servicio: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'servicio_adicional',
        key: 'id_servicio'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID del servicio es requerido'
        }
      }
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empresa_expositora',
        key: 'id_empresa'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: 1,
          msg: 'La cantidad debe ser al menos 1'
        }
      }
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: 'El precio unitario no puede ser negativo'
        }
      }
    },
    descuento_aplicado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'El descuento aplicado no puede ser negativo'
        }
      }
    },
    precio_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: 0,
          msg: 'El precio total no puede ser negativo'
        }
      }
    },
    estado_servicio: {
      type: DataTypes.ENUM('solicitado', 'confirmado', 'instalado', 'activo', 'finalizado', 'cancelado'),
      defaultValue: 'solicitado',
      validate: {
        isIn: {
          args: [['solicitado', 'confirmado', 'instalado', 'activo', 'finalizado', 'cancelado']],
          msg: 'El estado del servicio debe ser válido'
        }
      }
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_instalacion_programada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_instalacion_real: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_retiro_programada: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_retiro_real: {
      type: DataTypes.DATE,
      allowNull: true
    },
    especificaciones_adicionales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Especificaciones adicionales del servicio'
    },
    contacto_instalacion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Datos de contacto para la instalación'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    calificacion_servicio: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La calificación mínima es 1'
        },
        max: {
          args: 5,
          msg: 'La calificación máxima es 5'
        }
      }
    },
    comentarios_calificacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    requiere_supervision: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    es_urgente: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: 'stand_servicio',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        name: 'idx_stand_evento_servicio_unique',
        fields: ['id_stand', 'id_evento', 'id_servicio']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null
        }
      },
      pendientes: {
        where: {
          deleted_at: null,
          estado_servicio: ['solicitado', 'confirmado']
        }
      },
      instalados: {
        where: {
          deleted_at: null,
          estado_servicio: ['instalado', 'activo']
        }
      },
      urgentes: {
        where: {
          deleted_at: null,
          es_urgente: true
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
  StandServicio.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  StandServicio.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  StandServicio.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  StandServicio.prototype.confirmar = function() {
    return this.update({
      estado_servicio: 'confirmado'
    });
  };

  StandServicio.prototype.instalar = function(fechaInstalacion = new Date()) {
    return this.update({
      estado_servicio: 'instalado',
      fecha_instalacion_real: fechaInstalacion
    });
  };

  StandServicio.prototype.activar = function() {
    return this.update({
      estado_servicio: 'activo'
    });
  };

  StandServicio.prototype.finalizar = function(fechaRetiro = new Date()) {
    return this.update({
      estado_servicio: 'finalizado',
      fecha_retiro_real: fechaRetiro
    });
  };

  StandServicio.prototype.cancelar = function(motivo = null) {
    const updateData = {
      estado_servicio: 'cancelado'
    };
    
    if (motivo) {
      updateData.observaciones = motivo;
    }
    
    return this.update(updateData);
  };

  StandServicio.prototype.calcularPrecioTotal = function() {
    const subtotal = parseFloat(this.precio_unitario) * parseInt(this.cantidad);
    const descuento = parseFloat(this.descuento_aplicado || 0);
    return subtotal - descuento;
  };

  StandServicio.prototype.actualizarPrecioTotal = function() {
    const precioTotal = this.calcularPrecioTotal();
    return this.update({ precio_total: precioTotal });
  };

  StandServicio.prototype.calificar = function(calificacion, comentarios = null) {
    if (calificacion < 1 || calificacion > 5) {
      throw new Error('La calificación debe estar entre 1 y 5');
    }
    
    return this.update({
      calificacion_servicio: calificacion,
      comentarios_calificacion: comentarios
    });
  };

  StandServicio.prototype.estaVencido = function() {
    if (!this.fecha_instalacion_programada) return false;
    
    const estados = ['solicitado', 'confirmado'];
    return estados.includes(this.estado_servicio) && 
           new Date() > new Date(this.fecha_instalacion_programada);
  };

  // Asociaciones
  StandServicio.associate = function(models) {
    // Relación con Stand
    StandServicio.belongsTo(models.Stand, {
      foreignKey: 'id_stand',
      as: 'stand'
    });

    // Relación con Evento
    StandServicio.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Relación con ServicioAdicional
    StandServicio.belongsTo(models.ServicioAdicional, {
      foreignKey: 'id_servicio',
      as: 'servicio'
    });

    // Relación con EmpresaExpositora
    StandServicio.belongsTo(models.EmpresaExpositora, {
      foreignKey: 'id_empresa',
      as: 'empresa'
    });

    // Asociaciones de auditoría
    StandServicio.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    StandServicio.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    StandServicio.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return StandServicio;
};
