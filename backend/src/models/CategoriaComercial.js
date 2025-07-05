const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const CategoriaComercial = sequelize.define('CategoriaComercial', {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_categoria: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'El nombre de la categoría no puede estar vacío'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: {
        name: 'unique_slug',
        msg: 'Este slug ya está en uso'
      },
      comment: 'URL-friendly version del nombre'
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
    // Jerarquía
    id_categoria_padre: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categoria_comercial',
        key: 'id_categoria'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Categoría padre para jerarquía'
    },
    nivel_jerarquia: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'El nivel mínimo es 1'
        },
        max: {
          args: 5,
          msg: 'El nivel máximo es 5'
        }
      },
      comment: '1=Principal, 2=Subcategoría, 3=Sub-subcategoría, etc.'
    },
    ruta_jerarquia: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Path completo de la jerarquía separado por /'
    },
    // Configuración
    permite_expositores: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si permite asignar expositores directamente'
    },
    icono: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Icono para mostrar en UI'
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
      comment: 'Color para mostrar en UI'
    },
    imagen_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL de imagen representativa'
    },
    // Estado y orden
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
    orden_visualizacion: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Orden para mostrar en listas'
    },
    es_destacada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si es categoría destacada/popular'
    },
    // Métricas
    total_expositores: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Número de expositores en esta categoría'
    },
    total_subcategorias: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Número de subcategorías directas'
    },
    // Configuración de stands
    sugerencia_ubicacion_stand: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Preferencias de ubicación para esta categoría'
    },
    requiere_servicios_especiales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios especiales requeridos por esta categoría'
    },
    // SEO y búsqueda
    palabras_clave: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Palabras clave para búsqueda (separadas por coma)'
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
    tableName: 'categoria_comercial',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['nombre_categoria']
      },
      {
        fields: ['slug'],
        unique: true
      },
      {
        fields: ['id_categoria_padre']
      },
      {
        fields: ['nivel_jerarquia']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['es_destacada']
      },
      {
        fields: ['orden_visualizacion']
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
      principales: {
        where: {
          id_categoria_padre: null,
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
      permitenExpositores: {
        where: {
          permite_expositores: true,
          deleted_at: null,
          estado: 'activa'
        }
      }
    }
  });

  // Métodos de instancia
  CategoriaComercial.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  CategoriaComercial.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  CategoriaComercial.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  CategoriaComercial.prototype.isRoot = function() {
    return this.id_categoria_padre === null;
  };

  CategoriaComercial.prototype.hasChildren = function() {
    return this.total_subcategorias > 0;
  };

  CategoriaComercial.prototype.generateSlug = function() {
    return this.nombre_categoria
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  CategoriaComercial.prototype.updateHierarchyPath = async function() {
    if (this.id_categoria_padre) {
      const padre = await CategoriaComercial.findByPk(this.id_categoria_padre);
      if (padre) {
        const rutaPadre = padre.ruta_jerarquia || padre.nombre_categoria;
        this.ruta_jerarquia = `${rutaPadre}/${this.nombre_categoria}`;
        this.nivel_jerarquia = padre.nivel_jerarquia + 1;
      }
    } else {
      this.ruta_jerarquia = this.nombre_categoria;
      this.nivel_jerarquia = 1;
    }
    await this.save();
  };

  CategoriaComercial.prototype.updateCounters = async function() {
    // Actualizar contador de subcategorías
    const subcategorias = await CategoriaComercial.count({
      where: {
        id_categoria_padre: this.id_categoria,
        deleted_at: null
      }
    });
    this.total_subcategorias = subcategorias;
    
    // Actualizar contador de expositores
    const { EmpresaCategoria } = sequelize.models;
    if (EmpresaCategoria) {
      const expositores = await EmpresaCategoria.count({
        where: {
          id_categoria: this.id_categoria,
          deleted_at: null
        }
      });
      this.total_expositores = expositores;
    }
    
    await this.save();
  };

  // Asociaciones
  CategoriaComercial.associate = function(models) {
    // Auto-referencia para jerarquía
    CategoriaComercial.belongsTo(models.CategoriaComercial, {
      foreignKey: 'id_categoria_padre',
      as: 'categoriaPadre'
    });

    CategoriaComercial.hasMany(models.CategoriaComercial, {
      foreignKey: 'id_categoria_padre',
      as: 'subcategorias'
    });

    // Relación many-to-many con EmpresaExpositora
    CategoriaComercial.belongsToMany(models.EmpresaExpositora, {
      through: 'EmpresaCategoria',
      foreignKey: 'id_categoria',
      otherKey: 'id_empresa',
      as: 'empresasExpositoras'
    });

    // Relación directa con EmpresaCategoria
    CategoriaComercial.hasMany(models.EmpresaCategoria, {
      foreignKey: 'id_categoria',
      as: 'asignacionesEmpresa'
    });

    // Asociaciones de auditoría
    CategoriaComercial.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    CategoriaComercial.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    CategoriaComercial.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return CategoriaComercial;
};
