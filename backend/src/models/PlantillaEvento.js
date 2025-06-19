const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const PlantillaEvento = sequelize.define('PlantillaEvento', {
    id_plantilla: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_plantilla: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la plantilla no puede estar vacío'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre de la plantilla debe tener entre 2 y 100 caracteres'
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
    modalidad_predefinida: {
      type: DataTypes.ENUM('presencial', 'virtual', 'hibrido'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['presencial', 'virtual', 'hibrido']],
          msg: 'La modalidad debe ser: presencial, virtual o híbrido'
        }
      }
    },
    // Configuración predefinida del evento
    configuracion_basica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuración básica del evento'
    },
    duracion_predefinida: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Duración predefinida'
    },
    ubicacion_sugerida: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tipos de ubicación sugeridos'
    },
    // Configuración de participantes
    capacidad_sugerida: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Capacidad sugerida'
    },
    perfil_asistentes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Perfil típico de asistentes'
    },
    // Configuración de stands
    stands_recomendados: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tipos y cantidad de stands recomendados'
    },
    layout_sugerido: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Layout sugerido para el evento'
    },
    // Servicios y recursos
    servicios_incluidos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios incluidos en la plantilla'
    },
    servicios_opcionales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios opcionales recomendados'
    },
    recursos_necesarios: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Recursos necesarios para el evento'
    },
    // Configuración de precios
    estructura_precios: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Estructura de precios sugerida'
    },
    presupuesto_estimado: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Presupuesto estimado por categorías'
    },
    // Cronograma y fases
    cronograma_tipo: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Cronograma típico del evento'
    },
    fases_planificacion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Fases de planificación recomendadas'
    },
    tareas_previas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tareas previas recomendadas'
    },
    // Marketing y promoción
    estrategia_marketing: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Estrategia de marketing sugerida'
    },
    canales_promocion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Canales de promoción recomendados'
    },
    // Configuración tecnológica
    tecnologia_requerida: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tecnología requerida para el evento'
    },
    plataformas_recomendadas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Plataformas recomendadas'
    },
    // Métricas y KPIs
    kpis_sugeridos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'KPIs sugeridos para medir éxito'
    },
    metricas_seguimiento: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Métricas de seguimiento recomendadas'
    },
    // Configuraciones especiales
    requisitos_especiales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Requisitos especiales del tipo de evento'
    },
    consideraciones_legales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Consideraciones legales a tener en cuenta'
    },
    // Metadatos de la plantilla
    es_plantilla_base: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    es_personalizable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    nivel_complejidad: {
      type: DataTypes.ENUM('basico', 'intermedio', 'avanzado', 'experto'),
      defaultValue: 'basico',
      validate: {
        isIn: {
          args: [['basico', 'intermedio', 'avanzado', 'experto']],
          msg: 'El nivel de complejidad debe ser: basico, intermedio, avanzado o experto'
        }
      }
    },
    tiempo_planificacion_sugerido: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'El tiempo de planificación debe ser al menos 1 día'
        }
      }
    },
    popularidad: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: {
          args: 0,
          msg: 'La popularidad no puede ser negativa'
        }
      }
    },
    calificacion_promedio: {
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
    estado: {
      type: DataTypes.ENUM('activa', 'inactiva', 'en_revision', 'archivada'),
      defaultValue: 'activa',
      validate: {
        isIn: {
          args: [['activa', 'inactiva', 'en_revision', 'archivada']],
          msg: 'El estado debe ser: activa, inactiva, en_revision o archivada'
        }
      }
    },
    version: {
      type: DataTypes.STRING(10),
      defaultValue: '1.0',
      validate: {
        len: {
          args: [1, 10],
          msg: 'La versión debe tener entre 1 y 10 caracteres'
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
    tableName: 'plantilla_evento',
    timestamps: false,
    underscored: false,
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: 'activa'
        }
      },
      populares: {
        where: {
          deleted_at: null,
          estado: 'activa'
        },
        order: [['popularidad', 'DESC'], ['calificacion_promedio', 'DESC']]
      },
      basicas: {
        where: {
          deleted_at: null,
          estado: 'activa',
          es_plantilla_base: true
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
  PlantillaEvento.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  PlantillaEvento.prototype.isActive = function() {
    return this.estado === 'activa' && !this.isDeleted();
  };

  PlantillaEvento.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy,
      estado: 'archivada'
    });
  };

  PlantillaEvento.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null,
      estado: 'activa'
    });
  };

  PlantillaEvento.prototype.incrementarPopularidad = function() {
    return this.increment('popularidad');
  };

  PlantillaEvento.prototype.actualizarCalificacion = function(nuevaCalificacion) {
    if (nuevaCalificacion < 1 || nuevaCalificacion > 5) {
      throw new Error('La calificación debe estar entre 1 y 5');
    }
    
    // Cálculo simple de promedio (en producción sería más complejo)
    const nuevoPromedio = this.calificacion_promedio 
      ? ((this.calificacion_promedio + nuevaCalificacion) / 2)
      : nuevaCalificacion;
    
    return this.update({ calificacion_promedio: nuevoPromedio });
  };

  PlantillaEvento.prototype.generarConfiguracionEvento = function(datosPersonalizados = {}) {
    const configuracionBase = {
      // Configuración básica
      nombre_evento: datosPersonalizados.nombre_evento || this.configuracion_basica?.nombre_sugerido || '',
      descripcion: datosPersonalizados.descripcion || this.configuracion_basica?.descripcion_base || '',
      modalidad: datosPersonalizados.modalidad || this.modalidad_predefinida,
      
      // Duración
      duracion_dias: datosPersonalizados.duracion_dias || this.duracion_predefinida?.dias || 1,
      hora_inicio: datosPersonalizados.hora_inicio || this.duracion_predefinida?.hora_inicio || '09:00',
      hora_fin: datosPersonalizados.hora_fin || this.duracion_predefinida?.hora_fin || '18:00',
      
      // Capacidad
      capacidad_maxima: datosPersonalizados.capacidad_maxima || this.capacidad_sugerida?.optima || 100,
      
      // Ubicación (si es presencial)
      tipo_ubicacion: this.modalidad_predefinida !== 'virtual' 
        ? (datosPersonalizados.tipo_ubicacion || this.ubicacion_sugerida?.tipo_preferido)
        : null,
      
      // Plataforma (si es virtual/híbrido)
      plataforma_virtual: this.modalidad_predefinida !== 'presencial'
        ? (datosPersonalizados.plataforma_virtual || this.plataformas_recomendadas?.[0])
        : null,
      
      // Precios
      precio_entrada: datosPersonalizados.precio_entrada || this.estructura_precios?.precio_base || 0,
      
      // Servicios
      servicios_incluidos: this.servicios_incluidos || [],
      servicios_recomendados: this.servicios_opcionales || []
    };

    return configuracionBase;
  };

  PlantillaEvento.prototype.validarPersonalizacion = function(datosPersonalizados) {
    const errores = [];

    // Validar modalidad
    if (datosPersonalizados.modalidad && datosPersonalizados.modalidad !== this.modalidad_predefinida) {
      if (!this.es_personalizable) {
        errores.push({
          campo: 'modalidad',
          mensaje: 'Esta plantilla no permite cambiar la modalidad predefinida'
        });
      }
    }

    // Validar capacidad
    if (datosPersonalizados.capacidad_maxima && this.capacidad_sugerida) {
      const min = this.capacidad_sugerida.minima;
      const max = this.capacidad_sugerida.maxima;
      
      if (min && datosPersonalizados.capacidad_maxima < min) {
        errores.push({
          campo: 'capacidad_maxima',
          mensaje: `La capacidad mínima recomendada para esta plantilla es ${min}`
        });
      }
      
      if (max && datosPersonalizados.capacidad_maxima > max) {
        errores.push({
          campo: 'capacidad_maxima',
          mensaje: `La capacidad máxima recomendada para esta plantilla es ${max}`
        });
      }
    }

    return errores;
  };

  PlantillaEvento.prototype.obtenerTareasRecomendadas = function(diasAnticipacion) {
    if (!this.tareas_previas) return [];

    return this.tareas_previas.filter(tarea => {
      return !tarea.dias_anticipacion || tarea.dias_anticipacion <= diasAnticipacion;
    }).sort((a, b) => (b.dias_anticipacion || 0) - (a.dias_anticipacion || 0));
  };

  // Asociaciones
  PlantillaEvento.associate = function(models) {
    // Relación con TipoEvento
    PlantillaEvento.belongsTo(models.TipoEvento, {
      foreignKey: 'id_tipo_evento',
      as: 'tipoEvento'
    });

    // Asociaciones de auditoría
    PlantillaEvento.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    PlantillaEvento.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    PlantillaEvento.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return PlantillaEvento;
};
