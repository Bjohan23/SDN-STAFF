module.exports = (sequelize, DataTypes) => {
  const LogValidacion = sequelize.define(
    "LogValidacion",
    {
      id_log: {
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
        comment: "Credencial que fue validada",
      },
      id_evento: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "evento",
          key: "id_evento",
        },
        comment: "Evento donde se realizó la validación",
      },
      id_acceso: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "acceso_evento",
          key: "id_acceso",
        },
        comment: "Tipo de acceso específico validado",
      },
      // Información de la validación
      fecha_validacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: "Fecha y hora exacta de la validación",
      },
      resultado: {
        type: DataTypes.ENUM("exitosa", "fallida", "bloqueada", "sospechosa"),
        allowNull: false,
        comment: "Resultado de la validación",
      },
      motivo_fallo: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Motivo específico del fallo si resultado != exitosa",
      },
      // Información de ubicación
      punto_acceso: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Punto de acceso donde se realizó la validación",
      },
      ubicacion_fisica: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "Ubicación física específica",
      },
      coordenadas_gps: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Coordenadas GPS si están disponibles",
      },
      // Información del dispositivo/terminal
      dispositivo_validacion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "Identificador del dispositivo usado para validar",
      },
      ip_validacion: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: "Dirección IP desde donde se validó",
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "User agent del navegador/app que validó",
      },
      // Información del validador
      id_usuario_validador: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "usuario",
          key: "id_usuario",
        },
        comment: "Usuario que realizó la validación manual",
      },
      nombre_validador: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "Nombre del validador si no es usuario del sistema",
      },
      // Datos técnicos
      qr_data_usado: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Datos del QR que fueron escaneados",
      },
      hash_validacion: {
        type: DataTypes.STRING(64),
        allowNull: true,
        comment: "Hash de los datos validados para integridad",
      },
      tiempo_respuesta_ms: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Tiempo de respuesta de la validación en milisegundos",
      },
      // Información de seguridad
      es_reintento: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica si es un reintento de validación",
      },
      numero_reintento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Número de reintento si es_reintento = true",
      },
      indicadores_fraude: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Indicadores automáticos de posible fraude",
      },
      nivel_riesgo: {
        type: DataTypes.ENUM("bajo", "medio", "alto", "critico"),
        allowNull: false,
        defaultValue: "bajo",
        comment: "Nivel de riesgo asignado automáticamente",
      },
      // Información adicional
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Observaciones del validador",
      },
      datos_adicionales: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Datos adicionales específicos del evento o contexto",
      },
      // Información de la sessión
      id_sesion_validacion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: "ID de sesión para agrupar validaciones relacionadas",
      },
      duracion_sesion_segundos: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Duración de la sesión en el área accedida",
      },
      // Información de entrada/salida
      tipo_movimiento: {
        type: DataTypes.ENUM("entrada", "salida", "verificacion"),
        allowNull: false,
        defaultValue: "entrada",
        comment: "Tipo de movimiento registrado",
      },
      id_log_entrada: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "log_validacion",
          key: "id_log",
        },
        comment: "Referencia al log de entrada si este es de salida",
      },
      // Campos técnicos
      version_app: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: "Versión de la aplicación que realizó la validación",
      },
      algoritmo_validacion: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Algoritmo usado para la validación",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "log_validacion",
      timestamps: false, // Solo usamos created_at
      indexes: [
        {
          fields: ["id_credencial"],
        },
        {
          fields: ["id_evento"],
        },
        {
          fields: ["fecha_validacion"],
        },
        {
          fields: ["resultado"],
        },
        {
          fields: ["punto_acceso"],
        },
        {
          fields: ["id_usuario_validador"],
        },
        {
          fields: ["nivel_riesgo"],
        },
        {
          fields: ["tipo_movimiento"],
        },
        {
          fields: ["dispositivo_validacion"],
        },
        {
          fields: ["ip_validacion"],
        },
        {
          fields: ["id_sesion_validacion"],
        },
        {
          fields: ["created_at"],
        },
      ],
    }
  );

  // Métodos estáticos
  LogValidacion.getEstadisticasPorEvento = async function (
    idEvento,
    fechaInicio = null,
    fechaFin = null
  ) {
    const where = { id_evento: idEvento };

    if (fechaInicio) {
      where.fecha_validacion = { [sequelize.Sequelize.Op.gte]: fechaInicio };
    }

    if (fechaFin) {
      if (where.fecha_validacion) {
        where.fecha_validacion[sequelize.Sequelize.Op.lte] = fechaFin;
      } else {
        where.fecha_validacion = { [sequelize.Sequelize.Op.lte]: fechaFin };
      }
    }

    const estadisticas = await LogValidacion.findAll({
      where,
      attributes: ["resultado", [sequelize.fn("COUNT", "*"), "total"]],
      group: ["resultado"],
      raw: true,
    });

    return estadisticas;
  };

  LogValidacion.getValidacionesSospechosas = async function (
    idEvento = null,
    limite = 50
  ) {
    const where = {
      [sequelize.Sequelize.Op.or]: [
        { resultado: "sospechosa" },
        { nivel_riesgo: ["alto", "critico"] },
        { es_reintento: true },
      ],
    };

    if (idEvento) {
      where.id_evento = idEvento;
    }

    return await LogValidacion.findAll({
      where,
      limit,
      order: [["fecha_validacion", "DESC"]],
      include: ["credencial", "evento"],
    });
  };

  // Métodos de instancia
  LogValidacion.prototype.marcarComoFraudulenta = async function (motivo) {
    this.resultado = "sospechosa";
    this.nivel_riesgo = "critico";
    this.observaciones = (this.observaciones || "") + "\n[FRAUDE] " + motivo;
    this.indicadores_fraude = {
      ...(this.indicadores_fraude || {}),
      marcado_manualmente: true,
      fecha_marcado: new Date(),
      motivo: motivo,
    };
    return await this.save();
  };

  // Definir asociaciones
  LogValidacion.associate = function (models) {
    // Un log pertenece a una credencial
    LogValidacion.belongsTo(models.Credencial, {
      foreignKey: "id_credencial",
      as: "credencial",
    });

    // Un log pertenece a un evento
    LogValidacion.belongsTo(models.Evento, {
      foreignKey: "id_evento",
      as: "evento",
    });

    // Un log puede pertenecer a un acceso específico
    LogValidacion.belongsTo(models.AccesoEvento, {
      foreignKey: "id_acceso",
      as: "acceso",
    });

    // Un log puede tener un usuario validador
    LogValidacion.belongsTo(models.Usuario, {
      foreignKey: "id_usuario_validador",
      as: "validador",
    });
  };

  return LogValidacion;
};
