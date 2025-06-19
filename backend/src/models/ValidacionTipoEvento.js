const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ValidacionTipoEvento = sequelize.define('ValidacionTipoEvento', {
    id_validacion: {
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
    nombre_validacion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la validación no puede estar vacío'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre de la validación debe tener entre 2 y 100 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'La descripción no puede exceder 500 caracteres'
        }
      }
    },
    tipo_validacion: {
      type: DataTypes.ENUM('campo_requerido', 'valor_minimo', 'valor_maximo', 'formato_especifico', 'fecha_validacion', 'capacidad_validacion', 'ubicacion_validacion', 'precio_validacion', 'custom'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['campo_requerido', 'valor_minimo', 'valor_maximo', 'formato_especifico', 'fecha_validacion', 'capacidad_validacion', 'ubicacion_validacion', 'precio_validacion', 'custom']],
          msg: 'Tipo de validación inválido'
        }
      }
    },
    campo_objetivo: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El campo objetivo no puede estar vacío'
        }
      }
    },
    condicion_validacion: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Condiciones específicas de la validación'
    },
    mensaje_error: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El mensaje de error no puede estar vacío'
        },
        len: {
          args: [5, 255],
          msg: 'El mensaje de error debe tener entre 5 y 255 caracteres'
        }
      }
    },
    es_critica: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    es_advertencia: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    momento_validacion: {
      type: DataTypes.ENUM('creacion', 'edicion', 'publicacion', 'activacion', 'finalizacion', 'siempre'),
      defaultValue: 'creacion',
      validate: {
        isIn: {
          args: [['creacion', 'edicion', 'publicacion', 'activacion', 'finalizacion', 'siempre']],
          msg: 'Momento de validación inválido'
        }
      }
    },
    orden_ejecucion: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: {
          args: 1,
          msg: 'El orden de ejecución debe ser al menos 1'
        }
      }
    },
    estado: {
      type: DataTypes.ENUM('activa', 'inactiva'),
      defaultValue: 'activa',
      validate: {
        isIn: {
          args: [['activa', 'inactiva']],
          msg: 'El estado debe ser: activa o inactiva'
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
    tableName: 'validacion_tipo_evento',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_tipo_evento', 'orden_ejecucion']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: 'activa'
        }
      },
      criticas: {
        where: {
          deleted_at: null,
          estado: 'activa',
          es_critica: true
        }
      },
      advertencias: {
        where: {
          deleted_at: null,
          estado: 'activa',
          es_advertencia: true
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
  ValidacionTipoEvento.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  ValidacionTipoEvento.prototype.isActive = function() {
    return this.estado === 'activa' && !this.isDeleted();
  };

  ValidacionTipoEvento.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  ValidacionTipoEvento.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  ValidacionTipoEvento.prototype.ejecutarValidacion = function(valor, contexto = {}) {
    try {
      const condiciones = this.condicion_validacion;
      
      switch (this.tipo_validacion) {
        case 'campo_requerido':
          return this.validarCampoRequerido(valor);
          
        case 'valor_minimo':
          return this.validarValorMinimo(valor, condiciones.valor_minimo);
          
        case 'valor_maximo':
          return this.validarValorMaximo(valor, condiciones.valor_maximo);
          
        case 'formato_especifico':
          return this.validarFormato(valor, condiciones.patron);
          
        case 'fecha_validacion':
          return this.validarFecha(valor, condiciones);
          
        case 'capacidad_validacion':
          return this.validarCapacidad(valor, condiciones, contexto);
          
        case 'ubicacion_validacion':
          return this.validarUbicacion(valor, condiciones);
          
        case 'precio_validacion':
          return this.validarPrecio(valor, condiciones);
          
        case 'custom':
          return this.validarCustom(valor, condiciones, contexto);
          
        default:
          return { valido: false, mensaje: 'Tipo de validación no reconocido' };
      }
    } catch (error) {
      return {
        valido: false,
        mensaje: `Error en validación: ${error.message}`
      };
    }
  };

  ValidacionTipoEvento.prototype.validarCampoRequerido = function(valor) {
    const esValido = valor !== null && valor !== undefined && valor !== '';
    return {
      valido: esValido,
      mensaje: esValido ? '' : this.mensaje_error
    };
  };

  ValidacionTipoEvento.prototype.validarValorMinimo = function(valor, minimo) {
    const valorNumerico = parseFloat(valor);
    const esValido = !isNaN(valorNumerico) && valorNumerico >= minimo;
    return {
      valido: esValido,
      mensaje: esValido ? '' : this.mensaje_error.replace('{minimo}', minimo)
    };
  };

  ValidacionTipoEvento.prototype.validarValorMaximo = function(valor, maximo) {
    const valorNumerico = parseFloat(valor);
    const esValido = !isNaN(valorNumerico) && valorNumerico <= maximo;
    return {
      valido: esValido,
      mensaje: esValido ? '' : this.mensaje_error.replace('{maximo}', maximo)
    };
  };

  ValidacionTipoEvento.prototype.validarFormato = function(valor, patron) {
    const regex = new RegExp(patron);
    const esValido = regex.test(valor);
    return {
      valido: esValido,
      mensaje: esValido ? '' : this.mensaje_error
    };
  };

  ValidacionTipoEvento.prototype.validarFecha = function(valor, condiciones) {
    const fecha = new Date(valor);
    const ahora = new Date();
    
    let esValido = true;
    let mensaje = '';

    if (isNaN(fecha.getTime())) {
      return { valido: false, mensaje: 'Fecha inválida' };
    }

    if (condiciones.no_pasada && fecha < ahora) {
      esValido = false;
      mensaje = 'La fecha no puede ser en el pasado';
    }

    if (condiciones.dias_anticipacion_minima) {
      const diasDiferencia = Math.ceil((fecha - ahora) / (1000 * 60 * 60 * 24));
      if (diasDiferencia < condiciones.dias_anticipacion_minima) {
        esValido = false;
        mensaje = `Se requiere al menos ${condiciones.dias_anticipacion_minima} días de anticipación`;
      }
    }

    return {
      valido: esValido,
      mensaje: esValido ? '' : (mensaje || this.mensaje_error)
    };
  };

  ValidacionTipoEvento.prototype.validarCapacidad = function(valor, condiciones, contexto) {
    const capacidad = parseInt(valor);
    
    if (isNaN(capacidad) || capacidad <= 0) {
      return { valido: false, mensaje: 'La capacidad debe ser un número positivo' };
    }

    // Validar según el tipo de ubicación si está disponible
    if (contexto.tipo_ubicacion && condiciones.capacidades_por_ubicacion) {
      const limitesUbicacion = condiciones.capacidades_por_ubicacion[contexto.tipo_ubicacion];
      if (limitesUbicacion) {
        if (limitesUbicacion.minima && capacidad < limitesUbicacion.minima) {
          return {
            valido: false,
            mensaje: `Capacidad mínima para ${contexto.tipo_ubicacion}: ${limitesUbicacion.minima}`
          };
        }
        if (limitesUbicacion.maxima && capacidad > limitesUbicacion.maxima) {
          return {
            valido: false,
            mensaje: `Capacidad máxima para ${contexto.tipo_ubicacion}: ${limitesUbicacion.maxima}`
          };
        }
      }
    }

    return { valido: true, mensaje: '' };
  };

  ValidacionTipoEvento.prototype.validarUbicacion = function(valor, condiciones) {
    if (condiciones.ubicaciones_permitidas && !condiciones.ubicaciones_permitidas.includes(valor)) {
      return {
        valido: false,
        mensaje: this.mensaje_error
      };
    }

    return { valido: true, mensaje: '' };
  };

  ValidacionTipoEvento.prototype.validarPrecio = function(valor, condiciones) {
    const precio = parseFloat(valor);
    
    if (isNaN(precio) || precio < 0) {
      return { valido: false, mensaje: 'El precio debe ser un número no negativo' };
    }

    if (condiciones.precio_minimo && precio < condiciones.precio_minimo) {
      return {
        valido: false,
        mensaje: `Precio mínimo requerido: ${condiciones.precio_minimo}`
      };
    }

    if (condiciones.precio_maximo && precio > condiciones.precio_maximo) {
      return {
        valido: false,
        mensaje: `Precio máximo permitido: ${condiciones.precio_maximo}`
      };
    }

    return { valido: true, mensaje: '' };
  };

  ValidacionTipoEvento.prototype.validarCustom = function(valor, condiciones, contexto) {
    // Implementación de validaciones personalizadas
    // Esta función puede ser extendida según necesidades específicas
    return { valido: true, mensaje: '' };
  };

  ValidacionTipoEvento.prototype.applicaAlMomento = function(momento) {
    return this.momento_validacion === 'siempre' || this.momento_validacion === momento;
  };

  // Asociaciones
  ValidacionTipoEvento.associate = function(models) {
    // Relación con TipoEvento
    ValidacionTipoEvento.belongsTo(models.TipoEvento, {
      foreignKey: 'id_tipo_evento',
      as: 'tipoEvento'
    });

    // Asociaciones de auditoría
    ValidacionTipoEvento.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    ValidacionTipoEvento.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    ValidacionTipoEvento.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return ValidacionTipoEvento;
};
