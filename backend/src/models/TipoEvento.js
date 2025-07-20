const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const TipoEvento = sequelize.define(
    "TipoEvento",
    {
      id_tipo_evento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre_tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          name: "unique_nombre_tipo",
          msg: "Este tipo de evento ya existe",
        },
        validate: {
          notEmpty: {
            msg: "El nombre del tipo de evento no puede estar vacío",
          },
          len: {
            args: [2, 50],
            msg: "El nombre del tipo debe tener entre 2 y 50 caracteres",
          },
        },
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: "La descripción no puede exceder 500 caracteres",
          },
        },
      },
      configuracion_especifica: {
        type: DataTypes.JSON,
        allowNull: true,
        comment:
          "Configuraciones específicas por tipo: plataformas virtuales, requisitos presenciales, etc.",
      },
      // Campos de auditoría
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "tipo_evento",
      timestamps: false,
      underscored: false,
      indexes: [
        {
          unique: true,
          fields: ["nombre_tipo"],
        },
      ],
      scopes: {
        active: {
          where: {
            deleted_at: null,
          },
        },
        deleted: {
          where: {
            deleted_at: { [Op.ne]: null },
          },
        },
      },
    }
  );

  // Métodos de instancia
  TipoEvento.prototype.isDeleted = function () {
    return this.deleted_at !== null;
  };

  TipoEvento.prototype.softDelete = function (deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy,
    });
  };

  TipoEvento.prototype.restore = function () {
    return this.update({
      deleted_at: null,
      deleted_by: null,
    });
  };

  // Asociaciones
  TipoEvento.associate = function (models) {
    // Relación con Eventos
    TipoEvento.hasMany(models.Evento, {
      foreignKey: "id_tipo_evento",
      as: "eventos",
    });

    // Relación con ConfiguracionTipoEvento
    TipoEvento.hasMany(models.ConfiguracionTipoEvento, {
      foreignKey: "id_tipo_evento",
      as: "configuraciones",
    });

    // Relación con PlantillaEvento
    TipoEvento.hasMany(models.PlantillaEvento, {
      foreignKey: "id_tipo_evento",
      as: "plantillas",
    });

    // Relación con ValidacionTipoEvento
    TipoEvento.hasMany(models.ValidacionTipoEvento, {
      foreignKey: "id_tipo_evento",
      as: "validaciones",
    });

    // Relación con PlantillaCredencial
    TipoEvento.hasMany(models.PlantillaCredencial, {
      foreignKey: "id_tipo_evento",
      as: "plantillasCredencial",
    });

    // Asociaciones de auditoría
    TipoEvento.belongsTo(models.Usuario, {
      foreignKey: "created_by",
      as: "createdByUser",
    });

    TipoEvento.belongsTo(models.Usuario, {
      foreignKey: "updated_by",
      as: "updatedByUser",
    });

    TipoEvento.belongsTo(models.Usuario, {
      foreignKey: "deleted_by",
      as: "deletedByUser",
    });
  };

  return TipoEvento;
};
