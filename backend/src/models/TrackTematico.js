const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const TrackTematico = sequelize.define('TrackTematico', {
    id_track: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'evento',
        key: 'id_evento'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    nombre_track: {
      type: DataTypes.STRING(120),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre del track no puede estar vacío'
        },
        len: {
          args: [2, 120],
          msg: 'El nombre debe tener entre 2 y 120 caracteres'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(140),
      allowNull: false,
      comment: 'URL-friendly version del nombre'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1500],
          msg: 'La descripción no puede exceder 1500 caracteres'
        }
      }
    },
    // Configuración visual
    color_hex: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Debe ser un color hexadecimal válido (#RRGGBB)'
        }
      },
      comment: 'Color identificativo del track'
    },
    icono: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Icono representativo del track'
    },
    imagen_banner: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de imagen banner del track'
    },
    // Configuración y estado
    orden_visualizacion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Orden para mostrar en listas'
    },
    es_destacado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es track destacado/principal'
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'borrador', 'archivado'),
      defaultValue: 'borrador',
      validate: {
        isIn: {
          args: [['activo', 'inactivo', 'borrador', 'archivado']],
          msg: 'El estado debe ser: activo, inactivo, borrador o archivado'
        }
      }
    },
    // Configuración de público objetivo
    nivel_audiencia: {
      type: DataTypes.ENUM('principiante', 'intermedio', 'avanzado', 'experto', 'mixto'),
      defaultValue: 'mixto',
      validate: {
        isIn: {
          args: [['principiante', 'intermedio', 'avanzado', 'experto', 'mixto']],
          msg: 'El nivel debe ser válido'
        }
      }
    },
    requisitos_previos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Conocimientos o requisitos previos recomendados'
    },
    publico_objetivo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del público objetivo'
    },
    // Coordinación y responsables
    coordinador_principal: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre del coordinador principal del track'
    },
    email_coordinador: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    // Métricas y estadísticas
    total_actividades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Número total de actividades en este track'
    },
    duracion_total_minutos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Duración total de todas las actividades'
    },
    capacidad_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Capacidad total sumada de todas las actividades'
    },
    total_inscritos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Total de personas inscritas en actividades del track'
    },
    // Configuración de visibilidad
    es_publico: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si es visible públicamente'
    },
    requiere_inscripcion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere inscripción previa'
    },
    fecha_apertura_inscripcion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de apertura de inscripciones'
    },
    fecha_cierre_inscripcion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de cierre de inscripciones'
    },
    // Configuración adicional
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas del track'
    },
    palabras_clave: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Palabras clave para búsqueda'
    },
    meta_descripcion: {
      type: DataTypes.STRING(300),
      allowNull: true,
      comment: 'Meta descripción para SEO'
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
    tableName: 'track_tematico',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_evento', 'nombre_track'],
        unique: true,
        name: 'unique_track_per_event'
      },
      {
        fields: ['id_evento']
      },
      {
        fields: ['slug']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['es_destacado']
      },
      {
        fields: ['orden_visualizacion']
      },
      {
        fields: ['nivel_audiencia']
      },
      {
        fields: ['es_publico']
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
      },
      publico: {
        where: {
          deleted_at: null,
          estado: 'activo',
          es_publico: true
        }
      },
      destacados: {
        where: {
          deleted_at: null,
          estado: 'activo',
          es_destacado: true
        }
      },
      porEvento: (eventoId) => ({
        where: {
          deleted_at: null,
          estado: 'activo',
          id_evento: eventoId
        }
      })
    }
  });

  // Métodos de instancia
  TrackTematico.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  TrackTematico.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  TrackTematico.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  TrackTematico.prototype.generateSlug = function() {
    return this.nombre_track
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  TrackTematico.prototype.isPublic = function() {
    return this.es_publico && this.estado === 'activo' && !this.isDeleted();
  };

  TrackTematico.prototype.canRegister = function() {
    if (!this.requiere_inscripcion) return true;
    
    const now = new Date();
    const apertura = this.fecha_apertura_inscripcion;
    const cierre = this.fecha_cierre_inscripcion;
    
    if (apertura && now < apertura) return false;
    if (cierre && now > cierre) return false;
    
    return true;
  };

  TrackTematico.prototype.updateMetrics = async function() {
    const { Actividad } = sequelize.models;
    
    if (Actividad) {
      const metrics = await Actividad.findOne({
        where: {
          id_track: this.id_track,
          deleted_at: null
        },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id_actividad')), 'total_actividades'],
          [sequelize.fn('SUM', sequelize.col('duracion_minutos')), 'duracion_total'],
          [sequelize.fn('SUM', sequelize.col('aforo_maximo')), 'capacidad_total']
        ],
        raw: true
      });

      await this.update({
        total_actividades: parseInt(metrics.total_actividades) || 0,
        duracion_total_minutos: parseInt(metrics.duracion_total) || 0,
        capacidad_total: parseInt(metrics.capacidad_total) || 0
      });
    }
  };

  // Asociaciones
  TrackTematico.associate = function(models) {
    // Relación con Evento
    TrackTematico.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Relación con Actividades
    TrackTematico.hasMany(models.Actividad, {
      foreignKey: 'id_track',
      as: 'actividades'
    });

    // Asociaciones de auditoría
    TrackTematico.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    TrackTematico.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    TrackTematico.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return TrackTematico;
};
