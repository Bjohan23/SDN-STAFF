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
    // Campos personalizables del perfil
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: "El nombre debe tener máximo 100 caracteres",
        },
      },
    },
    foto_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: "La URL de la foto debe ser válida",
        },
        len: {
          args: [0, 500],
          msg: "La URL de la foto debe tener máximo 500 caracteres",
        },
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: "La bio debe tener máximo 1000 caracteres",
        },
      },
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: "usuario",
    timestamps: true, // ✅ Usar timestamps automáticos
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: false, // ✅ Cambiado a false para consistencia
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
      {
        fields: ["created_by"]
      },
      {
        fields: ["deleted_at"]
      }
    ],
    scopes: {
      // ✅ Scopes sin dependencias circulares
      activo: {
        where: {
          estado: "activo",
          deleted_at: null
        },
      },
      withoutPassword: {
        attributes: {
          exclude: ["password_hash"],
        },
      },
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
    },
  });

  // Métodos de instancia
  Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash; // No incluir password_hash en respuestas JSON
    return values;
  };

  Usuario.prototype.isActive = function () {
    return this.estado === "activo" && !this.deleted_at;
  };

  Usuario.prototype.isDeleted = function () {
    return this.deleted_at !== null;
  };

  Usuario.prototype.softDelete = function (deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  Usuario.prototype.restore = function () {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  // ✅ Asociaciones consistentes
  Usuario.associate = function (models) {
    // Relación many-to-many con Rol a través de UsuarioRol
    Usuario.belongsToMany(models.Rol, {
      through: models.UsuarioRol,
      foreignKey: "id_usuario",
      otherKey: "id_rol",
      as: "roles",
    });

    // Relación directa con UsuarioRol
    Usuario.hasMany(models.UsuarioRol, {
      foreignKey: "id_usuario",
      as: "usuarioRoles",
    });

    // ✅ Asociaciones de auditoría con nombres consistentes
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

    // Relaciones inversas para auditoría
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