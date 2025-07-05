const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Actividad = sequelize.define('Actividad', {
    id_actividad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    // Relaciones principales
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
    id_track: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'track_tematico',
        key: 'id_track'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    id_sala_virtual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sala_virtual',
        key: 'id_sala_virtual'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    // Información básica
    titulo: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El título no puede estar vacío'
        },
        len: {
          args: [5, 200],
          msg: 'El título debe tener entre 5 y 200 caracteres'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      comment: 'URL-friendly version del título'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 3000],
          msg: 'La descripción no puede exceder 3000 caracteres'
        }
      }
    },
    descripcion_corta: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Versión resumida de la descripción'
    },
    // Tipo y categorización
    tipo_actividad: {
      type: DataTypes.ENUM(
        'conferencia', 'taller', 'demostracion', 'panel', 'keynote',
        'networking', 'ceremonia', 'masterclass', 'webinar', 'mesa_redonda',
        'presentacion', 'capacitacion', 'concurso', 'exhibicion', 'otros'
      ),
      allowNull: false,
      validate: {
        isIn: {
          args: [[
            'conferencia', 'taller', 'demostracion', 'panel', 'keynote',
            'networking', 'ceremonia', 'masterclass', 'webinar', 'mesa_redonda',
            'presentacion', 'capacitacion', 'concurso', 'exhibicion', 'otros'
          ]],
          msg: 'El tipo de actividad debe ser válido'
        }
      }
    },
    categoria: {
      type: DataTypes.STRING(80),
      allowNull: true,
      comment: 'Categoría específica dentro del tipo'
    },
    nivel_audiencia: {
      type: DataTypes.ENUM('principiante', 'intermedio', 'avanzado', 'experto', 'todos'),
      defaultValue: 'todos',
      validate: {
        isIn: {
          args: [['principiante', 'intermedio', 'avanzado', 'experto', 'todos']],
          msg: 'El nivel de audiencia debe ser válido'
        }
      }
    },
    // Programación temporal
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La fecha de inicio es requerida'
        },
        isDate: {
          msg: 'Debe ser una fecha válida'
        }
      }
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La fecha de fin es requerida'
        },
        isDate: {
          msg: 'Debe ser una fecha válida'
        }
      }
    },
    duracion_minutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: 5,
          msg: 'La duración mínima es 5 minutos'
        },
        max: {
          args: 1440,
          msg: 'La duración máxima es 24 horas (1440 minutos)'
        }
      }
    },
    tiempo_setup_minutos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Tiempo de preparación antes de la actividad'
    },
    tiempo_desmontaje_minutos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Tiempo de desmontaje después de la actividad'
    },
    // Ubicación y modalidad
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
    ubicacion_fisica: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Ubicación física (sala, auditorio, etc.)'
    },
    direccion_completa: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Dirección completa del lugar físico'
    },
    instrucciones_ubicacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones para llegar al lugar'
    },
    // Capacidad y aforo
    aforo_maximo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      validate: {
        min: {
          args: 1,
          msg: 'El aforo mínimo es 1 persona'
        }
      }
    },
    aforo_presencial: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Aforo específico para modalidad presencial'
    },
    aforo_virtual: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Aforo específico para modalidad virtual'
    },
    total_inscritos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Total de personas inscritas'
    },
    lista_espera_activa: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si tiene lista de espera cuando se llena'
    },
    // Inscripción y requisitos
    requiere_inscripcion: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si requiere inscripción previa'
    },
    inscripcion_abierta: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si las inscripciones están abiertas'
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
    requisitos_inscripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Requisitos específicos para inscribirse'
    },
    costo_inscripcion: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo de inscripción'
    },
    moneda: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    es_gratuita: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si la actividad es gratuita'
    },
    // Estado y visibilidad
    estado: {
      type: DataTypes.ENUM('borrador', 'programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'postponed'),
      defaultValue: 'borrador',
      validate: {
        isIn: {
          args: [['borrador', 'programada', 'confirmada', 'en_curso', 'completada', 'cancelada', 'postponed']],
          msg: 'El estado debe ser válido'
        }
      }
    },
    es_publica: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si es visible públicamente'
    },
    es_destacada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es actividad destacada'
    },
    publicar_en_agenda: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si aparece en la agenda pública'
    },
    // Configuración de streaming y grabación
    permite_grabacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si permite grabar la actividad'
    },
    se_grabara: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si se va a grabar esta actividad'
    },
    url_grabacion: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de la grabación después del evento'
    },
    permite_streaming: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si permite transmisión en vivo'
    },
    url_streaming: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de transmisión en vivo'
    },
    streaming_password: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Contraseña para el streaming'
    },
    // Información adicional
    objetivos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Objetivos de aprendizaje o resultados esperados'
    },
    requisitos_previos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Conocimientos o requisitos previos'
    },
    materiales_incluidos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Materiales que se proporcionarán'
    },
    materiales_requeridos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Materiales que debe traer el participante'
    },
    certificado_disponible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si otorga certificado de participación'
    },
    // Coordinación y responsables
    coordinador_principal: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Coordinador principal de la actividad'
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
    contacto_tecnico: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Contacto para soporte técnico'
    },
    // Configuración específica
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas de la actividad'
    },
    notas_internas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas internas para organizadores'
    },
    notas_participantes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas importantes para participantes'
    },
    // SEO y búsqueda
    palabras_clave: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Palabras clave para búsqueda'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Tags para categorización y búsqueda'
    },
    // Métricas y evaluación
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
    total_evaluaciones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total de evaluaciones recibidas'
    },
    porcentaje_asistencia: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Porcentaje de asistencia (inscritos vs asistentes)'
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
    tableName: 'actividad',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_evento', 'slug'],
        unique: true,
        name: 'unique_actividad_per_event'
      },
      {
        fields: ['id_evento']
      },
      {
        fields: ['id_track']
      },
      {
        fields: ['id_sala_virtual']
      },
      {
        fields: ['tipo_actividad']
      },
      {
        fields: ['modalidad']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['fecha_inicio']
      },
      {
        fields: ['fecha_fin']
      },
      {
        fields: ['es_publica']
      },
      {
        fields: ['es_destacada']
      },
      {
        fields: ['nivel_audiencia']
      },
      {
        fields: ['requiere_inscripcion']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: { [Op.notIn]: ['cancelada'] }
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      publicas: {
        where: {
          deleted_at: null,
          es_publica: true,
          publicar_en_agenda: true,
          estado: { [Op.notIn]: ['borrador', 'cancelada'] }
        }
      },
      destacadas: {
        where: {
          deleted_at: null,
          es_destacada: true,
          es_publica: true,
          estado: { [Op.notIn]: ['borrador', 'cancelada'] }
        }
      },
      porEvento: (eventoId) => ({
        where: {
          deleted_at: null,
          id_evento: eventoId,
          estado: { [Op.notIn]: ['cancelada'] }
        }
      }),
      porTrack: (trackId) => ({
        where: {
          deleted_at: null,
          id_track: trackId,
          estado: { [Op.notIn]: ['cancelada'] }
        }
      }),
      proximasAIniciar: {
        where: {
          deleted_at: null,
          fecha_inicio: { [Op.gte]: new Date() },
          estado: ['programada', 'confirmada']
        }
      }
    }
  });

  // Métodos de instancia
  Actividad.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  Actividad.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  Actividad.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  Actividad.prototype.generateSlug = function() {
    return this.titulo
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  Actividad.prototype.isPublic = function() {
    return this.es_publica && this.publicar_en_agenda && 
           !['borrador', 'cancelada'].includes(this.estado) && !this.isDeleted();
  };

  Actividad.prototype.canRegister = function() {
    if (!this.requiere_inscripcion) return false;
    if (!this.inscripcion_abierta) return false;
    if (this.total_inscritos >= this.aforo_maximo && !this.lista_espera_activa) return false;
    
    const now = new Date();
    if (this.fecha_apertura_inscripcion && now < this.fecha_apertura_inscripcion) return false;
    if (this.fecha_cierre_inscripcion && now > this.fecha_cierre_inscripcion) return false;
    
    return true;
  };

  Actividad.prototype.hasAvailableSlots = function() {
    return this.total_inscritos < this.aforo_maximo;
  };

  Actividad.prototype.getRemainingSlots = function() {
    return Math.max(0, this.aforo_maximo - this.total_inscritos);
  };

  Actividad.prototype.isInProgress = function() {
    const now = new Date();
    return now >= this.fecha_inicio && now <= this.fecha_fin && this.estado === 'en_curso';
  };

  Actividad.prototype.hasStarted = function() {
    return new Date() >= this.fecha_inicio;
  };

  Actividad.prototype.hasEnded = function() {
    return new Date() > this.fecha_fin;
  };

  Actividad.prototype.getDurationString = function() {
    const horas = Math.floor(this.duracion_minutos / 60);
    const minutos = this.duracion_minutos % 60;
    
    if (horas === 0) return `${minutos} minutos`;
    if (minutos === 0) return `${horas} hora${horas > 1 ? 's' : ''}`;
    return `${horas}h ${minutos}m`;
  };

  Actividad.prototype.getTimeSlot = function() {
    const inicio = new Date(this.fecha_inicio);
    const fin = new Date(this.fecha_fin);
    
    return {
      fecha: inicio.toISOString().split('T')[0],
      hora_inicio: inicio.toTimeString().slice(0, 5),
      hora_fin: fin.toTimeString().slice(0, 5),
      duracion: this.getDurationString()
    };
  };

  Actividad.prototype.updateInscriptionCount = async function() {
    const { InscripcionActividad } = sequelize.models;
    
    if (InscripcionActividad) {
      const count = await InscripcionActividad.count({
        where: {
          id_actividad: this.id_actividad,
          estado: ['confirmada', 'asistio'],
          deleted_at: null
        }
      });
      
      await this.update({ total_inscritos: count });
    }
  };

  Actividad.prototype.checkForConflicts = async function() {
    // Buscar actividades que se superpongan en tiempo
    const conflictos = await Actividad.findAll({
      where: {
        id_evento: this.id_evento,
        id_actividad: { [Op.ne]: this.id_actividad },
        deleted_at: null,
        estado: { [Op.notIn]: ['cancelada', 'borrador'] },
        [Op.or]: [
          {
            fecha_inicio: {
              [Op.between]: [this.fecha_inicio, this.fecha_fin]
            }
          },
          {
            fecha_fin: {
              [Op.between]: [this.fecha_inicio, this.fecha_fin]
            }
          },
          {
            [Op.and]: [
              { fecha_inicio: { [Op.lte]: this.fecha_inicio } },
              { fecha_fin: { [Op.gte]: this.fecha_fin } }
            ]
          }
        ]
      }
    });

    return conflictos;
  };

  Actividad.prototype.marcarComoIniciada = function() {
    return this.update({ estado: 'en_curso' });
  };

  Actividad.prototype.marcarComoCompletada = function() {
    return this.update({ estado: 'completada' });
  };

  Actividad.prototype.cancelar = function(motivo = null) {
    return this.update({ 
      estado: 'cancelada',
      notas_internas: `${this.notas_internas || ''}\n\nCancelada: ${motivo || 'Sin motivo especificado'}`
    });
  };

  // Asociaciones
  Actividad.associate = function(models) {
    // Relación con Evento
    Actividad.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Relación con TrackTematico
    Actividad.belongsTo(models.TrackTematico, {
      foreignKey: 'id_track',
      as: 'track'
    });

    // Relación con SalaVirtual
    Actividad.belongsTo(models.SalaVirtual, {
      foreignKey: 'id_sala_virtual',
      as: 'salaVirtual'
    });

    // Relación many-to-many con Ponente a través de ActividadPonente
    Actividad.belongsToMany(models.Ponente, {
      through: 'ActividadPonente',
      foreignKey: 'id_actividad',
      otherKey: 'id_ponente',
      as: 'ponentes'
    });

    // Relación directa con ActividadPonente
    Actividad.hasMany(models.ActividadPonente, {
      foreignKey: 'id_actividad',
      as: 'asignacionesPonente'
    });

    // Relación many-to-many con Recurso a través de ActividadRecurso
    Actividad.belongsToMany(models.Recurso, {
      through: 'ActividadRecurso',
      foreignKey: 'id_actividad',
      otherKey: 'id_recurso',
      as: 'recursos'
    });

    // Relación directa con ActividadRecurso
    Actividad.hasMany(models.ActividadRecurso, {
      foreignKey: 'id_actividad',
      as: 'asignacionesRecurso'
    });

    // Relación con Inscripciones
    Actividad.hasMany(models.InscripcionActividad, {
      foreignKey: 'id_actividad',
      as: 'inscripciones'
    });

    // Asociaciones de auditoría
    Actividad.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    Actividad.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    Actividad.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return Actividad;
};
