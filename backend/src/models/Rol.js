/**
 * Modelo de Rol
 */
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
    ]
  });

  // Métodos de instancia
  Rol.prototype.getUsuariosCount = async function() {
    const count = await this.countUsuarios();
    return count;
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
  };

  return Rol;
};
