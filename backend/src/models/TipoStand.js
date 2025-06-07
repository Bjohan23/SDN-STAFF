const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TipoStand = sequelize.define('TipoStand', {
    id_tipo_stand: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_tipo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_nombre_tipo_stand',
        msg: 'Este tipo de stand ya existe'
      },
      validate: {
        notEmpty: {
          msg: 'El nombre del tipo de stand no puede estar vacío'
        },
        len: {
          args: [2, 50],
          msg: 'El nombre del tipo debe tener entre 2 y 50 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'La descripción no puede exceder 1000 caracteres'
        }
      }
    },
    area_minima: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El área mínima no puede ser negativa'
        }
      }
    },
    area_maxima: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El área máxima no puede ser negativa'
        },
        isGreaterThanMin(value) {
          if (this.area_minima && value && value < this.area_minima) {
            throw new Error('El área máxima debe ser mayor al área mínima');
          }
        }
      }
    },
    precio_base: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'El precio base no puede ser negativo'
        }
      }
    },
    moneda: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'PEN',
      validate: {
        len: {
          args: [3, 3],
          msg: 'La moneda debe tener 3 caracteres (ISO 4217)'
        }
      }
    },
    equipamiento_incluido: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de equipamiento incluido por defecto'
    },
    servicios_incluidos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios incluidos en el precio base'
    },
    caracteristicas_especiales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Características especiales del tipo de stand'
    },
    restricciones: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Restricciones específicas para este tipo'
    },
    permite_personalizacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requiere_aprobacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'descontinuado'),
      defaultValue: 'activo',
      validate: {
        isIn: {
          args: [['activo', 'inactivo', 'descontinuado']],
          msg: 'El estado debe ser: activo, inactivo o descontinuado'
        }
      }
    },
    orden_visualizacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El orden de visualización no puede ser negativo'
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
    tableName: 'tipo_stand',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['nombre_tipo']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: 'activo'
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
  TipoStand.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  TipoStand.prototype.isActive = function() {
    return this.estado === 'activo' && !this.isDeleted();
  };

  TipoStand.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  TipoStand.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  TipoStand.prototype.calcularPrecio = function(area) {
    if (!area || area <= 0) return 0;
    return parseFloat(this.precio_base) * parseFloat(area);
  };

  TipoStand.prototype.esAreaValida = function(area) {
    if (!area || area <= 0) return false;
    
    if (this.area_minima && area < this.area_minima) return false;
    if (this.area_maxima && area > this.area_maxima) return false;
    
    return true;
  };

  // Asociaciones
  TipoStand.associate = function(models) {
    // Relación con Stand
    TipoStand.hasMany(models.Stand, {
      foreignKey: 'id_tipo_stand',
      as: 'stands'
    });

    // Asociaciones de auditoría
    TipoStand.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    TipoStand.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    TipoStand.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return TipoStand;
};
