const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Ponente = sequelize.define('Ponente', {
    id_ponente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Información personal
    nombre_completo: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre completo no puede estar vacío'
        },
        len: {
          args: [2, 150],
          msg: 'El nombre debe tener entre 2 y 150 caracteres'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(170),
      allowNull: false,
      unique: {
        name: 'unique_ponente_slug',
        msg: 'Este slug ya está en uso'
      },
      comment: 'URL-friendly version del nombre'
    },
    titulo_profesional: {
      type: DataTypes.STRING(120),
      allowNull: true,
      comment: 'Título o cargo principal (CEO, Dr., Ing., etc.)'
    },
    biografia: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 3000],
          msg: 'La biografía no puede exceder 3000 caracteres'
        }
      }
    },
    biografia_corta: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Versión resumida de la biografía'
    },
    // Información de contacto
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El email es requerido'
        },
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    pais: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    ciudad: {
      type: DataTypes.STRING(80),
      allowNull: true
    },
    // Información profesional
    empresa_organizacion: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: 'Empresa u organización donde trabaja'
    },
    cargo_actual: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Cargo actual en la empresa/organización'
    },
    especialidades: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array de especialidades o áreas de expertise'
    },
    industrias: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array de industrias en las que tiene experiencia'
    },
    años_experiencia: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'Los años de experiencia no pueden ser negativos'
        },
        max: {
          args: 60,
          msg: 'Los años de experiencia no pueden ser más de 60'
        }
      }
    },
    // Medios y redes sociales
    foto_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de la foto del ponente'
    },
    sitio_web: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Debe ser una URL válida'
        }
      }
    },
    linkedin: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'URL del perfil de LinkedIn'
    },
    twitter: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Handle de Twitter (sin @)'
    },
    instagram: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Handle de Instagram (sin @)'
    },
    youtube: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'URL del canal de YouTube'
    },
    redes_sociales_adicionales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Otras redes sociales'
    },
    // Configuración del ponente
    tipo_ponente: {
      type: DataTypes.ENUM('keynote', 'speaker', 'panelista', 'moderador', 'tallerista', 'invitado_especial'),
      defaultValue: 'speaker',
      validate: {
        isIn: {
          args: [['keynote', 'speaker', 'panelista', 'moderador', 'tallerista', 'invitado_especial']],
          msg: 'El tipo de ponente debe ser válido'
        }
      }
    },
    nivel_ponente: {
      type: DataTypes.ENUM('nacional', 'internacional', 'local', 'regional'),
      defaultValue: 'nacional',
      validate: {
        isIn: {
          args: [['nacional', 'internacional', 'local', 'regional']],
          msg: 'El nivel debe ser válido'
        }
      }
    },
    es_destacado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es ponente destacado/principal'
    },
    disponible_virtual: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si puede participar virtualmente'
    },
    disponible_presencial: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si puede participar presencialmente'
    },
    // Información de participación
    honorarios: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Honorarios solicitados'
    },
    moneda_honorarios: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
      comment: 'Moneda de los honorarios'
    },
    requiere_viaticos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere viáticos'
    },
    requiere_hospedaje: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere hospedaje'
    },
    notas_participacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas especiales sobre su participación'
    },
    // Estado y disponibilidad
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'pendiente', 'confirmado', 'cancelado'),
      defaultValue: 'pendiente',
      validate: {
        isIn: {
          args: [['activo', 'inactivo', 'pendiente', 'confirmado', 'cancelado']],
          msg: 'El estado debe ser válido'
        }
      }
    },
    fecha_confirmacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que confirmó su participación'
    },
    confirmado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    // Configuración adicional
    idiomas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Idiomas que maneja (código y nivel)'
    },
    zona_horaria: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Zona horaria del ponente'
    },
    equipos_tecnicos_requeridos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de equipos técnicos que requiere'
    },
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas del ponente'
    },
    // Métricas
    total_actividades: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Número total de actividades asignadas'
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
      },
      comment: 'Calificación promedio de sus presentaciones'
    },
    total_participantes_alcanzados: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de participantes alcanzados en todas sus actividades'
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
    tableName: 'ponente',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['slug'],
        unique: true
      },
      {
        fields: ['email']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['tipo_ponente']
      },
      {
        fields: ['nivel_ponente']
      },
      {
        fields: ['es_destacado']
      },
      {
        fields: ['empresa_organizacion']
      },
      {
        fields: ['pais']
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
      confirmados: {
        where: {
          deleted_at: null,
          estado: 'confirmado'
        }
      },
      destacados: {
        where: {
          deleted_at: null,
          es_destacado: true,
          estado: ['activo', 'confirmado']
        }
      },
      disponibles: {
        where: {
          deleted_at: null,
          estado: ['activo', 'confirmado']
        }
      }
    }
  });

  // Métodos de instancia
  Ponente.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  Ponente.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  Ponente.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  Ponente.prototype.generateSlug = function() {
    return this.nombre_completo
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  Ponente.prototype.isConfirmed = function() {
    return this.estado === 'confirmado';
  };

  Ponente.prototype.canParticipate = function(modalidad = 'presencial') {
    if (!this.isConfirmed()) return false;
    
    if (modalidad === 'virtual') return this.disponible_virtual;
    if (modalidad === 'presencial') return this.disponible_presencial;
    if (modalidad === 'hibrido') return this.disponible_virtual || this.disponible_presencial;
    
    return false;
  };

  Ponente.prototype.confirmar = function(confirmadoPor = null) {
    return this.update({
      estado: 'confirmado',
      fecha_confirmacion: new Date(),
      confirmado_por: confirmadoPor
    });
  };

  Ponente.prototype.updateMetrics = async function() {
    const { ActividadPonente, InscripcionActividad } = sequelize.models;
    
    if (ActividadPonente) {
      const actividades = await ActividadPonente.count({
        where: {
          id_ponente: this.id_ponente,
          deleted_at: null
        }
      });

      let totalParticipantes = 0;
      if (InscripcionActividad) {
        const actividadesPonente = await ActividadPonente.findAll({
          where: {
            id_ponente: this.id_ponente,
            deleted_at: null
          },
          attributes: ['id_actividad']
        });

        const actividadIds = actividadesPonente.map(a => a.id_actividad);
        
        if (actividadIds.length > 0) {
          totalParticipantes = await InscripcionActividad.count({
            where: {
              id_actividad: { [Op.in]: actividadIds },
              estado: ['confirmada', 'asistio'],
              deleted_at: null
            }
          });
        }
      }

      await this.update({
        total_actividades: actividades,
        total_participantes_alcanzados: totalParticipantes
      });
    }
  };

  Ponente.prototype.getFullName = function() {
    return this.titulo_profesional 
      ? `${this.titulo_profesional} ${this.nombre_completo}`
      : this.nombre_completo;
  };

  Ponente.prototype.getSocialLinks = function() {
    const links = {};
    
    if (this.sitio_web) links.website = this.sitio_web;
    if (this.linkedin) links.linkedin = this.linkedin;
    if (this.twitter) links.twitter = `https://twitter.com/${this.twitter}`;
    if (this.instagram) links.instagram = `https://instagram.com/${this.instagram}`;
    if (this.youtube) links.youtube = this.youtube;
    
    if (this.redes_sociales_adicionales) {
      Object.assign(links, this.redes_sociales_adicionales);
    }
    
    return links;
  };

  // Asociaciones
  Ponente.associate = function(models) {
    // Relación many-to-many con Actividad a través de ActividadPonente
    Ponente.belongsToMany(models.Actividad, {
      through: 'ActividadPonente',
      foreignKey: 'id_ponente',
      otherKey: 'id_actividad',
      as: 'actividades'
    });

    // Relación directa con ActividadPonente
    Ponente.hasMany(models.ActividadPonente, {
      foreignKey: 'id_ponente',
      as: 'asignacionesActividad'
    });

    // Relación con usuario que confirmó
    Ponente.belongsTo(models.Usuario, {
      foreignKey: 'confirmado_por',
      as: 'confirmadoPorUsuario'
    });

    // Asociaciones de auditoría
    Ponente.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    Ponente.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    Ponente.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return Ponente;
};
