const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      // --- Campos de Identificación ---
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

      // --- Campos de Perfil ---
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "El nombre es requerido",
          },
          len: {
            args: [1, 100],
            msg: "El nombre debe tener entre 1 y 100 caracteres",
          },
        },
      },
      foto_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          isUrl: {
            msg: "Debe proporcionar una URL válida para la foto",
          },
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 1000],
            msg: "La biografía no debe exceder los 1000 caracteres",
          },
        },
      },

      // --- Campos de Estado y Sesión ---
      estado: {
        type: DataTypes.ENUM("activo", "inactivo", "suspendido"),
        defaultValue: "activo",
        validate: {
          isIn: {
            args: [["activo", "inactivo", "suspendido"]],
            msg: "El estado debe ser 'activo', 'inactivo' o 'suspendido'",
          },
        },
      },
      ultima_sesion: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      // ✅ AGREGAR ESTE CAMPO QUE FALTA
      fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      // --- Campos de Auditoría ---
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },

      // ✅ AGREGAR ESTOS CAMPOS ADICIONALES QUE VEO EN TU BD
      created_by_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      updated_by_usuario: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
    },
    {
      // --- Opciones del Modelo ---
      tableName: "usuario",
      timestamps: true,
      paranoid: true,
      underscored: true,

      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",

      indexes: [
        { unique: true, fields: ["correo"] },
        { fields: ["estado"] },
        { fields: ["created_by"] },
        { fields: ["fecha_creacion"] },
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

  // Resto del código igual...
  Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  Usuario.associate = function (models) {
    // Relación con Roles (Muchos a Muchos)
    Usuario.belongsToMany(models.Rol, {
      through: models.UsuarioRol,
      foreignKey: "id_usuario",
      otherKey: "id_rol",
      as: "roles",
    });

    Usuario.hasMany(models.UsuarioRol, {
      foreignKey: "id_usuario",
      as: "usuarioRoles",
    });

    // Asociaciones de auditoría
    Usuario.belongsTo(models.Usuario, {
      foreignKey: "created_by",
      as: "createdByUser",
    });
    Usuario.belongsTo(models.Usuario, {
      foreignKey: "updated_by",
      as: "updatedByUser",
    });
    Usuario.belongsTo(models.Usuario, {
      foreignKey: "deleted_by",
      as: "deletedByUser",
    });
    Usuario.belongsTo(models.Usuario, {
      foreignKey: "created_by_usuario",
      as: "createdByUsuario",
    });
    Usuario.belongsTo(models.Usuario, {
      foreignKey: "updated_by_usuario",
      as: "updatedByUsuario",
    });

    Usuario.hasMany(models.Usuario, {
      foreignKey: "created_by",
      as: "createdUsers",
    });
    Usuario.hasMany(models.Usuario, {
      foreignKey: "updated_by",
      as: "updatedUsers",
    });
    Usuario.hasMany(models.Usuario, {
      foreignKey: "deleted_by",
      as: "deletedUsers",
    });

    // Relaciones con modelos de credenciales
    Usuario.hasMany(models.Credencial, {
      foreignKey: "id_usuario",
      as: "credenciales",
    });
    Usuario.hasMany(models.Credencial, {
      foreignKey: "created_by",
      as: "credencialesCreadas",
    });
    Usuario.hasMany(models.Credencial, {
      foreignKey: "updated_by",
      as: "credencialesActualizadas",
    });
    Usuario.hasMany(models.Credencial, {
      foreignKey: "deleted_by",
      as: "credencialesEliminadas",
    });

    Usuario.hasMany(models.TipoCredencial, {
      foreignKey: "created_by",
      as: "tiposCredencialCreados",
    });
    Usuario.hasMany(models.TipoCredencial, {
      foreignKey: "updated_by",
      as: "tiposCredencialActualizados",
    });
    Usuario.hasMany(models.TipoCredencial, {
      foreignKey: "deleted_by",
      as: "tiposCredencialEliminados",
    });

    Usuario.hasMany(models.PlantillaCredencial, {
      foreignKey: "created_by",
      as: "plantillasCredencialCreadas",
    });
    Usuario.hasMany(models.PlantillaCredencial, {
      foreignKey: "updated_by",
      as: "plantillasCredencialActualizadas",
    });
    Usuario.hasMany(models.PlantillaCredencial, {
      foreignKey: "deleted_by",
      as: "plantillasCredencialEliminadas",
    });

    Usuario.hasMany(models.AccesoEvento, {
      foreignKey: "created_by",
      as: "accesosCreados",
    });
    Usuario.hasMany(models.AccesoEvento, {
      foreignKey: "updated_by",
      as: "accesosActualizados",
    });
    Usuario.hasMany(models.AccesoEvento, {
      foreignKey: "deleted_by",
      as: "accesosEliminados",
    });

    Usuario.hasMany(models.LogValidacion, {
      foreignKey: "validado_por",
      as: "validacionesRealizadas",
    });
  };

  return Usuario;
};
