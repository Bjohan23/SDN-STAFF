const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
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
      allowNull: true, // La foto de perfil suele ser opcional
      validate: {
        isUrl: { // Usar 'isUrl' es mucho mejor para validar URLs
          msg: "Debe proporcionar una URL válida para la foto"
        }
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true, // La biografía también suele ser opcional
      validate: {
        len: {
          args: [0, 1000], // Permitir que esté vacía
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
    
    // --- Campos de Auditoría (Creado, Actualizado, Borrado por) ---
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
    
  }, {
    // --- Opciones del Modelo ---
    tableName: "usuario",
    timestamps: true,       // Sequelize gestionará created_at y updated_at
    paranoid: true,         // Activa el borrado lógico (soft delete)
    underscored: true,      // Mapea camelCase a snake_case (ej: createdAt -> created_at)
    
    // Nombres de las columnas para timestamps y borrado lógico
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    
    indexes: [
      { unique: true, fields: ["correo"] },
      { fields: ["estado"] },
      { fields: ["created_by"] }
    ],
    
    scopes: {
      // Usuarios que no han sido borrados lógicamente
      activo: {
        where: {
          estado: "activo",
        },
      },
      // Excluir el hash de la contraseña de las consultas
      withoutPassword: {
        attributes: {
          exclude: ["password_hash"],
        },
      },
    },
  });

  // --- Métodos de Instancia ---
  // Sobrescribe el método toJSON para no exponer nunca la contraseña
  Usuario.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  };
  
  // --- Asociaciones ---
  Usuario.associate = function (models) {
    // Relación con Roles (Muchos a Muchos)
    Usuario.belongsToMany(models.Rol, {
      through: models.UsuarioRol,
      foreignKey: "id_usuario",
      otherKey: "id_rol",
      as: "roles",
    });

    // Relación directa con la tabla intermedia
    Usuario.hasMany(models.UsuarioRol, {
      foreignKey: "id_usuario",
      as: "usuarioRoles",
    });

    // Asociaciones de auditoría (quién creó, actualizó, borró)
    Usuario.belongsTo(models.Usuario, { foreignKey: 'created_by', as: 'createdByUser' });
    Usuario.belongsTo(models.Usuario, { foreignKey: 'updated_by', as: 'updatedByUser' });
    Usuario.belongsTo(models.Usuario, { foreignKey: 'deleted_by', as: 'deletedByUser' });

    // Relaciones inversas (qué usuarios ha creado, actualizado, borrado este usuario)
    Usuario.hasMany(models.Usuario, { foreignKey: 'created_by', as: 'createdUsers' });
    Usuario.hasMany(models.Usuario, { foreignKey: 'updated_by', as: 'updatedUsers' });
    Usuario.hasMany(models.Usuario, { foreignKey: 'deleted_by', as: 'deletedUsers' });
  };

  return Usuario;
};