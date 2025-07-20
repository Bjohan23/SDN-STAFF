module.exports = (sequelize, DataTypes) => {
  const AccesoEvento = sequelize.define(
    "AccesoEvento",
    {
      id_acceso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_credencial: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "credencial",
          key: "id_credencial",
        },
        comment: "Credencial que tiene el acceso",
      },
      id_evento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "evento",
          key: "id_evento",
        },
        comment: "Evento al que se otorga acceso",
      },
      tipo_acceso: {
        type: DataTypes.ENUM(
          "entrada_general",
          "zona_vip",
          "area_expositores",
          "backstage",
          "area_prensa",
          "sala_conferencias",
          "area_networking",
          "zona_catering",
          "parking",
          "area_staff"
        ),
        allowNull: false,
        comment: "Tipo específico de acceso otorgado",
      },
      descripcion_acceso: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "Descripción detallada del acceso",
      },
      // Control temporal
      fecha_inicio_acceso: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Fecha y hora desde la cual el acceso es válido",
      },
      fecha_fin_acceso: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Fecha y hora hasta la cual el acceso es válido",
      },
      dias_semana_valido: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [1, 2, 3, 4, 5, 6, 7],
        comment: "Días de la semana en que es válido (1=Lun, 7=Dom)",
      },
      horario_inicio: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: "Hora de inicio diaria del acceso",
      },
      horario_fin: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: "Hora de fin diaria del acceso",
      },
      // Control de usos
      limite_usos_diarios: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Límite de usos por día (null = sin límite)",
      },
      limite_usos_totales: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Límite total de usos (null = sin límite)",
      },
      usos_realizados: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Número de veces que se ha usado este acceso",
      },
      // Configuración específica
      requiere_acompañante: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica si requiere estar acompañado de personal",
      },
      permite_invitados: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Permite traer invitados con esta credencial",
      },
      max_invitados: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Máximo número de invitados permitidos",
      },
      // Ubicaciones específicas
      ubicaciones_permitidas: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Lista específica de ubicaciones donde es válido",
      },
      ubicaciones_restringidas: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Lista de ubicaciones donde NO es válido",
      },
      // Metadatos
      condiciones_especiales: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Condiciones especiales o restricciones adicionales",
      },
      notas_acceso: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Notas adicionales sobre el acceso",
      },
      // Estado
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Indica si el acceso está activo",
      },
      motivo_suspension: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Motivo por el cual se suspendió el acceso",
      },
      // Campos de auditoría
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
      },
      updated_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
      },
      deleted_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
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
      tableName: "acceso_evento",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          fields: ["id_credencial"],
        },
        {
          fields: ["id_evento"],
        },
        {
          fields: ["tipo_acceso"],
        },
        {
          fields: ["activo"],
        },
        {
          fields: ["fecha_inicio_acceso"],
        },
        {
          fields: ["fecha_fin_acceso"],
        },
        {
          unique: true,
          fields: ["id_credencial", "tipo_acceso", "deleted_at"],
          where: {
            deleted_at: null,
          },
        },
      ],
    }
  );

  // Métodos de instancia
  AccesoEvento.prototype.isDeleted = function () {
    return this.deleted_at !== null;
  };

  AccesoEvento.prototype.softDelete = async function (userId = null) {
    this.deleted_at = new Date();
    this.deleted_by = userId;
    this.activo = false;
    return await this.save();
  };

  AccesoEvento.prototype.esValidoAhora = function () {
    if (!this.activo) return false;

    const ahora = new Date();

    // Verificar rango de fechas
    if (this.fecha_inicio_acceso && ahora < this.fecha_inicio_acceso)
      return false;
    if (this.fecha_fin_acceso && ahora > this.fecha_fin_acceso) return false;

    // Verificar día de la semana
    if (this.dias_semana_valido && this.dias_semana_valido.length > 0) {
      const diaSemana = ahora.getDay(); // 0=Dom, 1=Lun, ..., 6=Sab
      const diaAjustado = diaSemana === 0 ? 7 : diaSemana; // Convertir a 1=Lun, 7=Dom
      if (!this.dias_semana_valido.includes(diaAjustado)) return false;
    }

    // Verificar horario
    if (this.horario_inicio || this.horario_fin) {
      const horaActual = ahora.toTimeString().slice(0, 8);
      if (this.horario_inicio && horaActual < this.horario_inicio) return false;
      if (this.horario_fin && horaActual > this.horario_fin) return false;
    }

    // Verificar límites de uso
    if (
      this.limite_usos_totales &&
      this.usos_realizados >= this.limite_usos_totales
    )
      return false;

    return true;
  };

  AccesoEvento.prototype.registrarUso = async function () {
    this.usos_realizados += 1;
    return await this.save();
  };

  AccesoEvento.prototype.suspender = async function (motivo, userId = null) {
    this.activo = false;
    this.motivo_suspension = motivo;
    this.updated_by = userId;
    return await this.save();
  };

  AccesoEvento.prototype.reactivar = async function (userId = null) {
    this.activo = true;
    this.motivo_suspension = null;
    this.updated_by = userId;
    return await this.save();
  };

  // Definir asociaciones
  AccesoEvento.associate = function (models) {
    // Un acceso pertenece a una credencial
    AccesoEvento.belongsTo(models.Credencial, {
      foreignKey: "id_credencial",
      as: "credencial",
    });

    // Un acceso pertenece a un evento
    AccesoEvento.belongsTo(models.Evento, {
      foreignKey: "id_evento",
      as: "evento",
    });

    // Un acceso puede tener muchos logs de validación
    AccesoEvento.hasMany(models.LogValidacion, {
      foreignKey: "id_acceso",
      as: "logsValidacion",
    });

    // Relaciones de auditoría
    AccesoEvento.belongsTo(models.Usuario, {
      foreignKey: "created_by",
      as: "createdByUser",
    });

    AccesoEvento.belongsTo(models.Usuario, {
      foreignKey: "updated_by",
      as: "updatedByUser",
    });

    AccesoEvento.belongsTo(models.Usuario, {
      foreignKey: "deleted_by",
      as: "deletedByUser",
    });
  };

  return AccesoEvento;
};
