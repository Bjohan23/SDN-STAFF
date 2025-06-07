const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ServicioAdicional = sequelize.define('ServicioAdicional', {
    id_servicio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_servicio: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del servicio no puede estar vacío'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre del servicio debe tener entre 2 y 100 caracteres'
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
    categoria: {
      type: DataTypes.ENUM('electricidad', 'conectividad', 'mobiliario', 'audiovisual', 'limpieza', 'seguridad', 'catering', 'decoracion', 'logistica', 'otros'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['electricidad', 'conectividad', 'mobiliario', 'audiovisual', 'limpieza', 'seguridad', 'catering', 'decoracion', 'logistica', 'otros']],
          msg: 'La categoría debe ser válida'
        }
      }
    },
    tipo_precio: {
      type: DataTypes.ENUM('fijo', 'por_metro', 'por_dia', 'por_evento', 'por_unidad'),
      defaultValue: 'fijo',
      validate: {
        isIn: {
          args: [['fijo', 'por_metro', 'por_dia', 'por_evento', 'por_unidad']],
          msg: 'El tipo de precio debe ser válido'
        }
      }
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'El precio no puede ser negativo'
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
    unidad_medida: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: 'La unidad de medida no puede exceder 20 caracteres'
        }
      }
    },
    cantidad_minima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: {
        min: {
          args: 1,
          msg: 'La cantidad mínima debe ser al menos 1'
        }
      }
    },
    cantidad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La cantidad máxima debe ser al menos 1'
        },
        isGreaterThanMin(value) {
          if (this.cantidad_minima && value && value < this.cantidad_minima) {
            throw new Error('La cantidad máxima debe ser mayor a la cantidad mínima');
          }
        }
      }
    },
    requiere_instalacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tiempo_instalacion_horas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El tiempo de instalación no puede ser negativo'
        }
      }
    },
    disponible_tipos_stand: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tipos de stand donde está disponible este servicio'
    },
    restricciones: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Restricciones específicas del servicio'
    },
    incluye_mantenimiento: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    proveedor_externo: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'El proveedor externo no puede exceder 200 caracteres'
        }
      }
    },
    contacto_proveedor: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Datos de contacto del proveedor'
    },
    estado: {
      type: DataTypes.ENUM('disponible', 'agotado', 'mantenimiento', 'descontinuado'),
      defaultValue: 'disponible',
      validate: {
        isIn: {
          args: [['disponible', 'agotado', 'mantenimiento', 'descontinuado']],
          msg: 'El estado debe ser: disponible, agotado, mantenimiento o descontinuado'
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
    es_popular: {
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
    tableName: 'servicio_adicional',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['nombre_servicio']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: 'disponible'
        }
      },
      popular: {
        where: {
          deleted_at: null,
          estado: 'disponible',
          es_popular: true
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
  ServicioAdicional.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  ServicioAdicional.prototype.isDisponible = function() {
    return this.estado === 'disponible' && !this.isDeleted();
  };

  ServicioAdicional.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  ServicioAdicional.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  ServicioAdicional.prototype.calcularPrecio = function(cantidad = 1, area = null, dias = null) {
    const basePrice = parseFloat(this.precio);
    let finalPrice = 0;

    switch (this.tipo_precio) {
      case 'fijo':
        finalPrice = basePrice;
        break;
      case 'por_metro':
        if (!area) throw new Error('Se requiere área para calcular el precio');
        finalPrice = basePrice * parseFloat(area);
        break;
      case 'por_dia':
        if (!dias) throw new Error('Se requiere cantidad de días para calcular el precio');
        finalPrice = basePrice * parseInt(dias);
        break;
      case 'por_evento':
        finalPrice = basePrice;
        break;
      case 'por_unidad':
        finalPrice = basePrice * parseInt(cantidad);
        break;
      default:
        finalPrice = basePrice;
    }

    return finalPrice;
  };

  ServicioAdicional.prototype.esCantidadValida = function(cantidad) {
    if (!cantidad || cantidad <= 0) return false;
    
    if (this.cantidad_minima && cantidad < this.cantidad_minima) return false;
    if (this.cantidad_maxima && cantidad > this.cantidad_maxima) return false;
    
    return true;
  };

  ServicioAdicional.prototype.esCompatibleConTipoStand = function(tipoStand) {
    if (!this.disponible_tipos_stand) return true; // Si no hay restricciones, es compatible con todos
    
    return this.disponible_tipos_stand.includes(tipoStand);
  };

  // Asociaciones
  ServicioAdicional.associate = function(models) {
    // Relación con StandServicio
    ServicioAdicional.hasMany(models.StandServicio, {
      foreignKey: 'id_servicio',
      as: 'contrataciones'
    });

    // Asociaciones de auditoría
    ServicioAdicional.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    ServicioAdicional.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    ServicioAdicional.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return ServicioAdicional;
};
