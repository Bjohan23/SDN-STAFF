/**
 * Modelo UsuarioRol (Tabla intermedia)
 */
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
    }
  }, {
    tableName: 'usuariorol',
    timestamps: false, // No usar created_at/updated_at automáticos
    underscored: false,
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
    ]
  });

  // Métodos de instancia
  UsuarioRol.prototype.isRecentAssignment = function(days = 30) {
    const now = new Date();
    const assignmentDate = new Date(this.fecha_asignacion);
    const diffTime = Math.abs(now - assignmentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
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
  };

  return UsuarioRol;
};
