const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Stand = sequelize.define('Stand', {
    id_stand: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    numero_stand: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El número del stand no puede estar vacío'
        },
        len: {
          args: [1, 20],
          msg: 'El número del stand debe tener entre 1 y 20 caracteres'
        }
      }
    },
    nombre_stand: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'El nombre del stand no puede exceder 100 caracteres'
        }
      }
    },
    id_tipo_stand: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipo_stand',
        key: 'id_tipo_stand'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El tipo de stand es requerido'
        }
      }
    },
    area: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El área del stand es requerida'
        },
        min: {
          args: 0.01,
          msg: 'El área del stand debe ser mayor a 0'
        }
      }
    },
    ubicacion: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'La ubicación no puede exceder 200 caracteres'
        }
      }
    },
    coordenadas_x: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    coordenadas_y: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true
    },
    estado_fisico: {
      type: DataTypes.ENUM('disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio'),
      defaultValue: 'disponible',
      validate: {
        isIn: {
          args: [['disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio']],
          msg: 'El estado físico debe ser: disponible, ocupado, mantenimiento o fuera_de_servicio'
        }
      }
    },
    caracteristicas_fisicas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Características físicas específicas del stand'
    },
    equipamiento_fijo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Equipamiento fijo instalado en el stand'
    },
    servicios_disponibles: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios disponibles en este stand específico'
    },
    precio_personalizado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        isPositiveOrNull(value) {
          // Solo validar si el valor no es null, undefined o string vacío
          if (value !== null && value !== undefined && value !== '') {
            const precio = parseFloat(value);
            if (isNaN(precio) || precio < 0) {
              throw new Error('El precio personalizado no puede ser negativo');
            }
          }
        }
      }
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha_ultima_inspeccion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_proximo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'temporal'),
      defaultValue: 'activo',
      validate: {
        isIn: {
          args: [['activo', 'inactivo', 'temporal']],
          msg: 'El estado debe ser: activo, inactivo o temporal'
        }
      }
    },
    es_premium: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    permite_subdivision: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    capacidad_maxima_personas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La capacidad máxima debe ser al menos 1 persona'
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
    tableName: 'stand',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['numero_stand'],
        where: { deleted_at: null }
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: 'activo'
        }
      },
      disponible: {
        where: {
          deleted_at: null,
          estado: 'activo',
          estado_fisico: 'disponible'
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
  Stand.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  Stand.prototype.isActive = function() {
    return this.estado === 'activo' && !this.isDeleted();
  };

  Stand.prototype.isDisponible = function() {
    return this.isActive() && this.estado_fisico === 'disponible';
  };

  Stand.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  Stand.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  Stand.prototype.calcularPrecio = async function() {
    if (this.precio_personalizado) {
      return parseFloat(this.precio_personalizado);
    }
    
    // Si no hay precio personalizado, usar el precio base del tipo
    if (this.tipoStand) {
      return this.tipoStand.calcularPrecio(this.area);
    }
    
    return 0;
  };

  Stand.prototype.cambiarEstadoFisico = function(nuevoEstado, observaciones = null) {
    const estadosValidos = ['disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio'];
    
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error('Estado físico inválido');
    }

    const updateData = { estado_fisico: nuevoEstado };
    
    if (observaciones) {
      updateData.observaciones = observaciones;
    }

    return this.update(updateData);
  };

  Stand.prototype.requiereMantenimiento = function() {
    if (!this.fecha_proximo_mantenimiento) return false;
    return new Date() >= new Date(this.fecha_proximo_mantenimiento);
  };

  // Asociaciones
  Stand.associate = function(models) {
    // Relación con TipoStand
    Stand.belongsTo(models.TipoStand, {
      foreignKey: 'id_tipo_stand',
      as: 'tipoStand'
    });

    // Relación many-to-many con Evento a través de StandEvento
    Stand.belongsToMany(models.Evento, {
      through: 'StandEvento',
      foreignKey: 'id_stand',
      otherKey: 'id_evento',
      as: 'eventos'
    });

    // Relación directa con StandEvento
    Stand.hasMany(models.StandEvento, {
      foreignKey: 'id_stand',
      as: 'standEventos'
    });

    // Relación con EmpresaEvento (empresas que ocupan el stand)
    Stand.hasMany(models.EmpresaEvento, {
      foreignKey: 'id_stand',
      as: 'participaciones'
    });

    // Relación con StandServicio
    Stand.hasMany(models.StandServicio, {
      foreignKey: 'id_stand',
      as: 'serviciosContratados'
    });

    // Asociaciones de auditoría
    Stand.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    Stand.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    Stand.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return Stand;
};
