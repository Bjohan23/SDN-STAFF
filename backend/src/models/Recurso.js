const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Recurso = sequelize.define('Recurso', {
    id_recurso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Información básica
    nombre_recurso: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del recurso no puede estar vacío'
        },
        len: {
          args: [2, 120],
          msg: 'El nombre debe tener entre 2 y 120 caracteres'
        }
      }
    },
    codigo_recurso: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: {
        name: 'unique_codigo_recurso',
        msg: 'Este código ya está en uso'
      },
      comment: 'Código único identificativo del recurso'
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
    // Categorización
    tipo_recurso: {
      type: DataTypes.ENUM(
        'sala', 'equipo_audiovisual', 'equipo_informatico', 'mobiliario', 
        'material_oficina', 'catering', 'transporte', 'personal', 
        'herramienta', 'software', 'otros'
      ),
      allowNull: false,
      validate: {
        isIn: {
          args: [[
            'sala', 'equipo_audiovisual', 'equipo_informatico', 'mobiliario', 
            'material_oficina', 'catering', 'transporte', 'personal', 
            'herramienta', 'software', 'otros'
          ]],
          msg: 'El tipo de recurso debe ser válido'
        }
      }
    },
    categoria: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'Categoría específica dentro del tipo'
    },
    subcategoria: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'Subcategoría más específica'
    },
    // Características físicas/técnicas
    marca: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    modelo: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    numero_serie: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Número de serie o identificador único'
    },
    especificaciones_tecnicas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Especificaciones técnicas detalladas'
    },
    // Ubicación y disponibilidad
    ubicacion_fisica: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Ubicación física del recurso'
    },
    es_movil: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si el recurso puede ser trasladado'
    },
    es_compartible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si puede ser usado por múltiples actividades simultáneamente'
    },
    capacidad_maxima: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La capacidad debe ser al menos 1'
        }
      },
      comment: 'Capacidad máxima (para salas, vehículos, etc.)'
    },
    // Estado y condición
    estado: {
      type: DataTypes.ENUM('disponible', 'ocupado', 'mantenimiento', 'dañado', 'inactivo'),
      defaultValue: 'disponible',
      validate: {
        isIn: {
          args: [['disponible', 'ocupado', 'mantenimiento', 'dañado', 'inactivo']],
          msg: 'El estado debe ser válido'
        }
      }
    },
    condicion: {
      type: DataTypes.ENUM('excelente', 'buena', 'regular', 'mala'),
      defaultValue: 'buena',
      validate: {
        isIn: {
          args: [['excelente', 'buena', 'regular', 'mala']],
          msg: 'La condición debe ser válida'
        }
      }
    },
    // Gestión y mantenimiento
    responsable_recurso: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Persona responsable del recurso'
    },
    telefono_responsable: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email_responsable: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    fecha_ultimo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_proximo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    instrucciones_uso: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones especiales para usar el recurso'
    },
    // Costos y reserva
    requiere_reserva: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si requiere reserva previa'
    },
    tiempo_minimo_reserva: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      comment: 'Tiempo mínimo de reserva en minutos'
    },
    tiempo_maximo_reserva: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tiempo máximo de reserva en minutos'
    },
    costo_por_hora: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo por hora de uso'
    },
    costo_fijo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo fijo por uso'
    },
    moneda: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    // Configuración de uso
    requiere_operador: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere un operador especializado'
    },
    requiere_capacitacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere capacitación previa para usarlo'
    },
    tiempo_setup_minutos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Tiempo necesario para configurar el recurso'
    },
    tiempo_desmontaje_minutos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Tiempo necesario para desmontar/guardar'
    },
    // Compatibilidad y restricciones
    tipos_actividad_compatibles: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tipos de actividad compatibles con este recurso'
    },
    restricciones_uso: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Restricciones específicas de uso'
    },
    recursos_dependientes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'IDs de otros recursos que este requiere'
    },
    recursos_incompatibles: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'IDs de recursos incompatibles'
    },
    // Información adicional
    imagen_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de imagen del recurso'
    },
    manual_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL del manual de uso'
    },
    notas_adicionales: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tags para búsqueda y categorización'
    },
    // Métricas de uso
    total_reservas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número total de veces que ha sido reservado'
    },
    horas_uso_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de horas de uso acumuladas'
    },
    calificacion_promedio: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'La calificación no puede ser negativa'
        },
        max: {
          args: 5,
          msg: 'La calificación no puede ser mayor a 5'
        }
      }
    },
    ultima_utilizacion: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'recurso',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['codigo_recurso'],
        unique: true
      },
      {
        fields: ['tipo_recurso']
      },
      {
        fields: ['categoria']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['condicion']
      },
      {
        fields: ['ubicacion_fisica']
      },
      {
        fields: ['es_movil']
      },
      {
        fields: ['es_compartible']
      },
      {
        fields: ['requiere_reserva']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: { [Op.ne]: 'inactivo' }
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      disponibles: {
        where: {
          deleted_at: null,
          estado: 'disponible'
        }
      },
      porTipo: (tipo) => ({
        where: {
          deleted_at: null,
          tipo_recurso: tipo,
          estado: { [Op.ne]: 'inactivo' }
        }
      }),
      compartibles: {
        where: {
          deleted_at: null,
          es_compartible: true,
          estado: 'disponible'
        }
      }
    }
  });

  // Métodos de instancia
  Recurso.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  Recurso.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  Recurso.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  Recurso.prototype.isAvailable = function() {
    return this.estado === 'disponible' && !this.isDeleted();
  };

  Recurso.prototype.needsMaintenance = function() {
    if (!this.fecha_proximo_mantenimiento) return false;
    return new Date() >= new Date(this.fecha_proximo_mantenimiento);
  };

  Recurso.prototype.canBeUsedFor = function(tipoActividad) {
    if (!this.tipos_actividad_compatibles) return true;
    return this.tipos_actividad_compatibles.includes(tipoActividad);
  };

  Recurso.prototype.getTotalCost = function(duracionMinutos) {
    let costo = 0;
    
    if (this.costo_fijo) {
      costo += parseFloat(this.costo_fijo);
    }
    
    if (this.costo_por_hora && duracionMinutos) {
      const horas = duracionMinutos / 60;
      costo += parseFloat(this.costo_por_hora) * horas;
    }
    
    return costo;
  };

  Recurso.prototype.isCompatibleWith = function(otroRecursoId) {
    if (!this.recursos_incompatibles) return true;
    return !this.recursos_incompatibles.includes(otroRecursoId);
  };

  Recurso.prototype.requiresResource = function(otroRecursoId) {
    if (!this.recursos_dependientes) return false;
    return this.recursos_dependientes.includes(otroRecursoId);
  };

  Recurso.prototype.updateUsageMetrics = async function() {
    const { ActividadRecurso } = sequelize.models;
    
    if (ActividadRecurso) {
      const stats = await ActividadRecurso.findOne({
        where: {
          id_recurso: this.id_recurso,
          deleted_at: null
        },
        include: [{
          model: sequelize.models.Actividad,
          as: 'actividad',
          attributes: ['duracion_minutos'],
          where: { deleted_at: null }
        }],
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id_actividad_recurso')), 'total_reservas'],
          [sequelize.fn('SUM', sequelize.col('actividad.duracion_minutos')), 'horas_uso']
        ],
        raw: true
      });

      await this.update({
        total_reservas: parseInt(stats.total_reservas) || 0,
        horas_uso_total: Math.round((parseInt(stats.horas_uso) || 0) / 60),
        ultima_utilizacion: new Date()
      });
    }
  };

  Recurso.prototype.marcarComoOcupado = function() {
    return this.update({ estado: 'ocupado' });
  };

  Recurso.prototype.marcarComoDisponible = function() {
    return this.update({ estado: 'disponible' });
  };

  // Asociaciones
  Recurso.associate = function(models) {
    // Relación many-to-many con Actividad a través de ActividadRecurso
    Recurso.belongsToMany(models.Actividad, {
      through: 'ActividadRecurso',
      foreignKey: 'id_recurso',
      otherKey: 'id_actividad',
      as: 'actividades'
    });

    // Relación directa con ActividadRecurso
    Recurso.hasMany(models.ActividadRecurso, {
      foreignKey: 'id_recurso',
      as: 'asignacionesActividad'
    });

    // Asociaciones de auditoría
    Recurso.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    Recurso.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    Recurso.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return Recurso;
};
