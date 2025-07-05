const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const EmpresaExpositora = sequelize.define('EmpresaExpositora', {
    id_empresa: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_empresa: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la empresa no puede estar vacío'
        },
        len: {
          args: [2, 150],
          msg: 'El nombre de la empresa debe tener entre 2 y 150 caracteres'
        }
      }
    },
    razon_social: {
      type: DataTypes.STRING(200),
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'La razón social no puede exceder 200 caracteres'
        }
      }
    },
    ruc: {
      type: DataTypes.STRING(11),
      allowNull: true,
      unique: {
        name: 'unique_ruc',
        msg: 'Este RUC ya está registrado'
      },
      validate: {
        len: {
          args: [11, 11],
          msg: 'El RUC debe tener exactamente 11 dígitos'
        },
        isNumeric: {
          msg: 'El RUC debe contener solo números'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 2000],
          msg: 'La descripción no puede exceder 2000 caracteres'
        }
      }
    },
    sector: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'El sector no puede exceder 100 caracteres'
        }
      },
      comment: 'Sector o industria de la empresa (tecnología, salud, educación, etc.)'
    },
    tamaño_empresa: {
      type: DataTypes.ENUM('micro', 'pequeña', 'mediana', 'grande'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['micro', 'pequeña', 'mediana', 'grande']],
          msg: 'El tamaño debe ser: micro, pequeña, mediana o grande'
        }
      }
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL o path del logo de la empresa'
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
    // Información de contacto principal
    email_contacto: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El email de contacto es requerido'
        },
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    telefono_contacto: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [0, 20],
          msg: 'El teléfono no puede exceder 20 caracteres'
        }
      }
    },
    nombre_contacto: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'El nombre de contacto no puede exceder 100 caracteres'
        }
      },
      comment: 'Nombre de la persona de contacto principal'
    },
    cargo_contacto: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'El cargo no puede exceder 100 caracteres'
        }
      }
    },
    // Dirección
    direccion: {
      type: DataTypes.STRING(300),
      allowNull: true,
      validate: {
        len: {
          args: [0, 300],
          msg: 'La dirección no puede exceder 300 caracteres'
        }
      }
    },
    ciudad: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'La ciudad no puede exceder 100 caracteres'
        }
      }
    },
    pais: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Perú',
      validate: {
        len: {
          args: [0, 100],
          msg: 'El país no puede exceder 100 caracteres'
        }
      }
    },
    // Estado y aprobación
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada', 'suspendida', 'inactiva'),
      defaultValue: 'pendiente',
      validate: {
        isIn: {
          args: [['pendiente', 'aprobada', 'rechazada', 'suspendida', 'inactiva']],
          msg: 'El estado debe ser: pendiente, aprobada, rechazada, suspendida o inactiva'
        }
      }
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que la empresa fue aprobada'
    },
    aprobada_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que aprobó la empresa'
    },
    motivo_rechazo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo en caso de rechazo'
    },
    // Documentación legal
    documentos_legales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'URLs y metadatos de documentos legales subidos'
    },
    fecha_vencimiento_documentos: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de vencimiento de documentos legales'
    },
    // Redes sociales
    redes_sociales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'URLs de redes sociales (Facebook, Instagram, LinkedIn, etc.)'
    },
    // Información adicional
    productos_servicios: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de productos y servicios que ofrece'
    },
    experiencia_ferias: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Experiencia previa en ferias y eventos'
    },
    // Configuración específica
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas por empresa'
    },
    // Métricas
    numero_participaciones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
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
      comment: 'Calificación promedio basada en participaciones anteriores'
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
    tableName: 'empresa_expositora',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['nombre_empresa']
      },
      {
        fields: ['ruc'],
        unique: true
      },
      {
        fields: ['email_contacto']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['sector']
      },
      {
        fields: ['fecha_aprobacion']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      aprobadas: {
        where: {
          estado: 'aprobada',
          deleted_at: null
        }
      },
      pendientes: {
        where: {
          estado: 'pendiente',
          deleted_at: null
        }
      }
    }
  });

  // Métodos de instancia
  EmpresaExpositora.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  EmpresaExpositora.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  EmpresaExpositora.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  EmpresaExpositora.prototype.isApproved = function() {
    return this.estado === 'aprobada';
  };

  EmpresaExpositora.prototype.isPending = function() {
    return this.estado === 'pendiente';
  };

  EmpresaExpositora.prototype.aprobar = function(aprobadaPor = null) {
    return this.update({
      estado: 'aprobada',
      fecha_aprobacion: new Date(),
      aprobada_por: aprobadaPor,
      motivo_rechazo: null
    });
  };

  EmpresaExpositora.prototype.rechazar = function(motivo = null, rechazadaPor = null) {
    return this.update({
      estado: 'rechazada',
      motivo_rechazo: motivo,
      aprobada_por: rechazadaPor,
      fecha_aprobacion: null
    });
  };

  EmpresaExpositora.prototype.documentosVencidos = function() {
    if (!this.fecha_vencimiento_documentos) return false;
    return new Date() > new Date(this.fecha_vencimiento_documentos);
  };

  EmpresaExpositora.prototype.documentosProximosAVencer = function(dias = 30) {
    if (!this.fecha_vencimiento_documentos) return false;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + dias);
    return new Date(this.fecha_vencimiento_documentos) <= fechaLimite;
  };

  // ==================== MÉTODOS PARA CLASIFICACIÓN ====================

  // Obtener categoría principal de la empresa
  EmpresaExpositora.prototype.getCategoriaPrincipal = async function() {
    const { EmpresaCategoria } = sequelize.models;
    return await EmpresaCategoria.findOne({
      where: {
        id_empresa: this.id_empresa,
        es_categoria_principal: true,
        deleted_at: null
      },
      include: [{
        model: sequelize.models.CategoriaComercial,
        as: 'categoriaComercial'
      }]
    });
  };

  // Verificar si tiene una categoría específica
  EmpresaExpositora.prototype.tieneCategoria = async function(categoriaId) {
    const { EmpresaCategoria } = sequelize.models;
    const count = await EmpresaCategoria.count({
      where: {
        id_empresa: this.id_empresa,
        id_categoria: categoriaId,
        deleted_at: null,
        estado: 'activa'
      }
    });
    return count > 0;
  };

  // Verificar si tiene una etiqueta específica
  EmpresaExpositora.prototype.tieneEtiqueta = async function(etiquetaId, eventoId = null) {
    const { EmpresaEtiqueta } = sequelize.models;
    const whereCondition = {
      id_empresa: this.id_empresa,
      id_etiqueta: etiquetaId,
      deleted_at: null,
      estado: 'activa'
    };

    if (eventoId) {
      whereCondition[Op.or] = [
        { id_evento_asignacion: eventoId },
        { es_solo_para_evento: false }
      ];
    }

    const count = await EmpresaEtiqueta.count({ where: whereCondition });
    return count > 0;
  };

  // Obtener resumen de clasificación
  EmpresaExpositora.prototype.getResumenClasificacion = async function() {
    const { EmpresaCategoria, EmpresaEtiqueta } = sequelize.models;
    
    const [categorias, etiquetas] = await Promise.all([
      EmpresaCategoria.count({
        where: {
          id_empresa: this.id_empresa,
          deleted_at: null,
          estado: 'activa'
        }
      }),
      EmpresaEtiqueta.count({
        where: {
          id_empresa: this.id_empresa,
          deleted_at: null,
          estado: 'activa'
        }
      })
    ]);

    return {
      total_categorias: categorias,
      total_etiquetas: etiquetas,
      esta_clasificada: categorias > 0 || etiquetas > 0
    };
  };

  // Verificar si está completamente clasificada
  EmpresaExpositora.prototype.estaClasificada = async function() {
    const resumen = await this.getResumenClasificacion();
    return resumen.total_categorias > 0; // Al menos debe tener una categoría
  };

  // Asociaciones
  EmpresaExpositora.associate = function(models) {
    // Relación con Usuario que aprobó
    EmpresaExpositora.belongsTo(models.Usuario, {
      foreignKey: 'aprobada_por',
      as: 'aprobadaPorUsuario'
    });

    // Relación many-to-many con Eventos a través de EmpresaEvento
    EmpresaExpositora.belongsToMany(models.Evento, {
      through: 'EmpresaEvento',
      foreignKey: 'id_empresa',
      otherKey: 'id_evento',
      as: 'eventos'
    });

    // Relación directa con EmpresaEvento
    EmpresaExpositora.hasMany(models.EmpresaEvento, {
      foreignKey: 'id_empresa',
      as: 'participaciones'
    });

    // Relación con StandServicio (servicios contratados por la empresa)
    EmpresaExpositora.hasMany(models.StandServicio, {
      foreignKey: 'id_empresa',
      as: 'serviciosContratados'
    });

    // Relación con SolicitudAsignacion
    EmpresaExpositora.hasMany(models.SolicitudAsignacion, {
      foreignKey: 'id_empresa',
      as: 'solicitudesAsignacion'
    });

    // ==================== NUEVAS RELACIONES PARA CLASIFICACIÓN ====================

    // Relación many-to-many con CategoriaComercial a través de EmpresaCategoria
    EmpresaExpositora.belongsToMany(models.CategoriaComercial, {
      through: 'EmpresaCategoria',
      foreignKey: 'id_empresa',
      otherKey: 'id_categoria',
      as: 'categoriasComerciales'
    });

    // Relación directa con EmpresaCategoria
    EmpresaExpositora.hasMany(models.EmpresaCategoria, {
      foreignKey: 'id_empresa',
      as: 'asignacionesCategorias'
    });

    // Relación many-to-many con EtiquetaLibre a través de EmpresaEtiqueta
    EmpresaExpositora.belongsToMany(models.EtiquetaLibre, {
      through: 'EmpresaEtiqueta',
      foreignKey: 'id_empresa',
      otherKey: 'id_etiqueta',
      as: 'etiquetasLibres'
    });

    // Relación directa con EmpresaEtiqueta
    EmpresaExpositora.hasMany(models.EmpresaEtiqueta, {
      foreignKey: 'id_empresa',
      as: 'asignacionesEtiquetas'
    });

    // Asociaciones de auditoría
    EmpresaExpositora.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    EmpresaExpositora.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    EmpresaExpositora.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return EmpresaExpositora;
};
