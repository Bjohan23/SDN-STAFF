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
    created_by_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    updated_by_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },


  }, {
    tableName: 'rol',
    timestamps: true, // No usar created_at/updated_at automáticos
    underscored: true,
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
  Rol.prototype.getUsuariosCount = async function () {
    const count = await this.countUsuarios();
    return count;
  };



  // Asociaciones
  Rol.associate = function (models) {
    // Relación many-to-many con Usuario a través de UsuarioRol
    Rol.belongsToMany(models.Usuario, {
      through: models.UsuarioRol,
      foreignKey: 'id_rol',
      otherKey: 'id_usuario',
      as: 'usuarios'
    });

    Rol.hasMany(models.UsuarioRol, {
      foreignKey: 'id_rol',
      as: 'usuarioRoles'
    });

    // Asociación de auditoría
    Rol.belongsTo(models.Usuario, {
      foreignKey: 'created_by_usuario',
      as: 'createdByUser'
    });
    Rol.belongsTo(models.Usuario, {
      foreignKey: 'updated_by_usuario',
      as: 'updatedByUser'
    });
  };

  return Rol;
};