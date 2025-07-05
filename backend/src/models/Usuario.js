const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
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
    // Campos personalizables del perfil (conservados de la rama 'main')
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
      allowNull: false, // Considera cambiar a 'true' si la foto es opcional
      validate: {
        notEmpty: {
          msg: "La URL de la foto es requerida",
        },
        isUrl: { // Una validación más específica para URLs
          msg: "Debe ser una URL válida"
        }
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true, // La biografía suele ser opcional
      validate: {
        len: {
          args: [0, 1000],
          msg: "La bio no debe exceder los 1000 caracteres",
        },
      },
    },
    // Campos de auditoría consistentes
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
    tableName: "usuario",
    timestamps: true, // ✅ Usar timestamps automáticos
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // ¡Ojo con esto! La mayoría de tus columnas son snake_case, por lo que 'true' sería más consistente.
    underscored: true, 
    paranoid: true, // Activa el soft-delete nativo de Sequelize
    deletedAt: 'deleted_at', // Mapea el campo para soft-delete
    
    indexes: [
      {
        unique: true,
        fields: ["correo"],
      },
      {
        fields: ["estado"],
      },
      {
        fields: ["created_by"]
      }
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
      // 'active' y 'deleted' son manejados por `paranoid: true` por defecto.
      // Puedes eliminarlos si usas `paranoid` o mantenerlos si necesitas lógica personalizada.
    },
  });

  // Métodos de instancia
  Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };

  Usuario.prototype.isActive = function () {
    // Con 'paranoid: true', Sequelize ya sabe que un registro con 'deleted_at' no está "vivo".
    return this.estado === "activo";
  };

  // Los métodos softDelete y restore ya no son necesarios si usas `paranoid: true`.
  // Sequelize provee `instance.destroy()` y `instance.restore()` automáticamente.
  // Ejemplo: await usuario.destroy({ where: { id: 1 } });
  // Para registrar quién borró, usarías un hook 'beforeDestroy'.

  // Asociaciones
  Usuario.associate = function (models) {
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

    Usuario.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    Usuario.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    Usuario.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });

    // Relaciones inversas
    Usuario.hasMany(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdUsers'
    });

    Usuario.hasMany(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedUsers'
    });

    Usuario.hasMany(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedUsers'
    });
  };

  return Usuario;
};