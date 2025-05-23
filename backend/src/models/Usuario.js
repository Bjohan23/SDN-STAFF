/**
 * Modelo de Usuario
 */
module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      id_usuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      correo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: "unique_correo",
          msg: "Este correo electrónico ya está en uso",
        },
        validate: {
          notEmpty: {
            msg: "El correo electrónico no puede estar vacío",
          },
          len: {
            args: [5, 50],
            msg: "El correo electrónico debe tener entre 5 y 50 caracteres",
          },
          isEmail: {
            msg: "Debe ingresar un correo electrónico válido",
          },
        },
      },

      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "La contraseña es requerida",
          },
        },
      },
      estado: {
        type: DataTypes.ENUM("activo", "inactivo", "suspendido"),
        defaultValue: "activo",
        validate: {
          isIn: {
            args: [["activo", "inactivo", "suspendido"]],
            msg: "El estado debe ser activo, inactivo o suspendido",
          },
        },
      },
      fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      ultima_sesion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "usuario",
      timestamps: false, // No usar created_at/updated_at automáticos
      underscored: false,
      indexes: [
        {
          unique: true,
          fields: ["correo"],
        },
        {
          fields: ["estado"],
        },
        {
          fields: ["fecha_creacion"],
        },
      ],
      scopes: {
        activo: {
          where: {
            estado: "activo",
          },
        },
        withoutPassword: {
          attributes: {
            exclude: ["password_hash"],
          },
        },
      },
    }
  );

  // Métodos de instancia
  Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash; // No incluir password_hash en respuestas JSON por defecto
    return values;
  };

  Usuario.prototype.isActive = function () {
    return this.estado === "activo";
  };

  // Asociaciones
  Usuario.associate = function (models) {
    // Relación many-to-many con Rol a través de UsuarioRol
    Usuario.belongsToMany(models.Rol, {
      through: models.UsuarioRol,
      foreignKey: "id_usuario",
      otherKey: "id_rol",
      as: "roles",
    });

    // Relación directa con UsuarioRol para acceder a fecha_asignacion
    Usuario.hasMany(models.UsuarioRol, {
      foreignKey: "id_usuario",
      as: "usuarioRoles",
    });
  };

  return Usuario;
};
