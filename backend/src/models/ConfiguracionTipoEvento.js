const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ConfiguracionTipoEvento = sequelize.define('ConfiguracionTipoEvento', {
    id_configuracion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_tipo_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipo_evento',
        key: 'id_tipo_evento'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El tipo de evento es requerido'
        }
      }
    },
    modalidad: {
      type: DataTypes.ENUM('presencial', 'virtual', 'hibrido'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['presencial', 'virtual', 'hibrido']],
          msg: 'La modalidad debe ser: presencial, virtual o híbrido'
        }
      }
    },
    permite_presencial: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permite_virtual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    permite_hibrido: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Configuraciones de ubicación física
    requiere_ubicacion_fisica: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    tipos_ubicacion_permitidos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tipos de ubicación permitidos'
    },
    capacidad_minima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La capacidad mínima debe ser al menos 1'
        }
      }
    },
    capacidad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La capacidad máxima debe ser al menos 1'
        },
        isGreaterThanMin(value) {
          if (this.capacidad_minima && value && value < this.capacidad_minima) {
            throw new Error('La capacidad máxima debe ser mayor a la capacidad mínima');
          }
        }
      }
    },
    // Configuraciones de plataforma virtual
    requiere_plataforma_virtual: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    plataformas_permitidas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Plataformas virtuales permitidas'
    },
    permite_transmision_vivo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    permite_grabacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    permite_interaccion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Configuraciones de stands
    permite_stands_fisicos: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permite_stands_virtuales: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tipos_stand_permitidos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tipos de stand permitidos'
    },
    // Configuraciones de registro y acceso
    requiere_registro_previo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permite_registro_in_situ: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    requiere_aprobacion_registro: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Configuraciones de precios
    tiene_costo_entrada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    precio_base_entrada: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El precio no puede ser negativo'
        }
      }
    },
    moneda_precio: {
      type: DataTypes.STRING(3),
      defaultValue: 'PEN',
      validate: {
        len: {
          args: [3, 3],
          msg: 'La moneda debe tener 3 caracteres (ISO 4217)'
        }
      }
    },
    permite_descuentos: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Configuraciones de duración
    duracion_minima_horas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La duración mínima debe ser al menos 1 hora'
        }
      }
    },
    duracion_maxima_horas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La duración máxima debe ser al menos 1 hora'
        },
        isGreaterThanMin(value) {
          if (this.duracion_minima_horas && value && value < this.duracion_minima_horas) {
            throw new Error('La duración máxima debe ser mayor a la duración mínima');
          }
        }
      }
    },
    permite_eventos_multidia: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    // Configuraciones específicas
    requiere_acreditacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    permite_networking: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permite_conferencias: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permite_talleres: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Restricciones y validaciones
    restricciones_especiales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Restricciones especiales del tipo de evento'
    },
    validaciones_requeridas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Validaciones requeridas antes de crear evento'
    },
    campos_obligatorios: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Campos obligatorios para este tipo de evento'
    },
    // Plantillas y configuraciones predefinidas
    plantilla_configuracion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Plantilla de configuración predefinida'
    },
    servicios_incluidos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios incluidos por defecto'
    },
    servicios_recomendados: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios recomendados para este tipo'
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'en_revision'),
      defaultValue: 'activo',
      validate: {
        isIn: {
          args: [['activo', 'inactivo', 'en_revision']],
          msg: 'El estado debe ser: activo, inactivo o en_revision'
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
    tableName: 'configuracion_tipo_evento',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['id_tipo_evento', 'modalidad'],
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
      presencial: {
        where: {
          deleted_at: null,
          modalidad: 'presencial'
        }
      },
      virtual: {
        where: {
          deleted_at: null,
          modalidad: 'virtual'
        }
      },
      hibrido: {
        where: {
          deleted_at: null,
          modalidad: 'hibrido'
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
  ConfiguracionTipoEvento.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  ConfiguracionTipoEvento.prototype.isActive = function() {
    return this.estado === 'activo' && !this.isDeleted();
  };

  ConfiguracionTipoEvento.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  ConfiguracionTipoEvento.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  ConfiguracionTipoEvento.prototype.isCapacidadValida = function(capacidad) {
    if (!capacidad || capacidad <= 0) return false;
    
    if (this.capacidad_minima && capacidad < this.capacidad_minima) return false;
    if (this.capacidad_maxima && capacidad > this.capacidad_maxima) return false;
    
    return true;
  };

  ConfiguracionTipoEvento.prototype.isDuracionValida = function(horas) {
    if (!horas || horas <= 0) return false;
    
    if (this.duracion_minima_horas && horas < this.duracion_minima_horas) return false;
    if (this.duracion_maxima_horas && horas > this.duracion_maxima_horas) return false;
    
    return true;
  };

  ConfiguracionTipoEvento.prototype.isUbicacionPermitida = function(tipoUbicacion) {
    if (!this.tipos_ubicacion_permitidos) return true;
    return this.tipos_ubicacion_permitidos.includes(tipoUbicacion);
  };

  ConfiguracionTipoEvento.prototype.isPlataformaPermitida = function(plataforma) {
    if (!this.plataformas_permitidas) return true;
    return this.plataformas_permitidas.includes(plataforma);
  };

  ConfiguracionTipoEvento.prototype.isTipoStandPermitido = function(tipoStand) {
    if (!this.tipos_stand_permitidos) return true;
    return this.tipos_stand_permitidos.includes(tipoStand);
  };

  ConfiguracionTipoEvento.prototype.getModalidadesPermitidas = function() {
    const modalidades = [];
    if (this.permite_presencial) modalidades.push('presencial');
    if (this.permite_virtual) modalidades.push('virtual');
    if (this.permite_hibrido) modalidades.push('hibrido');
    return modalidades;
  };

  ConfiguracionTipoEvento.prototype.validarConfiguracionEvento = function(datosEvento) {
    const errores = [];

    // Validar capacidad
    if (datosEvento.capacidad_maxima && !this.isCapacidadValida(datosEvento.capacidad_maxima)) {
      errores.push({
        campo: 'capacidad_maxima',
        mensaje: `Capacidad debe estar entre ${this.capacidad_minima || 1} y ${this.capacidad_maxima || 'sin límite'}`
      });
    }

    // Validar duración
    if (datosEvento.duracion_horas && !this.isDuracionValida(datosEvento.duracion_horas)) {
      errores.push({
        campo: 'duracion_horas',
        mensaje: `Duración debe estar entre ${this.duracion_minima_horas || 1} y ${this.duracion_maxima_horas || 'sin límite'} horas`
      });
    }

    // Validar ubicación si es presencial
    if (datosEvento.modalidad !== 'virtual' && datosEvento.tipo_ubicacion && !this.isUbicacionPermitida(datosEvento.tipo_ubicacion)) {
      errores.push({
        campo: 'tipo_ubicacion',
        mensaje: `Tipo de ubicación no permitido para este tipo de evento`
      });
    }

    // Validar plataforma si es virtual/híbrido
    if (datosEvento.modalidad !== 'presencial' && datosEvento.plataforma_virtual && !this.isPlataformaPermitida(datosEvento.plataforma_virtual)) {
      errores.push({
        campo: 'plataforma_virtual',
        mensaje: `Plataforma virtual no permitida para este tipo de evento`
      });
    }

    return errores;
  };

  // Asociaciones
  ConfiguracionTipoEvento.associate = function(models) {
    // Relación con TipoEvento
    ConfiguracionTipoEvento.belongsTo(models.TipoEvento, {
      foreignKey: 'id_tipo_evento',
      as: 'tipoEvento'
    });

    // Asociaciones de auditoría
    ConfiguracionTipoEvento.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    ConfiguracionTipoEvento.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    ConfiguracionTipoEvento.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return ConfiguracionTipoEvento;
};
