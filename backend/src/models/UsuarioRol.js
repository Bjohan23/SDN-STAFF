const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const UsuarioRol = sequelize.define('UsuarioRol', {
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de usuario es requerido'
        },
        isInt: {
          msg: 'El ID de usuario debe ser un número entero'
        }
      }
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'rol',
        key: 'id_rol'
      },
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de rol es requerido'
        },
        isInt: {
          msg: 'El ID de rol debe ser un número entero'
        }
      }
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    // ✅ Campos de auditoría consistentes (sin _usuario)
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
    // ✅ Agregamos deleted_at que faltaba
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'usuariorol',
    timestamps: true, // ✅ Usar timestamps automáticos
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: false, // ✅ Consistencia con otros modelos
    indexes: [
      {
        fields: ['id_usuario']
      },
      {
        fields: ['id_rol']
      },
      {
        fields: ['fecha_asignacion']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['deleted_at']
      }
    ],
    scopes: {
      // ✅ Scopes sin dependencias circulares
      active: {
        where: {
          deleted_at: null
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
  UsuarioRol.prototype.isRecentAssignment = function(days = 30) {
    const now = new Date();
    const assignmentDate = new Date(this.fecha_asignacion);
    const diffTime = Math.abs(now - assignmentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  };

  UsuarioRol.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  UsuarioRol.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  UsuarioRol.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  // ✅ Asociaciones consistentes
  UsuarioRol.associate = function(models) {
    // Relación con Usuario
    UsuarioRol.belongsTo(models.Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario'
    });

    // Relación con Rol
    UsuarioRol.belongsTo(models.Rol, {
      foreignKey: 'id_rol',
      as: 'rol'
    });

    // ✅ Asociaciones de auditoría con nombres consistentes
    UsuarioRol.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    UsuarioRol.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    UsuarioRol.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return UsuarioRol;
};