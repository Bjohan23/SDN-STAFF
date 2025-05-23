/**
 * Modelo de Usuario
 */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'first_name',
      validate: {
        notEmpty: {
          msg: 'El nombre no puede estar vacío'
        },
        len: {
          args: [2, 50],
          msg: 'El nombre debe tener entre 2 y 50 caracteres'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'last_name',
      validate: {
        notEmpty: {
          msg: 'El apellido no puede estar vacío'
        },
        len: {
          args: [2, 50],
          msg: 'El apellido debe tener entre 2 y 50 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'unique_email',
        msg: 'Este email ya está registrado'
      },
      validate: {
        isEmail: {
          msg: 'Debe ser un email válido'
        },
        notEmpty: {
          msg: 'El email no puede estar vacío'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La contraseña no puede estar vacía'
        },
        len: {
          args: [6, 255],
          msg: 'La contraseña debe tener al menos 6 caracteres'
        }
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        len: {
          args: [8, 20],
          msg: 'El teléfono debe tener entre 8 y 20 caracteres'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'employee'),
      defaultValue: 'employee',
      validate: {
        isIn: {
          args: [['admin', 'manager', 'employee']],
          msg: 'El rol debe ser admin, manager o employee'
        }
      }
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login'
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'email_verified_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_active']
      }
    ],
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      withoutPassword: {
        attributes: {
          exclude: ['password']
        }
      }
    }
  });

  // Métodos de instancia
  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password; // No incluir password en respuestas JSON por defecto
    return values;
  };

  // Asociaciones
  User.associate = function(models) {
    // Ejemplo de asociaciones (descomentar cuando tengas otros modelos)
    // User.hasMany(models.Task, { foreignKey: 'userId', as: 'tasks' });
    // User.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
  };

  return User;
};
