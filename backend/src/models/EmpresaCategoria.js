const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const EmpresaCategoria = sequelize.define('EmpresaCategoria', {
    id_empresa_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa_expositora',
        key: 'id_empresa'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categoria_comercial',
        key: 'id_categoria'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    es_categoria_principal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si es la categoría principal de la empresa'
    },
    prioridad: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'La prioridad mínima es 1'
        },
        max: {
          args: 10,
          msg: 'La prioridad máxima es 10'
        }
      },
      comment: '1=Mayor prioridad, 10=Menor prioridad'
    },
    porcentaje_actividad: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El porcentaje no puede ser negativo'
        },
        max: {
          args: 100,
          msg: 'El porcentaje no puede ser mayor a 100'
        }
      },
      comment: 'Porcentaje de actividad de la empresa en esta categoría'
    },
    descripcion_actividad: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'La descripción no puede exceder 500 caracteres'
        }
      },
      comment: 'Descripción específica de la actividad en esta categoría'
    },
    productos_principales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Productos principales en esta categoría'
    },
    servicios_principales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Servicios principales en esta categoría'
    },
    experiencia_años: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'Los años de experiencia no pueden ser negativos'
        },
        max: {
          args: 100,
          msg: 'Los años de experiencia no pueden ser más de 100'
        }
      },
      comment: 'Años de experiencia en esta categoría'
    },
    certificaciones: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Certificaciones específicas para esta categoría'
    },
    // Estado
    estado: {
      type: DataTypes.ENUM('activa', 'inactiva', 'pendiente_revision'),
      defaultValue: 'activa',
      validate: {
        isIn: {
          args: [['activa', 'inactiva', 'pendiente_revision']],
          msg: 'El estado debe ser: activa, inactiva o pendiente_revision'
        }
      }
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha en que se asignó la categoría'
    },
    fecha_validacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se validó la asignación'
    },
    validada_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que validó la asignación'
    },
    motivo_asignacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo o justificación de la asignación'
    },
    // Configuración específica
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas para esta empresa-categoría'
    },
    // Métricas
    numero_eventos_categoria: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de eventos en los que participó en esta categoría'
    },
    ultima_participacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de última participación en esta categoría'
    },
    calificacion_categoria: {
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
      comment: 'Calificación específica en esta categoría'
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
    tableName: 'empresa_categoria',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_empresa', 'id_categoria'],
        unique: true,
        name: 'unique_empresa_categoria'
      },
      {
        fields: ['id_empresa']
      },
      {
        fields: ['id_categoria']
      },
      {
        fields: ['es_categoria_principal']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['prioridad']
      },
      {
        fields: ['fecha_asignacion']
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
          es_categoria_principal: true,
          deleted_at: null,
          estado: 'activa'
        }
      },
      pendientes: {
        where: {
          estado: 'pendiente_revision',
          deleted_at: null
        }
      },
      validadas: {
        where: {
          fecha_validacion: { [Op.ne]: null },
          deleted_at: null
        }
      }
    }
  });

  // Métodos de instancia
  EmpresaCategoria.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  EmpresaCategoria.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  EmpresaCategoria.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  EmpresaCategoria.prototype.isPrincipal = function() {
    return this.es_categoria_principal === true;
  };

  EmpresaCategoria.prototype.isValidated = function() {
    return this.fecha_validacion !== null;
  };

  EmpresaCategoria.prototype.validar = function(validadaPor = null) {
    return this.update({
      estado: 'activa',
      fecha_validacion: new Date(),
      validada_por: validadaPor
    });
  };

  EmpresaCategoria.prototype.marcarComoPrincipal = async function() {
    // Primero desmarcar otras categorías principales de la misma empresa
    await EmpresaCategoria.update(
      { es_categoria_principal: false },
      {
        where: {
          id_empresa: this.id_empresa,
          es_categoria_principal: true,
          deleted_at: null
        }
      }
    );

    // Marcar esta como principal
    return this.update({
      es_categoria_principal: true,
      prioridad: 1
    });
  };

  EmpresaCategoria.prototype.updateMetrics = async function() {
    // Aquí se podrían calcular métricas basadas en participaciones
    // Por ahora solo actualizamos la fecha de última participación
    this.ultima_participacion = new Date();
    await this.save();
  };

  // Asociaciones
  EmpresaCategoria.associate = function(models) {
    // Relación con EmpresaExpositora
    EmpresaCategoria.belongsTo(models.EmpresaExpositora, {
      foreignKey: 'id_empresa',
      as: 'empresaExpositora'
    });

    // Relación con CategoriaComercial
    EmpresaCategoria.belongsTo(models.CategoriaComercial, {
      foreignKey: 'id_categoria',
      as: 'categoriaComercial'
    });

    // Relación con usuario que validó
    EmpresaCategoria.belongsTo(models.Usuario, {
      foreignKey: 'validada_por',
      as: 'validadaPorUsuario'
    });

    // Asociaciones de auditoría
    EmpresaCategoria.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    EmpresaCategoria.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    EmpresaCategoria.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return EmpresaCategoria;
};
