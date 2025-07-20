module.exports = (sequelize, DataTypes) => {
  const PlantillaCredencial = sequelize.define(
    "PlantillaCredencial",
    {
      id_plantilla: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre_plantilla: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: "Nombre descriptivo de la plantilla",
      },
      id_tipo_credencial: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "tipo_credencial",
          key: "id_tipo_credencial",
        },
        comment: "Tipo de credencial asociado a esta plantilla",
      },
      id_tipo_evento: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "tipo_evento",
          key: "id_tipo_evento",
        },
        comment: "Tipo de evento específico (null = aplica a todos)",
      },
      diseño_html: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
        comment: "Template HTML con variables para personalización",
      },
      estilos_css: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
        comment: "Estilos CSS para la plantilla",
      },
      configuracion_layout: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Configuración del layout: dimensiones, posiciones, etc.",
      },
      variables_disponibles: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Lista de variables disponibles para usar en la plantilla",
      },
      imagen_fondo: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "URL o path de la imagen de fondo",
      },
      logo_evento: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "URL o path del logo del evento",
      },
      dimensiones: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
          ancho: 300,
          alto: 450,
          unidad: "px",
        },
        comment: "Dimensiones de la credencial",
      },
      configuracion_qr: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
          tamaño: 80,
          posicion: { x: 20, y: 350 },
          nivel_correccion: "M",
        },
        comment: "Configuración del código QR",
      },
      es_plantilla_default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Indica si es la plantilla por defecto para el tipo",
      },
      activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      version: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "1.0",
        comment: "Versión de la plantilla para control de cambios",
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
      tableName: "plantilla_credencial",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
      indexes: [
        {
          fields: ["id_tipo_credencial"],
        },
        {
          fields: ["id_tipo_evento"],
        },
        {
          fields: ["es_plantilla_default"],
        },
        {
          fields: ["activa"],
        },
        {
          unique: true,
          fields: ["nombre_plantilla", "deleted_at"],
          where: {
            deleted_at: null,
          },
        },
      ],
    }
  );

  // Métodos de instancia
  PlantillaCredencial.prototype.isDeleted = function () {
    return this.deleted_at !== null;
  };

  PlantillaCredencial.prototype.softDelete = async function (userId = null) {
    this.deleted_at = new Date();
    this.deleted_by = userId;
    return await this.save();
  };

  PlantillaCredencial.prototype.clonar = async function (
    nuevoNombre,
    userId = null
  ) {
    const nuevaPlantilla = await PlantillaCredencial.create({
      nombre_plantilla: nuevoNombre,
      id_tipo_credencial: this.id_tipo_credencial,
      id_tipo_evento: this.id_tipo_evento,
      diseño_html: this.diseño_html,
      estilos_css: this.estilos_css,
      configuracion_layout: this.configuracion_layout,
      variables_disponibles: this.variables_disponibles,
      imagen_fondo: this.imagen_fondo,
      logo_evento: this.logo_evento,
      dimensiones: this.dimensiones,
      configuracion_qr: this.configuracion_qr,
      version: "1.0",
      created_by: userId,
    });
    return nuevaPlantilla;
  };

  // Definir asociaciones
  PlantillaCredencial.associate = function (models) {
    // Una plantilla pertenece a un tipo de credencial
    PlantillaCredencial.belongsTo(models.TipoCredencial, {
      foreignKey: "id_tipo_credencial",
      as: "tipoCredencial",
    });

    // Una plantilla puede pertenecer a un tipo de evento
    PlantillaCredencial.belongsTo(models.TipoEvento, {
      foreignKey: "id_tipo_evento",
      as: "tipoEvento",
    });

    // Una plantilla puede tener muchas credenciales que la usen
    PlantillaCredencial.hasMany(models.Credencial, {
      foreignKey: "id_plantilla",
      as: "credenciales",
    });

    // Relaciones de auditoría
    PlantillaCredencial.belongsTo(models.Usuario, {
      foreignKey: "created_by",
      as: "createdByUser",
    });

    PlantillaCredencial.belongsTo(models.Usuario, {
      foreignKey: "updated_by",
      as: "updatedByUser",
    });

    PlantillaCredencial.belongsTo(models.Usuario, {
      foreignKey: "deleted_by",
      as: "deletedByUser",
    });
  };

  return PlantillaCredencial;
};
