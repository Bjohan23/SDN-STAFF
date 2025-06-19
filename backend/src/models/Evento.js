const { Op } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Evento = sequelize.define(
    "Evento",
    {
      id_evento: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nombre_evento: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "El nombre del evento no puede estar vacío",
          },
          len: {
            args: [3, 100],
            msg: "El nombre del evento debe tener entre 3 y 100 caracteres",
          },
        },
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 2000],
            msg: "La descripción no puede exceder 2000 caracteres",
          },
        },
      },
      fecha_inicio: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "La fecha de inicio es requerida",
          },
          isDate: {
            msg: "Debe ser una fecha válida",
          },
        },
      },
      fecha_fin: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "La fecha de fin es requerida",
          },
          isDate: {
            msg: "Debe ser una fecha válida",
          },
          isAfterStart(value) {
            if (value <= this.fecha_inicio) {
              throw new Error(
                "La fecha de fin debe ser posterior a la fecha de inicio"
              );
            }
          },
        },
      },
      ubicacion: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "Ubicación física para eventos presenciales o híbridos",
      },
      url_virtual: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: {
            msg: "Debe ser una URL válida",
          },
        },
        comment:
          "URL de la plataforma virtual para eventos virtuales o híbridos",
      },
      id_tipo_evento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tipo_evento",
          key: "id_tipo_evento",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
        validate: {
          notNull: {
            msg: "El tipo de evento es requerido",
          },
        },
      },
      estado: {
        type: DataTypes.ENUM(
          "borrador",
          "publicado",
          "activo",
          "finalizado",
          "archivado"
        ),
        defaultValue: "borrador",
        validate: {
          isIn: {
            args: [
              ["borrador", "publicado", "activo", "finalizado", "archivado"],
            ],
            msg: "El estado debe ser: borrador, publicado, activo, finalizado o archivado",
          },
        },
      },
      imagen_logo: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "URL o path de la imagen/logo del evento",
      },
      configuracion_especifica: {
        type: DataTypes.JSON,
        allowNull: true,
        comment:
          "Configuraciones específicas del evento: horarios, requisitos, etc.",
      },
      url_amigable: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: {
          name: "unique_url_amigable",
          msg: "Esta URL amigable ya está en uso",
        },
        validate: {
          is: {
            args: /^[a-z0-9-]+$/,
            msg: "La URL amigable solo puede contener letras minúsculas, números y guiones",
          },
        },
        comment: "URL personalizada para el evento",
      },
      capacidad_maxima: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: {
            args: 1,
            msg: "La capacidad máxima debe ser mayor a 0",
          },
        },
      },
      precio_entrada: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
        validate: {
          isDecimal: {
            msg: "El precio debe ser un número decimal válido",
          },
          min: {
            args: [0],
            msg: "El precio no puede ser negativo",
          },
        },
      },
      moneda: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "PEN",
        validate: {
          len: {
            args: [3, 3],
            msg: "La moneda debe tener 3 caracteres (ISO 4217)",
          },
        },
      },
      requiere_aprobacion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Si los expositores requieren aprobación para participar",
      },
      fecha_limite_registro: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Fecha límite para registro de expositores",
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
      tableName: "evento",
      timestamps: false,
      underscored: false,
      indexes: [
        {
          fields: ["nombre_evento"],
        },
        {
          fields: ["fecha_inicio"],
        },
        {
          fields: ["fecha_fin"],
        },
        {
          fields: ["estado"],
        },
        {
          unique: true,
          fields: ["url_amigable"],
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
        published: {
          where: {
            estado: ["publicado", "activo"],
            deleted_at: null,
          },
        },
        upcoming: {
          where: {
            fecha_inicio: { [Op.gt]: new Date() },
            deleted_at: null,
          },
        },
        current: {
          where: {
            fecha_inicio: { [Op.lte]: new Date() },
            fecha_fin: { [Op.gte]: new Date() },
            deleted_at: null,
          },
        },
      },
    }
  );

  // Métodos de instancia
  Evento.prototype.isDeleted = function () {
    return this.deleted_at !== null;
  };

  Evento.prototype.softDelete = function (deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy,
    });
  };

  Evento.prototype.restore = function () {
    return this.update({
      deleted_at: null,
      deleted_by: null,
    });
  };

  Evento.prototype.isActive = function () {
    const now = new Date();
    return (
      this.fecha_inicio <= now &&
      this.fecha_fin >= now &&
      this.estado === "activo"
    );
  };

  Evento.prototype.isUpcoming = function () {
    return this.fecha_inicio > new Date();
  };

  Evento.prototype.isFinished = function () {
    return this.fecha_fin < new Date();
  };

  Evento.prototype.canRegister = function () {
    if (this.fecha_limite_registro) {
      return new Date() <= this.fecha_limite_registro;
    }
    return this.isUpcoming() || this.isActive();
  };

  // Asociaciones
  Evento.associate = function (models) {
    // Relación con TipoEvento
    Evento.belongsTo(models.TipoEvento, {
      foreignKey: "id_tipo_evento",
      as: "tipoEvento",
    });

    // Relación many-to-many con EmpresaExpositora a través de EmpresaEvento
    Evento.belongsToMany(models.EmpresaExpositora, {
      through: "EmpresaEvento",
      foreignKey: "id_evento",
      otherKey: "id_empresa",
      as: "empresasExpositoras",
    });

    // Relación directa con EmpresaEvento
    Evento.hasMany(models.EmpresaEvento, {
      foreignKey: "id_evento",
      as: "participaciones",
    });

    // Relación many-to-many con Stand a través de StandEvento
    Evento.belongsToMany(models.Stand, {
      through: "StandEvento",
      foreignKey: "id_evento",
      otherKey: "id_stand",
      as: "stands",
    });

    // Relación directa con StandEvento
    Evento.hasMany(models.StandEvento, {
      foreignKey: "id_evento",
      as: "standEventos",
    });

    // Relación con StandServicio (servicios contratados en el evento)
    Evento.hasMany(models.StandServicio, {
      foreignKey: "id_evento",
      as: "serviciosContratados",
    });

    // Relación many-to-many con Stand a través de StandEvento
    Evento.belongsToMany(models.Stand, {
      through: 'StandEvento',
      foreignKey: 'id_evento',
      otherKey: 'id_stand',
      as: 'stands'
    });

    // Relación directa con StandEvento
    Evento.hasMany(models.StandEvento, {
      foreignKey: 'id_evento',
      as: 'standEventos'
    });

    // Relación con StandServicio (servicios contratados en el evento)
    Evento.hasMany(models.StandServicio, {
      foreignKey: 'id_evento',
      as: 'serviciosContratados'
    });

    // Asociaciones de auditoría
    Evento.belongsTo(models.Usuario, {
      foreignKey: "created_by",
      as: "createdByUser",
    });

    Evento.belongsTo(models.Usuario, {
      foreignKey: "updated_by",
      as: "updatedByUser",
    });

    Evento.belongsTo(models.Usuario, {
      foreignKey: "deleted_by",
      as: "deletedByUser",
    });
  };

  return Evento;
};
