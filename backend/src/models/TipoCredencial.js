module.exports = (sequelize, DataTypes) => {
  const TipoCredencial = sequelize.define('TipoCredencial', {
  id_tipo_credencial: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_tipo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nombre del tipo de credencial (visitante, expositor, personal, prensa, VIP)'
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción detallada del tipo de credencial'
  },
  color_identificacion: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#007bff',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    },
    comment: 'Color en formato hexadecimal para identificación visual'
  },
  nivel_acceso: {
    type: DataTypes.ENUM('basico', 'intermedio', 'avanzado', 'total'),
    allowNull: false,
    defaultValue: 'basico',
    comment: 'Nivel de acceso que otorga este tipo de credencial'
  },
  es_imprimible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica si este tipo de credencial puede ser impreso'
  },
  requiere_aprobacion: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indica si requiere aprobación manual antes de generar'
  },
  duracion_validez_horas: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Duración de validez en horas (null = sin límite)'
  },
  permite_reingreso: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Permite múltiples entradas al evento'
  },
  configuracion_accesos: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Configuración específica de accesos en formato JSON'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  // Campos de auditoría
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  deleted_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuario',
      key: 'id_usuario'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'tipo_credencial',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    {
      unique: true,
      fields: ['nombre_tipo']
    },
    {
      fields: ['nivel_acceso']
    },
    {
      fields: ['activo']
    }
  ]
});

// Métodos de instancia
TipoCredencial.prototype.isDeleted = function() {
  return this.deleted_at !== null;
};

TipoCredencial.prototype.softDelete = async function(userId = null) {
  this.deleted_at = new Date();
  this.deleted_by = userId;
  return await this.save();
};

  return TipoCredencial;
};