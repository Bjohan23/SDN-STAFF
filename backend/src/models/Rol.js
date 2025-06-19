const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Rol = sequelize.define('Rol', {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    nombre_rol: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_nombre_rol',
        msg: 'Este nombre de rol ya existe'
      },
      validate: {
        notEmpty: {
          msg: 'El nombre del rol no puede estar vacío'
        },
        len: {
          args: [2, 50],
          msg: 'El nombre del rol debe tener entre 2 y 50 caracteres'
        }
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'La descripción no puede exceder 500 caracteres'
        }
      }
    },
    // ✅ Campos de auditoría consistentes
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'rol',
    timestamps: true, // ✅ Usar timestamps automáticos de Sequelize
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['nombre_rol']
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
      // ✅ Removemos withAuditInfo para evitar dependencias circulares
    }
  });

  // Métodos de instancia
  Rol.prototype.getUsuariosCount = async function() {
    const count = await this.countUsuarios();
    return count;
  };

  Rol.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  Rol.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  Rol.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  // ✅ Asociaciones limpias
  Rol.associate = function(models) {
    // Relación many-to-many con Usuario a través de UsuarioRol
    Rol.belongsToMany(models.Usuario, {
      through: models.UsuarioRol,
      foreignKey: 'id_rol',
      otherKey: 'id_usuario',
      as: 'usuarios'
    });

    // Relación directa con UsuarioRol
    Rol.hasMany(models.UsuarioRol, {
      foreignKey: 'id_rol',
      as: 'usuarioRoles'
    });

    // ✅ Asociaciones de auditoría con nombres consistentes
    Rol.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    Rol.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    Rol.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return Rol;
};