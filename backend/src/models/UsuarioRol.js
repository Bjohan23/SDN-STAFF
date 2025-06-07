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
    // Campos de auditoría
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
    tableName: 'usuariorol',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['id_usuario']
      },
      {
        fields: ['id_rol']
      },
      {
        fields: ['fecha_asignacion']
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
          deleted_at: { [Op.ne]: null }
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

        ]
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

  UsuarioRol.prototype.softDelete = function() {
    return this.update({
      deleted_at: new Date()
    });
  };

  UsuarioRol.prototype.restore = function() {
    return this.update({
      deleted_at: null
    });
  };

  // Asociaciones
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

    // Asociaciones de auditoría
    UsuarioRol.belongsTo(models.Usuario, {
      foreignKey: 'created_by_usuario',
      as: 'createdByUser'
    });

    UsuarioRol.belongsTo(models.Usuario, {
      foreignKey: 'updated_by_usuario',
      as: 'updatedByUser'
    });


  };

  return UsuarioRol;
};
