const { Op, DataTypes } = require('sequelize');
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
    tableName: 'rol',
    timestamps: false, // No usar created_at/updated_at automáticos
    underscored: false,
    indexes: [
      {
        unique: true,
        fields: ['nombre_rol']
      }
    ],
    scopes: {
      // Scope para obtener solo registros no eliminados
      active: {
        where: {
          deleted_at: null
        }
      },
      // Scope para obtener registros eliminados
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }  // ✅ Cambiado de sequelize.Op.ne a Op.ne
        }
      },
      // Scope con información de auditoría
      withAuditInfo: {
        include: [
          {
            model: require('./index').Usuario,
            as: 'createdByUser',
            attributes: ['id_usuario', 'correo']
          },
          {
            model: require('./index').Usuario,
            as: 'updatedByUser',
            attributes: ['id_usuario', 'correo']
          },
          {
            model: require('./index').Usuario,
            as: 'deletedByUser',
            attributes: ['id_usuario', 'correo']
          }
        ]
      }
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

  // Asociaciones
  Rol.associate = function(models) {
    // Relación many-to-many con Usuario a través de UsuarioRol
    Rol.belongsToMany(models.Usuario, {
      through: models.UsuarioRol,
      foreignKey: 'id_rol',
      otherKey: 'id_usuario',
      as: 'usuarios'
    });

    // Relación directa con UsuarioRol para acceder a fecha_asignacion
    Rol.hasMany(models.UsuarioRol, {
      foreignKey: 'id_rol',
      as: 'usuarioRoles'
    });

    // Asociaciones de auditoría
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