const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const EtiquetaLibre = sequelize.define('EtiquetaLibre', {
    id_etiqueta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_etiqueta: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la etiqueta no puede estar vacío'
        },
        len: {
          args: [2, 60],
          msg: 'El nombre debe tener entre 2 y 60 caracteres'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(70),
      allowNull: false,
      unique: {
        name: 'unique_etiqueta_slug',
        msg: 'Este slug ya está en uso'
      },
      comment: 'URL-friendly version del nombre'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 300],
          msg: 'La descripción no puede exceder 300 caracteres'
        }
      }
    },
    // Clasificación y organización
    tipo_etiqueta: {
      type: DataTypes.ENUM('producto', 'servicio', 'tecnologia', 'especialidad', 'certificacion', 'temporal', 'promocional', 'ubicacion', 'otros'),
      defaultValue: 'otros',
      validate: {
        isIn: {
          args: [['producto', 'servicio', 'tecnologia', 'especialidad', 'certificacion', 'temporal', 'promocional', 'ubicacion', 'otros']],
          msg: 'El tipo debe ser válido'
        }
      }
    },
    color_hex: {
      type: DataTypes.STRING(7),
      allowNull: true,
      validate: {
        is: {
          args: /^#[0-9A-Fa-f]{6}$/,
          msg: 'Debe ser un color hexadecimal válido (#RRGGBB)'
        }
      },
      comment: 'Color para mostrar la etiqueta'
    },
    icono: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Icono para mostrar con la etiqueta'
    },
    // Estado y configuración
    estado: {
      type: DataTypes.ENUM('activa', 'inactiva', 'archivada'),
      defaultValue: 'activa',
      validate: {
        isIn: {
          args: [['activa', 'inactiva', 'archivada']],
          msg: 'El estado debe ser: activa, inactiva o archivada'
        }
      }
    },
    es_destacada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es etiqueta destacada/popular'
    },
    es_publica: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si es visible públicamente'
    },
    es_sugerible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si puede aparecer en sugerencias automáticas'
    },
    // Uso temporal
    es_temporal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es una etiqueta temporal (ej: promociones)'
    },
    fecha_inicio_vigencia: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Inicio de vigencia (para etiquetas temporales)'
    },
    fecha_fin_vigencia: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fin de vigencia (para etiquetas temporales)'
    },
    // Restricciones de uso
    requiere_aprobacion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere aprobación para ser asignada'
    },
    solo_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si solo puede ser asignada por administradores'
    },
    max_usos_empresa: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'El máximo de usos debe ser al menos 1'
        }
      },
      comment: 'Máximo número de veces que una empresa puede usar esta etiqueta'
    },
    // Métricas y estadísticas
    total_usos: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Número total de veces que se ha usado'
    },
    total_empresas: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Número de empresas que usan esta etiqueta'
    },
    popularidad_score: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
      comment: 'Score de popularidad calculado automáticamente'
    },
    ultima_vez_usada: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última vez que fue usada'
    },
    // Configuración de búsqueda y SEO
    palabras_clave: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Palabras clave relacionadas (separadas por coma)'
    },
    sinonimos: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Sinónimos de la etiqueta (separados por coma)'
    },
    // Asociaciones sugeridas
    categorias_sugeridas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'IDs de categorías donde esta etiqueta es más relevante'
    },
    etiquetas_relacionadas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'IDs de otras etiquetas relacionadas'
    },
    // Configuración específica
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas de la etiqueta'
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
    tableName: 'etiqueta_libre',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['nombre_etiqueta']
      },
      {
        fields: ['slug'],
        unique: true
      },
      {
        fields: ['tipo_etiqueta']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['es_destacada']
      },
      {
        fields: ['es_publica']
      },
      {
        fields: ['es_temporal']
      },
      {
        fields: ['fecha_fin_vigencia']
      },
      {
        fields: ['popularidad_score']
      },
      {
        fields: ['total_usos']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: 'activa'
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      publicas: {
        where: {
          es_publica: true,
          deleted_at: null,
          estado: 'activa'
        }
      },
      destacadas: {
        where: {
          es_destacada: true,
          deleted_at: null,
          estado: 'activa'
        }
      },
      vigentes: {
        where: {
          deleted_at: null,
          estado: 'activa',
          [Op.or]: [
            { es_temporal: false },
            {
              [Op.and]: [
                { es_temporal: true },
                {
                  [Op.or]: [
                    { fecha_inicio_vigencia: null },
                    { fecha_inicio_vigencia: { [Op.lte]: new Date() } }
                  ]
                },
                {
                  [Op.or]: [
                    { fecha_fin_vigencia: null },
                    { fecha_fin_vigencia: { [Op.gte]: new Date() } }
                  ]
                }
              ]
            }
          ]
        }
      },
      sugeribles: {
        where: {
          es_sugerible: true,
          deleted_at: null,
          estado: 'activa'
        }
      }
    }
  });

  // Métodos de instancia
  EtiquetaLibre.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  EtiquetaLibre.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  EtiquetaLibre.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  EtiquetaLibre.prototype.isVigente = function() {
    if (!this.es_temporal) return true;
    
    const now = new Date();
    const inicioOk = !this.fecha_inicio_vigencia || this.fecha_inicio_vigencia <= now;
    const finOk = !this.fecha_fin_vigencia || this.fecha_fin_vigencia >= now;
    
    return inicioOk && finOk;
  };

  EtiquetaLibre.prototype.generateSlug = function() {
    return this.nombre_etiqueta
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  EtiquetaLibre.prototype.incrementarUso = async function(empresaId = null) {
    this.total_usos += 1;
    this.ultima_vez_usada = new Date();
    
    // Recalcular popularidad (fórmula simple)
    this.popularidad_score = Math.min(100, (this.total_usos * 0.5) + (this.total_empresas * 2));
    
    await this.save();
  };

  EtiquetaLibre.prototype.updateCounters = async function() {
    const { EmpresaEtiqueta } = sequelize.models;
    if (EmpresaEtiqueta) {
      const stats = await EmpresaEtiqueta.findOne({
        where: {
          id_etiqueta: this.id_etiqueta,
          deleted_at: null
        },
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id_empresa_etiqueta')), 'total_usos'],
          [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('id_empresa'))), 'total_empresas']
        ],
        raw: true
      });
      
      this.total_usos = parseInt(stats.total_usos) || 0;
      this.total_empresas = parseInt(stats.total_empresas) || 0;
      this.popularidad_score = Math.min(100, (this.total_usos * 0.5) + (this.total_empresas * 2));
      
      await this.save();
    }
  };

  EtiquetaLibre.prototype.puedeSerUsadaPor = function(empresaId, esAdmin = false) {
    if (!this.isVigente()) return false;
    if (this.estado !== 'activa') return false;
    if (this.solo_admin && !esAdmin) return false;
    
    return true;
  };

  // Asociaciones
  EtiquetaLibre.associate = function(models) {
    // Relación many-to-many con EmpresaExpositora
    EtiquetaLibre.belongsToMany(models.EmpresaExpositora, {
      through: 'EmpresaEtiqueta',
      foreignKey: 'id_etiqueta',
      otherKey: 'id_empresa',
      as: 'empresasExpositoras'
    });

    // Relación directa con EmpresaEtiqueta
    EtiquetaLibre.hasMany(models.EmpresaEtiqueta, {
      foreignKey: 'id_etiqueta',
      as: 'asignacionesEmpresa'
    });

    // Asociaciones de auditoría
    EtiquetaLibre.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    EtiquetaLibre.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    EtiquetaLibre.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return EtiquetaLibre;
};
